using System.Globalization;
using System.Text.RegularExpressions;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using HtmlAgilityPack;

namespace CasalPlanner.Infrastructure.Services;

public class ExtratorLinkService : IExtratorLinkService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExtratorLinkService> _logger;

    public ExtratorLinkService(HttpClient httpClient, ILogger<ExtratorLinkService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<ProdutoDto?> ExtrairAsync(string url, CancellationToken cancellationToken = default)
    {
        try
        {
            var requestMessage = new HttpRequestMessage(HttpMethod.Get, url);
            requestMessage.Headers.Add("User-Agent", "Mozilla/5.0");

            var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Falha ao extrair link {Url}: StatusCode {Status}", url, response.StatusCode);
                return null;
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // 1. Extrair Nome
            var titulo = GetMetaContent(doc, "og:title") 
                      ?? GetMetaContent(doc, "twitter:title") 
                      ?? doc.DocumentNode.SelectSingleNode("//title")?.InnerText;
                      
            if (string.IsNullOrWhiteSpace(titulo))
            {
                _logger.LogWarning("Não foi possível extrair o título do link: {Url}", url);
                return null;
            }

            // 2. Extrair Imagem
            var imagem = GetMetaContent(doc, "og:image") 
                      ?? GetMetaContent(doc, "twitter:image")
                      ?? GetMetaContent(doc, "itemprop", "image");

            // 3. Extrair Loja (Site Name)
            var loja = GetMetaContent(doc, "og:site_name");
            if (string.IsNullOrWhiteSpace(loja))
            {
                if (Uri.TryCreate(url, UriKind.Absolute, out var uri))
                {
                    loja = uri.Host.Replace("www.", "").Split('.')[0];
                    loja = char.ToUpper(loja[0]) + loja.Substring(1);
                }
            }

            // 4. Extrair Preço
            decimal preco = 0;
            var precoStr = GetMetaContent(doc, "product:price:amount") 
                        ?? GetMetaContent(doc, "itemprop", "price")
                        ?? GetMetaContent(doc, "og:price:amount");
                        
            if (!string.IsNullOrWhiteSpace(precoStr))
            {
                TryParsePrice(precoStr, out preco);
            }
            
            // Se falhou pelas metas, tenta procurar no DOM (variáveis globais JS ou tags comuns de e-commerce)
            if (preco <= 0)
            {
                var regex = new Regex(@"R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})", RegexOptions.IgnoreCase);
                var match = regex.Match(html);
                if (match.Success)
                {
                    TryParsePrice(match.Groups[1].Value, out preco);
                }
            }

            return new ProdutoDto
            {
                Nome = HtmlEntity.DeEntitize(titulo.Trim()),
                Preco = preco,
                Imagem = imagem ?? string.Empty,
                Url = url,
                Loja = loja ?? string.Empty,
                Fonte = "Link Direto"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao extrair dados do link: {Url}", url);
            return null;
        }
    }

    private static string? GetMetaContent(HtmlDocument doc, string propertyName)
    {
        return doc.DocumentNode.SelectSingleNode($"//meta[@property='{propertyName}' or @name='{propertyName}']")?.GetAttributeValue("content", null);
    }

    private static string? GetMetaContent(HtmlDocument doc, string attrName, string attrValue)
    {
        return doc.DocumentNode.SelectSingleNode($"//meta[@{attrName}='{attrValue}']")?.GetAttributeValue("content", null);
    }

    private static bool TryParsePrice(string priceStr, out decimal price)
    {
        price = 0;
        priceStr = priceStr.Replace("R$", "").Trim();

        // Formato BR: 1.234,56
        if (priceStr.Contains(',') && priceStr.IndexOf(',') > priceStr.IndexOf('.'))
        {
            return decimal.TryParse(priceStr, NumberStyles.Any, new CultureInfo("pt-BR"), out price);
        }
        // Formato US: 1234.56 ou 1,234.56
        return decimal.TryParse(priceStr, NumberStyles.Any, CultureInfo.InvariantCulture, out price);
    }
}
