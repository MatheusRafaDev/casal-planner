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
    private readonly IMemoryCache _cache;
    private readonly ItemService _service;

    public ItemServiceTests()
    {
        _itemRepositoryMock = new Mock<IItemRepository>();
        _usuarioRepositoryMock = new Mock<IUsuarioRepository>();
        _pushServiceMock = new Mock<IPushService>();
        _loggerMock = new Mock<ILogger<ItemService>>();
        _emailServiceMock = new Mock<IEmailService>();
        _cache = new MemoryCache(new MemoryCacheOptions());

        _service = new ItemService(
            _itemRepositoryMock.Object,
            _usuarioRepositoryMock.Object,
            _pushServiceMock.Object,
            _loggerMock.Object,
            _emailServiceMock.Object,
            _cache
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
}
