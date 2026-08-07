using System.Text.Json;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Application.Helpers;

namespace CasalPlanner.Infrastructure.Services.Providers;

public class MercadoLivreProvider : IPriceProvider
{
    private readonly IHttpClientFactory _httpClientFactory;
    public string ProviderName => "Mercado Livre";

    public MercadoLivreProvider(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<IEnumerable<ProdutoDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        var url = $"https://api.mercadolibre.com/sites/MLB/search?q={Uri.EscapeDataString(query)}&limit=20";
        var client = _httpClientFactory.CreateClient("MercadoLivreClient");

        var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return Enumerable.Empty<ProdutoDto>();

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (string.IsNullOrEmpty(content))
            return Enumerable.Empty<ProdutoDto>();

        return ProcessResults(content);
    }

    private IEnumerable<ProdutoDto> ProcessResults(string jsonContent)
    {
        var produtos = new List<ProdutoDto>();
        try
        {
            using var doc = JsonDocument.Parse(jsonContent);
            if (!doc.RootElement.TryGetProperty("results", out var results))
                return produtos;

            foreach (var item in results.EnumerateArray())
            {
                decimal price = item.TryGetProperty("price", out var p) && p.ValueKind == JsonValueKind.Number ? p.GetDecimal() : 0;
                if (price <= 0) continue;

                var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                var link = item.TryGetProperty("permalink", out var l) ? l.GetString() ?? "" : "";
                var thumbnail = item.TryGetProperty("thumbnail", out var th) ? th.GetString() ?? "" : "";
                
                // Melhora qualidade da imagem do ML substituindo -I por -O (ou -F) se possível
                if (!string.IsNullOrEmpty(thumbnail))
                    thumbnail = thumbnail.Replace("-I.jpg", "-O.jpg");

                decimal originalPrice = item.TryGetProperty("original_price", out var op) && op.ValueKind == JsonValueKind.Number ? op.GetDecimal() : 0;

                var condition = item.TryGetProperty("condition", out var c) ? c.GetString() : "";
                var isUsed = condition == "used" || StoreAndBrandHelper.IsUsedProduct(title);
                
                var marca = StoreAndBrandHelper.ExtractBrandFallback(title);
                var loja = "Mercado Livre";

                produtos.Add(new ProdutoDto
                {
                    Nome = title,
                    Preco = price,
                    PrecoOriginal = originalPrice > price ? originalPrice : null,
                    Loja = loja,
                    IsMarketplace = true,
                    Imagem = thumbnail,
                    Url = link,
                    Marca = marca,
                    Fonte = ProviderName,
                    LogoLoja = StoreAndBrandHelper.GetStoreLogo(loja, link),
                    LogoMarca = StoreAndBrandHelper.GetBrandLogo(marca),
                    IsTrusted = true,
                    IsUsed = isUsed,
                    Disponivel = true,
                    DataConsulta = DateTime.UtcNow
                });
            }
        }
        catch
        {
            // Retorna o que conseguiu parsear
        }

        return produtos;
    }
}
