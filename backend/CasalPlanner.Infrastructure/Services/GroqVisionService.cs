using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Infrastructure.Services;

public class GroqVisionService
{
    // Modelos com suporte a visão (imagens) ativos no Groq.
    // Importante: todos os modelos desta lista DEVEM suportar image_url no conteúdo.
    private static readonly string[] VisionModels =
    [
        "meta-llama/llama-4-maverick-17b-128e-instruct", // Llama 4 Maverick (mais preciso)
        "meta-llama/llama-4-scout-17b-16e-instruct",     // Llama 4 Scout (fallback visão)
        "llama-3.2-11b-vision-preview",                  // Llama 3.2 Vision (último recurso)
    ];

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
            throw new InvalidOperationException("A análise por foto não está configurada.");

        var imageUrl = imagemBase64.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
            ? imagemBase64
            : $"data:image/jpeg;base64,{imagemBase64}";

        // Tenta cada modelo em ordem até um funcionar.
        // Ignora modelos que retornam model_not_found (sem acesso ou descontinuados).
        Exception? lastException = null;
        foreach (var model in VisionModels)
        {
            try
            {
                _logger.LogInformation("Tentando modelo de visão: {Model}", model);
                return await CallGroqAsync(model, imageUrl, cancellationToken);
            }
            catch (InvalidOperationException ex) when (
                ex.Message.Contains("model_not_found") ||
                ex.Message.Contains("model_decommissioned") ||
                ex.Message.Contains("does not exist") ||
                ex.Message.Contains("404") ||
                ex.Message.Contains("BadRequest") ||     // 400 = modelo deprecado
                ex.Message.Contains("400") ||
                ex.Message.Contains("deprecat"))         // deprecation message body
            {
                _logger.LogWarning("Modelo {Model} não disponível. Tentando próximo.", model);
                lastException = ex;
            }
        }

        // Todos os modelos falharam
        _logger.LogError(lastException, "Nenhum modelo de visão funcionou.");
        throw new InvalidOperationException(
            "Não há nenhum modelo de visão disponível na sua conta Groq. " +
            $"Modelos testados: {string.Join(", ", VisionModels)}. " +
            "Verifique sua conta em console.groq.com.");
    }

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
            _logger.LogWarning("Groq Vision retornou {StatusCode} com modelo {Model}. Body: {Body}",
                response.StatusCode, model, errorContent);
            throw new InvalidOperationException($"Erro da IA ({response.StatusCode}): {errorContent}");
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
            throw new InvalidOperationException("Não consegui identificar o produto na foto.");

        _logger.LogInformation("Análise concluída com modelo {Model}: {Produto}", model, result.ProdutoNome);
        return result;
    }

    private static string RemoveMarkdownFence(string? content) =>
        (content ?? string.Empty).Trim()
            .Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace("```", string.Empty)
            .Trim();
}
