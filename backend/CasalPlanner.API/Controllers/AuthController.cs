// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Services;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Domain.Entities;
using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.API.Helpers;
using MongoDB.Driver;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Google.Apis.Auth;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly MongoDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(
            IAuthService authService,
            MongoDbContext context,
            ILogger<AuthController> logger,
            IConfiguration configuration)
        {
            _authService = authService;
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        private string GetUsuarioId() =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? string.Empty;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var emailNormalizado = dto.Email?.Trim().ToLowerInvariant() ?? string.Empty;
            _logger.LogInformation("Tentativa de login para email: {Email}", emailNormalizado);

            var usuario = await _authService.ObterUsuarioPorEmail(emailNormalizado);
            var isCasal = false;
            string pessoa = "";

            if (usuario == null)
            {
                usuario = await _authService.ObterCasalPorEmail(emailNormalizado);
                if (usuario != null)
                {
                    isCasal = true;
                    pessoa = usuario.CasalInfo?.EmailPessoa1 == emailNormalizado ? "pessoa1" : "pessoa2";
                }
            }

            if (usuario == null)
            {
                _logger.LogWarning("Tentativa de login falhou (usuário não encontrado): {Email}", dto.Email);
                return Unauthorized(new { message = "Credenciais inválidas" });
            }

            var senhaValida = await _authService.VerificarSenha(usuario, dto.Senha, pessoa);

            if (!senhaValida)
            {
                _logger.LogWarning("Tentativa de login falhou (senha inválida): {Email}", dto.Email);
                return Unauthorized(new { message = "Credenciais inválidas" });
            }

            await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuario.Id,
                Builders<Usuario>.Update.Set(u => u.LastLoginAt, DateTime.UtcNow)
            );
            usuario.LastLoginAt = DateTime.UtcNow;

            string token = isCasal
                ? _authService.GerarTokenCasal(usuario, pessoa)
                : _authService.GerarToken(usuario);

            _logger.LogInformation("Login realizado com sucesso: {Email}", dto.Email);

            var usuarioMapeado = isCasal
                ? UsuarioMapper.MapearCasal(usuario, pessoa)
                : UsuarioMapper.MapearIndividual(usuario);

            return Ok(new
            {
                success = true,
                message = "Login realizado com sucesso",
                token,
                usuario = usuarioMapeado
            });
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthDto dto)
        {
            var clientId = _configuration["Google:ClientId"]
                ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");

            if (string.IsNullOrEmpty(clientId))
                return StatusCode(500, new { message = "Google Client ID não configurado no servidor." });

            GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.Token, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized(new { message = "Token do Google inválido." });
            }

            if (!payload.EmailVerified)
                return Unauthorized(new { message = "E-mail do Google não verificado." });

            var emailNormalizado = payload.Email.Trim().ToLowerInvariant();
            _logger.LogInformation("Google Login para: {Email}", emailNormalizado);

            var usuario = await _authService.ObterUsuarioPorEmail(emailNormalizado);
            var isCasal = false;
            string pessoa = "";

            if (usuario == null)
            {
                usuario = await _authService.ObterCasalPorEmail(emailNormalizado);
                if (usuario != null)
                {
                    isCasal = true;
                    pessoa = usuario.CasalInfo?.EmailPessoa1 == emailNormalizado ? "pessoa1" : "pessoa2";
                }
            }

            if (usuario == null)
            {
                usuario = await _authService.CriarUsuarioViaGoogleAsync(
                    emailNormalizado,
                    payload.Name ?? "Usuário Google"
                );
                _logger.LogInformation("Nova conta Individual criada via Google: {Email}", emailNormalizado);
            }
            else if (!isCasal && (usuario.Provider == "local" || string.IsNullOrEmpty(usuario.Provider)))
            {
                await _context.Usuarios.UpdateOneAsync(
                    u => u.Id == usuario.Id,
                    Builders<Usuario>.Update.Set(u => u.Provider, "both"));
                usuario.Provider = "both";
            }

            await _context.Usuarios.UpdateOneAsync(
                u => u.Id == usuario.Id,
                Builders<Usuario>.Update.Set(u => u.LastLoginAt, DateTime.UtcNow));
            usuario.LastLoginAt = DateTime.UtcNow;

            string token = isCasal
                ? _authService.GerarTokenCasal(usuario, pessoa)
                : _authService.GerarToken(usuario);

            var usuarioMapeado = isCasal
                ? UsuarioMapper.MapearCasal(usuario, pessoa)
                : UsuarioMapper.MapearIndividual(usuario);

            return Ok(new { success = true, message = "Login realizado com sucesso", token, usuario = usuarioMapeado });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logout realizado com sucesso" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<object>> GetCurrentUser()
        {
            var usuarioId = GetUsuarioId();
            if (string.IsNullOrEmpty(usuarioId))
                return Unauthorized();

            var usuario = await _context.Usuarios
                .Find(u => u.Id == usuarioId)
                .FirstOrDefaultAsync();

            if (usuario == null)
                return NotFound();

            var pessoaLogada = User.FindFirst("PessoaLogada")?.Value;

            var usuarioMapeado = usuario.TipoConta == TipoConta.Casal
                ? UsuarioMapper.MapearCasal(usuario, pessoaLogada)
                : UsuarioMapper.MapearIndividual(usuario);

            return Ok(usuarioMapeado);
        }
    }
}