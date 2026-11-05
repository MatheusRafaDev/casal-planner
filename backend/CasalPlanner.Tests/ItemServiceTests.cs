using CasalPlanner.Application.DTOs;
using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.Services;
using CasalPlanner.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CasalPlanner.Tests;

public class ItemServiceTests
{
    private readonly Mock<IItemRepository> _itemRepositoryMock;
    private readonly Mock<IUsuarioRepository> _usuarioRepositoryMock;
    private readonly Mock<IPushService> _pushServiceMock;
    private readonly Mock<ILogger<ItemService>> _loggerMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<IScrapeDoService> _scrapeDoServiceMock;
    private readonly IMemoryCache _cache;
    private readonly ItemService _service;

    public ItemServiceTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _pushServiceMock = new Mock<IPushService>();
        _loggerMock = new Mock<ILogger<ItemService>>();
        _emailServiceMock = new Mock<IEmailService>();
        _scrapeDoServiceMock = new Mock<IScrapeDoService>();
        _cache = new MemoryCache(new MemoryCacheOptions());

        _service = new ItemService(
            _itemRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _pushServiceMock.Object,
            _loggerMock.Object,
            _emailServiceMock.Object,
            _cache,
            _scrapeDoServiceMock.Object
        );
    }

    [Fact]
    public async Task CriarItem_DivisaoPagamentoSomaInvalida_LancaArgumentException()
    {
        // Arrange
        var dto = new CriarItemDto
        {
            Nome = "Item Teste",
            CategoriaId = "cat1",
            Preco = 100m,
            Quantidade = 2, // Total = 200
            DivisaoPagamento = new DivisaoPagamentoDto
            {
                ValorPessoa1 = 50m,
                ValorPessoa2 = 50m // Soma = 100 != 200
            }
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<System.ArgumentException>(() =>
            _service.CriarItem(dto, "user1", "teste@teste.com"));
            
        Assert.Contains("soma da divisão de pagamento", ex.Message);
    }

    [Fact]
    public async Task CriarItem_DivisaoPagamentoNull_CriaItemCorretamente()
    {
        // Arrange
        var dto = new CriarItemDto
        {
            Nome = "Item Teste",
            CategoriaId = "cat1",
            Preco = 100m,
            Quantidade = 2,
            DivisaoPagamento = null
        };
        
        _usuarioRepositoryMock.Setup(r => r.GetByIdAsync("user1"))
            .ReturnsAsync(new Usuario { Id = "user1", IsCasal = false });

        // Act
        var result = await _service.CriarItem(dto, "user1", "teste@teste.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Item Teste", result.Nome);
        Assert.Null(result.DivisaoPagamento);
        _itemRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Item>()), Times.Once);
    }

    [Fact]
    public async Task AtualizarComprado_ItemNaoEncontrado_RetornaNull()
    {
        // Arrange
        _itemRepositoryMock.Setup(r => r.UpdateCompradoAsync("item1", "user1", true))
            .ReturnsAsync((Item)null);

        // Act
        var result = await _service.AtualizarComprado("item1", true, "user1", "teste@teste.com");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeletarItem_ItemNaoExiste_RetornaFalse()
    {
        // Arrange
        _itemRepositoryMock.Setup(r => r.DeleteAsync("item1", "user1"))
            .ReturnsAsync(false);

        // Act
        var result = await _service.DeletarItem("item1", "user1");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CriarItem_ComIdempotencyKeyExistente_RetornaItemExistenteSemCriarNovo()
    {
        // Arrange
        var existing = new Item
        {
            Id = "item-existente-1",
            Nome = "Jogo de Panelas",
            Preco = 350m,
            UsuarioId = "user1",
            IdempotencyKey = "key-123"
        };

        _itemRepositoryMock.Setup(r => r.GetByIdempotencyKeyAsync("user1", "key-123"))
            .ReturnsAsync(existing);

        var dto = new CriarItemDto
        {
            Nome = "Jogo de Panelas",
            CategoriaId = "cat1",
            Preco = 350m,
            Quantidade = 1,
            IdempotencyKey = "key-123"
        };

        // Act
        var result = await _service.CriarItem(dto, "user1", "teste@teste.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("item-existente-1", result.Id);
        _itemRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Item>()), Times.Never);
    }

    [Fact]
    public async Task CriarItem_DuplicadoRecenteSemIdempotencyKey_RetornaItemExistenteSemCriarNovo()
    {
        // Arrange
        var existing = new Item
        {
            Id = "item-recente-2",
            Nome = "Jogo de Pratos",
            Preco = 120m,
            CategoriaId = "cat1",
            UsuarioId = "user1"
        };

        _itemRepositoryMock.Setup(r => r.GetRecentDuplicateAsync("user1", "Jogo de Pratos", "cat1", 120m, It.IsAny<System.TimeSpan>()))
            .ReturnsAsync(existing);

        var dto = new CriarItemDto
        {
            Nome = "Jogo de Pratos",
            CategoriaId = "cat1",
            Preco = 120m,
            Quantidade = 1
        };

        // Act
        var result = await _service.CriarItem(dto, "user1", "teste@teste.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("item-recente-2", result.Id);
        _itemRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Item>()), Times.Never);
    }

    [Fact]
    public async Task CriarItem_SemVideo_VideoRelevanteEncontrado_VinculaVideoAutomaticamente()
    {
        // Arrange
        var previewMock = new Mock<CasalPlanner.Application.Interfaces.ITikTokPreviewService>();
        previewMock.Setup(p => p.BuscarVideosAsync("Canto Alemão Cash com 2 Cadeiras Sol Viero", It.IsAny<System.Threading.CancellationToken>()))
            .ReturnsAsync(new List<VideoPreviewDto>
            {
                new VideoPreviewDto
                {
                    Id = "v1",
                    Title = "Review: Conjunto Canto Alemão com 2 Cadeiras Viero Móveis",
                    VideoUrl = "https://www.youtube.com/watch?v=uUIpRbXVhDY",
                    ThumbnailUrl = "https://i.ytimg.com/vi/uUIpRbXVhDY/hqdefault.jpg"
                }
            });

        var customService = new ItemService(
            _itemRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _pushServiceMock.Object,
            _loggerMock.Object,
            _emailServiceMock.Object,
            _cache,
            _scrapeDoServiceMock.Object,
            null,
            previewMock.Object
        );

        var dto = new CriarItemDto
        {
            Nome = "Canto Alemão Cash com 2 Cadeiras Sol Viero",
            CategoriaId = "cat1",
            Preco = 926.91m,
            Quantidade = 1
        };

        Item? itemCriado = null;
        _itemRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<Item>()))
            .Callback<Item>(i => itemCriado = i)
            .Returns(Task.CompletedTask);

        // Act
        var res = await customService.CriarItem(dto, "user1", "teste@teste.com");

        // Assert
        Assert.NotNull(res);
        Assert.Equal("https://www.youtube.com/watch?v=uUIpRbXVhDY", res.VideoUrl);
        Assert.Equal("https://i.ytimg.com/vi/uUIpRbXVhDY/hqdefault.jpg", res.VideoThumbnail);
    }

    [Fact]
    public async Task CriarItem_SemVideo_VideoIrrelevante_NaoVinculaVideo()
    {
        // Arrange: Se não achar vídeo relevante ("se nao achar n coloque"), deve deixar nulo
        var previewMock = new Mock<CasalPlanner.Application.Interfaces.ITikTokPreviewService>();
        previewMock.Setup(p => p.BuscarVideosAsync("Parafuso Sextavado 3/8", It.IsAny<System.Threading.CancellationToken>()))
            .ReturnsAsync(new List<VideoPreviewDto>
            {
                new VideoPreviewDto
                {
                    Id = "v2",
                    Title = "Receita de Bolo de Cenoura Fácil e Rápido",
                    VideoUrl = "https://www.youtube.com/watch?v=xyz123",
                    ThumbnailUrl = "https://i.ytimg.com/vi/xyz123/hqdefault.jpg"
                }
            });

        var customService = new ItemService(
            _itemRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _pushServiceMock.Object,
            _loggerMock.Object,
            _emailServiceMock.Object,
            _cache,
            _scrapeDoServiceMock.Object,
            null,
            previewMock.Object
        );

        var dto = new CriarItemDto
        {
            Nome = "Parafuso Sextavado 3/8",
            CategoriaId = "cat1",
            Preco = 5.00m,
            Quantidade = 10
        };

        // Act
        var res = await customService.CriarItem(dto, "user1", "teste@teste.com");

        // Assert
        Assert.NotNull(res);
        Assert.Null(res.VideoUrl);
        Assert.Null(res.VideoThumbnail);
    }
}
