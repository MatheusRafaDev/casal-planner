using System.Text.Json;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using Microsoft.Extensions.Logging;
using CasalPlanner.Application.Helpers;

namespace CasalPlanner.Infrastructure.Services.Providers;

public class GoogleShoppingProvider : IPriceProvider
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IScrapeDoService _scrapeDoService;
    private readonly ILogger<GoogleShoppingProvider> _logger;
    public string ProviderName => "Google Shopping";

    public GoogleShoppingProvider(IHttpClientFactory httpClientFactory, IScrapeDoService scrapeDoService, ILogger<GoogleShoppingProvider> logger)
    {
        _httpClientFactory = httpClientFactory;
        _scrapeDoService = scrapeDoService;
        _logger = logger;
    }

    public async Task<IEnumerable<ProdutoDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");
        if (string.IsNullOrEmpty(apiKey))
            return Enumerable.Empty<ProdutoDto>();

        var url = $"https://serpapi.com/search?engine=google_shopping&q={Uri.EscapeDataString(query)}&gl=br&hl=pt-BR&num=30&api_key={apiKey}";
        var client = _httpClientFactory.CreateClient("GoogleShoppingClient");

        var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return Enumerable.Empty<ProdutoDto>();

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (string.IsNullOrEmpty(content))
            return Enumerable.Empty<ProdutoDto>();

        return await ProcessResultsAsync(content, query);
    }

    private async Task<IEnumerable<ProdutoDto>> ProcessResultsAsync(string jsonContent, string originalQuery)
    {
        var produtos = new List<ProdutoDto>();
        try
        {
            using var doc = JsonDocument.Parse(jsonContent);

            JsonElement results;
            if (doc.RootElement.TryGetProperty("shopping_results", out var shopping))
                results = shopping;
            else if (doc.RootElement.TryGetProperty("inline_shopping_results", out var inline))
                results = inline;
            else if (doc.RootElement.TryGetProperty("organic_results", out var organic))
                results = organic;
            else
                return produtos;

            foreach (var item in results.EnumerateArray())
            {
                var price = ExtractPrice(item);
                if (price <= 0) continue;

                var source = item.TryGetProperty("source", out var s) ? s.GetString() ?? "" : "";
                var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                var link = ExtractLink(item);

                if (string.IsNullOrEmpty(link)) continue;

                // Ignora links que na verdade são apenas páginas de busca da loja (Ads)
                if (link.Contains("lista.mercadolivre.com.br") || 
                    link.Contains("amazon.com.br/s?k=") || 
                    link.Contains("busca.magazineluiza.com.br"))
                {
                    // Tenta usar o link do próprio Google Shopping se for um Ad disfarçado
                    if (item.TryGetProperty("product_link", out var pLink) && !string.IsNullOrEmpty(pLink.GetString()))
                    {
                        link = pLink.GetString() ?? "";
                    }
                    else
                    {
                        continue;
                    }
                }

                var isUsed = StoreAndBrandHelper.IsUsedProduct(title);
                var isMarketplace = StoreAndBrandHelper.IsMarketplaceStore(source, title, isUsed);
                var isTrusted = StoreAndBrandHelper.IsTrustedStore(source) && !isMarketplace && !isUsed;

                var marcaProduto = StoreAndBrandHelper.ExtractBrandFallback(title);

                decimal precoAntigo = 0;
                if (item.TryGetProperty("old_price", out var oldPriceElem))
                    precoAntigo = ExtractPriceFromElement(oldPriceElem);

                var logoUrl = StoreAndBrandHelper.GetStoreLogo(source, link);
                var logoMarcaUrl = StoreAndBrandHelper.GetBrandLogo(marcaProduto);

                string? parcelamento = null;
                if (item.TryGetProperty("installment", out var inst))
                {
                    var months = inst.TryGetProperty("months", out var mo) ? mo.GetInt32() : 0;
                    if (months > 1) parcelamento = months.ToString();
                }

                produtos.Add(new ProdutoDto
                {
                    Nome = title,
                    Loja = StoreAndBrandHelper.NormalizarNomeLoja(source),
                    Preco = price,
                    PrecoOriginal = precoAntigo > price ? precoAntigo : null,
                    Url = link,
                    Imagem = item.TryGetProperty("thumbnail", out var thumb) ? thumb.GetString() ?? "" : "",
                    LogoLoja = logoUrl,
                    LogoMarca = logoMarcaUrl,
                    IsTrusted = isTrusted,
                    IsMarketplace = isMarketplace,
                    IsUsed = isUsed,
                    Marca = marcaProduto,
                    Parcelamento = parcelamento,
                    Fonte = ProviderName,
                    DataConsulta = DateTime.UtcNow
                });
            }
        }
        catch
        {
            // log silently
        }

        return produtos;
    }

    private static string ExtractLink(JsonElement item)
    {
        string rawLink = "";

        if (item.TryGetProperty("link", out var link) && !string.IsNullOrEmpty(link.GetString()))
            rawLink = link.GetString() ?? "";
        else if (item.TryGetProperty("product_link", out var productLink))
            rawLink = productLink.GetString() ?? "";
        else if (item.TryGetProperty("serpapi_product_api", out var serpLink))
            rawLink = serpLink.GetString() ?? "";
        else if (item.TryGetProperty("serpapi_link", out var serp))
            rawLink = serp.GetString() ?? "";

        if (string.IsNullOrEmpty(rawLink))
            return "";

        // Tenta limpar redirecionamentos do Google Shopping (google.com/url?q=...)
        try
        {
            if (rawLink.Contains("google.com/url") || rawLink.Contains("google.com.br/url"))
            {
                var uri = new Uri(rawLink);
                var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
                var directUrl = query["q"] ?? query["url"];
                
                if (!string.IsNullOrEmpty(directUrl))
                {
                    return directUrl;
                }
            }
        }
        catch
        {
            // fallback para o rawLink
        }

        return rawLink;
    }

    private static decimal ExtractPrice(JsonElement item)
    {
        // Ignoramos o 'extracted_price' do SerpApi pois ele falha grosseiramente
        // com decimais no Brasil (ex: R$ 596,70 vira 59670).
        // Sempre usamos o campo 'price' (string) para fazer nosso próprio parse.

        if (!item.TryGetProperty("price", out var priceElem))
            return 0;

        return ExtractPriceFromElement(priceElem);
    }

    private static decimal ExtractPriceFromElement(JsonElement priceElem)
    {
        if (priceElem.ValueKind == JsonValueKind.Number)
            return priceElem.GetDecimal();

        var priceStr = priceElem.GetString();
        return PriceTextHelper.ExtractPrice(priceStr ?? "");
    }
}
