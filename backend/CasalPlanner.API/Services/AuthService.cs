using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs; 
using CasalPlanner.API.Data;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
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
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                CPF = dto.CPF,
                DataNascimento = dto.DataNascimento,

                RendaMensal = dto.RendaMensal,
                TipoConta = TipoConta.Individual,
                IsCasal = false,
                CreatedAt = DateTime.UtcNow,
                ModoEscuro = false
            };

            await _context.Usuarios.InsertOneAsync(usuario);
            return usuario;
        }

        public async Task<Usuario?> RegistrarCasal(RegistroCasalDto dto)
        {
            try
            {

                // Verificar se emails já existem
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
                        SenhaHashPessoa1 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa1),
                        CPFPessoa1 = dto.CPFPessoa1,
                        DataNascimentoPessoa1 = dto.DataNascimentoPessoa1,
                        RendaMensalPessoa1 = dto.RendaMensalPessoa1,

                        NomeCompletoPessoa2 = dto.NomeCompletoPessoa2,
                        EmailPessoa2 = dto.EmailPessoa2,
                        SenhaHashPessoa2 = BCrypt.Net.BCrypt.HashPassword(dto.SenhaPessoa2),
                        CPFPessoa2 = dto.CPFPessoa2,
                        DataNascimentoPessoa2 = dto.DataNascimentoPessoa2,
                        RendaMensalPessoa2 = dto.RendaMensalPessoa2,

                        DataCasamento = dto.DataCasamento,
                        CreatedAt = DateTime.UtcNow,
                        
                    }
                };

                await _context.Usuarios.InsertOneAsync(usuario);


                return usuario;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public async Task<Usuario?> ObterUsuarioPorEmail(string email)
        {
            return await _context.Usuarios
                .Find(u => u.Email == email)
                .FirstOrDefaultAsync();
        }

        public async Task<Usuario?> ObterCasalPorEmail(string email)
        {
            return await _context.Usuarios
                .Find(u => u.CasalInfo != null &&
                          (u.CasalInfo.EmailPessoa1 == email || u.CasalInfo.EmailPessoa2 == email))
                .FirstOrDefaultAsync();
        }

        public async Task<Usuario?> ObterUsuarioPorId(string id)
        {
            return await _context.Usuarios
                .Find(u => u.Id == id)
                .FirstOrDefaultAsync();
        }

        public string GerarToken(Usuario usuario)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "sua-chave-secreta-aqui-com-pelo-menos-32-caracteres");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id ?? string.Empty),
                new Claim(ClaimTypes.Email, usuario.Email ?? string.Empty),
                new Claim(ClaimTypes.Name, usuario.NomeCompleto ?? string.Empty),
                new Claim("TipoConta", usuario.TipoConta.ToString()),
                new Claim("IsCasal", usuario.IsCasal.ToString())
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

        public string GerarTokenCasal(Usuario usuario, string pessoa)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "sua-chave-secreta-aqui-com-pelo-menos-32-caracteres");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id ?? string.Empty),
                new Claim("TipoConta", usuario.TipoConta.ToString()),
                new Claim("IsCasal", "true"),
                new Claim("PessoaLogada", pessoa)
            };

            if (pessoa == "pessoa1" && usuario.CasalInfo != null)
            {
                claims.Add(new Claim(ClaimTypes.Email, usuario.CasalInfo.EmailPessoa1));
                claims.Add(new Claim(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa1));
            }
            else if (pessoa == "pessoa2" && usuario.CasalInfo != null)
            {
                claims.Add(new Claim(ClaimTypes.Email, usuario.CasalInfo.EmailPessoa2));
                claims.Add(new Claim(ClaimTypes.Name, usuario.CasalInfo.NomeCompletoPessoa2));
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

        public async Task<Usuario?> AtualizarPerfilCasal(string id, AtualizarCasalDto dto)
        {
            var usuario = await _context.Usuarios
                .Find(u => u.Id == id && u.TipoConta == TipoConta.Casal)
                .FirstOrDefaultAsync();

            if (usuario == null)
                return null;

            var update = Builders<Usuario>.Update;
            var updates = new List<UpdateDefinition<Usuario>>();

            var renda = dto.RendaMensalPessoa1 + dto.RendaMensalPessoa2;

            if (usuario.CasalInfo != null)
            {
                if (dto.NomeCompletoPessoa1 != null)
                    updates.Add(update.Set(u => u.CasalInfo.NomeCompletoPessoa1, dto.NomeCompletoPessoa1));


                if (dto.DataNascimentoPessoa1.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.DataNascimentoPessoa1, dto.DataNascimentoPessoa1.Value));

                if (dto.RendaMensalPessoa1.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.RendaMensalPessoa1, dto.RendaMensalPessoa1.Value));

                if (dto.NomeCompletoPessoa2 != null)
                    updates.Add(update.Set(u => u.CasalInfo.NomeCompletoPessoa2, dto.NomeCompletoPessoa2));

                if (dto.DataNascimentoPessoa2.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.DataNascimentoPessoa2, dto.DataNascimentoPessoa2.Value));

                if (dto.RendaMensalPessoa2.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.RendaMensalPessoa2, dto.RendaMensalPessoa2.Value));

                if (dto.RendaMensal.HasValue)
                    updates.Add(update.Set(u => u.RendaMensal, renda));

                if (dto.DataCasamento.HasValue)
                    updates.Add(update.Set(u => u.CasalInfo.DataCasamento, dto.DataCasamento.Value));

                updates.Add(update.Set(u => u.CasalInfo.UpdatedAt, DateTime.UtcNow));
            }

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