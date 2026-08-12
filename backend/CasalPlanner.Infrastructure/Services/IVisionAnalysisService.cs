using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Infrastructure.Services;

/// <summary>
/// Contrato para serviços de análise de imagem que identificam produtos e preços.
/// </summary>
public interface IVisionAnalysisService
{
    /// <summary>
    /// Analisa uma imagem em base64 e retorna os dados do produto/preço identificados.
    /// </summary>
    /// <param name="imagemBase64">
    /// Imagem em base64. Pode ser data URI (data:image/jpeg;base64,...) ou base64 puro.
    /// </param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    Task<AnalisarFotoPrecoResponse> AnalisarAsync(string imagemBase64, CancellationToken cancellationToken);
}
