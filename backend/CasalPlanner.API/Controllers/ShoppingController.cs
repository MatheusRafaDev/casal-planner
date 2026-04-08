using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShoppingController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ShoppingController> _logger;

        // Sites confiáveis (lojas oficiais)
        private readonly HashSet<string> _trustedSites = new(StringComparer.OrdinalIgnoreCase)
        {
            "amazon", "magalu", "magazine luiza", "casas bahia", "ponto frio", "extra",
            "americanas", "submarino", "shoptime", "fast shop", "carrefour", "walmart",
            "samsung", "apple", "dell", "lenovo", "acer", "hp", "multilaser", "positivo",
            "kabum", "terabyteshop", "pichau"
        };

        // Sites de marketplace/classificados (baixa prioridade)
        private readonly HashSet<string> _lowPrioritySites = new(StringComparer.OrdinalIgnoreCase)
        {
            "olx", "mercado livre", "enjoei", "facebook marketplace", "shopee", "aliexpress"
        };

        public ShoppingController(
            IHttpClientFactory httpClientFactory,
            ILogger<ShoppingController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { error = "Parâmetro 'q' é obrigatório." });

            if (q.Length > 200)
                return BadRequest(new { error = "Consulta muito longa. Máximo de 200 caracteres." });

            var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");
            
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SERPAPI_KEY não configurada no ambiente");
                return StatusCode(500, new { error = "Configuração da API não encontrada." });
            }

            var url = $"https://serpapi.com/search?" +
                      $"engine=google_shopping" +
                      $"&q={Uri.EscapeDataString(q)}" +
                      $"&gl=br&hl=pt&num=20" +
                      $"&api_key={apiKey}";

            try
            {
                var client = _httpClientFactory.CreateClient("SerpApiClient");
                client.Timeout = TimeSpan.FromSeconds(30);
                
                var response = await client.GetAsync(url);
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("SerpApi retornou {StatusCode}: {Content}", 
                        response.StatusCode, content);
                    return StatusCode(502, new { error = "Erro ao buscar produtos. Tente novamente." });
                }

                // Processar e ordenar os resultados
                var processedResults = ProcessShoppingResults(content);
                return Ok(new { shopping_results = processedResults });
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Timeout na requisição para SerpApi");
                return StatusCode(504, new { error = "Tempo limite excedido." });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Erro de rede ao consultar SerpApi");
                return StatusCode(502, new { error = "Erro de conexão com o serviço de busca." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao consultar SerpApi");
                return StatusCode(500, new { error = "Erro interno no servidor." });
            }
        }

        private List<object> ProcessShoppingResults(string jsonContent)
        {
            try
            {
                using var doc = JsonDocument.Parse(jsonContent);
                var root = doc.RootElement;
                
                if (!root.TryGetProperty("shopping_results", out var shoppingResults))
                    return new List<object>();

                var produtos = new List<ProdutoProcessado>();

                foreach (var item in shoppingResults.EnumerateArray())
                {
                    // Extrair preço
                    var price = ExtractPrice(item);
                    if (price <= 0) continue;

                    var source = item.TryGetProperty("source", out var sourceElem) 
                        ? sourceElem.GetString() ?? "" 
                        : "";
                    
                    var title = item.TryGetProperty("title", out var titleElem)
                        ? titleElem.GetString() ?? ""
                        : "";

                    // Determinar prioridades
                    var isTrusted = IsTrustedSite(source);
                    var isLowPriority = IsLowPrioritySite(source);

                    produtos.Add(new ProdutoProcessado
                    {
                        Id = item.TryGetProperty("position", out var posElem) ? posElem.GetInt32() : produtos.Count,
                        Nome = title,
                        Loja = source,
                        Preco = price,
                        Link = item.TryGetProperty("product_link", out var linkElem) ? linkElem.GetString() : 
                               item.TryGetProperty("link", out var lElem) ? lElem.GetString() : "",
                        Imagem = item.TryGetProperty("thumbnail", out var thumbElem) ? thumbElem.GetString() : "",
                        Rating = item.TryGetProperty("rating", out var ratingElem) ? ratingElem.GetDouble() : 0,
                        Reviews = item.TryGetProperty("reviews", out var revElem) ? revElem.GetInt32() : 0,
                        IsTrusted = isTrusted,
                        IsLowPriority = isLowPriority
                    });
                }

                // Ordenar produtos:
                // 1. Sites confiáveis (IsTrusted = true)
                // 2. Sites normais
                // 3. Marketplaces/baixa prioridade (IsLowPriority = true)
                // Dentro de cada grupo, ordenar por preço (menor para maior)
                var resultadosOrdenados = produtos
                    .OrderBy(p => !p.IsTrusted)      // Trusted primeiro
                    .ThenBy(p => p.IsLowPriority)    // Low priority por último
                    .ThenBy(p => p.Preco)            // Menor preço primeiro
                    .Take(10)                         // Limitar a 10 produtos
                    .Select(p => new
                    {
                        position = p.Id,
                        title = p.Nome,
                        source = p.Loja,
                        price = p.Preco,
                        product_link = p.Link,
                        thumbnail = p.Imagem,
                        rating = p.Rating,
                        reviews = p.Reviews,
                        is_trusted = p.IsTrusted,
                        is_low_priority = p.IsLowPriority
                    })
                    .ToList<object>();

                return resultadosOrdenados;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar resultados");
                return new List<object>();
            }
        }

        private decimal ExtractPrice(JsonElement item)
        {
            try
            {
                if (item.TryGetProperty("price", out var priceElem))
                {
                    var priceStr = priceElem.GetString();
                    if (!string.IsNullOrEmpty(priceStr))
                    {
                        // Limpar string do preço (remover R$, pontos, etc)
                        var cleaned = System.Text.RegularExpressions.Regex.Replace(priceStr, @"[^\d,]", "");
                        cleaned = cleaned.Replace(".", "").Replace(",", ".");
                        if (decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any, 
                            System.Globalization.CultureInfo.InvariantCulture, out var price))
                        {
                            return price;
                        }
                    }
                }
                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private bool IsTrustedSite(string source)
        {
            if (string.IsNullOrEmpty(source)) return false;
            return _trustedSites.Any(site => source.Contains(site, StringComparison.OrdinalIgnoreCase));
        }

        private bool IsLowPrioritySite(string source)
        {
            if (string.IsNullOrEmpty(source)) return false;
            return _lowPrioritySites.Any(site => source.Contains(site, StringComparison.OrdinalIgnoreCase));
        }

        private class ProdutoProcessado
        {
            public int Id { get; set; }
            public string Nome { get; set; } = "";
            public string Loja { get; set; } = "";
            public decimal Preco { get; set; }
            public string Link { get; set; } = "";
            public string Imagem { get; set; } = "";
            public double Rating { get; set; }
            public int Reviews { get; set; }
            public bool IsTrusted { get; set; }
            public bool IsLowPriority { get; set; }
        }
    }
}