using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces;

public interface IExtratorLinkService
{
    Task<ProdutoDto?> ExtrairAsync(string url, CancellationToken cancellationToken = default);
}
