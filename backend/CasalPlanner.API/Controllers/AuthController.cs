using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CasalPlanner.API.Services;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Models;
using CasalPlanner.API.Data;
using MongoDB.Driver;
using System.Security.Claims;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly MongoDbContext _context; // 🔥 Adicionar context

        public AuthController(IAuthService authService, MongoDbContext context)
        {
            _authService = authService;
            _context = context; // 🔥 Inicializar context
        }

        private string GetUsuarioId() // 🔥 Adicionar método GetUsuarioId
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                // Buscar usuário individual
                var usuario = await _authService.ObterUsuarioPorEmail(dto.Email);
                var isCasal = false;
                string pessoa = "";

                // Se não for individual, buscar como casal
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
                    return Unauthorized(new { error = "Usuário não encontrado" });

                // Verificar senha usando BCrypt
                var senhaValida = await _authService.VerificarSenha(usuario, dto.Senha, pessoa);

                if (!senhaValida)
                    return Unauthorized(new { error = "Senha inválida" });

                // Gerar token
                string token;
                if (isCasal)
                {
                    token = _authService.GerarTokenCasal(usuario, pessoa);
                }
                else
                {
                    token = _authService.GerarToken(usuario);
                }

                Response.Cookies.Append("auth_token", token, new CookieOptions
                {
                    HttpOnly = true,      
                    Secure = false,        
                    SameSite = SameSiteMode.Strict, 
                    Expires = DateTime.UtcNow.AddDays(7), 
                    Path = "/"
                });

                return Ok(new
                {
                    message = "Login realizado com sucesso",
                    usuario = new
                    {
                        usuario.Id,
                        usuario.NomeCompleto,
                        usuario.Email,
                        usuario.TipoConta,
                        usuario.IsCasal,
                        usuario.ModoEscuro,
                        usuario.RendaMensal
                    }
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("auth_token");
            return Ok(new { message = "Logout realizado" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<object>> GetCurrentUser()
        {
            var usuarioId = GetUsuarioId();
            if (string.IsNullOrEmpty(usuarioId))
                return Unauthorized();

            var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
            if (usuario == null)
                return NotFound();

            if (usuario.TipoConta == TipoConta.Casal)
            {
                return Ok(new
                {
                    usuario.Id,
                    usuario.NomeCompleto,
                    usuario.Email,
                    usuario.TipoConta,
                    usuario.IsCasal,
                    usuario.ModoEscuro,
                    usuario.RendaMensal,
                    CasalInfo = new
                    {
                        usuario.CasalInfo?.NomeCompletoPessoa1,
                        usuario.CasalInfo?.EmailPessoa1,
                        usuario.CasalInfo?.CPFPessoa1,
                        DataNascimentoPessoa1 = usuario.CasalInfo?.DataNascimentoPessoa1.ToString("yyyy-MM-dd"),
                        usuario.CasalInfo?.RendaMensalPessoa1,
                        usuario.CasalInfo?.NomeCompletoPessoa2,
                        usuario.CasalInfo?.EmailPessoa2,
                        usuario.CasalInfo?.CPFPessoa2,
                        DataNascimentoPessoa2 = usuario.CasalInfo?.DataNascimentoPessoa2.ToString("yyyy-MM-dd"),
                        usuario.CasalInfo?.RendaMensalPessoa2,
                        DataCasamento = usuario.CasalInfo?.DataCasamento?.ToString("yyyy-MM-dd"),
                        usuario.CasalInfo?.CreatedAt
                    }
                });
            }
            else
            {
                return Ok(new
                {
                    usuario.Id,
                    usuario.NomeCompleto,
                    usuario.Email,
                    usuario.TipoConta,
                    usuario.IsCasal,
                    usuario.ModoEscuro,
                    usuario.RendaMensal,
                    usuario.CPF,
                    DataNascimento = usuario.DataNascimento?.ToString("yyyy-MM-dd")
                });
            }
        }
    }
}