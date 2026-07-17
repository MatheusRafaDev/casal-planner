using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using System.Text.RegularExpressions;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Services;

namespace CasalPlanner.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PesquisaPrecosController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly GroqService _groqService;

        // Lojas oficiais confiáveis (BR)
        private static readonly HashSet<string> TrustedDomains = new(StringComparer.OrdinalIgnoreCase)
        {
            "magazine luiza", "magalu", "americanas", "mercado livre", "amazon",
            "casas bahia", "ponto frio", "extra", "submarino", "shoptime",
            "kabum", "pichau", "terabyte", "dell", "lenovo", "acer", "samsung",
            "lg", "apple", "xiaomi", "motorola", "nokia", "sony", "philips",
            "hp", "asus", "positivo", "iplace", "fast shop", "fastshop",
            "carrefour", "leroy merlin", "tok stok", "etna", "riachuelo",
            "renner", "havan", "centauro", "netshoes", "dafiti", "marisa",
            "natura", "boticario", "epocacosmeticos", "beleza na web",
            "multilaser", "multiloja", "eletrosom", "novo mundo",
            "colombo", "ricardo eletro", "loja do mecanico", "ferramentas kennedy"
        };

        // Mapeamento loja → domínio para favicon
        private static readonly Dictionary<string, string> StoreDomainMap = new(StringComparer.OrdinalIgnoreCase)
        {
            { "magazine luiza", "magazineluiza.com.br" },
            { "magalu", "magazineluiza.com.br" },
            { "americanas", "americanas.com.br" },
            { "mercado livre", "mercadolivre.com.br" },
            { "amazon", "amazon.com.br" },
            { "casas bahia", "casasbahia.com.br" },
            { "ponto frio", "pontofrio.com.br" },
            { "ponto", "pontofrio.com.br" },
            { "extra", "extra.com.br" },
            { "submarino", "submarino.com.br" },
            { "shoptime", "shoptime.com.br" },
            { "kabum", "kabum.com.br" },
            { "pichau", "pichau.com.br" },
            { "terabyte", "terabyteshop.com.br" },
            { "shopee", "shopee.com.br" },
            { "aliexpress", "aliexpress.com" },
            { "ebay", "ebay.com" },
            { "dell", "dell.com" },
            { "lenovo", "lenovo.com" },
            { "samsung", "samsung.com.br" },
            { "apple", "apple.com/br" },
            { "lg", "lge.com" },
            { "fast shop", "fastshop.com.br" },
            { "fastshop", "fastshop.com.br" },
            { "carrefour", "carrefour.com.br" },
            { "leroy merlin", "leroymerlin.com.br" },
            { "tok stok", "tokstok.com.br" },
            { "centauro", "centauro.com.br" },
            { "netshoes", "netshoes.com.br" },
            { "dafiti", "dafiti.com.br" },
            { "iplace", "iplace.com.br" },
            { "novo mundo", "novomundo.com.br" },
            { "colombo", "colombo.com.br" },
        };

        // Marketplaces conhecidos
        private static readonly HashSet<string> MarketplaceDomains = new(StringComparer.OrdinalIgnoreCase)
        {
            "olx", "enjoei", "shopee", "aliexpress", "ebay",
            "etsy", "facebook", "marketplace", "trocafone", "bne store",
            "wireless source", "taqi", "br celulares", "elo7"
        };

        // Palavras que indicam produto usado/recondicionado
        private static readonly HashSet<string> UsedProductKeywords = new(StringComparer.OrdinalIgnoreCase)
        {
            "usado", "semi-novo", "semi novo", "seminovo", "recondicionado",
            "refurbished", "open box", "como novo", "bom estado", "excelente estado",
            "segunda mão", "segunda mao", "c/ avaria", "avariado"
        };

        public PesquisaPrecosController(
            IHttpClientFactory httpClientFactory,
            GroqService groqService)
        {
            _httpClientFactory = httpClientFactory;
            _groqService = groqService;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] string q,
            [FromQuery] string? marca = null,
            [FromQuery] string? buscaUsuario = null)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length > 300)
                return BadRequest(new { error = "Consulta inválida" });

            string marcaIdentificada = marca ?? "";
            string nomeValidado = q.Trim();

            if (string.IsNullOrEmpty(marca))
            {
                try
                {
                    var validacao = await _groqService.ValidateProductAsync(q, buscaUsuario ?? q);
                    marcaIdentificada = validacao.Marca?.Trim() ?? "";
                    nomeValidado = string.IsNullOrWhiteSpace(validacao.NomeValidado) ? q : validacao.NomeValidado.Trim();
                }
                catch
                {
                    marcaIdentificada = ExtractBrandFallback(q);
                }
            }

            // Monta query de busca: "Marca NomeProduto" se marca identificada e não já contida
            string queryFinal;
            if (!string.IsNullOrEmpty(marcaIdentificada) &&
                !nomeValidado.Contains(marcaIdentificada, StringComparison.OrdinalIgnoreCase))
                queryFinal = $"{marcaIdentificada} {nomeValidado}";
            else
                queryFinal = nomeValidado;

            var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");
            if (string.IsNullOrEmpty(apiKey))
                return StatusCode(500, new { error = "API não configurada" });

            // Busca no Google Shopping BR com mais resultados
            var url = $"https://serpapi.com/search?engine=google_shopping&q={Uri.EscapeDataString(queryFinal)}&gl=br&hl=pt-BR&num=30&api_key={apiKey}";

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(15);
            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                return StatusCode(502, new { error = "Erro ao buscar produtos" });

            var content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrEmpty(content))
                return StatusCode(500, new { error = "Resposta vazia da API" });

            var produtos = ProcessResults(content, marcaIdentificada, nomeValidado);

            return Ok(new
            {
                produtos,
                marca_identificada = marcaIdentificada,
                nome_validado = nomeValidado,
                query_utilizada = queryFinal,
                total = produtos.Count
            });
        }

        private List<object> ProcessResults(string jsonContent, string marcaIdentificada, string nomeValidado)
        {
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
                    return new List<object>();

                var produtos = new List<object>();

                foreach (var item in results.EnumerateArray())
                {
                    var price = ExtractPrice(item);
                    if (price <= 0) continue;

                    var source = item.TryGetProperty("source", out var s) ? s.GetString() ?? "" : "";
                    var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                    var link = ExtractLink(item);

                    if (string.IsNullOrEmpty(link)) continue;

                    var isUsed = IsUsedProduct(title);
                    var isMarketplace = IsMarketplaceStore(source, title, isUsed);
                    var isTrusted = IsTrustedStore(source) && !isMarketplace && !isUsed;

                    // Extrai marca do produto
                    var marcaProduto = !string.IsNullOrEmpty(marcaIdentificada)
                        ? marcaIdentificada
                        : ExtractBrandFallback(title);

                    // Preço antigo / desconto
                    decimal precoAntigo = 0;
                    if (item.TryGetProperty("old_price", out var oldPriceElem))
                        precoAntigo = ExtractPriceFromElement(oldPriceElem);

                    // Logo da loja via favicon Google
                    var logoUrl = GetStoreLogo(source, link);
                    var logoMarcaUrl = GetBrandLogo(marcaProduto);

                    // Parcelamento
                    string? parcelamento = null;
                    if (item.TryGetProperty("installment", out var inst))
                    {
                        var months = inst.TryGetProperty("months", out var mo) ? mo.GetInt32() : 0;
                        if (months > 1) parcelamento = months.ToString();
                    }

                    var produto = new
                    {
                        id = produtos.Count,
                        nome = title,
                        loja = NormalizarNomeLoja(source),
                        preco = price,
                        precoAntigo = precoAntigo > 0 ? precoAntigo : (decimal?)null,
                        link,
                        imagem = item.TryGetProperty("thumbnail", out var thumb) ? thumb.GetString() ?? "" : "",
                        logo_loja = logoUrl,
                        logo_marca = logoMarcaUrl,
                        is_trusted = isTrusted,
                        is_marketplace = isMarketplace,
                        is_used = isUsed,
                        marca = marcaProduto,
                        parcelamento,
                        nome_validado = nomeValidado
                    };

                    produtos.Add(produto);
                }

                // Ordena: lojas confiáveis primeiro, depois por preço
                return produtos
                    .Cast<dynamic>()
                    .OrderByDescending(p => (bool)p.is_trusted)
                    .ThenBy(p => (bool)p.is_marketplace)
                    .ThenBy(p => (decimal)p.preco)
                    .Take(20)
                    .Cast<object>()
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERRO ProcessResults: {ex.Message}");
                return new List<object>();
            }
        }

        private static string GetStoreLogo(string storeName, string productLink)
        {
            // Tenta mapear pelo nome da loja
            var storeKey = StoreDomainMap.Keys
                .FirstOrDefault(k => storeName.Contains(k, StringComparison.OrdinalIgnoreCase));

            if (storeKey != null)
                return $"https://www.google.com/s2/favicons?sz=32&domain={StoreDomainMap[storeKey]}";

            // Extrai domínio da URL do produto
            try
            {
                var uri = new Uri(productLink);
                return $"https://www.google.com/s2/favicons?sz=32&domain={uri.Host}";
            }
            catch
            {
                return "";
            }
        }

        private static readonly Dictionary<string, string> BrandDomainMap = new(StringComparer.OrdinalIgnoreCase)
        {
            { "apple", "apple.com" },
            { "samsung", "samsung.com" },
            { "lg", "lg.com" },
            { "xiaomi", "mi.com" },
            { "motorola", "motorola.com" },
            { "nokia", "nokia.com" },
            { "sony", "sony.com" },
            { "philips", "philips.com" },
            { "dell", "dell.com" },
            { "hp", "hp.com" },
            { "lenovo", "lenovo.com" },
            { "acer", "acer.com" },
            { "asus", "asus.com" },
            { "positivo", "positivotecnologia.com.br" },
            { "multilaser", "multilaser.com.br" },
            { "braun", "braun.com" },
            { "bosch", "bosch.com" },
            { "electrolux", "electrolux.com.br" },
            { "tramontina", "tramontina.com.br" },
            { "mondial", "emondial.com.br" },
            { "cadence", "cadence.com.br" },
            { "panasonic", "panasonic.com" },
            { "jbl", "jbl.com.br" },
            { "bose", "bose.com" },
            { "logitech", "logitech.com" },
            { "razer", "razer.com" },
            { "hyperx", "hyperxgaming.com" },
            { "corsair", "corsair.com" },
            { "intel", "intel.com" },
            { "amd", "amd.com" },
            { "nvidia", "nvidia.com" },
            { "wd", "westerndigital.com" },
            { "seagate", "seagate.com" },
            { "kingston", "kingston.com" },
            { "brastemp", "brastemp.com.br" },
            { "consul", "consul.com.br" },
            { "arno", "arno.com.br" },
            { "philco", "philco.com.br" },
            { "britânia", "britania.com.br" },
            { "oster", "oster.com.br" },
            { "midea", "midea.com/br" },
            { "tcl", "tcl.com/br" },
            { "aoc", "aoc.com/br" },
            { "walita", "walita.com.br" },
            { "black+decker", "blackanddecker.com.br" },
            { "fischer", "fischer.com.br" },
            { "suggar", "suggar.com.br" },
            { "mueller", "mueller.ind.br" },
            { "dako", "dako.com.br" },
            { "atlas", "atlas.ind.br" },
            { "gree", "gree.com.br" },
            { "daikin", "daikin.com.br" },
            { "elgin", "elgin.com.br" },
            { "wap", "wap.ind.br" },
            { "kitchenaid", "kitchenaid.com.br" },
            { "mallory", "mallory.com.br" }
        };

        private static string GetBrandLogo(string brandName)
        {
            if (string.IsNullOrWhiteSpace(brandName)) return "";
            
            var brandKey = BrandDomainMap.Keys
                .FirstOrDefault(k => brandName.Contains(k, StringComparison.OrdinalIgnoreCase));

            if (brandKey != null)
                return $"https://www.google.com/s2/favicons?sz=32&domain={BrandDomainMap[brandKey]}";

            return "";
        }

        private static string NormalizarNomeLoja(string storeName)
        {
            if (string.IsNullOrEmpty(storeName)) return storeName;
            // Capitaliza corretamente nomes conhecidos
            var lower = storeName.ToLowerInvariant();
            if (lower.Contains("magazine luiza") || lower.Contains("magalu")) return "Magazine Luiza";
            if (lower.Contains("mercado livre")) return "Mercado Livre";
            if (lower.Contains("casas bahia")) return "Casas Bahia";
            if (lower.Contains("ponto frio")) return "Ponto Frio";
            if (lower.Contains("fast shop") || lower.Contains("fastshop")) return "Fast Shop";
            if (lower.Contains("leroy merlin")) return "Leroy Merlin";
            if (lower.Contains("tok stok")) return "Tok&Stok";
            if (lower.Contains("americanas")) return "Americanas";
            if (lower.Contains("amazon")) return "Amazon";
            if (lower.Contains("kabum")) return "KaBuM!";
            if (lower.Contains("pichau")) return "Pichau";
            if (lower.Contains("shopee")) return "Shopee";
            return storeName;
        }

        private bool IsTrustedStore(string storeName)
        {
            if (string.IsNullOrEmpty(storeName)) return false;
            var lower = storeName.ToLowerInvariant();
            return TrustedDomains.Any(d => lower.Contains(d.ToLowerInvariant()));
        }

        private bool IsMarketplaceStore(string storeName, string productTitle, bool isUsed)
        {
            if (string.IsNullOrEmpty(storeName)) return false;
            if (isUsed) return true;

            var storeLower = storeName.ToLowerInvariant();
            var titleLower = (productTitle ?? "").ToLowerInvariant();

            if (MarketplaceDomains.Any(m => storeLower.Contains(m.ToLowerInvariant())))
                return true;

            if (UsedProductKeywords.Any(k => titleLower.Contains(k.ToLowerInvariant())))
                return true;

            return false;
        }

        private bool IsUsedProduct(string productTitle)
        {
            if (string.IsNullOrEmpty(productTitle)) return false;
            var lower = productTitle.ToLowerInvariant();
            return UsedProductKeywords.Any(k => lower.Contains(k.ToLowerInvariant()));
        }

        private static string ExtractBrandFallback(string text)
        {
            var knownBrands = new[]
            {
                "Apple", "Samsung", "LG", "Xiaomi", "Motorola", "Nokia",
                "Sony", "Philips", "Dell", "HP", "Lenovo", "Acer", "Asus",
                "Positivo", "Multilaser", "Braun", "Bosch", "Electrolux",
                "Tramontina", "Mondial", "Cadence", "Panasonic", "JBL",
                "Bose", "Logitech", "Razer", "HyperX", "Corsair",
                "Intel", "AMD", "Nvidia", "WD", "Seagate", "Kingston",
                "Brastemp", "Consul", "Arno", "Philco", "Britânia", "Oster", 
                "Midea", "TCL", "AOC", "Walita", "Black+Decker", "Fischer", 
                "Suggar", "Mueller", "Dako", "Atlas", "Gree", "Daikin", 
                "Elgin", "Wap", "KitchenAid", "Mallory"
            };

            // Prioritize brands at the beginning of the text (more likely to be the actual brand)
            var words = text.Split(new[] { ' ', '-', '_', '/' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var word in words)
            {
                foreach (var marca in knownBrands)
                {
                    if (word.Equals(marca, StringComparison.OrdinalIgnoreCase))
                        return marca;
                }
            }

            // Fallback: check if brand appears anywhere in text
            foreach (var marca in knownBrands)
                if (text.Contains(marca, StringComparison.OrdinalIgnoreCase))
                    return marca;

            return "";
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
            // Tenta extracted_price primeiro (já é número)
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
            if (string.IsNullOrEmpty(priceStr)) return 0;

            // Remove tudo exceto dígitos, ponto e vírgula
            var cleaned = Regex.Replace(priceStr, @"[^\d,.]", "");

            // Formato BR: 1.234,56 → 1234.56
            if (cleaned.Contains(",") && cleaned.LastIndexOf(",") > cleaned.LastIndexOf("."))
                cleaned = cleaned.Replace(".", "").Replace(",", ".");
            // Apenas vírgula como decimal: 1234,56
            else if (cleaned.Contains(",") && !cleaned.Contains("."))
                cleaned = cleaned.Replace(",", ".");

            if (decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var price))
                return price;

            return 0;
        }
    }
}