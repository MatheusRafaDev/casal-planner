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
        private readonly IWebHostEnvironment _environment;

        public AuthController(
            IAuthService authService,
            MongoDbContext context,
            ILogger<AuthController> logger,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            _authService = authService;
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _environment = environment;
        }

        private void SetTokenCookie(string token, string? refreshToken = null)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("cp_token", token, cookieOptions);

            if (!string.IsNullOrEmpty(refreshToken))
            {
                var refreshCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = !_environment.IsDevelopment(),
                    SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                    Path = "/api/auth",
                    Expires = DateTime.UtcNow.AddDays(30)
                };
                Response.Cookies.Append("cp_refresh_token", refreshToken, refreshCookieOptions);
            }
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

            var refreshTokenResult = await _authService.GerarERegistrarRefreshToken(usuario.Id!, isCasal ? pessoa : null);

            SetTokenCookie(token, refreshTokenResult.Token);

            _logger.LogInformation("Login realizado com sucesso: {Email}", dto.Email);

            var usuarioMapeado = isCasal
                ? UsuarioMapper.MapearCasal(usuario, pessoa)
                : UsuarioMapper.MapearIndividual(usuario);

            return Ok(new
            {
                success = true,
                message = "Login realizado com sucesso",
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

            var refreshTokenResult = await _authService.GerarERegistrarRefreshToken(usuario.Id!, isCasal ? pessoa : null);

            SetTokenCookie(token, refreshTokenResult.Token);

            var usuarioMapeado = isCasal
                ? UsuarioMapper.MapearCasal(usuario, pessoa)
                : UsuarioMapper.MapearIndividual(usuario);

            return Ok(new { success = true, message = "Login realizado com sucesso", usuario = usuarioMapeado });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var usuarioId = GetUsuarioId();
            var pessoa = User.FindFirst("PessoaLogada")?.Value;
            if (!string.IsNullOrEmpty(usuarioId))
            {
                var update = pessoa == "pessoa1"
                    ? Builders<Usuario>.Update.Set(u => u.CasalInfo!.RefreshTokenPessoa1, null).Set(u => u.CasalInfo!.RefreshTokenExpiraEmPessoa1, null)
                    : pessoa == "pessoa2"
                        ? Builders<Usuario>.Update.Set(u => u.CasalInfo!.RefreshTokenPessoa2, null).Set(u => u.CasalInfo!.RefreshTokenExpiraEmPessoa2, null)
                        : Builders<Usuario>.Update.Set(u => u.RefreshToken, null).Set(u => u.RefreshTokenExpiraEm, null);
                await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioId, update);
            }
            Response.Cookies.Delete("cp_token");
            Response.Cookies.Delete("cp_refresh_token", new CookieOptions { Path = "/api/auth", Secure = !_environment.IsDevelopment(), SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None });
            return Ok(new { message = "Logout realizado com sucesso" });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue("cp_refresh_token", out var refreshToken) || string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "Refresh token não fornecido." });
            }

            var (usuario, pessoa) = await _authService.ValidarRefreshToken(refreshToken);

            if (usuario == null)
            {
                return Unauthorized(new { message = "Refresh token inválido ou expirado." });
            }

            // Rotacionar refresh token
            var isCasal = usuario.TipoConta == TipoConta.Casal;
            string token = isCasal
                ? _authService.GerarTokenCasal(usuario, pessoa!)
                : _authService.GerarToken(usuario);

            var novoRefreshToken = await _authService.GerarERegistrarRefreshToken(usuario.Id!, isCasal ? pessoa : null);

            SetTokenCookie(token, novoRefreshToken.Token);

            return Ok(new { success = true });
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
