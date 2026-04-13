using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Data;
using MongoDB.Driver;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace CasalPlanner.API.Services
{
    public interface IAuthService
    {
        Task<Usuario?> Registrar(RegistroDto dto);
        Task<Usuario?> RegistrarCasal(RegistroCasalDto dto);
        Task<Usuario?> ObterUsuarioPorEmail(string email);
        Task<Usuario?> ObterCasalPorEmail(string email);
        Task<Usuario?> ObterUsuarioPorId(string id);
        string GerarToken(Usuario usuario);
        string GerarTokenCasal(Usuario usuario, string pessoa);
        Task<Usuario?> AtualizarPerfilCasal(string id, AtualizarCasalDto dto);
        Task<bool> VerificarSenha(Usuario usuario, string senha, string? pessoa = null);

        // ✅ Métodos para gerenciar cookie de forma centralizada
        void SetAuthCookie(HttpResponse response, string token);
        void RemoverAuthCookie(HttpResponse response);
    }

    public class AuthService : IAuthService
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(MongoDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // ✅ Seta o cookie com as opções corretas para funcionar cross-site (Vercel → Render)
        public void SetAuthCookie(HttpResponse response, string token)
        {
            response.Cookies.Append("auth_token", token, new CookieOptions
            {
                HttpOnly = true,              // JS não consegue ler (proteção XSS)
                Secure = true,               // Apenas HTTPS
                SameSite = SameSiteMode.None, // ✅ obrigatório para cross-site
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
                // ⚠️ Sem Domain — browser usa o domínio do servidor automaticamente
                // Colocar Domain = ".onrender.com" quebra cookies cross-site
            });
        }

        // ✅ Deleta cookie de forma compatível com cross-site
        // Response.Cookies.Delete() não aceita SameSite, então sobrescrevemos com data expirada
        public void RemoverAuthCookie(HttpResponse response)
        {
            response.Cookies.Append("auth_token", "", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(-1), // expirado = apagado
                Path = "/"
            });
        }

        public async Task<Usuario?> Registrar(RegistroDto dto)
        {
            var usuarioExistente = await _context.Usuarios
                .Find(u => u.Email == dto.Email)
                .FirstOrDefaultAsync();

            if (usuarioExistente != null)
                return null;

            var usuario = new Usuario
            {
                NomeCompleto = dto.NomeCompleto,
                Email = dto.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha, workFactor: 12),
                CPF = dto.CPF,
                DataNascimento = dto.DataNascimento,
                RendaMensal = dto.RendaMensal,
                TipoConta = TipoConta.Individual,
                IsCasal = false,
                CreatedAt = DateTime.UtcNow,
                ModoEscuro = true
            };

            await _context.Usuarios.InsertOneAsync(usuario);
            return usuario;
        }

        public async Task<Usuario?> RegistrarCasal(RegistroCasalDto dto)
        {
            try
            {
                var usuarioExistente1 = await _context.Usuarios
                    .Find(u => u.Email == dto.EmailPessoa1 ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa1 == dto.EmailPessoa1) ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa2 == dto.EmailPessoa1))
                    .FirstOrDefaultAsync();

                var usuarioExistente2 = await _context.Usuarios
                    .Find(u => u.Email == dto.EmailPessoa2 ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa1 == dto.EmailPessoa2) ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa2 == dto.EmailPessoa2))
                    .FirstOrDefaultAsync();

                if (usuarioExistente1 != null || usuarioExistente2 != null)
                    return null;

                var usuario = new Usuario
                {
                    NomeCompleto = $"{dto.NomeCompletoPessoa1} & {dto.NomeCompletoPessoa2}",
                    RendaMensal = dto.RendaMensalPessoa1 + dto.RendaMensalPessoa2,
                    Email = "",
                    TipoConta = TipoConta.Casal,
                    IsCasal = true,
                    CreatedAt = DateTime.UtcNow,
                    ModoEscuro = true,
                    CasalInfo = new CasalInfo
                    {
                        NomeCompletoPessoa1 = dto.NomeCompletoPessoa1,
                        EmailPessoa1 = dto.EmailPessoa1,
                        SenhaHashPessoa1 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa1, workFactor: 12),
                        CPFPessoa1 = dto.CPFPessoa1,
                        DataNascimentoPessoa1 = dto.DataNascimentoPessoa1,
                        RendaMensalPessoa1 = dto.RendaMensalPessoa1,

                        NomeCompletoPessoa2 = dto.NomeCompletoPessoa2,
                        EmailPessoa2 = dto.EmailPessoa2,
                        SenhaHashPessoa2 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa2, workFactor: 12),
                        CPFPessoa2 = dto.CPFPessoa2,
                        DataNascimentoPessoa2 = dto.DataNascimentoPessoa2,
                        RendaMensalPessoa2 = dto.RendaMensalPessoa2,
                        CreatedAt = DateTime.UtcNow,
                    }
                };

                await _context.Usuarios.InsertOneAsync(usuario);
                return usuario;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao registrar casal: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> VerificarSenha(Usuario usuario, string senha, string? pessoa = null)
        {
            try
            {
                if (usuario == null || string.IsNullOrEmpty(senha))
                    return false;

                if (usuario.IsCasal && usuario.CasalInfo != null)
                {
                    if (pessoa == "pessoa1")
                    {
                        var hash1 = usuario.CasalInfo.SenhaHashPessoa1;
                        return !string.IsNullOrEmpty(hash1) && BCrypt.Net.BCrypt.Verify(senha, hash1);
                    }
                    else if (pessoa == "pessoa2")
                    {
                        var hash2 = usuario.CasalInfo.SenhaHashPessoa2;
                        return !string.IsNullOrEmpty(hash2) && BCrypt.Net.BCrypt.Verify(senha, hash2);
                    }
                    return false;
                }
                else
                {
                    var hash = usuario.SenhaHash;
                    return !string.IsNullOrEmpty(hash) && BCrypt.Net.BCrypt.Verify(senha, hash);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao verificar senha: {ex.Message}");
                return false;
            }
        }

        public async Task<Usuario?> ObterUsuarioPorEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return null;

            return await _context.Usuarios
                .Find(u => u.Email == email)
                .FirstOrDefaultAsync();
        }

        public async Task<Usuario?> ObterCasalPorEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return null;

            return await _context.Usuarios
                .Find(u => u.CasalInfo != null &&
                          (u.CasalInfo.EmailPessoa1 == email || u.CasalInfo.EmailPessoa2 == email))
                .FirstOrDefaultAsync();
        }

        public async Task<Usuario?> ObterUsuarioPorId(string id)
        {
            if (string.IsNullOrEmpty(id))
                return null;

            return await _context.Usuarios
                .Find(u => u.Id == id)
                .FirstOrDefaultAsync();
        }

        public string GerarToken(Usuario usuario)
        {
            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario));

            var tokenHandler = new JwtSecurityTokenHandler();

            var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                ?? _configuration["Jwt:Key"];
            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? _configuration["Jwt:Issuer"]
                ?? "CasalPlanner";
            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? _configuration["Jwt:Audience"]
                ?? "CasalPlannerUsers";

            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key não configurada");

            var key = Encoding.UTF8.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Id ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Email, usuario.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, usuario.NomeCompleto ?? string.Empty),
                new Claim("TipoConta", usuario.TipoConta.ToString()),
                new Claim("IsCasal", usuario.IsCasal.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GerarTokenCasal(Usuario usuario, string pessoa)
        {
            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario));

            var tokenHandler = new JwtSecurityTokenHandler();

            var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                ?? _configuration["Jwt:Key"];
            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? _configuration["Jwt:Issuer"]
                ?? "CasalPlanner";
            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                ?? _configuration["Jwt:Audience"]
                ?? "CasalPlannerUsers";

            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key não configurada");

            var key = Encoding.UTF8.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Id ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("TipoConta", usuario.TipoConta.ToString()),
                new Claim("IsCasal", "true"),
                new Claim("PessoaLogada", pessoa)
            };

            if (pessoa == "pessoa1" && usuario.CasalInfo != null)
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Email, usuario.CasalInfo.EmailPessoa1 ?? string.Empty));
                claims.Add(new Claim(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa1 ?? string.Empty));
            }
            else if (pessoa == "pessoa2" && usuario.CasalInfo != null)
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Email, usuario.CasalInfo.EmailPessoa2 ?? string.Empty));
                claims.Add(new Claim(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa2 ?? string.Empty));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7), // ✅ era 1h, agora 7 dias
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<Usuario?> AtualizarPerfilCasal(string id, AtualizarCasalDto dto)
        {
            if (string.IsNullOrEmpty(id))
                return null;

            var usuario = await _context.Usuarios
                .Find(u => u.Id == id && u.TipoConta == TipoConta.Casal)
                .FirstOrDefaultAsync();

            if (usuario == null || usuario.CasalInfo == null)
                return null;

            var update = Builders<Usuario>.Update;
            var updates = new List<UpdateDefinition<Usuario>>();

            var renda = (dto.RendaMensalPessoa1 ?? 0) + (dto.RendaMensalPessoa2 ?? 0);

            if (dto.NomeCompletoPessoa1 != null)
                updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa1, dto.NomeCompletoPessoa1));

            if (dto.DataNascimentoPessoa1.HasValue)
                updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa1, dto.DataNascimentoPessoa1.Value));

            if (dto.RendaMensalPessoa1.HasValue)
                updates.Add(update.Set(u => u.CasalInfo!.RendaMensalPessoa1, dto.RendaMensalPessoa1.Value));

            if (dto.NomeCompletoPessoa2 != null)
                updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa2, dto.NomeCompletoPessoa2));

            if (dto.DataNascimentoPessoa2.HasValue)
                updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa2, dto.DataNascimentoPessoa2.Value));

            if (dto.RendaMensalPessoa2.HasValue)
                updates.Add(update.Set(u => u.CasalInfo!.RendaMensalPessoa2, dto.RendaMensalPessoa2.Value));

            if (dto.RendaMensal.HasValue)
                updates.Add(update.Set(u => u.RendaMensal, renda));

            updates.Add(update.Set(u => u.CasalInfo!.UpdatedAt, DateTime.UtcNow));

            if (updates.Any())
            {
                await _context.Usuarios.UpdateOneAsync(
                    u => u.Id == id,
                    update.Combine(updates)
                );
            }

            return await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();
        }
    }
}