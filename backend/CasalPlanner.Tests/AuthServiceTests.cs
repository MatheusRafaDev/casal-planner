using CasalPlanner.Domain.Entities;
using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.Infrastructure.Services;
using CasalPlanner.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Moq;
using Xunit;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CasalPlanner.Tests;

public class AuthServiceTests
{
    private readonly Mock<MongoDbContext> _contextMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        var settings = Options.Create(new MongoDBSettings { ConnectionString = "mongodb://localhost", DatabaseName = "TestDB" });
        _contextMock = new Mock<MongoDbContext>(settings);
        _configMock = new Mock<IConfiguration>();
        
        _configMock.Setup(c => c["JWT_SECRET_KEY"]).Returns(new string('a', 32));
        _configMock.Setup(c => c["JWT_ISSUER"]).Returns("issuer");
        _configMock.Setup(c => c["JWT_AUDIENCE"]).Returns("audience");

        _loggerMock = new Mock<ILogger<AuthService>>();
        _emailServiceMock = new Mock<IEmailService>();

        _service = new AuthService(
            _contextMock.Object,
            _configMock.Object
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

        mockCollection.Setup(c => c.FindAsync(
            It.IsAny<FilterDefinition<T>>(),
            It.IsAny<FindOptions<T, T>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockCursor.Object);

        return mockCollection;
    }

    [Fact]
    public async Task GerarERegistrarRefreshToken_Individual_ShouldGenerateTokenAndUpdateUser()
    {
        var mockCollection = new Mock<IMongoCollection<Usuario>>();
        _contextMock.Setup(c => c.Usuarios).Returns(mockCollection.Object);

        var (token, expiraEm) = await _service.GerarERegistrarRefreshToken("user-1");

        Assert.NotNull(token);
        Assert.True(token.Length > 0);
        Assert.True(expiraEm > DateTime.UtcNow.AddDays(29));

        mockCollection.Verify(c => c.UpdateOneAsync(
            It.IsAny<FilterDefinition<Usuario>>(),
            It.IsAny<UpdateDefinition<Usuario>>(),
            It.IsAny<UpdateOptions>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ValidarRefreshToken_ValidToken_ReturnsUser()
    {
        var token = "valid-token";
        var usuario = new Usuario 
        { 
            Id = "user-1", 
            TipoConta = TipoConta.Individual, 
            RefreshToken = token, 
            RefreshTokenExpiraEm = DateTime.UtcNow.AddDays(1) 
        };

        var mockCollection = SetupMockCollection(new List<Usuario> { usuario });
        _contextMock.Setup(c => c.Usuarios).Returns(mockCollection.Object);

        var (u, pessoa) = await _service.ValidarRefreshToken(token);

        Assert.NotNull(u);
        Assert.Equal("user-1", u.Id);
        Assert.Null(pessoa);
    }
}
