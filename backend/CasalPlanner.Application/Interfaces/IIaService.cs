using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces;

public interface IIaService
{
    Task<string> CompletarTextoAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken = default);
    Task<IEnumerable<SugestaoItemDto>> ObterSugestoesComodoAsync(string comodo, CancellationToken cancellationToken = default);
    Task<DetectarDuplicataResponseDto> DetectarDuplicataAsync(string nomeItem, IEnumerable<string> itensExistentes, CancellationToken cancellationToken = default);
    Task<EstimativaComodoDto> ObterEstimativaComodoAsync(string comodo, CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> DescobrirDominiosAsync(IEnumerable<string> lojas, CancellationToken cancellationToken = default);
}
