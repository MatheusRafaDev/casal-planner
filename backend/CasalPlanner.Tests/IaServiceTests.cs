using System.Net;
using CasalPlanner.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace CasalPlanner.Tests;

public class IaServiceTests
{
    private readonly Mock<ILogger<IaService>> _loggerMock = new();

    private IaService CreateService(HttpMessageHandler? handler = null)
    {
        var httpClient = handler != null ? new HttpClient(handler) : new HttpClient();
        return new IaService(httpClient, _loggerMock.Object);
    }

    [Fact]
    public async Task ObterSugestoesComodo_FallbackLocal_RetornaItensParaCozinha()
    {
        // Sem chaves de API no ambiente de teste, deve acionar o fallback inteligente sem estourar exceção
        var service = CreateService();

        var sugestoes = await service.ObterSugestoesComodoAsync("Cozinha");

        Assert.NotNull(sugestoes);
        Assert.NotEmpty(sugestoes);
        Assert.Contains(sugestoes, s => s.Nome.Contains("Panelas", StringComparison.OrdinalIgnoreCase) || s.Nome.Contains("Air Fryer", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task DetectarDuplicata_SemItensExistentes_RetornaFalso()
    {
        var service = CreateService();

        var resultado = await service.DetectarDuplicataAsync("Air Fryer Philips", Array.Empty<string>());

        Assert.NotNull(resultado);
        Assert.False(resultado.Duplicata);
        Assert.Null(resultado.ItemSimilar);
    }

    [Fact]
    public async Task DetectarDuplicata_ItemSimilarExistente_DetectaCorretamente()
    {
        var service = CreateService();
        var itensExistentes = new[] { "Air Fryer Mondial 4L", "Liquidificador Oster" };

        var resultado = await service.DetectarDuplicataAsync("Air Fryer", itensExistentes);

        Assert.NotNull(resultado);
        Assert.True(resultado.Duplicata);
        Assert.Equal("Air Fryer Mondial 4L", resultado.ItemSimilar);
    }

    [Fact]
    public async Task DescobrirDominios_LojasConhecidas_ResolveInstantaneamenteSemChamadaExterna()
    {
        var service = CreateService();
        var lojas = new[] { "Magazine Luiza", "Tok&Stok", "Leroy Merlin", "Amazon" };

        var resultado = await service.DescobrirDominiosAsync(lojas);

        Assert.NotNull(resultado);
        Assert.Equal("magazineluiza.com.br", resultado["Magazine Luiza"]);
        Assert.Equal("tokstok.com.br", resultado["Tok&Stok"]);
        Assert.Equal("leroymerlin.com.br", resultado["Leroy Merlin"]);
        Assert.Equal("amazon.com.br", resultado["Amazon"]);
    }

    [Fact]
    public async Task ObterEstimativaComodo_Fallback_RetornaFaixasValidas()
    {
        var service = CreateService();

        var estimativa = await service.ObterEstimativaComodoAsync("Quarto");

        Assert.NotNull(estimativa);
        Assert.Equal("Quarto", estimativa.Comodo);
        Assert.True(estimativa.FaixaEssencial > 0);
        Assert.True(estimativa.FaixaMedia >= estimativa.FaixaEssencial);
        Assert.True(estimativa.FaixaCompleta >= estimativa.FaixaMedia);
    }
}
