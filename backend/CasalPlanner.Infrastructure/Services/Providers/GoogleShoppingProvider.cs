using System.Text.Json;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Helpers;

namespace CasalPlanner.Infrastructure.Services.Providers;

public class GoogleShoppingProvider : IPriceProvider
{
    private readonly IHttpClientFactory _httpClientFactory;
    public string ProviderName => "Google Shopping";

    public GoogleShoppingProvider(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
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

        return ProcessResults(content, query);
    }

    private IEnumerable<ProdutoDto> ProcessResults(string jsonContent, string originalQuery)
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
        if (item.TryGetProperty("link", out var link) &&
            link.GetString()?.Contains("google.com/shopping") == false)
            return link.GetString() ?? "";

        if (item.TryGetProperty("product_link", out var productLink))
            return productLink.GetString() ?? "";

        if (item.TryGetProperty("serpapi_product_api", out var serpLink))
            return serpLink.GetString() ?? "";

        if (item.TryGetProperty("serpapi_link", out var serp))
            return serp.GetString() ?? "";

        return "";
    }

    private static decimal ExtractPrice(JsonElement item)
    {
        if (item.TryGetProperty("extracted_price", out var extracted))
        {
            if (extracted.ValueKind == JsonValueKind.Number)
                return extracted.GetDecimal();
        }

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
