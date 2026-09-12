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
    private readonly ILogger<VisionAnalysisService> _logger;

    public VisionAnalysisService(
        GeminiVisionService gemini,
        ILogger<VisionAnalysisService> logger)
    {
        _gemini = gemini;
        _logger = logger;
    }

    public async Task<AnalisarFotoPrecoResponse> AnalisarAsync(string imagemBase64, CancellationToken cancellationToken)
    {
        // ── PRIMÁRIO: Gemini ──────────────────────────────────────────────────
        try
        {
            return await _gemini.AnalisarAsync(imagemBase64, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Cancelado pelo request da API (usuário fechou, etc), não faz fallback.
            throw;
        }
        catch (Exception geminiEx)
        {
            _logger.LogError(geminiEx,
                "[Vision Orchestrator] Gemini falhou.");
            throw;
        }
    }
}
