using Microsoft.Extensions.Options;
using MongoDB.Driver;
using CasalPlanner.API.Models;

namespace CasalPlanner.API.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    
    // Declare as propriedades
    private readonly IMongoCollection<Usuario> _usuarios;
    private readonly IMongoCollection<Categoria> _categorias;
    private readonly IMongoCollection<Item> _itens;
    
    public MongoDbContext(IOptions<MongoDBSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
        
        // Inicialize as coleções
        _usuarios = _database.GetCollection<Usuario>("Usuarios");
        _categorias = _database.GetCollection<Categoria>("Categorias");
        _itens = _database.GetCollection<Item>("Itens");
    }
    
    // Propriedades públicas
    public IMongoCollection<Usuario> Usuarios => _usuarios;
    public IMongoCollection<Categoria> Categorias => _categorias;
    public IMongoCollection<Item> Itens => _itens;
    
    public async Task SeedDataAsync()
    {
        // Criar índices
        var usuariosIndexes = Usuarios.Indexes;
        await usuariosIndexes.CreateOneAsync(
            new CreateIndexModel<Usuario>(
                Builders<Usuario>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true }
            )
        );
        
        // Verificar se já existem categorias padrão
        var categoriasCount = await Categorias.CountDocumentsAsync(c => c.IsPadrao);
        
        if (categoriasCount == 0)
        {
            // Criar usuário padrão do casal
            var casal = new Usuario
            {
                Nome = "Casal",
                Email = "casal@email.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("casal123"),
                IsCasal = true,
                CreatedAt = DateTime.UtcNow
            };
            
            await Usuarios.InsertOneAsync(casal);
            
            // Categorias padrão
            var categorias = new List<Categoria>
            {
                new() { 
                    Nome = "🍳 Cozinha", 
                    Bg = "#d6e9d6", 
                    Text = "#2c5e2c", 
                    IsPadrao = true,
                    UsuarioId = casal.Id!
                },
                new() { 
                    Nome = "🛋️ Sala", 
                    Bg = "#f5ded2", 
                    Text = "#b84a2c", 
                    IsPadrao = true,
                    UsuarioId = casal.Id!
                },
                new() { 
                    Nome = "🛏️ Quarto", 
                    Bg = "#d6e3f0", 
                    Text = "#2c5282", 
                    IsPadrao = true,
                    UsuarioId =casal.Id!
                },
                new() { 
                    Nome = "🛁 Banheiro", 
                    Bg = "#e2d9ed", 
                    Text = "#553c9a", 
                    IsPadrao = true,
                    UsuarioId =casal.Id!
                },
                new() { 
                    Nome = "🧼 Lavanderia", 
                    Bg = "#f7d9df", 
                    Text = "#97266d", 
                    IsPadrao = true,
                    UsuarioId = casal.Id!
                }
            };
            
            await Categorias.InsertManyAsync(categorias);
            
            // Buscar IDs das categorias
            var cozinha = await Categorias.Find(c => c.Nome == "🍳 Cozinha").FirstOrDefaultAsync();
            var sala = await Categorias.Find(c => c.Nome == "🛋️ Sala").FirstOrDefaultAsync();
            
            // Itens iniciais
            var itens = new List<Item>
            {
                new() { 
                    Nome = "Geladeira", 
                    Marca = "consul", 
                    Preco = 2500.00m, 
                    Quantidade = 1, 
                    CategoriaId = cozinha!.Id!,
                    Pagamento = "normal",
                    UsuarioId = casal.Id!,
                    CreatedAt = DateTime.UtcNow
                },
                new() { 
                    Nome = "Fogão", 
                    Marca = "4 bocas", 
                    Preco = 1100.00m, 
                    Quantidade = 1, 
                    CategoriaId = cozinha.Id!,
                    Pagamento = "normal",
                    UsuarioId = casal.Id!,
                    CreatedAt = DateTime.UtcNow
                },
                new() { 
                    Nome = "Arroz", 
                    Marca = "tio joão", 
                    Preco = 28.90m, 
                    Quantidade = 2, 
                    CategoriaId = cozinha.Id!,
                    Pagamento = "vr",
                    UsuarioId = casal.Id!,
                    CreatedAt = DateTime.UtcNow
                },
                new() { 
                    Nome = "Sofá", 
                    Marca = "2 lugares", 
                    Preco = 750.00m, 
                    Quantidade = 1, 
                    CategoriaId = sala!.Id!,
                    Pagamento = "normal",
                    UsuarioId = casal.Id!,
                    CreatedAt = DateTime.UtcNow
                }
            };
            
            await Itens.InsertManyAsync(itens);
        }
    }

    // Método de verificação corrigido
    public async Task<bool> VerificarUsuarioCasal()
    {
        var casal = await _usuarios.Find(u => u.Email == "casal@email.com").FirstOrDefaultAsync();
        if (casal == null)
        {
            Console.WriteLine("❌ Usuário do casal NÃO encontrado!");
            return false;
        }
        else
        {
            Console.WriteLine($"✅ Usuário do casal encontrado: {casal.Nome} - {casal.Email}");
            return true;
        }
    }
}