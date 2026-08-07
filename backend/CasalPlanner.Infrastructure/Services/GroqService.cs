using System.Text;
using System.Text.Json;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services
{
    public class GroqService : IGroqService
    {
        private static readonly JsonSerializerOptions LlmJsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _apiKey;
        private readonly ILogger<GroqService> _logger;

        public GroqService(IHttpClientFactory httpClientFactory, ILogger<GroqService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? "";

            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogWarning("GROQ_API_KEY não configurada. Recursos de IA estarão desabilitados.");
            }
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
            var client = _httpClientFactory.CreateClient("groq");
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var requestBody = new
            {
                model = "llama-3.3-70b-versatile",
                temperature = 0.05,
                max_tokens = 120,
                response_format = new { type = "json_object" },
                messages = new[]
                {
                    new 
                    { 
                        role = "system", 
                        content = @"Você é especialista em produtos brasileiros. Dado o nome de um produto, identifique a marca e normalize o nome para uma busca eficaz no Google Shopping Brasil.

Regras:
- Corrija erros de ortografia e abreviações (ex: 'iphone 15 pro maxim' → 'iPhone 15 Pro Max')
- Identifique a marca correta (Apple, Samsung, LG, Xiaomi, Motorola, Sony, Dell, HP, Lenovo, Acer, Philips, etc.)
- O nomeValidado deve ser o nome oficial do produto, conciso e sem redundâncias
- Não inclua a marca no nomeValidado se ela já vai ser adicionada separadamente
- Responda APENAS com JSON válido:
{
    ""marca"": ""Nome da marca ou vazio se não identificada"",
    ""nomeValidado"": ""Nome oficial e limpo do produto""
}"
                    },
                    new 
                    { 
                        role = "user", 
                        content = $"Produto digitado: '{productName}'\nBusca original do usuário: '{userSearch}'" 
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
            var client = _httpClientFactory.CreateClient("groq");
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
                                 "Sony", "Philips", "Dell", "HP", "Lenovo", "Acer", "Asus",
                                 "Positivo", "Multilaser", "Braun", "Bosch", "Electrolux",
                                 "Tramontina", "Mondial", "Cadence", "Panasonic", "JBL",
                                 "Bose", "Logitech", "Razer", "HyperX", "Corsair",
                                 "Intel", "AMD", "Nvidia", "WD", "Seagate", "Kingston",
                                 "Brastemp", "Consul", "Arno", "Philco", "Britânia", "Oster", 
                                 "Midea", "TCL", "AOC", "Walita", "Black+Decker", "Fischer", 
                                 "Suggar", "Mueller", "Dako", "Atlas", "Gree", "Daikin", 
                                 "Elgin", "Wap", "KitchenAid", "Mallory" };

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
                var client = _httpClientFactory.CreateClient("groq");
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
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error (SugerirItensFaltantesPorComodo): {StatusCode} - {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(resultContent))
                    return null;

                return JsonSerializer.Deserialize<SugestaoItensDto>(resultContent, LlmJsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao sugerir itens por cômodo");
                return null;
            }
        }

        public async Task<DuplicataDto?> DetectarItemRedundante(string nomeNovoItem, List<string> itensExistentes)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient("groq");
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
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error (DetectarItemRedundante): {StatusCode} - {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(resultContent))
                    return null;

                return JsonSerializer.Deserialize<DuplicataDto>(resultContent, LlmJsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao detectar item redundante");
                return null;
            }
        }

        public async Task<EstimativaComodoDto?> EstimarOrcamentoPorComodo(string nomeComodo, string cidade)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient("groq");
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
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error (EstimarOrcamentoPorComodo): {StatusCode} - {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(resultContent))
                    return null;

                return JsonSerializer.Deserialize<EstimativaComodoDto>(resultContent, LlmJsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao estimar orçamento por cômodo");
                return null;
            }
        }

        public async Task<string?> GerarResumoEnxoval(ResumoEnxovalDto resumo, string nomesCasal)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient("groq");
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
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error (GerarResumoEnxoval): {StatusCode} - {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return resultContent?.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do enxoval");
                return null;
            }
        }

        public async Task<string?> GerarResumoEnxovalContexto(object contexto)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient("groq");
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                var dadosJson = JsonSerializer.Serialize(contexto, new JsonSerializerOptions { WriteIndented = true });

                var systemPrompt = @"Você é um assistente simpático que ajuda casais a planejarem o enxoval da casa nova.
Com base nos dados financeiros fornecidos, gere um resumo narrativo curto (máximo 4 frases) sobre o progresso do enxoval.
Seja encorajador, use o nome do casal, mencione valores concretos (total gasto, itens comprados, meta, quanto falta).
Se tiver dados de categoria, mencione brevemente as categorias com mais gasto.
Escreva em português do Brasil, de forma calorosa e pessoal. NÃO use markdown, só texto simples.";

                var userPrompt = $@"Gere o resumo do enxoval com base nestes dados:

{dadosJson}

Lembre-se: máximo 4 frases, use o nome do casal, mencione valores reais em reais (R$), seja encorajador.";

                var requestBody = new
                {
                    model = "llama-3.1-8b-instant",
                    temperature = 0.75,
                    max_tokens = 300,
                    messages = new[]
                    {
                        new { role = "system", content = systemPrompt },
                        new { role = "user", content = userPrompt }
                    }
                };

                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error (GerarResumoEnxovalContexto): {StatusCode} - {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return resultContent?.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do enxoval com contexto rico");
                return null;
            }
        }

        public async Task<Dictionary<string, string>?> DescobrirDominios(List<string> nomes)
        {
            if (string.IsNullOrEmpty(_apiKey) || nomes == null || nomes.Count == 0)
                return null;

            try
            {
                var client = _httpClientFactory.CreateClient("groq");
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                var nomesUnicosStr = string.Join(", ", nomes.Distinct().Where(n => !string.IsNullOrWhiteSpace(n)));
                if (string.IsNullOrWhiteSpace(nomesUnicosStr)) return new Dictionary<string, string>();

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
                            content = @"Você é um assistente que descobre domínios oficiais de lojas e marcas do Brasil e do mundo.
Responda APENAS em JSON válido, com um dicionário mapeando o nome exato solicitado para o seu domínio oficial principal (apenas o domínio base, sem https, sem www, ex: 'apple.com', 'magazineluiza.com.br').
Se não souber o domínio oficial de um nome, omita-o do JSON. Exemplo:
{
    ""Magazine Luiza"": ""magazineluiza.com.br"",
    ""Samsung"": ""samsung.com""
}"
                        },
                        new
                        {
                            role = "user",
                            content = $"Descubra os domínios oficiais para: {nomesUnicosStr}"
                        }
                    }
                };

                var response = await client.PostAsync(
                    "https://api.groq.com/openai/v1/chat/completions",
                    new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Groq API error (DescobrirDominios): {StatusCode} - {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var body = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);

                var resultContent = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                if (string.IsNullOrWhiteSpace(resultContent))
                    return null;

                return JsonSerializer.Deserialize<Dictionary<string, string>>(resultContent, LlmJsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao descobrir domínios");
                return null;
            }
        }
    }

}
