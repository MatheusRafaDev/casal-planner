using System.Text;
using System.Text.Json;

namespace CasalPlanner.API.Services
{
    public class GroqService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _apiKey;

        public GroqService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
            _apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? "";
        }

        public async Task<(string Marca, string NomeValidado)> ValidateProductAsync(string productName, string userSearch)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return (ExtractBrandFallback(productName), productName);

            try
            {
                return await CallGroqForProductValidationAsync(productName, userSearch);
            }
            catch (Exception)
            {
                return (ExtractBrandFallback(productName), productName);
            }
        }

        public async Task<StoreValidationResult> ValidateStoreAsync(string storeName, string storeUrl)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return new StoreValidationResult();

            try
            {
                return await CallGroqForStoreValidationAsync(storeName, storeUrl);
            }
            catch (Exception)
            {
                return new StoreValidationResult();
            }
        }

        private async Task<(string Marca, string NomeValidado)> CallGroqForProductValidationAsync(string productName, string userSearch)
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
                    new 
                    { 
                        role = "system", 
                        content = @"Extraia a MARCA e o NOME VALIDADO do produto.
Responda APENAS com JSON:
{
    ""marca"": ""nome da marca ou vazio"",
    ""nomeValidado"": ""nome limpo do produto""
}"
                    },
                    new 
                    { 
                        role = "user", 
                        content = $"Produto: '{productName}'\nBusca: '{userSearch}'" 
                    }
                }
            };

            var response = await client.PostAsync(
                "https://api.groq.com/openai/v1/chat/completions",
                new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode)
                return ("", productName);

            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            
            var resultContent = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrWhiteSpace(resultContent))
                return ("", productName);

            using var jsonDoc = JsonDocument.Parse(resultContent);
            var root = jsonDoc.RootElement;
            
            var marca = root.TryGetProperty("marca", out var m) ? m.GetString() ?? "" : "";
            var nomeValidado = root.TryGetProperty("nomeValidado", out var n) ? n.GetString() ?? productName : productName;
            
            return (marca, nomeValidado);
        }

        private async Task<StoreValidationResult> CallGroqForStoreValidationAsync(string storeName, string storeUrl)
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
                    new 
                    { 
                        role = "system", 
                        content = @"Analise a loja e responda APENAS com JSON:
{
    ""isTrusted"": false,
    ""isMarketplace"": false,
    ""storeType"": ""desconhecida""
}"
                    },
                    new 
                    { 
                        role = "user", 
                        content = $"Loja: {storeName}\nURL: {storeUrl}" 
                    }
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

            using var jsonDoc = JsonDocument.Parse(resultContent);
            var root = jsonDoc.RootElement;
            
            return new StoreValidationResult
            {
                IsTrusted = root.TryGetProperty("isTrusted", out var t) && t.GetBoolean(),
                IsMarketplace = root.TryGetProperty("isMarketplace", out var m) && m.GetBoolean(),
                StoreType = root.TryGetProperty("storeType", out var st) ? st.GetString() ?? "desconhecida" : "desconhecida"
            };
        }

        private string ExtractBrandFallback(string productName)
        {
            var marcas = new[] { "Apple", "Samsung", "LG", "Xiaomi", "Motorola", "Nokia", 
                                  "Sony", "Philips", "Dell", "HP", "Lenovo", "Acer" };
            
            foreach (var marca in marcas)
            {
                if (productName.Contains(marca, StringComparison.OrdinalIgnoreCase))
                    return marca;
            }
            return "";
        }
    }

    public class StoreValidationResult
    {
        public bool IsTrusted { get; set; }
        public bool IsMarketplace { get; set; }
        public string StoreType { get; set; } = "desconhecida";
    }
}