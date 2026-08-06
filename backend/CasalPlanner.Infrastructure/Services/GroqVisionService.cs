using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Infrastructure.Services;

public class GroqVisionService
{
    private static readonly string[] VisionModelPriority =
    [
        "llama-3.2-11b-vision-preview",
        "llama-3.2-90b-vision-preview"
    ];

    private readonly HttpClient _httpClient;
    private readonly ILogger<GroqVisionService> _logger;
    private readonly string _apiKey;
    private string? _visionModel;
    private DateTime _modelCheckedAt = DateTime.MinValue;

    public GroqVisionService(HttpClient httpClient, ILogger<GroqVisionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? string.Empty;
    }

    public async Task<AnalisarFotoPrecoResponse> AnalisarAsync(string imagemBase64, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_apiKey)) throw new InvalidOperationException("A análise por foto não está configurada.");
        var model = await GetVisionModelAsync(cancellationToken);
        var imageUrl = imagemBase64.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
            ? imagemBase64 : $"data:image/jpeg;base64,{imagemBase64}";
        var body = new
        {
            model,
            temperature = 0,
            response_format = new { type = "json_object" },
            messages = new object[]
            {
                new { role = "system", content = "Você identifica produtos e extrai preços de fotos. Se a foto for apenas do produto, identifique o produto (nome, marca, modelo). Se houver etiqueta de preço visível (ou se for apenas uma foto da etiqueta), extraia também o preço. Responda apenas JSON válido, sem markdown: {\"produtoNome\": string, \"marca\": string|null, \"modelo\": string|null, \"preco\": number|null, \"unidade\": string|null}. Use null quando o preço ou outros dados não estiverem disponíveis ou legíveis na imagem." },
                new { role = "user", content = new object[] { new { type = "text", text = "Identifique o produto e os dados de preço (se houver) nesta foto." }, new { type = "image_url", image_url = new { url = imageUrl } } } }
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
            _logger.LogWarning("Groq Vision retornou {StatusCode}. Body: {Body}", response.StatusCode, errorContent);
            throw new InvalidOperationException($"Erro da IA ({response.StatusCode}): {errorContent}");
        }

        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var content = json.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        var cleanJson = RemoveMarkdownFence(content);
        var result = JsonSerializer.Deserialize<AnalisarFotoPrecoResponse>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (result is null || string.IsNullOrWhiteSpace(result.ProdutoNome)) throw new InvalidOperationException("Não consegui identificar o produto na foto.");
        return result;
    }

    private async Task<string> GetVisionModelAsync(CancellationToken cancellationToken)
    {
        if (_visionModel is not null && DateTime.UtcNow - _modelCheckedAt < TimeSpan.FromMinutes(30)) return _visionModel;
        using var request = new HttpRequestMessage(HttpMethod.Get, "openai/v1/models");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var ids = json.RootElement.GetProperty("data").EnumerateArray().Select(m => m.GetProperty("id").GetString()).Where(id => !string.IsNullOrWhiteSpace(id)).Cast<string>().ToList();
        _visionModel = VisionModelPriority.FirstOrDefault(ids.Contains)
            ?? ids.FirstOrDefault(id => id.Contains("llama-3.2", StringComparison.OrdinalIgnoreCase) && id.Contains("vision", StringComparison.OrdinalIgnoreCase));
        _modelCheckedAt = DateTime.UtcNow;
        if (_visionModel is null) throw new InvalidOperationException("Nenhum modelo de visão compatível está disponível na conta Groq.");
        return _visionModel;
    }

    private static string RemoveMarkdownFence(string? content) => (content ?? string.Empty).Trim().Replace("```json", string.Empty, StringComparison.OrdinalIgnoreCase).Replace("```", string.Empty).Trim();
}
