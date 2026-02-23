using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using CasalPlanner.API.Models;
using CasalPlanner.API.Data;

namespace CasalPlanner.API.Services
{
    public interface IAuthService
    {
        Task<Usuario?> Registrar(RegistroDto dto);
        Task<LoginResponseDto?> Login(LoginDto dto);
        string GerarToken(Usuario usuario);
        Task<Usuario?> ObterUsuarioPorId(string id);
        Task<Usuario?> ObterUsuarioPorEmail(string email);
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
            var existe = await _context.Usuarios
                .Find(u => u.Email == dto.Email)
                .AnyAsync();

            if (existe)
                return null;

            var usuario = new Usuario
            {
                Nome = dto.Nome,
                Email = dto.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                IsCasal = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Usuarios.InsertOneAsync(usuario);

            return usuario;
        }

        public async Task<LoginResponseDto?> Login(LoginDto dto)
        {
            var usuario = await _context.Usuarios
                .Find(u => u.Email == dto.Email)
                .FirstOrDefaultAsync();

            if (usuario == null)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
                return null;

            var update = Builders<Usuario>.Update
                .Set(u => u.LastLoginAt, DateTime.UtcNow);

            await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuario.Id,
                update);

            var token = GerarToken(usuario);

            return new LoginResponseDto
            {
                Id = usuario.Id!,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Token = token,
                IsCasal = usuario.IsCasal
            };
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
                new Claim(ClaimTypes.Name, usuario.Nome),
                new Claim(ClaimTypes.Email, usuario.Email),
                new Claim("isCasal", usuario.IsCasal.ToString())
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
    }
}
