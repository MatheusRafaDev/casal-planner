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
            "magazineluiza", "americanas", "mercadolivre", "amazon", "casasbahia", 
            "ponto", "extra", "submarino", "shoptime", "kabum", "pichau", "terabyte"
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
            _logger.LogInformation("=== INÍCIO DA PESQUISA ===");
            _logger.LogInformation($"Consulta recebida: {q}");
            
            if (string.IsNullOrWhiteSpace(q) || q.Length > 200)
                return BadRequest(new { error = "Consulta inválida. Máximo 200 caracteres." });

            var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SERPAPI_KEY não configurada");
                return StatusCode(500, new { error = "Configuração da API não encontrada." });
            }

            var url = $"https://serpapi.com/search?engine=google_shopping&q={Uri.EscapeDataString(q)}&gl=br&hl=pt&num=20&api_key={apiKey}";
            _logger.LogInformation($"URL da requisição: {url}");

            try
            {
                var client = _httpClientFactory.CreateClient("SerpApiClient");
                var response = await client.GetAsync(url);
                
                _logger.LogInformation($"Status code da resposta: {response.StatusCode}");
                
                if (!response.IsSuccessStatusCode)
                    return StatusCode(502, new { error = "Erro ao buscar produtos." });

                var content = await response.Content.ReadAsStringAsync();
                
                // 🔥 LOG DO JSON COMPLETO RECEBIDO 🔥
                _logger.LogInformation("=== JSON COMPLETO DA RESPOSTA ===");
                _logger.LogInformation(content);
                
                // Salva em arquivo para análise
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "logs", $"serpapi_response_{DateTime.Now:yyyyMMdd_HHmmss}.json");
                Directory.CreateDirectory(Path.GetDirectoryName(filePath));
                await System.IO.File.WriteAllTextAsync(filePath, content);
                _logger.LogInformation($"Resposta salva em: {filePath}");
                
                var produtos = await ProcessResultsAsync(content);
                
                // 🔥 LOG DOS PRODUTOS PROCESSADOS 🔥
                _logger.LogInformation("=== PRODUTOS PROCESSADOS ===");
                _logger.LogInformation($"Total de produtos: {produtos.Count}");
                
                for (int i = 0; i < produtos.Count; i++)
                {
                    _logger.LogInformation($"Produto {i + 1}: {JsonSerializer.Serialize(produtos[i])}");
                }
                
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
                
                // 🔥 LOG DA ESTRUTURA DO JSON 🔥
                _logger.LogInformation("=== ESTRUTURA DO JSON ===");
                foreach (var property in doc.RootElement.EnumerateObject())
                {
                    _logger.LogInformation($"Propriedade raiz: {property.Name} - Tipo: {property.Value.ValueKind}");
                }
                
                if (!doc.RootElement.TryGetProperty("shopping_results", out var results))
                {
                    _logger.LogWarning("Propriedade 'shopping_results' não encontrada no JSON");
                    
                    // Tenta encontrar outras propriedades com resultados
                    if (doc.RootElement.TryGetProperty("organic_results", out var organic))
                    {
                        _logger.LogInformation("Usando 'organic_results' como fallback");
                        results = organic;
                    }
                    else if (doc.RootElement.TryGetProperty("products", out var products))
                    {
                        _logger.LogInformation("Usando 'products' como fallback");
                        results = products;
                    }
                    else
                    {
                        _logger.LogWarning("Nenhum resultado encontrado");
                        return new List<object>();
                    }
                }
                
                _logger.LogInformation($"Quantidade de itens encontrados: {results.GetArrayLength()}");
                
                var produtos = new List<object>();
                var iaCalls = 0;

                int itemIndex = 0;
                foreach (var item in results.EnumerateArray())
                {
                    itemIndex++;
                    _logger.LogInformation($"--- Processando item {itemIndex} ---");
                    
                    // 🔥 LOG DO ITEM CRU 🔥
                    var itemJson = JsonSerializer.Serialize(item);
                    _logger.LogInformation($"Item cru: {itemJson}");
                    
                    var price = ExtractPrice(item);
                    _logger.LogInformation($"Preço extraído: {price}");
                    
                    if (price <= 0)
                    {
                        _logger.LogInformation("Preço inválido, pulando item");
                        continue;
                    }

                    var source = item.TryGetProperty("source", out var s) ? s.GetString() ?? "" : "";
                    var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                    var link = ExtractLink(item);
                    
                    _logger.LogInformation($"Fonte: {source}");
                    _logger.LogInformation($"Título: {title}");
                    _logger.LogInformation($"Link: {link}");
                    
                    if (string.IsNullOrEmpty(link))
                    {
                        _logger.LogInformation("Link vazio, pulando item");
                        continue;
                    }

                    var (validation, newIaCalls) = await GetStoreValidation(source, link, iaCalls);
                    iaCalls = newIaCalls;
                    

                    System.Console.WriteLine($"Validação da loja: IsTrusted={validation.IsTrusted}, StoreType={validation.StoreType}");

                    var produto = new
                    {
                        title,
                        source,
                        price,
                        product_link = link,
                        thumbnail = item.TryGetProperty("thumbnail", out var thumb) ? thumb.GetString() ?? "" : "",
                        is_trusted = validation.IsTrusted,
                        store_type = validation.StoreType ?? "desconhecida"
                    };
                    
                    _logger.LogInformation($"Produto adicionado: {JsonSerializer.Serialize(produto)}");
                    produtos.Add(produto);
                }

                var resultado = produtos
                    .OrderByDescending(p => ((dynamic)p).is_trusted)
                    .ThenBy(p => ((dynamic)p).price)
                    .Take(20)
                    .ToList();
                    
                _logger.LogInformation($"Total de produtos após ordenação: {resultado.Count}");
                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar resultados");
                return new List<object>();
            }
        }

        private async Task<(StoreValidationResult Validation, int NewIaCalls)> GetStoreValidation(string source, string link, int currentIaCalls)
        {
            _logger.LogInformation($"Validando loja: {source}, IA Calls restantes: {3 - currentIaCalls}");
            
            // Verifica domínios conhecidos primeiro
            if (TrustedDomains.Any(d => source.Contains(d, StringComparison.OrdinalIgnoreCase)))
            {
                _logger.LogInformation($"Loja confiável por domínio conhecido: {source}");
                return (new StoreValidationResult { IsTrusted = true, StoreType = "oficial" }, currentIaCalls);
            }
            
            // Usa IA apenas para domínios desconhecidos (máx 3)
            if (currentIaCalls < 3)
            {
                _logger.LogInformation($"Usando IA para validar: {source}");
                var result = await _groqService.ValidateStoreAsync(source, link);
                _logger.LogInformation($"Resultado IA: IsTrusted={result.IsTrusted}, StoreType={result.StoreType}");
                return (result, currentIaCalls + 1);
            }

            _logger.LogInformation($"Limite de IA atingido, marcando como desconhecida: {source}");
            return (new StoreValidationResult { IsTrusted = false, StoreType = "desconhecida" }, currentIaCalls);
        }

        private static string ExtractLink(JsonElement item)
        {
            if (item.TryGetProperty("link", out var link) && !link.GetString()?.Contains("google.com/shopping") == true)
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
                return 0;

            var priceStr = priceElem.GetString();
            if (string.IsNullOrEmpty(priceStr)) return 0;

            // Tenta diferentes formatos de preço
            var cleaned = Regex.Replace(priceStr, @"[^\d,]", "").Replace(".", "").Replace(",", ".");
            if (decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var price))
                return price;
                
            // Tenta outro formato
            if (decimal.TryParse(priceStr, System.Globalization.NumberStyles.Currency, 
                System.Globalization.CultureInfo.GetCultureInfo("pt-BR"), out price))
                return price;
                
            return 0;
        }
    }
}