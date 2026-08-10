using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Application.Services;
using CasalPlanner.Infrastructure.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CasalPlanner.Tests;

public class PesquisaPrecosServiceTests
{
    private readonly IGroqService _groqService;
    private readonly IMemoryCache _cache;
    private readonly Mock<ILogger<PesquisaPrecosService>> _loggerMock;
    private readonly IOptions<PriceSearchOptions> _options;

    public PesquisaPrecosServiceTests()
    {
        var httpFactoryMock = new Mock<IHttpClientFactory>();
        httpFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>()))
            .Returns(new System.Net.Http.HttpClient());

        var groqLoggerMock = new Mock<ILogger<GroqService>>();
        _groqService = new GroqService(httpFactoryMock.Object, groqLoggerMock.Object);

        _cache = new MemoryCache(new MemoryCacheOptions());
        _loggerMock = new Mock<ILogger<PesquisaPrecosService>>();
        _options = Options.Create(new PriceSearchOptions
        {
            CacheExpirationMinutes = 5,
            TimeoutSeconds = 10,
            RetryCount = 1
        });
    }

    private static IPriceProvider CreateFakeProvider(string name, IEnumerable<ProdutoDto> results)
    {
        var mock = new Mock<IPriceProvider>();
        mock.Setup(p => p.ProviderName).Returns(name);
        mock.Setup(p => p.SearchAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(results);
        return mock.Object;
    }

    [Fact]
    public async Task PesquisarAsync_WithTwoProviders_MergesResults()
    {
        var provider1 = CreateFakeProvider("Provider1", new[]
        {
            new ProdutoDto { Nome = "Samsung Galaxy S24", Preco = 3999m, Loja = "Loja1", Fonte = "Provider1" }
        });
        var provider2 = CreateFakeProvider("Provider2", new[]
        {
            new ProdutoDto { Nome = "Apple iPhone 15", Preco = 5999m, Loja = "Loja2", Fonte = "Provider2" }
        });

        var service = new PesquisaPrecosService(
            new[] { provider1, provider2 }, _cache, _groqService, _loggerMock.Object, _options);

        var (produtos, _, _, _) = await service.PesquisarAsync("smartphone");

        var list = produtos.ToList();
        Assert.Equal(2, list.Count);
        Assert.Contains(list, p => p.Fonte == "Provider1");
        Assert.Contains(list, p => p.Fonte == "Provider2");
    }

    [Fact]
    public async Task PesquisarAsync_FailingProvider_DoesNotCrash()
    {
        var failingProviderMock = new Mock<IPriceProvider>();
        failingProviderMock.Setup(p => p.ProviderName).Returns("FailingProvider");
        failingProviderMock.Setup(p => p.SearchAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new HttpRequestException("API offline"));

        var workingProvider = CreateFakeProvider("WorkingProvider", new[]
        {
            new ProdutoDto { Nome = "Test Product", Preco = 99m, Loja = "Loja", Fonte = "WorkingProvider" }
        });

        var service = new PesquisaPrecosService(
            new[] { failingProviderMock.Object, workingProvider }, _cache, _groqService, _loggerMock.Object, _options);

        var (produtos, _, _, _) = await service.PesquisarAsync("test");

        var list = produtos.ToList();
        Assert.Single(list);
        Assert.Equal("WorkingProvider", list[0].Fonte);
    }

    [Fact]
    public async Task PesquisarAsync_DuplicateProducts_KeepsLowestPrice()
    {
        // Dois providers retornam o mesmo produto com preços diferentes
        var provider1 = CreateFakeProvider("P1", new[]
        {
            new ProdutoDto { Nome = "iPhone 15 Pro Max 256GB", Preco = 6500m, Loja = "Loja A", Fonte = "P1" }
        });
        var provider2 = CreateFakeProvider("P2", new[]
        {
            // Nome praticamente igual — deve ser deduplicado
            new ProdutoDto { Nome = "iPhone 15 Pro Max 256GB Azul", Preco = 6300m, Loja = "Loja B", Fonte = "P2" }
        });

        var service = new PesquisaPrecosService(
            new[] { provider1, provider2 }, _cache, _groqService, _loggerMock.Object, _options);

        var (produtos, _, _, _) = await service.PesquisarAsync("iphone 15 pro max 256gb");

        var list = produtos.ToList();
        // Deve manter apenas o de menor preço
        Assert.Equal(1, list.Count);
        Assert.Equal(6300m, list[0].Preco);
    }

    [Fact]
    public async Task PesquisarAsync_SecondCallHitsCacheNotProvider()
    {
        int callCount = 0;
        var providerMock = new Mock<IPriceProvider>();
        providerMock.Setup(p => p.ProviderName).Returns("CacheProvider");
        providerMock.Setup(p => p.SearchAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() =>
            {
                callCount++;
                return new[] { new ProdutoDto { Nome = "Product", Preco = 100m, Fonte = "CacheProvider" } };
            });

        var service = new PesquisaPrecosService(
            new[] { providerMock.Object }, _cache, _groqService, _loggerMock.Object, _options);

        // Primeira chamada — vai ao provider
        await service.PesquisarAsync("produto teste cache xyz123");
        // Segunda chamada com a mesma query — deve vir do cache
        await service.PesquisarAsync("produto teste cache xyz123");

        // Provider deve ter sido chamado apenas uma vez
        Assert.Equal(1, callCount);
    }

    [Fact]
    public async Task PesquisarAsync_OrdersByPriceThenTrustedFirst()
    {
        var provider = CreateFakeProvider("P", new[]
        {
            new ProdutoDto { Nome = "Produto A", Preco = 200m, IsTrusted = false, Fonte = "P" },
            new ProdutoDto { Nome = "Produto B", Preco = 100m, IsTrusted = true, Fonte = "P" },
            new ProdutoDto { Nome = "Produto C", Preco = 150m, IsTrusted = true, Fonte = "P" },
        });

        var service = new PesquisaPrecosService(
            new[] { provider }, _cache, _groqService, _loggerMock.Object, _options);

        var (produtos, _, _, _) = await service.PesquisarAsync("ordenacao test produto");

        var list = produtos.ToList();
        // Lojas confiáveis primeiro
        Assert.True(list[0].IsTrusted || list[1].IsTrusted);
        // Entre as confiáveis, menor preço primeiro
        Assert.Equal(100m, list[0].Preco);
    }
}
