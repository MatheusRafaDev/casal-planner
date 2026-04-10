using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;

namespace CasalPlanner.API.Services
{
    public class GroqService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<GroqService> _logger;
        private readonly string _apiKey;
        private readonly ConcurrentDictionary<string, StoreValidationResult> _cache = new();

        public GroqService(IHttpClientFactory httpClientFactory, ILogger<GroqService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? "";
        }

        public async Task<StoreValidationResult> ValidateStoreAsync(string storeName, string storeUrl)
        {
            var cacheKey = $"{storeName}-{storeUrl}".ToLowerInvariant();

            if (_cache.TryGetValue(cacheKey, out var cached))
                return cached;

            if (string.IsNullOrEmpty(_apiKey))
                return new StoreValidationResult();

            try
            {
                var result = await CallGroqApiAsync(storeName, storeUrl);
                _cache[cacheKey] = result;
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro na validação");
                return new StoreValidationResult();
            }
        }

        private async Task<StoreValidationResult> CallGroqApiAsync(string storeName, string storeUrl)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var requestBody = new
            {
                model = "llama-3.1-8b-instant",
                temperature = 0.1,
                response_format = new { type = "json_object" },
                messages = new[]
                {
                    new { 
                        role = "system", 
                        content = @"Responda APENAS com JSON. confidence deve ser string: 'alta', 'media' ou 'baixa'.
{
    ""isTrusted"": false,
    ""isMarketplace"": false,
    ""confidence"": ""media"",
    ""storeType"": ""desconhecida"",
    ""reason"": """"
}"
                    },
                    new { role = "user", content = $"Loja: {storeName}" }
                }
            };

            var response = await client.PostAsync(
                "https://api.groq.com/openai/v1/chat/completions",
                new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
                return new StoreValidationResult();

            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            
            var resultContent = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrWhiteSpace(resultContent))
                return new StoreValidationResult();

            // ⭐ Parse robusto que aceita número ou string
            try
            {
                using var jsonDoc = JsonDocument.Parse(resultContent);
                var root = jsonDoc.RootElement;
                
                return new StoreValidationResult
                {
                    IsTrusted = root.TryGetProperty("isTrusted", out var t) && t.GetBoolean(),
                    IsMarketplace = root.TryGetProperty("isMarketplace", out var m) && m.GetBoolean(),
                    Confidence = GetConfidenceAsString(root),
                    StoreType = root.TryGetProperty("storeType", out var st) ? st.GetString() ?? "desconhecida" : "desconhecida",
                    Reason = root.TryGetProperty("reason", out var r) ? r.GetString() ?? "" : ""
                };
            }
            catch
            {
                return new StoreValidationResult();
            }
        }

        private static string GetConfidenceAsString(JsonElement root)
        {
            if (!root.TryGetProperty("confidence", out var confidence))
                return "media";
                
            return confidence.ValueKind switch
            {
                JsonValueKind.String => confidence.GetString() ?? "media",
                JsonValueKind.Number => confidence.GetInt32() switch
                {
                    1 => "baixa",
                    2 => "media",
                    3 => "alta",
                    _ => "media"
                },
                _ => "media"
            };
        }
    }

    public class StoreValidationResult
    {
        public bool IsTrusted { get; set; }
        public bool IsMarketplace { get; set; }
        public string Confidence { get; set; } = "media";
        public string StoreType { get; set; } = "desconhecida";
        public string Reason { get; set; } = "";
    }
}