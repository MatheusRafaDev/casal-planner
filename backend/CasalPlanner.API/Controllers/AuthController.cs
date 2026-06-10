// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CasalPlanner.API.Services;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Models;
using CasalPlanner.API.Data;
using CasalPlanner.API.Helpers;
using MongoDB.Driver;
using System.Security.Claims;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly MongoDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService, 
            MongoDbContext context,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _context = context;
            _logger = logger;
        }

        private string GetUsuarioId() =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                _logger.LogInformation("Tentativa de login para email: {Email}", dto.Email);

                var usuario = await _authService.ObterUsuarioPorEmail(dto.Email);
                var isCasal = false;
                string pessoa = "";

                if (usuario == null)
                {
                    usuario = await _authService.ObterCasalPorEmail(dto.Email);
                    if (usuario != null)
                    {
                        isCasal = true;
                        pessoa = usuario.CasalInfo?.EmailPessoa1 == dto.Email ? "pessoa1" : "pessoa2";
                    }
                }

                if (usuario == null)
                {
                    _logger.LogWarning("Usuário não encontrado: {Email}", dto.Email);
                    return Unauthorized(new { message = "Usuário não encontrado" });
                }

                var senhaValida = await _authService.VerificarSenha(usuario, dto.Senha, pessoa);

                if (!senhaValida)
                {
                    _logger.LogWarning("Senha inválida para: {Email}", dto.Email);
                    return Unauthorized(new { message = "Senha inválida" });
                }

                await _context.Usuarios.UpdateOneAsync(
                    u => u.Id == usuario.Id,
                    Builders<Usuario>.Update.Set(u => u.LastLoginAt, DateTime.UtcNow)
                );
                usuario.LastLoginAt = DateTime.UtcNow;

                // Gera JWT
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro no login para {Email}", dto.Email);
                return StatusCode(500, new { success = false, message = "Erro interno no servidor", error = ex.Message });
            }
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

            var usuarioMapeado = usuario.TipoConta == TipoConta.Casal
                ? UsuarioMapper.MapearCasal(usuario)
                : UsuarioMapper.MapearIndividual(usuario);

            return Ok(usuarioMapeado);
        }
    }
}