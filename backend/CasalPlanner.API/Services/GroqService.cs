using System.Text;
using System.Text.Json;
using CasalPlanner.API.Models.DTOs;

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

        public async Task<SugestaoItensDto?> SugerirItensFaltantesPorComodo(string nomeComodo, List<string> itensExistentes)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                var itensExistentesStr = string.Join(", ", itensExistentes);

                var requestBody = new
                {
                    model = "llama-3.1-8b-instant",
                    temperature = 0.3,
                    response_format = new { type = "json_object" },
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = @"Você é um assistente de enxoval de casal. Sugira itens essenciais que faltam para um cômodo.
Responda APENAS em JSON válido, sem texto adicional, no formato:
{
    ""itens"": [
        {""nome"": ""..."", ""categoria"": ""..."", ""precoMedioEstimado"": 0.0, ""prioridade"": ""normal""}
    ]
}"
                        },
                        new
                        {
                            role = "user",
                            content = $"O cômodo é '{nomeComodo}'. O casal já tem: {itensExistentesStr}. Sugira até 8 itens essenciais que ainda faltam para este cômodo."
                        }
                    }
                };

                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                    return null;

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(resultContent))
                    return null;

                return JsonSerializer.Deserialize<SugestaoItensDto>(resultContent);
            }
            catch
            {
                return null;
            }
        }

        public async Task<DuplicataDto?> DetectarItemRedundante(string nomeNovoItem, List<string> itensExistentes)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                var itensExistentesStr = string.Join(", ", itensExistentes);

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
                            content = @"Analise se um item é duplicado ou incompatível com itens existentes.
Responda APENAS em JSON válido:
{
    ""detectado"": false,
    ""itemSimilar"": null,
    ""mensagem"": null
}"
                        },
                        new
                        {
                            role = "user",
                            content = $"Analise se '{nomeNovoItem}' é duplicado ou incompatível com algum item da lista: {itensExistentesStr}."
                        }
                    }
                };

                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                    return null;

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(resultContent))
                    return null;

                return JsonSerializer.Deserialize<DuplicataDto>(resultContent);
            }
            catch
            {
                return null;
            }
        }

        public async Task<EstimativaComodoDto?> EstimarOrcamentoPorComodo(string nomeComodo, string cidade)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                var requestBody = new
                {
                    model = "llama-3.1-8b-instant",
                    temperature = 0.3,
                    response_format = new { type = "json_object" },
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = @"Estime o custo para mobiliar/equipar um cômodo no Brasil em 2024/2025.
Responda APENAS em JSON válido:
{
    ""faixaBasica"": 0,
    ""faixaMedia"": 0,
    ""faixaPremium"": 0,
    ""observacao"": ""...""
}"
                        },
                        new
                        {
                            role = "user",
                            content = $"Estime o custo para mobiliar/equipar '{nomeComodo}' em {cidade}, Brasil, em 2024/2025."
                        }
                    }
                };

                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                    return null;

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(resultContent))
                    return null;

                return JsonSerializer.Deserialize<EstimativaComodoDto>(resultContent);
            }
            catch
            {
                return null;
            }
        }

        public async Task<string?> GerarResumoEnxoval(ResumoEnxovalDto resumo, string nomesCasal)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                var resumoJson = JsonSerializer.Serialize(resumo);

                var requestBody = new
                {
                    model = "llama-3.1-8b-instant",
                    temperature = 0.7,
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = "Gere um parágrafo curto e animado sobre o progresso do enxoval de um casal. Máximo 3 frases."
                        },
                        new
                        {
                            role = "user",
                            content = $"Gere um parágrafo curto e animado sobre o progresso do enxoval do casal {nomesCasal}. Dados: {resumoJson}. Máximo 3 frases."
                        }
                    }
                };

                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                    return null;

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return resultContent?.Trim();
            }
            catch
            {
                return null;
            }
        }
    }

    public class StoreValidationResult
    {
        public bool IsTrusted { get; set; }
        public bool IsMarketplace { get; set; }
        public string StoreType { get; set; } = "desconhecida";
    }
}