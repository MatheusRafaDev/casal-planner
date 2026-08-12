using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Infrastructure.Services;

/// <summary>
/// Orquestrador de análise de imagem por visão.
/// Tenta o GeminiVisionService como PRIMÁRIO. Se falhar (qualquer exceção),
/// usa o GroqVisionService como FALLBACK automático.
/// Registre como IVisionAnalysisService no DI.
/// </summary>
public class VisionAnalysisService : IVisionAnalysisService
{
    private readonly GeminiVisionService _gemini;
    private readonly GroqVisionService _groq;
    private readonly ILogger<VisionAnalysisService> _logger;

    public VisionAnalysisService(
        GeminiVisionService gemini,
        GroqVisionService groq,
        ILogger<VisionAnalysisService> logger)
    {
        _gemini = gemini;
        _groq = groq;
        _logger = logger;
    }

    public async Task<AnalisarFotoPrecoResponse> AnalisarAsync(string imagemBase64, CancellationToken cancellationToken)
    {
        // ── PRIMÁRIO: Gemini ──────────────────────────────────────────────────
        try
        {
            return await _gemini.AnalisarAsync(imagemBase64, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // Não faz fallback em cancelamento pelo usuário; propaga.
            throw;
        }
        catch (Exception geminiEx)
        {
            _logger.LogWarning(geminiEx,
                "[Vision Orchestrator] Gemini falhou. Acionando Groq como fallback. Motivo: {Message}",
                geminiEx.Message);
        }

        // ── FALLBACK: Groq ────────────────────────────────────────────────────
        try
        {
            return await _groq.AnalisarAsync(imagemBase64, cancellationToken);
        }
        catch (Exception groqEx)
        {
            _logger.LogError(groqEx,
                "[Vision Orchestrator] Groq (fallback) também falhou. Ambos os provedores estão indisponíveis. " +
                "Verifique: Gemini → https://ai.google.dev | Groq → https://console.groq.com/docs/deprecations");
            throw new InvalidOperationException(
                "A análise de foto falhou em ambos os provedores (Gemini e Groq). " +
                "Verifique as chaves GEMINI_API_KEY e GROQ_API_KEY e se os modelos estão ativos.",
                groqEx);
        }
    }
}
