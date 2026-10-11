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
        // ── PRIMÁRIO: Gemini (1.500 RPD no plano gratuito) ───────────────────
        try
        {
            return await _gemini.AnalisarAsync(imagemBase64, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception geminiEx)
        {
            _logger.LogWarning(geminiEx,
                "[Vision Orchestrator] Gemini falhou ou atingiu limite. Acionando fallback Groq Vision...");
        }

        // ── FALLBACK: Groq Vision (llama-3.2-11b-vision) ─────────────────────
        try
        {
            return await _groq.AnalisarAsync(imagemBase64, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception groqEx)
        {
            _logger.LogError(groqEx,
                "[Vision Orchestrator] Todos os provedores de visão gratuitos falharam.");
            throw new InvalidOperationException("Não foi possível analisar a imagem nem pelo Gemini nem pelo Groq Vision.", groqEx);
        }
    }
}
