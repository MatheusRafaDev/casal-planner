using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Infrastructure.Persistence;
using MongoDB.Driver;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

using CasalPlanner.Application.Interfaces;
using CasalPlanner.Domain.Exceptions;

namespace CasalPlanner.Infrastructure.Services
{

    public class AuthService : IAuthService
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(MongoDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        /// <summary>
        /// Normaliza email: remove espaços e converte para minúsculas
        /// </summary>
        private static string NormalizarEmail(string email) =>
            email?.Trim().ToLowerInvariant() ?? string.Empty;

        // ========== REGISTRO ==========

        public async Task<Usuario?> Registrar(RegistroDto dto)
        {
            var emailNormalizado = NormalizarEmail(dto.Email);

            var usuarioExistente = await _context.Usuarios
                .Find(u => u.Email == emailNormalizado)
                .FirstOrDefaultAsync();

            if (usuarioExistente != null) return null;

            var usuario = new Usuario
            {
                NomeCompleto = dto.NomeCompleto,
                Email = emailNormalizado,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha, workFactor: 12),
                DataNascimento = dto.DataNascimento,
                TipoConta = TipoConta.Individual,
                IsCasal = false,
                CreatedAt = DateTime.UtcNow,
                ModoEscuro = true,
                MetaGlobalEnxoval = dto.MetaGlobalEnxoval
            };

            await _context.Usuarios.InsertOneAsync(usuario);
            return usuario;
        }

        public async Task<Usuario> CriarUsuarioViaGoogleAsync(string email, string nome)
        {
            var usuario = new Usuario
            {
                NomeCompleto = nome,
                Email = NormalizarEmail(email),
                SenhaHash = string.Empty,
                TipoConta = TipoConta.Individual,
                Provider = "google",
                IsCasal = false,
                IsAtivo = true,
                CreatedAt = DateTime.UtcNow,
                ModoEscuro = true,
            };

            await _context.Usuarios.InsertOneAsync(usuario);
            return usuario;
        }

        public async Task<Usuario?> RegistrarCasal(RegistroCasalDto dto)
        {
            try
            {
                var emailPessoa1Normalizado = NormalizarEmail(dto.EmailPessoa1);
                var emailPessoa2Normalizado = NormalizarEmail(dto.EmailPessoa2);

                if (string.Equals(emailPessoa1Normalizado, emailPessoa2Normalizado, StringComparison.OrdinalIgnoreCase))
                    throw new EmailsIguaisException();

                var existe1 = await _context.Usuarios
                    .Find(u => u.Email == emailPessoa1Normalizado ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa1 == emailPessoa1Normalizado) ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa2 == emailPessoa1Normalizado))
                    .FirstOrDefaultAsync();

                var existe2 = await _context.Usuarios
                    .Find(u => u.Email == emailPessoa2Normalizado ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa1 == emailPessoa2Normalizado) ||
                              (u.CasalInfo != null && u.CasalInfo.EmailPessoa2 == emailPessoa2Normalizado))
                    .FirstOrDefaultAsync();

                if (existe1 != null || existe2 != null) return null;

                var usuario = new Usuario
                {
                    NomeCompleto = $"{dto.NomeCompletoPessoa1} & {dto.NomeCompletoPessoa2}",
                    Email = "",
                    TipoConta = TipoConta.Casal,
                    IsCasal = true,
                    CreatedAt = DateTime.UtcNow,
                    ModoEscuro = true,
                    CasalInfo = new CasalInfo
                    {
                        NomeCompletoPessoa1 = dto.NomeCompletoPessoa1,
                        EmailPessoa1 = emailPessoa1Normalizado,
                        SenhaHashPessoa1 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa1, workFactor: 12),
                        DataNascimentoPessoa1 = dto.DataNascimentoPessoa1,
                        NomeCompletoPessoa2 = dto.NomeCompletoPessoa2,
                        EmailPessoa2 = emailPessoa2Normalizado,
                        SenhaHashPessoa2 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa2, workFactor: 12),
                        DataNascimentoPessoa2 = dto.DataNascimentoPessoa2,
                        CreatedAt = DateTime.UtcNow,
                    },
                    MetaGlobalEnxoval = dto.MetaGlobalEnxoval
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

        // ========== CONSULTA ==========

        public async Task<Usuario?> ObterUsuarioPorEmail(string email)
        {
            if (string.IsNullOrEmpty(email)) return null;
            var emailNormalizado = NormalizarEmail(email);
            return await _context.Usuarios.Find(u => u.Email == emailNormalizado).FirstOrDefaultAsync();
        }

        public async Task<Usuario?> ObterCasalPorEmail(string email)
        {
            if (string.IsNullOrEmpty(email)) return null;
            var emailNormalizado = NormalizarEmail(email);
            return await _context.Usuarios
                .Find(u => u.CasalInfo != null &&
                          (u.CasalInfo.EmailPessoa1 == emailNormalizado || u.CasalInfo.EmailPessoa2 == emailNormalizado))
                .FirstOrDefaultAsync();
        }

        public async Task<Usuario?> ObterUsuarioPorId(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            return await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        // ========== TOKEN ==========

        public string GerarToken(Usuario usuario)
        {
            if (usuario == null) throw new ArgumentNullException(nameof(usuario));

            var (handler, descriptor) = CriarTokenDescriptor(usuario.Id ?? "", new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, usuario.Id ?? ""),
                new(JwtRegisteredClaimNames.Email, usuario.Email ?? ""),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, usuario.NomeCompleto ?? ""),
                new("TipoConta", usuario.TipoConta.ToString()),
                new("IsCasal", usuario.IsCasal.ToString()),
            });

            return handler.WriteToken(handler.CreateToken(descriptor));
        }

        public string GerarTokenCasal(Usuario usuario, string pessoa)
        {
            if (usuario == null) throw new ArgumentNullException(nameof(usuario));

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, usuario.Id ?? ""),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new("TipoConta", usuario.TipoConta.ToString()),
                new("IsCasal", "true"),
                new("PessoaLogada", pessoa),
            };

            if (pessoa == "pessoa1" && usuario.CasalInfo != null)
            {
                claims.Add(new(JwtRegisteredClaimNames.Email, usuario.CasalInfo.EmailPessoa1 ?? ""));
                claims.Add(new(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa1 ?? ""));
            }
            else if (pessoa == "pessoa2" && usuario.CasalInfo != null)
            {
                claims.Add(new(JwtRegisteredClaimNames.Email, usuario.CasalInfo.EmailPessoa2 ?? ""));
                claims.Add(new(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa2 ?? ""));
            }

            var (handler, descriptor) = CriarTokenDescriptor(usuario.Id ?? "", claims);
            return handler.WriteToken(handler.CreateToken(descriptor));
        }

        private (JwtSecurityTokenHandler handler, SecurityTokenDescriptor descriptor) CriarTokenDescriptor(
            string _, List<Claim> claims)
        {
            var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? _configuration["Jwt:Key"];
            var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? _configuration["Jwt:Issuer"] ?? "CasalPlanner";
            var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? _configuration["Jwt:Audience"] ?? "CasalPlannerUsers";

            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key não configurada");

            var key = Encoding.UTF8.GetBytes(jwtKey);
            var handler = new JwtSecurityTokenHandler();

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            return (handler, descriptor);
        }

        public async Task<(string Token, DateTime ExpiraEm)> GerarERegistrarRefreshToken(string usuarioId, string? pessoa = null)
        {
            var tokenBytes = new byte[64];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(tokenBytes);
            var token = Convert.ToBase64String(tokenBytes);
            var expiraEm = DateTime.UtcNow.AddDays(30);

            var update = Builders<Usuario>.Update;
            UpdateDefinition<Usuario> updateDef;

            if (string.IsNullOrEmpty(pessoa))
            {
                updateDef = update
                    .Set(u => u.RefreshToken, token)
                    .Set(u => u.RefreshTokenExpiraEm, expiraEm);
            }
            else if (pessoa == "pessoa1")
            {
                updateDef = update
                    .Set(u => u.CasalInfo!.RefreshTokenPessoa1, token)
                    .Set(u => u.CasalInfo!.RefreshTokenExpiraEmPessoa1, expiraEm);
            }
            else
            {
                updateDef = update
                    .Set(u => u.CasalInfo!.RefreshTokenPessoa2, token)
                    .Set(u => u.CasalInfo!.RefreshTokenExpiraEmPessoa2, expiraEm);
            }

            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioId, updateDef);

            return (token, expiraEm);
        }

        public async Task<(Usuario? Usuario, string? Pessoa)> ValidarRefreshToken(string refreshToken)
        {
            // Busca como individual
            var individual = await _context.Usuarios
                .Find(u => u.TipoConta == TipoConta.Individual && 
                           u.RefreshToken == refreshToken && 
                           u.RefreshTokenExpiraEm > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            if (individual != null)
                return (individual, null);

            // Busca como casal (Pessoa 1 ou Pessoa 2)
            var casal = await _context.Usuarios
                .Find(u => u.TipoConta == TipoConta.Casal && 
                           ((u.CasalInfo.RefreshTokenPessoa1 == refreshToken && u.CasalInfo.RefreshTokenExpiraEmPessoa1 > DateTime.UtcNow) ||
                            (u.CasalInfo.RefreshTokenPessoa2 == refreshToken && u.CasalInfo.RefreshTokenExpiraEmPessoa2 > DateTime.UtcNow)))
                .FirstOrDefaultAsync();

            if (casal != null)
            {
                var isPessoa1 = casal.CasalInfo?.RefreshTokenPessoa1 == refreshToken;
                return (casal, isPessoa1 ? "pessoa1" : "pessoa2");
            }

            return (null, null);
        }

        // ========== PERFIL ==========

        public async Task<Usuario?> AtualizarPerfilCasal(string id, AtualizarCasalDto dto)
        {
            if (string.IsNullOrEmpty(id)) return null;

            var usuario = await _context.Usuarios
                .Find(u => u.Id == id && u.TipoConta == TipoConta.Casal)
                .FirstOrDefaultAsync();

            if (usuario == null || usuario.CasalInfo == null) return null;

            var update = Builders<Usuario>.Update;
            var updates = new List<UpdateDefinition<Usuario>>();

            if (dto.NomeCompletoPessoa1 != null)
                updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa1, dto.NomeCompletoPessoa1));
            if (dto.DataNascimentoPessoa1.HasValue)
                updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa1, dto.DataNascimentoPessoa1.Value));
            if (dto.NomeCompletoPessoa2 != null)
                updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa2, dto.NomeCompletoPessoa2));
            if (dto.DataNascimentoPessoa2.HasValue)
                updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa2, dto.DataNascimentoPessoa2.Value));

            updates.Add(update.Set(u => u.CasalInfo!.UpdatedAt, DateTime.UtcNow));

            if (updates.Any())
                await _context.Usuarios.UpdateOneAsync(u => u.Id == id, update.Combine(updates));

            return await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        // ========== VERIFICAÇÃO DE SENHA ==========

        public async Task<bool> VerificarSenha(Usuario usuario, string senha, string? pessoa = null)
        {
            try
            {
                if (usuario == null || string.IsNullOrEmpty(senha)) return false;

                if (usuario.IsCasal && usuario.CasalInfo != null)
                {
                    if (pessoa == "pessoa1")
                    {
                        var h1 = usuario.CasalInfo.SenhaHashPessoa1;
                        return !string.IsNullOrEmpty(h1) && BCrypt.Net.BCrypt.Verify(senha, h1);
                    }
                    if (pessoa == "pessoa2")
                    {
                        var h2 = usuario.CasalInfo.SenhaHashPessoa2;
                        return !string.IsNullOrEmpty(h2) && BCrypt.Net.BCrypt.Verify(senha, h2);
                    }
                    return false;
                }

                var hash = usuario.SenhaHash;
                return !string.IsNullOrEmpty(hash) && BCrypt.Net.BCrypt.Verify(senha, hash);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao verificar senha: {ex.Message}");
                return false;
            }
        }

        // ========== RECUPERAÇÃO DE SENHA - INDIVIDUAL ==========

        public async Task<bool> SalvarCodigoRedefinicao(string usuarioId, string codigo, DateTime expiresAt)
        {
            var update = Builders<Usuario>.Update
                .Set(u => u.ResetCode, codigo)
                .Set(u => u.ResetCodeExpiresAt, expiresAt)
                .Unset(u => u.ResetToken)
                .Unset(u => u.ResetTokenExpiresAt);

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Individual,
                update
            );

            return result.ModifiedCount > 0;
        }

        public async Task<Usuario?> ObterUsuarioPorCodigo(string codigo)
        {
            if (string.IsNullOrEmpty(codigo)) return null;
            
            return await _context.Usuarios
                .Find(u => u.ResetCode == codigo && 
                          u.ResetCodeExpiresAt > DateTime.UtcNow &&
                          u.TipoConta == TipoConta.Individual)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> VerificarCodigoRedefinicao(string usuarioId, string codigo)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(codigo)) return false;
            
            var usuario = await _context.Usuarios
                .Find(u => u.Id == usuarioId && 
                          u.ResetCode == codigo && 
                          u.ResetCodeExpiresAt > DateTime.UtcNow &&
                          u.TipoConta == TipoConta.Individual)
                .FirstOrDefaultAsync();

            return usuario != null;
        }

        public async Task<bool> SalvarTokenRedefinicao(string usuarioId, string token, DateTime expiresAt)
        {
            var update = Builders<Usuario>.Update
                .Set(u => u.ResetToken, token)
                .Set(u => u.ResetTokenExpiresAt, expiresAt);

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Individual,
                update
            );

            return result.ModifiedCount > 0;
        }

        public async Task<Usuario?> ObterUsuarioPorTokenRedefinicao(string token)
        {
            if (string.IsNullOrEmpty(token)) return null;
            
            return await _context.Usuarios
                .Find(u => u.ResetToken == token && 
                          u.ResetTokenExpiresAt > DateTime.UtcNow &&
                          u.TipoConta == TipoConta.Individual)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> VerificarTokenRedefinicao(string usuarioId, string token)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(token)) return false;
            
            var usuario = await _context.Usuarios
                .Find(u => u.Id == usuarioId && 
                          u.ResetToken == token && 
                          u.ResetTokenExpiresAt > DateTime.UtcNow &&
                          u.TipoConta == TipoConta.Individual)
                .FirstOrDefaultAsync();

            return usuario != null;
        }

        public async Task<bool> AtualizarSenha(string usuarioId, string novaSenha)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(novaSenha)) return false;
            
            var senhaHash = BCrypt.Net.BCrypt.HashPassword(novaSenha, workFactor: 12);
            
            var update = Builders<Usuario>.Update
                .Set(u => u.SenhaHash, senhaHash);

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Individual,
                update
            );

            return result.ModifiedCount > 0;
        }

        public async Task<bool> LimparDadosRedefinicao(string usuarioId)
        {
            if (string.IsNullOrEmpty(usuarioId)) return false;
            
            var update = Builders<Usuario>.Update
                .Unset(u => u.ResetCode)
                .Unset(u => u.ResetCodeExpiresAt)
                .Unset(u => u.ResetToken)
                .Unset(u => u.ResetTokenExpiresAt);

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Individual,
                update
            );

            return result.ModifiedCount > 0;
        }

        // ========== RECUPERAÇÃO DE SENHA - CASAL ==========

        public async Task<bool> SalvarCodigoRedefinicaoCasal(string usuarioId, string pessoa, string codigo, DateTime expiresAt)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(pessoa) || string.IsNullOrEmpty(codigo)) 
                return false;

            UpdateDefinition<Usuario> update;
            
            if (pessoa == "pessoa1")
            {
                update = Builders<Usuario>.Update
                    .Set(u => u.CasalInfo!.ResetCodePessoa1, codigo)
                    .Set(u => u.CasalInfo!.ResetCodeExpiresAtPessoa1, expiresAt)
                    .Unset(u => u.CasalInfo!.ResetTokenPessoa1)
                    .Unset(u => u.CasalInfo!.ResetTokenExpiresAtPessoa1);
            }
            else if (pessoa == "pessoa2")
            {
                update = Builders<Usuario>.Update
                    .Set(u => u.CasalInfo!.ResetCodePessoa2, codigo)
                    .Set(u => u.CasalInfo!.ResetCodeExpiresAtPessoa2, expiresAt)
                    .Unset(u => u.CasalInfo!.ResetTokenPessoa2)
                    .Unset(u => u.CasalInfo!.ResetTokenExpiresAtPessoa2);
            }
            else
            {
                return false;
            }

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Casal,
                update
            );

            return result.ModifiedCount > 0;
        }

        public async Task<Usuario?> ObterCasalPorCodigo(string codigo)
        {
            if (string.IsNullOrEmpty(codigo)) return null;
            
            return await _context.Usuarios
                .Find(u => u.TipoConta == TipoConta.Casal && u.CasalInfo != null &&
                          ((u.CasalInfo.ResetCodePessoa1 == codigo && u.CasalInfo.ResetCodeExpiresAtPessoa1 > DateTime.UtcNow) ||
                           (u.CasalInfo.ResetCodePessoa2 == codigo && u.CasalInfo.ResetCodeExpiresAtPessoa2 > DateTime.UtcNow)))
                .FirstOrDefaultAsync();
        }

        public async Task<bool> VerificarCodigoRedefinicaoCasal(string usuarioId, string pessoa, string codigo)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(pessoa) || string.IsNullOrEmpty(codigo)) 
                return false;

            Usuario? usuario;
            
            if (pessoa == "pessoa1")
            {
                usuario = await _context.Usuarios
                    .Find(u => u.Id == usuarioId && 
                              u.TipoConta == TipoConta.Casal &&
                              u.CasalInfo != null &&
                              u.CasalInfo.ResetCodePessoa1 == codigo && 
                              u.CasalInfo.ResetCodeExpiresAtPessoa1 > DateTime.UtcNow)
                    .FirstOrDefaultAsync();
            }
            else if (pessoa == "pessoa2")
            {
                usuario = await _context.Usuarios
                    .Find(u => u.Id == usuarioId && 
                              u.TipoConta == TipoConta.Casal &&
                              u.CasalInfo != null &&
                              u.CasalInfo.ResetCodePessoa2 == codigo && 
                              u.CasalInfo.ResetCodeExpiresAtPessoa2 > DateTime.UtcNow)
                    .FirstOrDefaultAsync();
            }
            else
            {
                return false;
            }

            return usuario != null;
        }

        public async Task<bool> SalvarTokenRedefinicaoCasal(string usuarioId, string pessoa, string token, DateTime expiresAt)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(pessoa) || string.IsNullOrEmpty(token)) 
                return false;

            UpdateDefinition<Usuario> update;
            
            if (pessoa == "pessoa1")
            {
                update = Builders<Usuario>.Update
                    .Set(u => u.CasalInfo!.ResetTokenPessoa1, token)
                    .Set(u => u.CasalInfo!.ResetTokenExpiresAtPessoa1, expiresAt);
            }
            else if (pessoa == "pessoa2")
            {
                update = Builders<Usuario>.Update
                    .Set(u => u.CasalInfo!.ResetTokenPessoa2, token)
                    .Set(u => u.CasalInfo!.ResetTokenExpiresAtPessoa2, expiresAt);
            }
            else
            {
                return false;
            }

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Casal,
                update
            );

            return result.ModifiedCount > 0;
        }

        public async Task<Usuario?> ObterCasalPorTokenRedefinicao(string token)
        {
            if (string.IsNullOrEmpty(token)) return null;
            
            return await _context.Usuarios
                .Find(u => u.TipoConta == TipoConta.Casal && u.CasalInfo != null &&
                          ((u.CasalInfo.ResetTokenPessoa1 == token && u.CasalInfo.ResetTokenExpiresAtPessoa1 > DateTime.UtcNow) ||
                           (u.CasalInfo.ResetTokenPessoa2 == token && u.CasalInfo.ResetTokenExpiresAtPessoa2 > DateTime.UtcNow)))
                .FirstOrDefaultAsync();
        }

        public async Task<bool> VerificarTokenRedefinicaoCasal(string usuarioId, string pessoa, string token)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(pessoa) || string.IsNullOrEmpty(token)) 
                return false;

            Usuario? usuario;
            
            if (pessoa == "pessoa1")
            {
                usuario = await _context.Usuarios
                    .Find(u => u.Id == usuarioId && 
                              u.TipoConta == TipoConta.Casal &&
                              u.CasalInfo != null &&
                              u.CasalInfo.ResetTokenPessoa1 == token && 
                              u.CasalInfo.ResetTokenExpiresAtPessoa1 > DateTime.UtcNow)
                    .FirstOrDefaultAsync();
            }
            else if (pessoa == "pessoa2")
            {
                usuario = await _context.Usuarios
                    .Find(u => u.Id == usuarioId && 
                              u.TipoConta == TipoConta.Casal &&
                              u.CasalInfo != null &&
                              u.CasalInfo.ResetTokenPessoa2 == token && 
                              u.CasalInfo.ResetTokenExpiresAtPessoa2 > DateTime.UtcNow)
                    .FirstOrDefaultAsync();
            }
            else
            {
                return false;
            }

            return usuario != null;
        }

        public async Task<bool> AtualizarSenhaCasal(string usuarioId, string pessoa, string novaSenha)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(pessoa) || string.IsNullOrEmpty(novaSenha)) 
                return false;

            var senhaHash = BCrypt.Net.BCrypt.HashPassword(novaSenha, workFactor: 12);
            UpdateDefinition<Usuario> update;
            
            if (pessoa == "pessoa1")
            {
                update = Builders<Usuario>.Update
                    .Set(u => u.CasalInfo!.SenhaHashPessoa1, senhaHash);
            }
            else if (pessoa == "pessoa2")
            {
                update = Builders<Usuario>.Update
                    .Set(u => u.CasalInfo!.SenhaHashPessoa2, senhaHash);
            }
            else
            {
                return false;
            }

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Casal,
                update
            );

            return result.ModifiedCount > 0;
        }

        public async Task<bool> LimparDadosRedefinicaoCasal(string usuarioId, string pessoa)
        {
            if (string.IsNullOrEmpty(usuarioId) || string.IsNullOrEmpty(pessoa)) 
                return false;

            UpdateDefinition<Usuario> update;
            
            if (pessoa == "pessoa1")
            {
                update = Builders<Usuario>.Update
                    .Unset(u => u.CasalInfo!.ResetCodePessoa1)
                    .Unset(u => u.CasalInfo!.ResetCodeExpiresAtPessoa1)
                    .Unset(u => u.CasalInfo!.ResetTokenPessoa1)
                    .Unset(u => u.CasalInfo!.ResetTokenExpiresAtPessoa1);
            }
            else if (pessoa == "pessoa2")
            {
                update = Builders<Usuario>.Update
                    .Unset(u => u.CasalInfo!.ResetCodePessoa2)
                    .Unset(u => u.CasalInfo!.ResetCodeExpiresAtPessoa2)
                    .Unset(u => u.CasalInfo!.ResetTokenPessoa2)
                    .Unset(u => u.CasalInfo!.ResetTokenExpiresAtPessoa2);
            }
            else
            {
                return false;
            }

            var result = await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuarioId && u.TipoConta == TipoConta.Casal,
                update
            );

            return result.ModifiedCount > 0;
        }
    }
}