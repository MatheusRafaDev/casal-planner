using Microsoft.AspNetCore.Mvc;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs; 
using CasalPlanner.API.Services;
using CasalPlanner.API.Data;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;

namespace CasalPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly MongoDbContext _context;

    public AuthController(
        IAuthService authService,
        ILogger<AuthController> logger,
        MongoDbContext context)
    {
        _authService = authService;
        _logger = logger;
        _context = context;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] LoginDto dto)
    {
        var usuarioIndividual = await _authService.ObterUsuarioPorEmail(dto.Email);
        
        if (usuarioIndividual != null && usuarioIndividual.SenhaHash != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.Senha, usuarioIndividual.SenhaHash))
                return Unauthorized(new { message = "Email ou senha inválidos" });

            var update = Builders<Usuario>.Update.Set(u => u.LastLoginAt, DateTime.UtcNow);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioIndividual.Id, update);

            var token = _authService.GerarToken(usuarioIndividual);

            return Ok(new
            {
                id = usuarioIndividual.Id,
                nomeCompleto = usuarioIndividual.NomeCompleto,
                email = usuarioIndividual.Email,
                cpf = usuarioIndividual.CPF,
                dataNascimento = usuarioIndividual.DataNascimento,
                rendaMensal = usuarioIndividual.RendaMensal,
                token = token,
                tipoConta = "Individual",
                isCasal = false,
                modoEscuro = usuarioIndividual.ModoEscuro,
                createdAt = usuarioIndividual.CreatedAt,
                lastLoginAt = usuarioIndividual.LastLoginAt
            });
        }

        var usuarioCasal = await _authService.ObterCasalPorEmail(dto.Email);
        
        if (usuarioCasal?.CasalInfo != null)
        {
            string pessoaQueLogou = "";
            bool senhaValida = false;

            if (usuarioCasal.CasalInfo.EmailPessoa1 == dto.Email)
            {
                senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuarioCasal.CasalInfo.SenhaHashPessoa1);
                pessoaQueLogou = "pessoa1";
            }
            else if (usuarioCasal.CasalInfo.EmailPessoa2 == dto.Email)
            {
                senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuarioCasal.CasalInfo.SenhaHashPessoa2);
                pessoaQueLogou = "pessoa2";
            }

            if (!senhaValida)
                return Unauthorized(new { message = "Email ou senha inválidos" });

            var update = Builders<Usuario>.Update.Set(u => u.LastLoginAt, DateTime.UtcNow);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);

            var token = _authService.GerarTokenCasal(usuarioCasal, pessoaQueLogou);
            
            var nome = pessoaQueLogou == "pessoa1" 
                ? usuarioCasal.CasalInfo.NomeCompletoPessoa1 
                : usuarioCasal.CasalInfo.NomeCompletoPessoa2;

            // Criar uma cópia segura do CasalInfo sem os hashes de senha
            var casalInfoSeguro = new
            {
                usuarioCasal.CasalInfo.NomeCompletoPessoa1,
                usuarioCasal.CasalInfo.EmailPessoa1,
                usuarioCasal.CasalInfo.CPFPessoa1,
                usuarioCasal.CasalInfo.DataNascimentoPessoa1,
                usuarioCasal.CasalInfo.RendaMensalPessoa1,
                usuarioCasal.CasalInfo.NomeCompletoPessoa2,
                usuarioCasal.CasalInfo.EmailPessoa2,
                usuarioCasal.CasalInfo.CPFPessoa2,
                usuarioCasal.CasalInfo.DataNascimentoPessoa2,
                usuarioCasal.CasalInfo.RendaMensalPessoa2,
                usuarioCasal.CasalInfo.DataCasamento
            };

            return Ok(new
            {
                id = usuarioCasal.Id,
                nomeCompleto = nome,
                email = dto.Email,
                token = token,
                tipoConta = "Casal",
                isCasal = true,
                pessoaQueLogou = pessoaQueLogou,
                rendaMensal = usuarioCasal.RendaMensal,
                casalInfo = casalInfoSeguro,
                modoEscuro = usuarioCasal.ModoEscuro,
                createdAt = usuarioCasal.CreatedAt,
                lastLoginAt = usuarioCasal.LastLoginAt
            });
        }

        return Unauthorized(new { message = "Email ou senha inválidos" });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logout realizado com sucesso" });
    }
}