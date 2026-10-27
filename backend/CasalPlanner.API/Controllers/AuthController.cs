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
        private readonly IResumoService _resumoService;
        private readonly IItemService _itemService;
        private readonly ICacheService _cacheService;

        public AuthController(
            IAuthService authService,
            MongoDbContext context,
            ILogger<AuthController> logger,
            IConfiguration configuration,
            IWebHostEnvironment environment,
            IResumoService resumoService,
            IItemService itemService,
            ICacheService cacheService)
        {
            _authService = authService;
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _environment = environment;
            _resumoService = resumoService;
            _itemService = itemService;
            _cacheService = cacheService;
        }

        // Hash BCrypt fixo (workFactor 12) usado só para igualar o tempo de resposta.
        private const string DummyHash = "$2a$12$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG";

        private static TimeSpan GetTokenLifetime(bool isMobile) =>
            int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRES_IN"), out var m) && m > 0
                ? TimeSpan.FromMinutes(m)
                : SessionLifetimePolicy.GetLifetime(isMobile);

        private bool IsMobileDevice()
        {
            return SessionLifetimePolicy.IsMobileClient(Request);
        }

        private void SetTokenCookie(string token, string? refreshToken = null, bool isMobile = false)
        {
            var lifetime = GetTokenLifetime(isMobile);
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                Expires = DateTime.UtcNow.Add(lifetime)
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
                    Expires = isMobile ? DateTime.UtcNow.AddDays(3650) : DateTime.UtcNow.AddDays(30)
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
                // Hash dummy: mantém o custo de tempo igual ao de um usuário existente,
                // impedindo enumeração de contas por timing.
                BCrypt.Net.BCrypt.Verify(dto.Senha ?? string.Empty, DummyHash);
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

            var isMobile = IsMobileDevice();
            string token = isCasal
                ? _authService.GerarTokenCasal(usuario, pessoa, isMobile)
                : _authService.GerarToken(usuario, isMobile);

            var refreshTokenResult = await _authService.GerarERegistrarRefreshToken(usuario.Id!, isCasal ? pessoa : null, isMobile);

            SetTokenCookie(token, refreshTokenResult.Token, isMobile);

            _logger.LogInformation("Login realizado com sucesso: {Email}", dto.Email);

            DispararPreaquecimentoCache(usuario.Id!);

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

            var isMobile = IsMobileDevice();
            string token = isCasal
                ? _authService.GerarTokenCasal(usuario, pessoa, isMobile)
                : _authService.GerarToken(usuario, isMobile);

            var refreshTokenResult = await _authService.GerarERegistrarRefreshToken(usuario.Id!, isCasal ? pessoa : null, isMobile);

            SetTokenCookie(token, refreshTokenResult.Token, isMobile);

            DispararPreaquecimentoCache(usuario.Id!);

            var usuarioMapeado = isCasal
                ? UsuarioMapper.MapearCasal(usuario, pessoa)
                : UsuarioMapper.MapearIndividual(usuario);

            return Ok(new { success = true, message = "Login realizado com sucesso", usuario = usuarioMapeado });
        }

        private void DispararPreaquecimentoCache(string usuarioId)
        {
            if (string.IsNullOrWhiteSpace(usuarioId)) return;

            _ = Task.Run(async () =>
            {
                try
                {
                    var taskResumo = _resumoService.ObterResumo(usuarioId);
                    var taskItens = _itemService.GetItensByUsuarioId(usuarioId);

                    async Task AquecerCategorias()
                    {
                        var filter = Builders<Categoria>.Filter.Or(
                            Builders<Categoria>.Filter.Eq(c => c.UsuarioId, null),
                            Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId)
                        );
                        var cats = await _context.Categorias
                            .Find(filter)
                            .SortByDescending(c => c.IsPadrao)
                            .ThenBy(c => c.Nome)
                            .ToListAsync();
                        await _cacheService.SetAsync($"casal:categorias:{usuarioId}", cats, TimeSpan.FromHours(24));
                    }

                    await Task.WhenAll(taskResumo, taskItens, AquecerCategorias());
                    _logger.LogInformation("✅ [REDIS PRE-WARM] Cache 100% pronto no Redis para usuário {UsuarioId}!", usuarioId);
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Aviso no pré-aquecimento não-bloqueante de cache para {UsuarioId}", usuarioId);
                }
            });
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
            var deleteOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure   = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None
            };
            Response.Cookies.Delete("cp_token", deleteOptions);
            Response.Cookies.Delete("cp_refresh_token", new CookieOptions
            {
                HttpOnly = true,
                Secure   = !_environment.IsDevelopment(),
                SameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
                Path     = "/api/auth"
            });
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
            var isMobile = IsMobileDevice();
            string token = isCasal
                ? _authService.GerarTokenCasal(usuario, pessoa!, isMobile)
                : _authService.GerarToken(usuario, isMobile);

            var novoRefreshToken = await _authService.GerarERegistrarRefreshToken(usuario.Id!, isCasal ? pessoa : null, isMobile);

            SetTokenCookie(token, novoRefreshToken.Token, isMobile);

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
