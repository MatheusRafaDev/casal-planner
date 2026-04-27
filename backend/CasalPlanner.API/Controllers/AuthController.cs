// Controllers/AuthController.cs
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

                // Gera JWT
                string token = isCasal
                    ? _authService.GerarTokenCasal(usuario, pessoa)
                    : _authService.GerarToken(usuario);

                _logger.LogInformation("Login realizado com sucesso: {Email}", dto.Email);

                // ========== CONSTRUIR RESPOSTA COMPLETA SEM SENHA ==========
                
                if (usuario.TipoConta == TipoConta.Casal && usuario.CasalInfo != null)
                {
                    // Converter DateTime para string de forma segura
                    string dataNascimentoPessoa1 = usuario.CasalInfo.DataNascimentoPessoa1 == DateTime.MinValue
                        ? null
                        : usuario.CasalInfo.DataNascimentoPessoa1.ToString("yyyy-MM-dd");
                    
                    string dataNascimentoPessoa2 = usuario.CasalInfo.DataNascimentoPessoa2 == DateTime.MinValue
                        ? null
                        : usuario.CasalInfo.DataNascimentoPessoa2.ToString("yyyy-MM-dd");

                    // Resposta para conta CASAL
                    return Ok(new
                    {
                        success = true,
                        message = "Login realizado com sucesso",
                        token,
                        usuario = new
                        {
                            id = usuario.Id,
                            tipoConta = "Casal",
                            isCasal = true,
                            modoEscuro = usuario.ModoEscuro,
                            rendaMensal = usuario.RendaMensal,
                            createdAt = usuario.CreatedAt,
                            lastLoginAt = usuario.LastLoginAt,
                            pessoaLogada = pessoa,
                            pessoa1 = new
                            {
                                nomeCompleto = usuario.CasalInfo.NomeCompletoPessoa1,
                                email = usuario.CasalInfo.EmailPessoa1,
                                cpf = usuario.CasalInfo.CPFPessoa1,
                                dataNascimento = dataNascimentoPessoa1,
                                rendaMensal = usuario.CasalInfo.RendaMensalPessoa1
                            },
                            pessoa2 = new
                            {
                                nomeCompleto = usuario.CasalInfo.NomeCompletoPessoa2,
                                email = usuario.CasalInfo.EmailPessoa2,
                                cpf = usuario.CasalInfo.CPFPessoa2,
                                dataNascimento = dataNascimentoPessoa2,
                                rendaMensal = usuario.CasalInfo.RendaMensalPessoa2
                            }
                        }
                    });
                }
                else
                {
                    // DataNascimento é DateTime? (nullable) - pode usar ?.
                    string dataNascimento = usuario.DataNascimento?.ToString("yyyy-MM-dd");

                    // Resposta para conta INDIVIDUAL
                    return Ok(new
                    {
                        success = true,
                        message = "Login realizado com sucesso",
                        token,
                        usuario = new
                        {
                            id = usuario.Id,
                            nomeCompleto = usuario.NomeCompleto,
                            email = usuario.Email,
                            cpf = usuario.CPF,
                            dataNascimento = dataNascimento,
                            rendaMensal = usuario.RendaMensal,
                            tipoConta = "Individual",
                            isCasal = false,
                            modoEscuro = usuario.ModoEscuro,
                            createdAt = usuario.CreatedAt,
                            lastLoginAt = usuario.LastLoginAt
                        }
                    });
                }
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

            if (usuario.TipoConta == TipoConta.Casal && usuario.CasalInfo != null)
            {
                // Converter DateTime para string de forma segura
                string dataNascimentoPessoa1 = usuario.CasalInfo.DataNascimentoPessoa1 == DateTime.MinValue
                    ? null
                    : usuario.CasalInfo.DataNascimentoPessoa1.ToString("yyyy-MM-dd");
                
                string dataNascimentoPessoa2 = usuario.CasalInfo.DataNascimentoPessoa2 == DateTime.MinValue
                    ? null
                    : usuario.CasalInfo.DataNascimentoPessoa2.ToString("yyyy-MM-dd");

                return Ok(new
                {
                    id = usuario.Id,
                    nomeCompleto = usuario.NomeCompleto,
                    email = usuario.Email,
                    tipoConta = "Casal",
                    isCasal = true,
                    modoEscuro = usuario.ModoEscuro,
                    rendaMensal = usuario.RendaMensal,
                    createdAt = usuario.CreatedAt,
                    casalInfo = new
                    {
                        pessoa1 = new
                        {
                            nomeCompleto = usuario.CasalInfo.NomeCompletoPessoa1,
                            email = usuario.CasalInfo.EmailPessoa1,
                            cpf = usuario.CasalInfo.CPFPessoa1,
                            dataNascimento = dataNascimentoPessoa1,
                            rendaMensal = usuario.CasalInfo.RendaMensalPessoa1
                        },
                        pessoa2 = new
                        {
                            nomeCompleto = usuario.CasalInfo.NomeCompletoPessoa2,
                            email = usuario.CasalInfo.EmailPessoa2,
                            cpf = usuario.CasalInfo.CPFPessoa2,
                            dataNascimento = dataNascimentoPessoa2,
                            rendaMensal = usuario.CasalInfo.RendaMensalPessoa2
                        }
                    }
                });
            }

            // DataNascimento é DateTime? (nullable) - pode usar ?.
            string dataNascimento = usuario.DataNascimento?.ToString("yyyy-MM-dd");

            return Ok(new
            {
                id = usuario.Id,
                nomeCompleto = usuario.NomeCompleto,
                email = usuario.Email,
                cpf = usuario.CPF,
                dataNascimento = dataNascimento,
                rendaMensal = usuario.RendaMensal,
                tipoConta = "Individual",
                isCasal = false,
                modoEscuro = usuario.ModoEscuro,
                createdAt = usuario.CreatedAt,
                lastLoginAt = usuario.LastLoginAt
            });
        }
    }
}