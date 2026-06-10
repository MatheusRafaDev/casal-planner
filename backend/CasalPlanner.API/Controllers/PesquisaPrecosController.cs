using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using System.Text.RegularExpressions;
using CasalPlanner.API.Services;

namespace CasalPlanner.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PesquisaPrecosController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly GroqService _groqService;

        // Domínios confiáveis (lojas oficiais)
        private static readonly HashSet<string> TrustedDomains = new() 
        { 
            "magazineluiza", "americanas", "mercadolivre", "amazon", "casasbahia", 
            "ponto", "extra", "submarino", "shoptime", "kabum", "pichau", "terabyte",
            "dell", "lenovo", "acer", "samsung", "lg", "apple", "xiaomi", "motorola",
            "nokia", "sony", "philips", "hp", "asus", "positivo", "iplace"
        };

        // Marketplaces conhecidos
        private static readonly HashSet<string> MarketplaceDomains = new()
        {
            "olx", "enjoei", "mercadolivre", "shopee", "aliexpress", "ebay", 
            "etsy", "facebook", "marketplace", "trocafone", "bne store", 
            "wireless source", "taqi", "br celulares"
        };

        // Palavras que indicam produto usado/recondicionado
        private static readonly HashSet<string> UsedProductKeywords = new()
        {
            "usado", "semi-novo", "semi novo", "seminovo", "recondicionado", 
            "refurbished", "open box", "como novo", "bom estado", "excelente estado"
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
            try
            {
                if (string.IsNullOrWhiteSpace(q) || q.Length > 200)
                    return BadRequest(new { error = "Consulta inválida" });

                // IDENTIFICAR MARCA COM IA
                string marcaIdentificada = marca ?? "";
                string nomeValidado = q;
                
                if (string.IsNullOrEmpty(marca))
                {
                    try
                    {
                        var validacao = await _groqService.ValidateProductAsync(q, buscaUsuario ?? "");
                        marcaIdentificada = validacao.Marca;
                        nomeValidado = validacao.NomeValidado;
                    }
                    catch (Exception)
                    {
                        marcaIdentificada = "";
                    }
                }

                string queryFinal = string.IsNullOrEmpty(marcaIdentificada) 
                    ? nomeValidado 
                    : $"{nomeValidado} {marcaIdentificada}";

                var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");
                if (string.IsNullOrEmpty(apiKey))
                    return StatusCode(500, new { error = "API não configurada" });

                var url = $"https://serpapi.com/search?engine=google_shopping&q={Uri.EscapeDataString(queryFinal)}&gl=br&hl=pt&num=20&api_key={apiKey}";

                var client = _httpClientFactory.CreateClient();
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
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Erro interno", mensagem = ex.Message });
            }
        }

        private List<object> ProcessResults(string jsonContent, string marcaIdentificada, string nomeValidado)
        {
            try
            {
                using var doc = JsonDocument.Parse(jsonContent);
                
                if (!doc.RootElement.TryGetProperty("shopping_results", out var results))
                {
                    if (doc.RootElement.TryGetProperty("organic_results", out var organic))
                        results = organic;
                    else if (doc.RootElement.TryGetProperty("products", out var products))
                        results = products;
                    else
                        return new List<object>();
                }

                var produtos = new List<object>();

                foreach (var item in results.EnumerateArray())
                {
                    var price = ExtractPrice(item);
                    if (price <= 0) continue;

                    var source = item.TryGetProperty("source", out var s) ? s.GetString() ?? "" : "";
                    var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                    var link = ExtractLink(item);
                    
                    if (string.IsNullOrEmpty(link)) continue;

                    // 🔥 VALIDAÇÕES CORRIGIDAS
                    var isUsed = IsUsedProduct(title);
                    var isMarketplace = IsMarketplaceStore(source, title, isUsed);
                    var isTrusted = IsTrustedStore(source) && !isMarketplace && !isUsed;
                    
                    // MARCA DO PRODUTO
                    var marcaProduto = marcaIdentificada;
                    if (string.IsNullOrEmpty(marcaProduto))
                    {
                        marcaProduto = ExtractMarcaFromTitle(title);
                    }

                    var produto = new
                    {
                        id = produtos.Count,
                        nome = title,
                        loja = source,
                        preco = price,
                        link = link,
                        imagem = item.TryGetProperty("thumbnail", out var thumb) ? thumb.GetString() ?? "" : "",
                        is_trusted = isTrusted,
                        is_marketplace = isMarketplace,
                        is_used = isUsed,
                        marca = marcaProduto,
                        nome_validado = nomeValidado
                    };
                    
                    produtos.Add(produto);
                }

                // Ordena: primeiros confiáveis, depois por preço
                return produtos
                    .OrderByDescending(p => ((dynamic)p).is_trusted)
                    .ThenBy(p => ((dynamic)p).preco)
                    .Take(20)
                    .ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERRO: {ex.Message}");
                return new List<object>();
            }
        }

        private bool IsTrustedStore(string storeName)
        {
            if (string.IsNullOrEmpty(storeName)) return false;
            var storeLower = storeName.ToLowerInvariant();
            return TrustedDomains.Any(d => storeLower.Contains(d));
        }

        // 🔥 NOVA REGRA: Se é produto USADO, automaticamente é MARKETPLACE
        private bool IsMarketplaceStore(string storeName, string productTitle, bool isUsed)
        {
            if (string.IsNullOrEmpty(storeName)) return false;
            
            var storeLower = storeName.ToLowerInvariant();
            var titleLower = (productTitle ?? "").ToLowerInvariant();
            
            // 🔥 REGRA 1: Produto usado SEMPRE é marketplace
            if (isUsed)
                return true;
            
            // REGRA 2: Verifica se é marketplace conhecido
            if (MarketplaceDomains.Any(m => storeLower.Contains(m)))
                return true;
            
            // REGRA 3: Verifica palavras no título
            if (UsedProductKeywords.Any(k => titleLower.Contains(k)))
                return true;
            
            return false;
        }

        private bool IsUsedProduct(string productTitle)
        {
            if (string.IsNullOrEmpty(productTitle)) return false;
            var titleLower = productTitle.ToLowerInvariant();
            return UsedProductKeywords.Any(keyword => titleLower.Contains(keyword));
        }

        private string ExtractMarcaFromTitle(string title)
        {
            if (string.IsNullOrEmpty(title)) return "";
            
            var knownBrands = new[] { "Apple", "Samsung", "LG", "Xiaomi", "Motorola", "Nokia", 
                                       "Sony", "Philips", "Dell", "HP", "Lenovo", "Acer" };
            
            foreach (var marca in knownBrands)
            {
                if (title.Contains(marca, StringComparison.OrdinalIgnoreCase))
                    return marca;
            }
            
            return "";
        }

        private static string ExtractLink(JsonElement item)
        {
            if (item.TryGetProperty("link", out var link) && 
                !link.GetString()?.Contains("google.com/shopping") == true)
                return link.GetString() ?? "";
            
            if (item.TryGetProperty("product_link", out var productLink))
                return productLink.GetString() ?? "";
            
            if (item.TryGetProperty("serpapi_link", out var serpLink))
                return serpLink.GetString() ?? "";
            
            return "";
        }

        private static decimal ExtractPrice(JsonElement item)
        {
            if (!item.TryGetProperty("price", out var priceElem))
            {
                if (item.TryGetProperty("extracted_price", out var extracted))
                    priceElem = extracted;
                else
                    return 0;
            }

            var priceStr = priceElem.GetString();
            if (string.IsNullOrEmpty(priceStr)) return 0;

            var cleaned = Regex.Replace(priceStr, @"[^\d,.]", "");
            
            if (cleaned.Contains(",") && cleaned.IndexOf(",") > cleaned.IndexOf("."))
                cleaned = cleaned.Replace(".", "").Replace(",", ".");
            else if (cleaned.Contains(",") && !cleaned.Contains("."))
                cleaned = cleaned.Replace(",", "");
            
            if (decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var price))
                return price;
                
            if (decimal.TryParse(priceStr, System.Globalization.NumberStyles.Currency, 
                System.Globalization.CultureInfo.GetCultureInfo("pt-BR"), out price))
                return price;
                
            return 0;
        }
    }
}