using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using HtmlAgilityPack;

namespace CasalPlanner.Infrastructure.Services;

public class ExtratorLinkService : IExtratorLinkService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExtratorLinkService> _logger;

    // User-agents rotativos para reduzir chance de bloqueio
    private static readonly string[] _userAgents =
    [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    ];

    public ExtratorLinkService(HttpClient httpClient, ILogger<ExtratorLinkService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<ProdutoDto?> ExtrairAsync(string url, CancellationToken cancellationToken = default)
    {
        // Estratégia 1: Requisição direta com headers realistas
        var produto = await TentarExtrairDiretoAsync(url, cancellationToken);
        if (produto is not null) return produto;

        // Estratégia 2: Tentar Google AMP cache (funciona para muitos e-commerces BR)
        produto = await TentarExtrairViaGoogleAmpAsync(url, cancellationToken);
        if (produto is not null) return produto;

        // Estratégia 3: Tentar via Scrape.do proxy (para sites com proteção pesada como Magalu)
        produto = await TentarExtrairViaScrapeDoAsync(url, cancellationToken);
        if (produto is not null) return produto;

        _logger.LogWarning("Todas as estratégias de extração falharam para: {Url}", url);
        return null;
    }

    // ─── Estratégia 1: Requisição direta ─────────────────────────────────────

    private async Task<ProdutoDto?> TentarExtrairDiretoAsync(string url, CancellationToken ct)
    {
        try
        {
            var ua = _userAgents[Random.Shared.Next(_userAgents.Length)];
            var req = new HttpRequestMessage(HttpMethod.Get, url);
            req.Headers.Add("User-Agent", ua);
            req.Headers.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8");
            req.Headers.Add("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7");
            req.Headers.Add("Accept-Encoding", "gzip, deflate, br");
            req.Headers.Add("Cache-Control", "no-cache");
            req.Headers.Add("Pragma", "no-cache");
            req.Headers.Add("Sec-Fetch-Dest", "document");
            req.Headers.Add("Sec-Fetch-Mode", "navigate");
            req.Headers.Add("Sec-Fetch-Site", "none");
            req.Headers.Add("Upgrade-Insecure-Requests", "1");

            using var resp = await _httpClient.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogDebug("Extração direta retornou {Status} para {Url}", resp.StatusCode, url);
                return null;
            }

            var html = await resp.Content.ReadAsStringAsync(ct);
            return ParseHtml(html, url);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Falha na extração direta de {Url}", url);
            return null;
        }
    }

    // ─── Estratégia 2: Google AMP Cache ──────────────────────────────────────
    // Converte a URL em formato do Google AMP Cache, que frequentemente consegue
    // acessar páginas bloqueadas para servidores.

    private async Task<ProdutoDto?> TentarExtrairViaGoogleAmpAsync(string url, CancellationToken ct)
    {
        try
        {
            // Constrói URL do Google AMP: https://<host>.<tld>.cdn.ampproject.org/v/s/<url>
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return null;

            var host = uri.Host.Replace(".", "-"); // magazineluiza.com.br → magazineluiza-com-br
            var ampUrl = $"https://{host}.cdn.ampproject.org/v/s/{uri.Host}{uri.PathAndQuery}?amp_js_v=0.1";

            var req = new HttpRequestMessage(HttpMethod.Get, ampUrl);
            req.Headers.Add("User-Agent", _userAgents[0]);
            req.Headers.Add("Accept", "text/html");

            using var resp = await _httpClient.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
            if (!resp.IsSuccessStatusCode) return null;

            var html = await resp.Content.ReadAsStringAsync(ct);
            return ParseHtml(html, url);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Falha na extração via AMP cache de {Url}", url);
            return null;
        }
    }

    // ─── Estratégia 3: Scrape.do Proxy ───────────────────────────────────────

    private async Task<ProdutoDto?> TentarExtrairViaScrapeDoAsync(string url, CancellationToken ct)
    {
        try
        {
            var token = Environment.GetEnvironmentVariable("SCRAPEDO_TOKEN");
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogDebug("SCRAPEDO_TOKEN não configurada, pulando estratégia 3");
                return null;
            }

            var proxyUrl = $"http://api.scrape.do/?token={token}&url={Uri.EscapeDataString(url)}";

            var req = new HttpRequestMessage(HttpMethod.Get, proxyUrl);
            
            using var resp = await _httpClient.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogDebug("Scrape.do retornou {Status} para {Url}", resp.StatusCode, url);
                return null;
            }

            var html = await resp.Content.ReadAsStringAsync(ct);
            return ParseHtml(html, url);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Falha na extração via Scrape.do de {Url}", url);
            return null;
        }
    }

    // ─── Parser HTML ──────────────────────────────────────────────────────────

    private ProdutoDto? ParseHtml(string html, string originalUrl)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // 1. Tentar JSON-LD (Schema.org) — padrão usado pela Magalu, Americanas, Shopee etc.
        var jsonLdResult = TryParseJsonLd(doc, originalUrl);
        if (jsonLdResult is not null) return jsonLdResult;

        // 2. Fallback: Open Graph / meta tags
        var titulo = GetMetaContent(doc, "og:title")
                  ?? GetMetaContent(doc, "twitter:title")
                  ?? doc.DocumentNode.SelectSingleNode("//title")?.InnerText?.Trim();

        if (string.IsNullOrWhiteSpace(titulo)) return null;

        var imagem = GetMetaContent(doc, "og:image") ?? GetMetaContent(doc, "twitter:image");
        var loja   = GetMetaContent(doc, "og:site_name") ?? ExtrairDominio(originalUrl);

        decimal preco = 0;
        var precoStr = GetMetaContent(doc, "product:price:amount")
                    ?? GetMetaContent(doc, "og:price:amount");

        if (!string.IsNullOrWhiteSpace(precoStr))
            TryParsePrice(precoStr, out preco);

        // Regex BRL como última tentativa de preço
        if (preco <= 0)
        {
            var m = Regex.Match(html, @"R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})");
            if (m.Success) TryParsePrice(m.Groups[1].Value, out preco);
        }

        return new ProdutoDto
        {
            Nome  = HtmlEntity.DeEntitize(titulo.Trim()),
            Preco = preco,
            Imagem = imagem ?? string.Empty,
            Url   = originalUrl,
            Loja  = loja ?? string.Empty,
            Fonte = "Link Direto",
        };
    }

    // ─── JSON-LD / Schema.org ─────────────────────────────────────────────────

    private ProdutoDto? TryParseJsonLd(HtmlDocument doc, string originalUrl)
    {
        var nodes = doc.DocumentNode.SelectNodes("//script[@type='application/ld+json']");
        if (nodes is null) return null;

        foreach (var node in nodes)
        {
            try
            {
                using var json = JsonDocument.Parse(node.InnerText);
                var root = json.RootElement;

                // Suporta array de objetos e objeto único
                JsonElement product = default;
                if (root.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in root.EnumerateArray())
                        if (IsProductType(item)) { product = item; break; }
                }
                else if (root.ValueKind == JsonValueKind.Object && IsProductType(root))
                {
                    product = root;
                }

                if (product.ValueKind == JsonValueKind.Undefined) continue;

                var nome = GetString(product, "name");
                if (string.IsNullOrWhiteSpace(nome)) continue;

                var imagem = GetString(product, "image");
                var loja   = GetString(product, "brand", "name")
                          ?? ExtrairDominio(originalUrl);

                decimal preco = 0;
                if (product.TryGetProperty("offers", out var offers))
                {
                    var offersEl = offers.ValueKind == JsonValueKind.Array
                        ? offers.EnumerateArray().FirstOrDefault()
                        : offers;

                    var precoStr = GetString(offersEl, "price");
                    if (!string.IsNullOrWhiteSpace(precoStr))
                        TryParsePrice(precoStr, out preco);
                }

                return new ProdutoDto
                {
                    Nome   = nome.Trim(),
                    Preco  = preco,
                    Imagem = imagem ?? string.Empty,
                    Url    = originalUrl,
                    Loja   = loja ?? string.Empty,
                    Fonte  = "Link Direto",
                };
            }
            catch
            {
                // JSON malformado, ignora
            }
        }

        return null;
    }

    private static bool IsProductType(JsonElement el)
    {
        if (!el.TryGetProperty("@type", out var t)) return false;
        var type = t.GetString() ?? "";
        return type.Equals("Product", StringComparison.OrdinalIgnoreCase) ||
               type.Equals("ItemPage", StringComparison.OrdinalIgnoreCase);
    }

    private static string? GetString(JsonElement el, string key, string? nested = null)
    {
        if (!el.TryGetProperty(key, out var v)) return null;
        if (nested is not null)
        {
            if (v.ValueKind == JsonValueKind.Object) return GetString(v, nested);
            if (v.ValueKind == JsonValueKind.Array)
                return v.EnumerateArray().Select(i => GetString(i, nested)).FirstOrDefault(s => s is not null);
            return null;
        }
        return v.ValueKind == JsonValueKind.String ? v.GetString() : v.ToString();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static string? GetMetaContent(HtmlDocument doc, string propertyName)
        => doc.DocumentNode
            .SelectSingleNode($"//meta[@property='{propertyName}' or @name='{propertyName}']")
            ?.GetAttributeValue("content", null);

    private static string ExtrairDominio(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return "Link Direto";
        var host = uri.Host.Replace("www.", "").Split('.')[0];
        return char.ToUpper(host[0]) + host[1..];
    }

    private static bool TryParsePrice(string priceStr, out decimal price)
    {
        price = 0;
        priceStr = Regex.Replace(priceStr, @"[^\d.,]", "").Trim();
        if (string.IsNullOrWhiteSpace(priceStr)) return false;

        // Formato BR: 1.234,56
        if (priceStr.Contains(',') && priceStr.LastIndexOf(',') > priceStr.LastIndexOf('.'))
            return decimal.TryParse(priceStr, NumberStyles.Any, new CultureInfo("pt-BR"), out price);

        // Formato US/neutro: 1234.56
        return decimal.TryParse(priceStr, NumberStyles.Any, CultureInfo.InvariantCulture, out price);
    }
}
