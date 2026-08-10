using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Application.Helpers;

namespace CasalPlanner.Application.Services;

public class PesquisaPrecosService : IPesquisaPrecosService
{
    private readonly IEnumerable<IPriceProvider> _providers;
    private readonly IMemoryCache _cache;
    private readonly IGroqService _groqService;
    private readonly ILogger<PesquisaPrecosService> _logger;
    private readonly PriceSearchOptions _options;

    public PesquisaPrecosService(
        IEnumerable<IPriceProvider> providers,
        IMemoryCache cache,
        IGroqService groqService,
        ILogger<PesquisaPrecosService> logger,
        IOptions<PriceSearchOptions> options)
    {
        _providers = providers;
        _cache = cache;
        _groqService = groqService;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<(IEnumerable<ProdutoDto> Produtos, string MarcaIdentificada, string NomeValidado, string QueryUtilizada)>
        PesquisarAsync(string q, string? marca = null, string? buscaUsuario = null)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // 1. Cache rápido com a query bruta (evita chamar Groq desnecessariamente)
        var rawCacheKey = $"pesquisa:{PriceTextHelper.NormalizeSearchQuery(q.Trim())}";
        if (_cache.TryGetValue(rawCacheKey, out List<ProdutoDto>? cachedRaw) && cachedRaw != null)
        {
            _logger.LogInformation("Cache HIT (raw) para query: {Query}", q);
            return (cachedRaw, marca?.Trim() ?? "", q.Trim(), q.Trim());
        }

        // 2. Normalizar query via Groq (só chama se não havia cache)
        var marcaIdentificada = marca?.Trim() ?? "";
        var nomeValidado = q.Trim();

        if (string.IsNullOrEmpty(marca))
        {
            try
            {
                var validacao = await _groqService.ValidateProductAsync(q, buscaUsuario ?? q);
                marcaIdentificada = validacao.Marca?.Trim() ?? "";
                nomeValidado = string.IsNullOrWhiteSpace(validacao.NomeValidado) ? q : validacao.NomeValidado.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha na validação via Groq. Usando fallback para marca.");
                marcaIdentificada = StoreAndBrandHelper.ExtractBrandFallback(q);
            }
        }

        var queryFinal = BuildFinalQuery(marcaIdentificada, nomeValidado);
        var cacheKey = $"pesquisa:{PriceTextHelper.NormalizeSearchQuery(queryFinal)}";

        // 3. Cache com a query normalizada (caso a query bruta e normalizada difiram)
        if (_cache.TryGetValue(cacheKey, out List<ProdutoDto>? cached) && cached != null)
        {
            _logger.LogInformation("Cache HIT (normalizado) para query: {Query}", queryFinal);
            // Popula também o cache da query bruta para próximas chamadas
            _cache.Set(rawCacheKey, cached, new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(_options.CacheExpirationMinutes)));
            return (cached, marcaIdentificada, nomeValidado, queryFinal);
        }

        // 4. Pesquisa paralela em todos os providers
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(_options.TimeoutSeconds));
        var providerTasks = _providers.Select(p => RunProviderSafelyAsync(p, queryFinal, cts.Token));
        var allResults = await Task.WhenAll(providerTasks);

        var produtos = allResults
            .SelectMany(r => r)
            .ToList();

        _logger.LogInformation("Pesquisa concluída em {Ms}ms. {Total} produtos brutos obtidos de {Providers} providers.",
            sw.ElapsedMilliseconds, produtos.Count, _providers.Count());

        // 4. Deduplicação
        var deduplicados = DeduplicarProdutos(produtos);

        // 5. Calcular scores
        foreach (var produto in deduplicados)
            produto.Score = CalcularScore(produto);

        // 6. Ordenação inteligente: lojas confiáveis primeiro, depois menor preço
        var ordenados = deduplicados
            .OrderByDescending(p => p.IsTrusted)
            .ThenBy(p => p.IsMarketplace)
            .ThenBy(p => p.Preco)
            .Take(25)
            .ToList();

        // 7. Guardar no cache (ambas as chaves: raw e normalizada)
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromMinutes(_options.CacheExpirationMinutes));
        _cache.Set(cacheKey, ordenados, cacheOptions);
        // Popula a chave bruta para evitar chamada ao Groq em buscas repetidas
        if (rawCacheKey != cacheKey)
            _cache.Set(rawCacheKey, ordenados, cacheOptions);

        sw.Stop();
        _logger.LogInformation("Pesquisa finalizada em {Ms}ms. {Total} produtos retornados após deduplicação.",
            sw.ElapsedMilliseconds, ordenados.Count);

        return (ordenados, marcaIdentificada, nomeValidado, queryFinal);
    }

    private async Task<IEnumerable<ProdutoDto>> RunProviderSafelyAsync(
        IPriceProvider provider, string query, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogDebug("Iniciando provider: {Provider}", provider.ProviderName);
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var results = await provider.SearchAsync(query, cancellationToken);
            sw.Stop();
            _logger.LogInformation("Provider {Provider} retornou {Count} resultados em {Ms}ms.",
                provider.ProviderName, results?.Count() ?? 0, sw.ElapsedMilliseconds);
            return results ?? Enumerable.Empty<ProdutoDto>();
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Provider {Provider} atingiu timeout ({Timeout}s).",
                provider.ProviderName, _options.TimeoutSeconds);
            return Enumerable.Empty<ProdutoDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Provider {Provider} falhou: {Message}", provider.ProviderName, ex.Message);
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
            {
                var existNorm = PriceTextHelper.NormalizeSearchQuery(r.Nome);
                var similarity = PriceTextHelper.CalculateSimilarity(nomeNorm, existNorm);
                return similarity >= 75;
            });

            if (similar == null)
            {
                result.Add(produto);
            }
            else if (produto.Preco < similar.Preco)
            {
                // Mantém o menor preço
                result.Remove(similar);
                result.Add(produto);
            }
        }

        return result;
    }

    private static decimal CalcularScore(ProdutoDto produto)
    {
        decimal score = 50; // base

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
