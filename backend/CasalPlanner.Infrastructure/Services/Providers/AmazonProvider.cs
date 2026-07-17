using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services.Providers;

public class AmazonProvider : IPriceProvider
{
    private readonly IHttpClientFactory _httpClientFactory;
    public string ProviderName => "Amazon";

    public AmazonProvider(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<IEnumerable<ProdutoDto>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        // Scaffold for future Amazon PA-API integration.
        // Requires Access Key, Secret Key, and Partner Tag.
        
        await Task.CompletedTask;
        return Enumerable.Empty<ProdutoDto>();
    }
}
