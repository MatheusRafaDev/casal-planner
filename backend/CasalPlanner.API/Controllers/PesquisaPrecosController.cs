
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.RegularExpressions;
using CasalPlanner.API.Services;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PesquisaPrecosController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<PesquisaPrecosController> _logger;
        private readonly GroqService _groqService;

        private static readonly HashSet<string> TrustedDomains = new() 
        { 
            "magazineluiza", "americanas", "mercadolivre", "amazon", "casasbahia", "ponto", "extra", "submarino", "shoptime" 
        };
        

        public PesquisaPrecosController(
            IHttpClientFactory httpClientFactory,
            ILogger<PesquisaPrecosController> logger,
            GroqService groqService)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _groqService = groqService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length > 200)
                return BadRequest(new { error = "Consulta inválida. Máximo 200 caracteres." });

            var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SERPAPI_KEY não configurada");
                return StatusCode(500, new { error = "Configuração da API não encontrada." });
            }

            var url = $"https://serpapi.com/search?engine=google_shopping&q={Uri.EscapeDataString(q)}&gl=br&hl=pt&num=20&api_key={apiKey}";

            try
            {
                var client = _httpClientFactory.CreateClient("SerpApiClient");
                var response = await client.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                    return StatusCode(502, new { error = "Erro ao buscar produtos." });

                var content = await response.Content.ReadAsStringAsync();
                var produtos = await ProcessResultsAsync(content);
                
                return Ok(new { shopping_results = produtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao consultar SerpApi");
                return StatusCode(500, new { error = "Erro interno." });
            }
        }

        private async Task<List<object>> ProcessResultsAsync(string jsonContent)
        {
            try
            {
                using var doc = JsonDocument.Parse(jsonContent);
                if (!doc.RootElement.TryGetProperty("shopping_results", out var results))
                    return new List<object>();

                var produtos = new List<object>();
                var iaCalls = 0; // Agora é uma variável local normal

                foreach (var item in results.EnumerateArray())
                {
                    var price = ExtractPrice(item);
                    if (price <= 0) continue;

                    var source = item.TryGetProperty("source", out var s) ? s.GetString() ?? "" : "";
                    var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                    var link = ExtractLink(item);
                    
                    if (string.IsNullOrEmpty(link)) continue;

                    // Passa o valor atual e retorna o novo valor
                    var (validation, newIaCalls) = await GetStoreValidation(source, link, iaCalls);
                    iaCalls = newIaCalls;
                    
                    produtos.Add(new
                    {
                        title,
                        source,
                        price,
                        product_link = link,
                        thumbnail = item.TryGetProperty("thumbnail", out var thumb) ? thumb.GetString() ?? "" : "",
                        is_trusted = validation.IsTrusted,
                        store_type = validation.StoreType
                    });
                }

                return produtos
                    .OrderByDescending(p => ((dynamic)p).is_trusted)
                    .ThenBy(p => ((dynamic)p).price)
                    .Take(20)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar resultados");
                return new List<object>();
            }
        }

        private async Task<(StoreValidationResult Validation, int NewIaCalls)> GetStoreValidation(string source, string link, int currentIaCalls)
        {
            // Verifica domínios conhecidos primeiro
            if (TrustedDomains.Any(d => source.Contains(d, StringComparison.OrdinalIgnoreCase)))
                return (new StoreValidationResult { IsTrusted = true, StoreType = "oficial" }, currentIaCalls);
            
            // Usa IA apenas para domínios desconhecidos (máx 3)
            if (currentIaCalls < 3)
            {
                var result = await _groqService.ValidateStoreAsync(source, link);
                return (result, currentIaCalls + 1);
            }

            return (new StoreValidationResult { IsTrusted = false, StoreType = "desconhecida" }, currentIaCalls);
        }

        private static string ExtractLink(JsonElement item)
        {
            if (item.TryGetProperty("link", out var link) && !link.GetString()?.Contains("google.com/shopping") == true)
                return link.GetString() ?? "";
            
            if (item.TryGetProperty("product_link", out var productLink))
                return productLink.GetString() ?? "";
            
            return "";
        }

        private static decimal ExtractPrice(JsonElement item)
        {
            if (!item.TryGetProperty("price", out var priceElem))
                return 0;

            var priceStr = priceElem.GetString();
            if (string.IsNullOrEmpty(priceStr)) return 0;

            var cleaned = Regex.Replace(priceStr, @"[^\d,]", "").Replace(".", "").Replace(",", ".");
            return decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var price) ? price : 0;
        }
    }
}