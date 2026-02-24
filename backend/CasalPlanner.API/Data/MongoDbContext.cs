using Microsoft.Extensions.Options;
using MongoDB.Driver;
using CasalPlanner.API.Models;

namespace CasalPlanner.API.Data;

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
            Console.WriteLine("🔄 Iniciando seed de dados...");

            // ===== 1. CONFIGURAR ÍNDICES =====
            await ConfigurarIndices();

            // ===== 2. CRIAR/OBTER CASAL DE EXEMPLO =====
            var casal = await ObterOuCriarCasalExemplo();
            
            if (casal == null)
            {
                Console.WriteLine("❌ Erro fatal: Não foi possível criar/obter o casal de exemplo!");
                return;
            }

            // ===== 3. CRIAR CATEGORIAS PADRÃO =====
            await CriarCategoriasPadrao();

            // ===== 4. CRIAR ITENS INICIAIS =====
            await CriarItensIniciais(casal);

            Console.WriteLine("✅ Seed de dados concluído com sucesso!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erro no seed de dados: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
        }
    }

    private async Task ConfigurarIndices()
    {
        try
        {
            // Listar índices existentes para debug
            var indexes = await (await _usuarios.Indexes.ListAsync()).ToListAsync();
            Console.WriteLine($"Índices existentes: {indexes.Count}");

            // Verificar se o índice já existe antes de criar
            var indexExists = indexes.Any(i => i["name"] == "Email_1");

            if (!indexExists)
            {
                // Criar índice para email em contas individuais
                var indexKeys = Builders<Usuario>.IndexKeys.Ascending(u => u.Email);
                var indexOptions = new CreateIndexOptions
                {
                    Unique = true,
                    Sparse = true,
                    Name = "Email_1"
                };
                var indexModel = new CreateIndexModel<Usuario>(indexKeys, indexOptions);

                await _usuarios.Indexes.CreateOneAsync(indexModel);
                Console.WriteLine("✅ Índice Email_1 criado com sucesso");
            }
            else
            {
                Console.WriteLine("ℹ️ Índice Email_1 já existe");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erro ao criar índices: {ex.Message}");
        }
    }

    private async Task<Usuario?> ObterOuCriarCasalExemplo()
    {
        // Verificar se já existe um casal de exemplo
        var casalExistente = await _usuarios
            .Find(u => u.TipoConta == TipoConta.Casal && 
                       u.CasalInfo != null && 
                       u.CasalInfo.EmailPessoa1 == "joao@email.com")
            .FirstOrDefaultAsync();

        if (casalExistente != null)
        {
            Console.WriteLine($"✅ Casal de exemplo já existe com ID: {casalExistente.Id}");
            
            // Mostrar dados do casal
            Console.WriteLine($"   Pessoa 1: {casalExistente.CasalInfo?.NomeCompletoPessoa1} - {casalExistente.CasalInfo?.EmailPessoa1}");
            Console.WriteLine($"   Pessoa 2: {casalExistente.CasalInfo?.NomeCompletoPessoa2} - {casalExistente.CasalInfo?.EmailPessoa2}");
            
            return casalExistente;
        }

        Console.WriteLine("👫 Criando casal de exemplo...");

        // IMPORTANTE: Para contas do tipo Casal, os campos individuais (NomeCompleto, Email, SenhaHash, etc.)
        // devem permanecer null. Toda a informação fica dentro de CasalInfo.
        var casal = new Usuario
        {
            TipoConta = TipoConta.Casal,
            IsCasal = true,
            // Campos individuais ficam null (padrão)
            CasalInfo = new CasalInfo
            {
                // Pessoa 1 - João
                NomeCompletoPessoa1 = "João Silva",
                EmailPessoa1 = "joao@email.com",
                SenhaHashPessoa1 = BCrypt.Net.BCrypt.HashPassword("123456"),
                CPFPessoa1 = "123.456.789-00",
                DataNascimentoPessoa1 = new DateTime(1990, 1, 1),
                TelefonePessoa1 = "(11) 99999-9999",
                RendaMensalPessoa1 = 5000.00m,

                // Pessoa 2 - Maria
                NomeCompletoPessoa2 = "Maria Silva",
                EmailPessoa2 = "maria@email.com",
                SenhaHashPessoa2 = BCrypt.Net.BCrypt.HashPassword("123456"),
                CPFPessoa2 = "987.654.321-00",
                DataNascimentoPessoa2 = new DateTime(1992, 2, 2),
                TelefonePessoa2 = "(11) 98888-8888",
                RendaMensalPessoa2 = 4500.00m,

                // Informações do casal
                DataCasamento = new DateTime(2020, 1, 1),
                CreatedAt = DateTime.UtcNow
            },
            CreatedAt = DateTime.UtcNow,
            Preferencias = new PreferenciasUsuario()
        };

        await _usuarios.InsertOneAsync(casal);
        Console.WriteLine($"✅ Casal de exemplo criado com ID: {casal.Id}");
        
        // Mostrar dados criados
        Console.WriteLine($"   Pessoa 1: {casal.CasalInfo?.NomeCompletoPessoa1} - {casal.CasalInfo?.EmailPessoa1}");
        Console.WriteLine($"   Pessoa 2: {casal.CasalInfo?.NomeCompletoPessoa2} - {casal.CasalInfo?.EmailPessoa2}");
        Console.WriteLine($"   Data Casamento: {casal.CasalInfo?.DataCasamento:dd/MM/yyyy}");

        return casal;
    }

    private async Task CriarCategoriasPadrao()
    {
        // Verificar se já existem categorias padrão
        var categoriasCount = await _categorias.CountDocumentsAsync(c => c.IsPadrao);
        Console.WriteLine($"Categorias padrão existentes: {categoriasCount}");

        if (categoriasCount > 0)
        {
            Console.WriteLine("ℹ️ Categorias já existem, pulando criação");
            return;
        }

        Console.WriteLine("📦 Criando categorias padrão...");

        // Categorias padrão (UsuarioId = null para serem globais)
        var categorias = new List<Categoria>
        {
            new() {
                Nome = "🍳 Cozinha",
                Bg = "#d6e9d6",
                Text = "#2c5e2c",
                IsPadrao = true,
                UsuarioId = null,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "🛋️ Sala",
                Bg = "#f5ded2",
                Text = "#b84a2c",
                IsPadrao = true,
                UsuarioId = null,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "🛏️ Quarto",
                Bg = "#d6e3f0",
                Text = "#2c5282",
                IsPadrao = true,
                UsuarioId = null,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "🛁 Banheiro",
                Bg = "#e2d9ed",
                Text = "#553c9a",
                IsPadrao = true,
                UsuarioId = null,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "🧼 Lavanderia",
                Bg = "#f7d9df",
                Text = "#97266d",
                IsPadrao = true,
                UsuarioId = null,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _categorias.InsertManyAsync(categorias);
        Console.WriteLine("✅ Categorias criadas");
    }

    private async Task CriarItensIniciais(Usuario casal)
    {
        // Verificar se já existem itens
        var itensCount = await _itens.CountDocumentsAsync(_ => true);
        
        if (itensCount > 0)
        {
            Console.WriteLine("ℹ️ Itens já existem, pulando criação");
            return;
        }

        // Buscar IDs das categorias
        var cozinha = await _categorias.Find(c => c.Nome == "🍳 Cozinha").FirstOrDefaultAsync();
        var sala = await _categorias.Find(c => c.Nome == "🛋️ Sala").FirstOrDefaultAsync();

        if (cozinha == null || sala == null)
        {
            Console.WriteLine("❌ Categorias não encontradas para criar itens");
            return;
        }

        Console.WriteLine("📦 Criando itens iniciais...");

        // Itens iniciais
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
        Console.WriteLine("✅ Itens iniciais criados");
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
                
                // Listar todos os usuários para debug
                var todosUsuarios = await _usuarios.Find(_ => true).ToListAsync();
                Console.WriteLine($"Total de usuários no banco: {todosUsuarios.Count}");
                
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
            else
            {
                Console.WriteLine($"✅ Casal encontrado:");
                Console.WriteLine($"   ID: {casal.Id}");
                Console.WriteLine($"   Pessoa 1: {casal.CasalInfo?.NomeCompletoPessoa1} - {casal.CasalInfo?.EmailPessoa1}");
                Console.WriteLine($"   Pessoa 2: {casal.CasalInfo?.NomeCompletoPessoa2} - {casal.CasalInfo?.EmailPessoa2}");
                Console.WriteLine($"   Data Casamento: {casal.CasalInfo?.DataCasamento:dd/MM/yyyy}");
                
                // Contar itens do casal
                var itensCount = await _itens.CountDocumentsAsync(i => i.UsuarioId == casal.Id);
                Console.WriteLine($"   Total de itens: {itensCount}");
                
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erro ao verificar usuário casal: {ex.Message}");
            return false;
        }
    }

    // Método adicional para debug
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
            
            if (u.CasalInfo != null)
            {
                Console.WriteLine($"  CasalInfo:");
                Console.WriteLine($"    Pessoa1: {u.CasalInfo.NomeCompletoPessoa1} - {u.CasalInfo.EmailPessoa1}");
                Console.WriteLine($"    CPF1: {u.CasalInfo.CPFPessoa1}");
                Console.WriteLine($"    DataNasc1: {u.CasalInfo.DataNascimentoPessoa1:dd/MM/yyyy}");
                Console.WriteLine($"    Renda1: {u.CasalInfo.RendaMensalPessoa1:C}");
                Console.WriteLine($"    Pessoa2: {u.CasalInfo.NomeCompletoPessoa2} - {u.CasalInfo.EmailPessoa2}");
                Console.WriteLine($"    CPF2: {u.CasalInfo.CPFPessoa2}");
                Console.WriteLine($"    DataNasc2: {u.CasalInfo.DataNascimentoPessoa2:dd/MM/yyyy}");
                Console.WriteLine($"    Renda2: {u.CasalInfo.RendaMensalPessoa2:C}");
                Console.WriteLine($"    DataCasamento: {u.CasalInfo.DataCasamento:dd/MM/yyyy}");
            }
            else
            {
                Console.WriteLine($"  Individual:");
                Console.WriteLine($"    Nome: {u.NomeCompleto}");
                Console.WriteLine($"    Email: {u.Email}");
                Console.WriteLine($"    CPF: {u.CPF}");
                Console.WriteLine($"    DataNasc: {u.DataNascimento:dd/MM/yyyy}");
                Console.WriteLine($"    Renda: {u.RendaMensal:C}");
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
}