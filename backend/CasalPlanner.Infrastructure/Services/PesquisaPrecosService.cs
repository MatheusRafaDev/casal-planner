using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Helpers;

namespace CasalPlanner.Infrastructure.Services;

public class PesquisaPrecosService : IPesquisaPrecosService
{
    private readonly IEnumerable<IPriceProvider> _providers;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PesquisaPrecosService> _logger;
    private readonly PriceSearchOptions _options;

    public PesquisaPrecosService(
        IEnumerable<IPriceProvider> providers,
        IMemoryCache cache,
        ILogger<PesquisaPrecosService> logger,
        IOptions<PriceSearchOptions> options)
    {
        _providers = providers;
        _cache = cache;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<(IEnumerable<ProdutoDto> Produtos, string MarcaIdentificada, string NomeValidado, string QueryUtilizada)>
        PesquisarAsync(string q, string? marca = null, string? buscaUsuario = null)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        var marcaIdentificada = marca?.Trim() ?? StoreAndBrandHelper.ExtractBrandFallback(q);
        var nomeValidado = q.Trim();
        var queryFinal = BuildFinalQuery(marcaIdentificada, nomeValidado);
        var cacheKey = $"pesquisa:{PriceTextHelper.NormalizeSearchQuery(queryFinal)}";

        // Verificar cache
        if (_cache.TryGetValue(cacheKey, out List<ProdutoDto>? cached) && cached != null)
        {
            _logger.LogInformation("Cache HIT para query: {Query}", queryFinal);
            return (cached, marcaIdentificada, nomeValidado, queryFinal);
        }

        // Pesquisa paralela em todos os providers
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_options.TimeoutSeconds));
        var providerTasks = _providers.Select(p => RunProviderSafelyAsync(p, queryFinal, cts.Token));
        var allResults = await Task.WhenAll(providerTasks);

        var produtos = allResults.SelectMany(r => r).ToList();

        _logger.LogInformation("Pesquisa concluída em {Ms}ms. {Total} produtos brutos de {Providers} providers.",
            sw.ElapsedMilliseconds, produtos.Count, _providers.Count());

        var deduplicados = DeduplicarProdutos(produtos);

        foreach (var produto in deduplicados)
            produto.Score = CalcularScore(produto);

        var ordenados = deduplicados
            .OrderByDescending(p => p.IsTrusted)
            .ThenBy(p => p.IsMarketplace)
            .ThenBy(p => p.Preco)
            .Take(25)
            .ToList();

        var cacheOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(_options.CacheExpirationMinutes));
        _cache.Set(cacheKey, ordenados, cacheOptions);

        sw.Stop();
        _logger.LogInformation("Pesquisa finalizada em {Ms}ms. {Total} produtos retornados.",
            sw.ElapsedMilliseconds, ordenados.Count);

        return (ordenados, marcaIdentificada, nomeValidado, queryFinal);
    }

    private async Task<IEnumerable<ProdutoDto>> RunProviderSafelyAsync(
        IPriceProvider provider, string query, CancellationToken cancellationToken)
    {
        try
        {
            var results = await provider.SearchAsync(query, cancellationToken);
            return results ?? Enumerable.Empty<ProdutoDto>();
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Provider {Provider} atingiu timeout.", provider.ProviderName);
            return Enumerable.Empty<ProdutoDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Provider {Provider} falhou.", provider.ProviderName);
            return Enumerable.Empty<ProdutoDto>();
        }
    }

    private static string BuildFinalQuery(string marca, string nome)
    {
        if (!string.IsNullOrEmpty(marca) && !nome.Contains(marca, StringComparison.OrdinalIgnoreCase))
            return $"{marca} {nome}";
        return nome;
    }

    private static List<ProdutoDto> DeduplicarProdutos(List<ProdutoDto> produtos)
    {
        var result = new List<ProdutoDto>();
        foreach (var produto in produtos.OrderBy(p => p.Preco))
        {
            var nomeNorm = PriceTextHelper.NormalizeSearchQuery(produto.Nome);
            var similar = result.FirstOrDefault(r =>
                PriceTextHelper.CalculateSimilarity(nomeNorm, PriceTextHelper.NormalizeSearchQuery(r.Nome)) >= 75);

            if (similar == null)
                result.Add(produto);
            else if (produto.Preco < similar.Preco)
            {
                result.Remove(similar);
                result.Add(produto);
            }
        }
        return result;
    }

    private static decimal CalcularScore(ProdutoDto produto)
    {
        decimal score = 50;
        if (produto.IsTrusted) score += 20;
        if (!produto.IsUsed) score += 10;
        if (!produto.IsMarketplace) score += 10;
        if (produto.Avaliacao.HasValue) score += (produto.Avaliacao.Value / 5m) * 10;
        if (produto.QuantidadeAvaliacoes.HasValue && produto.QuantidadeAvaliacoes > 50) score += 5;
        if (!string.IsNullOrEmpty(produto.Imagem)) score += 3;
        if (!string.IsNullOrEmpty(produto.Marca)) score += 2;
        return Math.Min(score, 100);
    }
}
