using Microsoft.Extensions.Options;
using MongoDB.Driver;
using CasalPlanner.Domain.Entities;

namespace CasalPlanner.Infrastructure.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    private readonly IMongoCollection<Usuario> _usuarios;
    private readonly IMongoCollection<Categoria> _categorias;
    private readonly IMongoCollection<Item> _itens;

    public MongoDbContext(IOptions<MongoDBSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);

        _usuarios = _database.GetCollection<Usuario>("Usuarios");
        _categorias = _database.GetCollection<Categoria>("Categorias");
        _itens = _database.GetCollection<Item>("Itens");
    }

    public IMongoCollection<Usuario> Usuarios => _usuarios;
    public IMongoCollection<Categoria> Categorias => _categorias;
    public IMongoCollection<Item> Itens => _itens;

    public async Task SeedDataAsync()
    {
        try
        {
            var casal = await ObterOuCriarCasalExemplo();
            if (casal == null)
            {
                return;
            }
            await CriarCategoriasPadrao(casal);
            await CriarItensIniciais(casal);
        }
        catch (Exception ex) // 🔥 Manter a variável mesmo não usada
        {
            Console.WriteLine($"❌ Erro ao executar seed data: {ex.Message}"); // 🔥 Adicionar log
        }
    }
    private async Task<Usuario?> ObterOuCriarCasalExemplo()
    {
        var casalExistente = await _usuarios
            .Find(u => u.TipoConta == TipoConta.Casal &&
                       u.CasalInfo != null &&
                       u.CasalInfo.EmailPessoa1 == "joao@email.com")
            .FirstOrDefaultAsync();

        if (casalExistente != null)
        {
            return casalExistente;
        }

        var casal = new Usuario
        {
            TipoConta = TipoConta.Casal,
            IsCasal = true,
            Email = "",
            NomeCompleto = "João" + " e " + "Maria",
            ModoEscuro = false,
            CasalInfo = new CasalInfo
            {

                NomeCompletoPessoa1 = "João Silva",
                EmailPessoa1 = "joao@email.com",
                SenhaHashPessoa1 = BCrypt.Net.BCrypt.HashPassword("123456"),
                DataNascimentoPessoa1 = new DateTime(1990, 1, 1),

                NomeCompletoPessoa2 = "Maria Silva",
                EmailPessoa2 = "maria@email.com",
                SenhaHashPessoa2 = BCrypt.Net.BCrypt.HashPassword("123456"),
                DataNascimentoPessoa2 = new DateTime(1992, 2, 2),

                CreatedAt = DateTime.UtcNow
            },
            CreatedAt = DateTime.UtcNow
        };

        await _usuarios.InsertOneAsync(casal);
        return casal;
    }

    private async Task CriarCategoriasPadrao(Usuario casal)
    {
        var categoriasCount = await _categorias.CountDocumentsAsync(c => c.IsPadrao);

        if (categoriasCount > 0)
        {
            return;
        }

        var categorias = new List<Categoria>
        {
            new() {
                Nome = "Cozinha",
                Bg = "#2c5e2c",
                Icon = "Refrigerator",
                IsPadrao = true,
                UsuarioId = casal.Id!,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Sala",
                Bg = "#b84a2c",
                Icon = "Sofa",
                IsPadrao = true,
                UsuarioId = casal.Id!,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Quarto",
                Bg = "#2c5280",
                Icon = "Bed",
                IsPadrao = true,
                UsuarioId = casal.Id!,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Banheiro",
                Bg = "#e2d9ed",
                Icon = "Bath",
                IsPadrao = true,
                UsuarioId = casal.Id!,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Lavanderia",
                Bg = "#97266d",
                Icon = "WashingMachine",
                IsPadrao = true,
                UsuarioId = casal.Id!,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _categorias.InsertManyAsync(categorias);
    }

    private async Task CriarItensIniciais(Usuario casal)
    {
        var itensCount = await _itens.CountDocumentsAsync(_ => true);

        if (itensCount > 0)
        {
            return;
        }

        var cozinha = await _categorias.Find(c => c.Nome == "Cozinha").FirstOrDefaultAsync();
        var sala = await _categorias.Find(c => c.Nome == "Sala").FirstOrDefaultAsync();

        if (cozinha == null || sala == null)
        {
            return;
        }

        var itens = new List<Item>
        {
            new() {
                Nome = "Geladeira",
                Marca = "consul",
                Preco = 2500.00m,
                Quantidade = 1,
                CategoriaId = cozinha.Id!,
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
                CategoriaId = sala.Id!,
                Pagamento = "normal",
                UsuarioId = casal.Id!,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _itens.InsertManyAsync(itens);
    }

    public async Task<bool> VerificarUsuarioCasal()
    {
        try
        {
            var casal = await _usuarios
                .Find(u => u.TipoConta == TipoConta.Casal &&
                          u.CasalInfo != null)
                .FirstOrDefaultAsync();

            if (casal == null)
            {
                Console.WriteLine("❌ Nenhum casal encontrado no banco!");

                var todosUsuarios = await _usuarios.Find(_ => true).ToListAsync();

                foreach (var u in todosUsuarios)
                {
                    Console.WriteLine($"- Usuário ID: {u.Id}, TipoConta: {u.TipoConta}");
                    if (u.CasalInfo != null)
                    {
                        Console.WriteLine($"  Pessoa1: {u.CasalInfo.EmailPessoa1}");
                        Console.WriteLine($"  Pessoa2: {u.CasalInfo.EmailPessoa2}");
                    }
                    else
                    {
                        Console.WriteLine($"  Email: {u.Email}");
                    }
                }

                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erro ao verificar usuário casal: {ex.Message}");
            return false;
        }
    }

    public async Task DebugInfo()
    {
        Console.WriteLine("\n=== INFORMAÇÕES DE DEBUG ===");

        var usuarios = await _usuarios.Find(_ => true).ToListAsync();
        Console.WriteLine($"Total de usuários: {usuarios.Count}");

        foreach (var u in usuarios)
        {
            Console.WriteLine($"\nUsuário: {u.Id}");
            Console.WriteLine($"  TipoConta: {u.TipoConta}");
            Console.WriteLine($"  IsCasal: {u.IsCasal}");
            Console.WriteLine($"  ModoEscuro: {u.ModoEscuro}");

            if (u.CasalInfo != null)
            {
                Console.WriteLine($"  CasalInfo:");
                Console.WriteLine($"    Pessoa1: {u.CasalInfo.NomeCompletoPessoa1} - {u.CasalInfo.EmailPessoa1}");
                Console.WriteLine($"    DataNasc1: {u.CasalInfo.DataNascimentoPessoa1:dd/MM/yyyy}");
                Console.WriteLine($"    Pessoa2: {u.CasalInfo.NomeCompletoPessoa2} - {u.CasalInfo.EmailPessoa2}");
                Console.WriteLine($"    DataNasc2: {u.CasalInfo.DataNascimentoPessoa2:dd/MM/yyyy}");
            }
            else
            {
                Console.WriteLine($"  Individual:");
                Console.WriteLine($"    Nome: {u.NomeCompleto}");
                Console.WriteLine($"    Email: {u.Email}");
                Console.WriteLine($"    DataNasc: {u.DataNascimento:dd/MM/yyyy}");
            }
        }

        var categorias = await _categorias.Find(_ => true).ToListAsync();
        Console.WriteLine($"\nTotal de categorias: {categorias.Count}");
        foreach (var c in categorias)
        {
            Console.WriteLine($"  {c.Nome} - ID: {c.Id}");
        }

        var itens = await _itens.Find(_ => true).ToListAsync();
        Console.WriteLine($"\nTotal de itens: {itens.Count}");

        Console.WriteLine("=== FIM DEBUG ===\n");
    }

    public async Task TestarConexaoAsync()
    {
        try
        {
            var collections = await _database.ListCollectionNamesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Falha na conexão com MongoDB: {ex.Message}");
            throw;
        }
    }
}