using CasalPlanner.Application.DTOs;
using CasalPlanner.Domain.Entities;
using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.Infrastructure.Services;
using CasalPlanner.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Moq;
using Xunit;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CasalPlanner.Tests;

public class ItemServiceTests
{
    private readonly Mock<MongoDbContext> _contextMock;
    private readonly Mock<IPushService> _pushServiceMock;
    private readonly Mock<ILogger<ItemService>> _loggerMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly IMemoryCache _cache;
    private readonly ItemService _service;

    public ItemServiceTests()
    {
        var settings = Options.Create(new MongoDBSettings { ConnectionString = "mongodb://localhost", DatabaseName = "TestDB" });
        _contextMock = new Mock<MongoDbContext>(settings);
        _pushServiceMock = new Mock<IPushService>();
        _loggerMock = new Mock<ILogger<ItemService>>();
        _emailServiceMock = new Mock<IEmailService>();
        _cache = new MemoryCache(new MemoryCacheOptions());

        _service = new ItemService(
            _contextMock.Object,
            _pushServiceMock.Object,
            _loggerMock.Object,
            _emailServiceMock.Object,
            _cache
        );
    }

    private Mock<IMongoCollection<T>> SetupMockCollection<T>(List<T> data)
    {
        var mockCollection = new Mock<IMongoCollection<T>>();
        var mockCursor = new Mock<IAsyncCursor<T>>();

        mockCursor.Setup(_ => _.Current).Returns(data);
        mockCursor.SetupSequence(_ => _.MoveNext(It.IsAny<CancellationToken>()))
            .Returns(true)
            .Returns(false);
        mockCursor.SetupSequence(_ => _.MoveNextAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true)
            .ReturnsAsync(false);

        // Configuração básica para FindAsync
        mockCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<T>>(),
            It.IsAny<FindOptions<T, T>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);
            
        // DeleteOneAsync
        mockCollection.Setup(c => c.DeleteOneAsync(
            It.IsAny<FilterDefinition<T>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeleteResult.Acknowledged(data.Count > 0 ? 1 : 0));

        // FindOneAndUpdateAsync
        mockCollection.Setup(c => c.FindOneAndUpdateAsync(
            It.IsAny<FilterDefinition<T>>(),
            It.IsAny<UpdateDefinition<T>>(),
            It.IsAny<FindOneAndUpdateOptions<T, T>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(data.Count > 0 ? data[0] : default(T));

        return mockCollection;
    }

    [Fact]
    public async Task CriarItem_DivisaoPagamentoSomaInvalida_LancaArgumentException()
    {
        // Arrange
        var categorias = new List<Categoria> { new Categoria { Id = "cat1", IsPadrao = true, UsuarioId = "user1" } };
        var mockCategorias = SetupMockCollection(categorias);
        _contextMock.Setup(c => c.Categorias).Returns(mockCategorias.Object);

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
        var categorias = new List<Categoria> { new Categoria { Id = "cat1", IsPadrao = true, UsuarioId = "user1" } };
        var mockCategorias = SetupMockCollection(categorias);
        var mockItens = SetupMockCollection(new List<Item>());
        var mockUsuarios = SetupMockCollection(new List<Usuario>());
        
        _contextMock.Setup(c => c.Categorias).Returns(mockCategorias.Object);
        _contextMock.Setup(c => c.Itens).Returns(mockItens.Object);
        _contextMock.Setup(c => c.Usuarios).Returns(mockUsuarios.Object);

        var dto = new CriarItemDto
        {
            Nome = "Item Teste",
            CategoriaId = "cat1",
            Preco = 100m,
            Quantidade = 2,
            DivisaoPagamento = null
        };

        // Act
        var result = await _service.CriarItem(dto, "user1", "teste@teste.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Item Teste", result.Nome);
        Assert.Null(result.DivisaoPagamento);
        mockItens.Verify(i => i.InsertOneAsync(It.IsAny<Item>(), It.IsAny<InsertOneOptions>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AtualizarItem_CategoriaInvalida_LancaArgumentException()
    {
        // Arrange
        var categorias = new List<Categoria> { new Categoria { Id = "cat2", IsPadrao = false, UsuarioId = "user2" } }; // Pertence a outro
        var mockCategorias = SetupMockCollection(categorias);
        _contextMock.Setup(c => c.Categorias).Returns(mockCategorias.Object);

        var dto = new AtualizarItemDto
        {
            CategoriaId = "cat2"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<System.ArgumentException>(() =>
            _service.AtualizarItem("item1", dto, "user1", "teste@teste.com"));
            
        Assert.Contains("Categoria inválida", ex.Message);
    }

    [Fact]
    public async Task AtualizarComprado_ItemNaoEncontrado_RetornaNull()
    {
        // Arrange
        var mockItens = SetupMockCollection(new List<Item>()); // Lista vazia simula item não encontrado no mock básico
        _contextMock.Setup(c => c.Itens).Returns(mockItens.Object);

        // Act
        var result = await _service.AtualizarComprado("item1", true, "user1", "teste@teste.com");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeletarItem_ItemNaoExiste_RetornaFalse()
    {
        // Arrange
        var mockItens = new Mock<IMongoCollection<Item>>();
        mockItens.Setup(c => c.DeleteOneAsync(
            It.IsAny<FilterDefinition<Item>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeleteResult.Acknowledged(0)); // 0 deleted count

        _contextMock.Setup(c => c.Itens).Returns(mockItens.Object);

        // Act
        var result = await _service.DeletarItem("item1", "user1");

        // Assert
        Assert.False(result);
    }
}
