using System.Text;
using System.Text.Json;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Infrastructure.Services;

/// <summary>
/// Serviço de análise de imagem usando a API do Google Gemini (gemini-2.5-flash).
/// Atua como PRIMÁRIO no orquestrador VisionAnalysisService.
/// Documentação: https://ai.google.dev/api/generate-content
/// Chave gratuita disponível em: https://ai.google.dev (Google AI Studio)
/// </summary>
public class GeminiVisionService : IVisionAnalysisService
{
    // Modelo Gemini com suporte a visão. Atualizar se descontinuado:
    // https://ai.google.dev/gemini-api/docs/models
    private const string Model = "gemini-2.5-flash";

    // Instrução de sistema que define o comportamento esperado do modelo.
    private const string SystemInstruction =
        "Você identifica produtos e extrai preços de fotos. " +
        "Ignore mãos, pessoas ou fundo. " +
        "Leia textos parciais ou borrados o melhor que puder. " +
        "Considere que a imagem pode estar rotacionada de lado ou de cabeça para baixo. " +
        "Sempre dê uma estimativa educada e preencha os dados em vez de desistir. " +
        "Responda APENAS com JSON válido, sem markdown, sem texto adicional: " +
        "{\"produtoNome\": string, \"marca\": string|null, \"modelo\": string|null, \"preco\": number|null, \"unidade\": string|null}. " +
        "Use null quando o dado não estiver disponível.";

    private readonly HttpClient _httpClient;
    private readonly ILogger<GeminiVisionService> _logger;
    private readonly string _apiKey;

    public GeminiVisionService(HttpClient httpClient, ILogger<GeminiVisionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? string.Empty;
    }

    public async Task<AnalisarFotoPrecoResponse> AnalisarAsync(string imagemBase64, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            throw new InvalidOperationException(
                "GEMINI_API_KEY não configurada. " +
                "Obtenha uma chave gratuita em https://ai.google.dev e defina a variável de ambiente GEMINI_API_KEY.");

        // Extrai o base64 puro e o mime type do data URI, se fornecido.
        var (mimeType, base64Data) = ParseImageBase64(imagemBase64);

        _logger.LogInformation("[Gemini] Analisando imagem com modelo {Model}", Model);

        var requestBody = BuildRequestBody(mimeType, base64Data);
        var endpoint = $"v1beta/models/{Model}:generateContent?key={_apiKey}";

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json")
        };

        using var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);

            // Detecta modelo descontinuado ou não encontrado com log explicativo.
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound ||
                errorBody.Contains("model_decommissioned", StringComparison.OrdinalIgnoreCase) ||
                errorBody.Contains("model not found", StringComparison.OrdinalIgnoreCase) ||
                errorBody.Contains("INVALID_ARGUMENT", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "[Gemini] Modelo {Model} não disponível ou descontinuado. " +
                    "Verifique modelos ativos em: https://ai.google.dev/gemini-api/docs/models " +
                    "Corpo do erro: {ErrorBody}", Model, errorBody);
            }
            else
            {
                _logger.LogWarning("[Gemini] Retornou {StatusCode}. Body: {Body}",
                    response.StatusCode, errorBody);
            }

            throw new InvalidOperationException(
                $"Erro do Gemini ({(int)response.StatusCode} {response.StatusCode}): {errorBody}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        var result = ParseGeminiResponse(responseBody);

        if (result is null || string.IsNullOrWhiteSpace(result.ProdutoNome))
            throw new InvalidOperationException("[Gemini] Não consegui identificar o produto na foto.");

        _logger.LogInformation("[Gemini] Análise concluída: {Produto}", result.ProdutoNome);
        return result;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /// <summary>
    /// Extrai mime type e base64 puro de um data URI ou base64 raw.
    /// Exemplos de entrada: "data:image/jpeg;base64,/9j/..." ou "/9j/..."
    /// </summary>
    private static (string mimeType, string base64Data) ParseImageBase64(string imagemBase64)
    {
        if (imagemBase64.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            // Formato: data:<mimeType>;base64,<data>
            var commaIndex = imagemBase64.IndexOf(',');
            if (commaIndex > 0)
            {
                var header = imagemBase64[5..commaIndex]; // remove "data:"
                var semicolonIndex = header.IndexOf(';');
                var mimeType = semicolonIndex > 0 ? header[..semicolonIndex] : "image/jpeg";
                var base64Data = imagemBase64[(commaIndex + 1)..];
                return (mimeType, base64Data);
            }
        }

        // Base64 puro — assume JPEG
        return ("image/jpeg", imagemBase64);
    }

    /// <summary>
    /// Monta o payload para o endpoint generateContent do Gemini.
    /// Formato: https://ai.google.dev/api/generate-content#request-body
    /// </summary>
    private static object BuildRequestBody(string mimeType, string base64Data) => new
    {
        system_instruction = new
        {
            parts = new[] { new { text = SystemInstruction } }
        },
        contents = new[]
        {
            new
            {
                parts = new object[]
                {
                    new { text = "Identifique o produto e os dados de preço (se houver) nesta foto." },
                    new
                    {
                        inline_data = new
                        {
                            mime_type = mimeType,
                            data = base64Data
                        }
                    }
                }
            }
        },
        generation_config = new
        {
            temperature = 0,
            response_mime_type = "application/json"
        }
    };

    /// <summary>
    /// Faz parsing da resposta do Gemini e desserializa o JSON de produto/preço.
    /// Estrutura esperada: candidates[0].content.parts[0].text
    /// </summary>
    private AnalisarFotoPrecoResponse? ParseGeminiResponse(string responseBody)
    {
        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;

        // Extrai o texto gerado pelo modelo
        string? text = null;
        if (root.TryGetProperty("candidates", out var candidates) &&
            candidates.GetArrayLength() > 0)
        {
            var firstCandidate = candidates[0];
            if (firstCandidate.TryGetProperty("content", out var content) &&
                content.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0)
            {
                text = parts[0].GetProperty("text").GetString();
            }
        }

        if (string.IsNullOrWhiteSpace(text))
        {
            _logger.LogWarning("[Gemini] Resposta não continha texto gerado. Body: {Body}", responseBody);
            return null;
        }

        var cleanJson = RemoveMarkdownFence(text);
        return JsonSerializer.Deserialize<AnalisarFotoPrecoResponse>(
            cleanJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private static string RemoveMarkdownFence(string content) =>
        content.Trim()
            .Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("```", string.Empty)
            .Trim();
}
