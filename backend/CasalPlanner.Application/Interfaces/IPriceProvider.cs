using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces;

public interface IPriceProvider
{
    string ProviderName { get; }
    Task<IEnumerable<ProdutoDto>> SearchAsync(string query, CancellationToken cancellationToken);
}
