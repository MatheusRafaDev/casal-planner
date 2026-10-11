using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Infrastructure.Services;

/// <summary>
/// Serviço de análise de imagem via Groq Vision (llama-3.2-11b-vision-preview).
/// Atua como FALLBACK gratuito de altíssima velocidade no orquestrador VisionAnalysisService.
/// Documentação: https://console.groq.com/docs/vision
/// Baseado na lista: https://github.com/mnfst/awesome-free-llm-apis
/// </summary>
public class GroqVisionService : IVisionAnalysisService
{
    private const string Model = "llama-3.2-11b-vision-preview";
    private const string SystemInstruction =
        "Você identifica produtos e extrai preços de fotos de etiquetas de preço ou prateleiras. " +
        "Ignore mãos, pessoas ou fundo. " +
        "Responda APENAS com JSON válido, sem formatação markdown, sem texto adicional: " +
        "{\"produtoNome\": string, \"marca\": string|null, \"modelo\": string|null, \"preco\": number|null, \"unidade\": string|null}. " +
        "Use null quando o dado não estiver disponível.";

    private readonly HttpClient _httpClient;
    private readonly ILogger<GroqVisionService> _logger;
    private readonly string _apiKey;

    public GroqVisionService(HttpClient httpClient, ILogger<GroqVisionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? string.Empty;
    }

    public async Task<AnalisarFotoPrecoResponse> AnalisarAsync(string imagemBase64, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            throw new InvalidOperationException("GROQ_API_KEY não configurada para fallback de visão.");

        var dataUri = FormatDataUri(imagemBase64);

        _logger.LogInformation("[Groq Vision] Analisando imagem com modelo {Model}", Model);

        var requestBody = new
        {
            model = Model,
            messages = new object[]
            {
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "text", text = SystemInstruction },
                        new
                        {
                            type = "image_url",
                            image_url = new { url = dataUri }
                        }
                    }
                }
            },
            temperature = 0.1,
            response_format = new { type = "json_object" }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning("[Groq Vision] Retornou {StatusCode}. Body: {Body}", response.StatusCode, errorBody);
            throw new InvalidOperationException($"Erro do Groq Vision ({(int)response.StatusCode}): {errorBody}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        var result = ParseGroqResponse(responseBody);

        if (result is null || string.IsNullOrWhiteSpace(result.ProdutoNome))
            throw new InvalidOperationException("[Groq Vision] Não consegui identificar o produto na foto.");

        _logger.LogInformation("[Groq Vision] Análise concluída: {Produto}", result.ProdutoNome);
        return result;
    }

    private static string FormatDataUri(string imagemBase64)
    {
        if (imagemBase64.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            return imagemBase64;
        return $"data:image/jpeg;base64,{imagemBase64}";
    }

    private AnalisarFotoPrecoResponse? ParseGroqResponse(string responseBody)
    {
        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;

        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var choice = choices[0];
            if (choice.TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var content))
            {
                var text = content.GetString()?.Trim() ?? string.Empty;
                var clean = RemoveMarkdownFence(text);
                return JsonSerializer.Deserialize<AnalisarFotoPrecoResponse>(
                    clean,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
        }

        return null;
    }

    private static string RemoveMarkdownFence(string content) =>
        content.Trim()
            .Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("```", string.Empty)
            .Trim();
}
