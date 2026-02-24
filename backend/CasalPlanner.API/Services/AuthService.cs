using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using BCrypt.Net;
using CasalPlanner.API.Models;
using CasalPlanner.API.Data;

namespace CasalPlanner.API.Services
{
    public interface IAuthService
    {
        // Métodos existentes
        Task<Usuario?> Registrar(RegistroDto dto);
        Task<LoginResponseDto?> Login(LoginDto dto);
        string GerarToken(Usuario usuario);
        Task<Usuario?> ObterUsuarioPorId(string id);
        Task<Usuario?> ObterUsuarioPorEmail(string email);

        // NOVOS MÉTODOS PARA CASAL
        Task<Usuario?> RegistrarCasal(RegistroCasalDto dto);
        Task<LoginCasalResponseDto?> LoginCasal(LoginCasalDto dto);
        string GerarTokenCasal(Usuario usuario, string pessoaQueLogou);
        Task<Usuario?> ObterCasalPorEmail(string email);
        Task<bool> AlterarSenhaPessoa(AlterarSenhaDto dto);
        Task<Usuario?> AtualizarPerfilCasal(string usuarioId, AtualizarCasalDto dto);
    }

    public class AuthService : IAuthService
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            MongoDbContext context,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        #region Métodos Individuais

        public async Task<Usuario?> Registrar(RegistroDto dto)
        {
            try
            {
                // Verificar se email já existe
                var existe = await _context.Usuarios
                    .Find(u => u.Email == dto.Email)
                    .AnyAsync();

                if (existe)
                    return null;

                var usuario = new Usuario
                {
                    NomeCompleto = dto.NomeCompleto,
                    Email = dto.Email,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                    CPF = dto.CPF,
                    DataNascimento = dto.DataNascimento,
                    Telefone = dto.Telefone,
                    RendaMensal = dto.RendaMensal,
                    IsCasal = false,
                    TipoConta = TipoConta.Individual,
                    CreatedAt = DateTime.UtcNow,
                    Preferencias = new PreferenciasUsuario()
                };

                await _context.Usuarios.InsertOneAsync(usuario);

                _logger.LogInformation("Usuário registrado com sucesso: {Email}", dto.Email);
                return usuario;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao registrar usuário: {Email}", dto.Email);
                throw;
            }
        }

        public async Task<LoginResponseDto?> Login(LoginDto dto)
        {
            try
            {
                var usuario = await _context.Usuarios
                    .Find(u => u.Email == dto.Email)
                    .FirstOrDefaultAsync();

                if (usuario?.SenhaHash == null)
                {
                    _logger.LogWarning("Usuário não encontrado: {Email}", dto.Email);
                    return null;
                }

                if (!BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
                {
                    _logger.LogWarning("Senha inválida para: {Email}", dto.Email);
                    return null;
                }

                var update = Builders<Usuario>.Update
                    .Set(u => u.LastLoginAt, DateTime.UtcNow);

                await _context.Usuarios.UpdateOneAsync(
                    u => u.Id == usuario.Id,
                    update);

                var token = GerarToken(usuario);

                _logger.LogInformation("Login bem-sucedido: {Email}", dto.Email);

                return new LoginResponseDto
                {
                    Id = usuario.Id!,
                    NomeCompleto = usuario.NomeCompleto ?? "",
                    Email = usuario.Email ?? "",
                    Token = token,
                    IsCasal = usuario.IsCasal,
                    TipoConta = usuario.TipoConta.ToString()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro no login para: {Email}", dto.Email);
                throw;
            }
        }

        public string GerarToken(Usuario usuario)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(
                _configuration["Jwt:Key"] ?? "chave-super-secreta-casal-planner-2024"
            );

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id!),
                new Claim(ClaimTypes.Name, usuario.NomeCompleto ?? ""),
                new Claim(ClaimTypes.Email, usuario.Email ?? ""),
                new Claim("isCasal", usuario.IsCasal.ToString()),
                new Claim("tipoConta", usuario.TipoConta.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<Usuario?> ObterUsuarioPorId(string id)
        {
            return await _context.Usuarios
                .Find(u => u.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<Usuario?> ObterUsuarioPorEmail(string email)
        {
            return await _context.Usuarios
                .Find(u => u.Email == email)
                .FirstOrDefaultAsync();
        }

        #endregion

        #region Métodos para Casal

        public async Task<Usuario?> RegistrarCasal(RegistroCasalDto dto)
        {
            try
            {
                _logger.LogInformation("Tentando registrar casal: {Email1} e {Email2}",
                    dto.EmailPessoa1, dto.EmailPessoa2);

                // Verificar se os emails já existem
                var email1Existe = await _context.Usuarios
                    .Find(u => u.Email == dto.EmailPessoa1)
                    .AnyAsync();

                var email2Existe = await _context.Usuarios
                    .Find(u => u.Email == dto.EmailPessoa2)
                    .AnyAsync();

                if (email1Existe || email2Existe)
                {
                    _logger.LogWarning("Um dos emails já existe: {Email1} - {Email2}",
                        dto.EmailPessoa1, dto.EmailPessoa2);
                    return null;
                }

                var usuario = new Usuario
                {
                    TipoConta = TipoConta.Casal,
                    IsCasal = true,
                    CasalInfo = new CasalInfo
                    {
                        // Pessoa 1
                        NomeCompletoPessoa1 = dto.NomeCompletoPessoa1,
                        EmailPessoa1 = dto.EmailPessoa1,
                        SenhaHashPessoa1 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa1),
                        CPFPessoa1 = dto.CPFPessoa1,
                        DataNascimentoPessoa1 = dto.DataNascimentoPessoa1,
                        TelefonePessoa1 = dto.TelefonePessoa1,
                        RendaMensalPessoa1 = dto.RendaMensalPessoa1,

                        // Pessoa 2
                        NomeCompletoPessoa2 = dto.NomeCompletoPessoa2,
                        EmailPessoa2 = dto.EmailPessoa2,
                        SenhaHashPessoa2 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa2),
                        CPFPessoa2 = dto.CPFPessoa2,
                        DataNascimentoPessoa2 = dto.DataNascimentoPessoa2,
                        TelefonePessoa2 = dto.TelefonePessoa2,
                        RendaMensalPessoa2 = dto.RendaMensalPessoa2,

                        // Informações do casal
                        DataCasamento = dto.DataCasamento,
                        CreatedAt = DateTime.UtcNow
                    },
                    CreatedAt = DateTime.UtcNow,
                    Preferencias = new PreferenciasUsuario()
                };

                await _context.Usuarios.InsertOneAsync(usuario);

                _logger.LogInformation("Casal registrado com sucesso: {Id}", usuario.Id);
                return usuario;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao registrar casal");
                throw;
            }
        }

        public async Task<LoginCasalResponseDto?> LoginCasal(LoginCasalDto dto)
        {
            try
            {
                _logger.LogInformation("Tentando login do casal: {Email}", dto.Email);

                var usuario = await _context.Usuarios
                    .Find(u => u.TipoConta == TipoConta.Casal)
                    .FirstOrDefaultAsync();

                if (usuario?.CasalInfo == null)
                {
                    _logger.LogWarning("Casal não encontrado para email: {Email}", dto.Email);
                    return null;
                }

                // Verificar qual pessoa está fazendo login
                string pessoaQueLogou = "";
                bool senhaValida = false;

                if (usuario.CasalInfo.EmailPessoa1 == dto.Email)
                {
                    senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.CasalInfo.SenhaHashPessoa1);
                    pessoaQueLogou = "pessoa1";
                    _logger.LogInformation("Login como pessoa 1");
                }
                else if (usuario.CasalInfo.EmailPessoa2 == dto.Email)
                {
                    senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.CasalInfo.SenhaHashPessoa2);
                    pessoaQueLogou = "pessoa2";
                    _logger.LogInformation("Login como pessoa 2");
                }

                if (!senhaValida)
                {
                    _logger.LogWarning("Senha inválida para: {Email}", dto.Email);
                    return null;
                }

                // Atualizar último login
                var update = Builders<Usuario>.Update
                    .Set(u => u.LastLoginAt, DateTime.UtcNow);

                await _context.Usuarios.UpdateOneAsync(u => u.Id == usuario.Id, update);

                var token = GerarTokenCasal(usuario, pessoaQueLogou);
                var nome = pessoaQueLogou == "pessoa1"
                    ? usuario.CasalInfo.NomeCompletoPessoa1
                    : usuario.CasalInfo.NomeCompletoPessoa2;

                _logger.LogInformation("Login do casal bem-sucedido: {Email}", dto.Email);

                return new LoginCasalResponseDto
                {
                    Id = usuario.Id!,
                    NomeCompleto = nome,
                    Email = dto.Email,
                    Token = token,
                    TipoConta = "Casal",
                    PessoaQueLogou = pessoaQueLogou,
                    NomeCompletoPessoa1 = usuario.CasalInfo.NomeCompletoPessoa1,
                    EmailPessoa1 = usuario.CasalInfo.EmailPessoa1,
                    CPFPessoa1 = usuario.CasalInfo.CPFPessoa1,
                    DataNascimentoPessoa1 = usuario.CasalInfo.DataNascimentoPessoa1,
                    NomeCompletoPessoa2 = usuario.CasalInfo.NomeCompletoPessoa2,
                    EmailPessoa2 = usuario.CasalInfo.EmailPessoa2,
                    CPFPessoa2 = usuario.CasalInfo.CPFPessoa2,
                    DataNascimentoPessoa2 = usuario.CasalInfo.DataNascimentoPessoa2,
                    DataCasamento = usuario.CasalInfo.DataCasamento
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro no login do casal para: {Email}", dto.Email);
                throw;
            }
        }

        public string GerarTokenCasal(Usuario usuario, string pessoaQueLogou)
        {
            if (usuario.CasalInfo == null)
                throw new InvalidOperationException("Usuário não é do tipo casal");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(
                _configuration["Jwt:Key"] ?? "chave-super-secreta-casal-planner-2024"
            );

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id!),
                new Claim("tipoConta", "Casal"),
                new Claim("pessoaQueLogou", pessoaQueLogou),
                new Claim("nomeCompletoPessoa1", usuario.CasalInfo.NomeCompletoPessoa1),
                new Claim("emailPessoa1", usuario.CasalInfo.EmailPessoa1),
                new Claim("cpfPessoa1", usuario.CasalInfo.CPFPessoa1),
                new Claim("nomeCompletoPessoa2", usuario.CasalInfo.NomeCompletoPessoa2),
                new Claim("emailPessoa2", usuario.CasalInfo.EmailPessoa2),
                new Claim("cpfPessoa2", usuario.CasalInfo.CPFPessoa2)
            };

            if (pessoaQueLogou == "pessoa1")
            {
                claims.Add(new Claim(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa1));
                claims.Add(new Claim(ClaimTypes.Email, usuario.CasalInfo.EmailPessoa1));
            }
            else
            {
                claims.Add(new Claim(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa2));
                claims.Add(new Claim(ClaimTypes.Email, usuario.CasalInfo.EmailPessoa2));
            }

            if (usuario.CasalInfo.DataCasamento.HasValue)
            {
                claims.Add(new Claim("dataCasamento", usuario.CasalInfo.DataCasamento.Value.ToString("yyyy-MM-dd")));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<Usuario?> ObterCasalPorEmail(string email)
        {
            return await _context.Usuarios
                .Find(u => u.TipoConta == TipoConta.Casal &&
                           u.CasalInfo != null &&
                           (u.CasalInfo.EmailPessoa1 == email || u.CasalInfo.EmailPessoa2 == email))
                .FirstOrDefaultAsync();
        }
        public async Task<bool> AlterarSenhaPessoa(AlterarSenhaDto dto)
        {
            try
            {
                _logger.LogInformation("Tentando alterar senha para: {Email}", dto.Email);

                var usuario = await _context.Usuarios
                    .Find(u => u.TipoConta == TipoConta.Casal)
                    .FirstOrDefaultAsync();

                if (usuario?.CasalInfo == null)
                {
                    _logger.LogWarning("Casal não encontrado para: {Email}", dto.Email);
                    return false;
                }

                var update = Builders<Usuario>.Update;
                UpdateDefinition<Usuario>? definicao = null;

                // Verificação segura com null check
                if (!string.IsNullOrEmpty(usuario.CasalInfo.EmailPessoa1) &&
                    usuario.CasalInfo.EmailPessoa1.Equals(dto.Email, StringComparison.OrdinalIgnoreCase))
                {
                    if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuario.CasalInfo.SenhaHashPessoa1))
                    {
                        _logger.LogWarning("Senha atual inválida para pessoa 1: {Email}", dto.Email);
                        return false;
                    }

                    var novaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
                    definicao = update.Set(u => u.CasalInfo.SenhaHashPessoa1, novaHash);
                    _logger.LogInformation("Senha alterada para pessoa 1");
                }
                else if (!string.IsNullOrEmpty(usuario.CasalInfo.EmailPessoa2) &&
                         usuario.CasalInfo.EmailPessoa2.Equals(dto.Email, StringComparison.OrdinalIgnoreCase))
                {
                    if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuario.CasalInfo.SenhaHashPessoa2))
                    {
                        _logger.LogWarning("Senha atual inválida para pessoa 2: {Email}", dto.Email);
                        return false;
                    }

                    var novaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
                    definicao = update.Set(u => u.CasalInfo.SenhaHashPessoa2, novaHash);
                    _logger.LogInformation("Senha alterada para pessoa 2");
                }

                if (definicao != null)
                {
                    definicao = definicao.Set(u => u.CasalInfo.UpdatedAt, DateTime.UtcNow);
                    await _context.Usuarios.UpdateOneAsync(u => u.Id == usuario.Id, definicao);
                    _logger.LogInformation("Senha alterada com sucesso para: {Email}", dto.Email);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao alterar senha para: {Email}", dto.Email);
                return false;
            }
        }

        public async Task<Usuario?> AtualizarPerfilCasal(string usuarioId, AtualizarCasalDto dto)
        {
            try
            {
                _logger.LogInformation("Atualizando perfil do casal: {UsuarioId}", usuarioId);

                var usuario = await _context.Usuarios
                    .Find(u => u.Id == usuarioId && u.TipoConta == TipoConta.Casal)
                    .FirstOrDefaultAsync();

                if (usuario?.CasalInfo == null)
                {
                    _logger.LogWarning("Casal não encontrado: {UsuarioId}", usuarioId);
                    return null;
                }

                var update = Builders<Usuario>.Update;
                var updates = new List<UpdateDefinition<Usuario>>();

                if (!string.IsNullOrWhiteSpace(dto.NomeCompletoPessoa1))
                    updates.Add(update.Set(u => u.CasalInfo.NomeCompletoPessoa1, dto.NomeCompletoPessoa1));

                if (!string.IsNullOrWhiteSpace(dto.TelefonePessoa1))
                    updates.Add(update.Set(u => u.CasalInfo.TelefonePessoa1, dto.TelefonePessoa1));

                if (dto.DataNascimentoPessoa1.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.DataNascimentoPessoa1, dto.DataNascimentoPessoa1));

                if (dto.RendaMensalPessoa1.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.RendaMensalPessoa1, dto.RendaMensalPessoa1));

                if (!string.IsNullOrWhiteSpace(dto.NomeCompletoPessoa2))
                    updates.Add(update.Set(u => u.CasalInfo.NomeCompletoPessoa2, dto.NomeCompletoPessoa2));

                if (!string.IsNullOrWhiteSpace(dto.TelefonePessoa2))
                    updates.Add(update.Set(u => u.CasalInfo.TelefonePessoa2, dto.TelefonePessoa2));

                if (dto.DataNascimentoPessoa2.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.DataNascimentoPessoa2, dto.DataNascimentoPessoa2));

                if (dto.RendaMensalPessoa2.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.RendaMensalPessoa2, dto.RendaMensalPessoa2));

                if (dto.DataCasamento.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.DataCasamento, dto.DataCasamento));

                if (!string.IsNullOrWhiteSpace(dto.AvatarPessoa1))
                    updates.Add(update.Set(u => u.CasalInfo.AvatarPessoa1, dto.AvatarPessoa1));

                if (!string.IsNullOrWhiteSpace(dto.AvatarPessoa2))
                    updates.Add(update.Set(u => u.CasalInfo.AvatarPessoa2, dto.AvatarPessoa2));

                updates.Add(update.Set(u => u.CasalInfo.UpdatedAt, DateTime.UtcNow));

                if (updates.Any())
                {
                    await _context.Usuarios.UpdateOneAsync(
                        u => u.Id == usuarioId,
                        update.Combine(updates)
                    );
                    _logger.LogInformation("Perfil do casal atualizado: {UsuarioId}", usuarioId);
                }

                return await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar perfil do casal: {UsuarioId}", usuarioId);
                return null;
            }
        }

        #endregion
    }
}