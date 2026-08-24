using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Infrastructure.Services;

/// <summary>
/// Serviço de análise de imagem usando a API de visão do Groq.
/// Atua como FALLBACK quando o GeminiVisionService falha.
/// </summary>
public class GroqVisionService : IVisionAnalysisService
{
    // Modelo de visão ativo no Groq (agosto 2026).
    // Suporta: texto + imagem (multimodal), JSON mode, tool use.
    // Se este modelo for descontinuado, verifique: https://console.groq.com/docs/deprecations
    private const string VisionModel = "llama-3.2-11b-vision-preview";

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
            throw new InvalidOperationException("GROQ_API_KEY não configurada. Análise de foto pelo Groq indisponível.");

        var imageUrl = imagemBase64.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
            ? imagemBase64
            : $"data:image/jpeg;base64,{imagemBase64}";

        _logger.LogInformation("[Groq Fallback] Tentando modelo de visão: {Model}", VisionModel);
        try
        {
            return await CallGroqAsync(VisionModel, imageUrl, cancellationToken);
        }
        catch (InvalidOperationException ex) when (IsModelUnavailableError(ex.Message))
        {
            _logger.LogWarning(
                "[Groq Fallback] Modelo {Model} não disponível ou descontinuado. " +
                "Verifique modelos ativos em: https://console.groq.com/docs/deprecations",
                VisionModel);
            throw;
        }
    }

    /// <summary>
    /// Verifica se a mensagem de erro indica que o modelo foi descontinuado ou não encontrado.
    /// </summary>
    private static bool IsModelUnavailableError(string message) =>
        message.Contains("model_not_found", StringComparison.OrdinalIgnoreCase) ||
        message.Contains("model_decommissioned", StringComparison.OrdinalIgnoreCase) ||
        message.Contains("does not exist", StringComparison.OrdinalIgnoreCase) ||
        message.Contains("404") ||
        message.Contains("deprecat", StringComparison.OrdinalIgnoreCase);

    private async Task<AnalisarFotoPrecoResponse> CallGroqAsync(string model, string imageUrl, CancellationToken cancellationToken)
    {
        var body = new
        {
            model,
            temperature = 0,
            response_format = new { type = "json_object" },
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = "Você identifica produtos e extrai preços de fotos. Ignore mãos, pessoas ou fundo. Leia textos parciais ou borrados o melhor que puder. Considere que a imagem pode estar rotacionada de lado ou de cabeça para baixo. Sempre dê uma estimativa educada e preencha os dados em vez de desistir. Responda apenas JSON válido: {\"produtoNome\": string, \"marca\": string|null, \"modelo\": string|null, \"preco\": number|null, \"unidade\": string|null}. Use null quando o dado não estiver disponível."
                },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new { type = "text", text = "Identifique o produto e os dados de preço (se houver) nesta foto." },
                        new { type = "image_url", image_url = new { url = imageUrl } }
                    }
                }
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "openai/v1/chat/completions")
        {
            Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning("[Groq Fallback] Retornou {StatusCode} com modelo {Model}. Body: {Body}",
                response.StatusCode, model, errorContent);
            throw new InvalidOperationException($"Erro do Groq ({response.StatusCode}): {errorContent}");
        }

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var content = json.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        var cleanJson = RemoveMarkdownFence(content);
        var result = JsonSerializer.Deserialize<AnalisarFotoPrecoResponse>(
            cleanJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (result is null || string.IsNullOrWhiteSpace(result.ProdutoNome))
            throw new InvalidOperationException("[Groq Fallback] Não consegui identificar o produto na foto.");

        _logger.LogInformation("[Groq Fallback] Análise concluída com modelo {Model}: {Produto}", model, result.ProdutoNome);
        return result;
    }

    private static string RemoveMarkdownFence(string? content) =>
        (content ?? string.Empty).Trim()
            .Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("```", string.Empty)
            .Trim();
}
