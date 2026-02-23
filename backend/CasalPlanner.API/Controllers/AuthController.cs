using Microsoft.AspNetCore.Mvc;
using CasalPlanner.API.Models;
using CasalPlanner.API.Services;
using CasalPlanner.API.Data; // <-- ADICIONE ISSO
using MongoDB.Driver; // <-- ADICIONE ISSO
using BCrypt.Net; // <-- ADICIONE ISSO

namespace CasalPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly MongoDbContext _context; // <-- ADICIONE ISSO

    public AuthController(
        IAuthService authService, 
        ILogger<AuthController> logger,
        MongoDbContext context) // <-- ADICIONE ISSO NO CONSTRUTOR
    {
        _authService = authService;
        _logger = logger;
        _context = context; // <-- ADICIONE ISSO
    }

    [HttpPost("registrar")]
    public async Task<ActionResult<LoginResponseDto>> Registrar([FromBody] RegistroDto dto)
    {
        _logger.LogInformation("Tentativa de registro para email: {Email}", dto.Email);
        
        var usuario = await _authService.Registrar(dto);
        
        if (usuario == null)
        {
            _logger.LogWarning("Registro falhou: email já cadastrado - {Email}", dto.Email);
            return BadRequest(new { message = "Email já cadastrado" });
        }
            
        var token = _authService.GerarToken(usuario);
        
        _logger.LogInformation("Registro bem-sucedido para: {Email}", dto.Email);
        
        return Ok(new LoginResponseDto
        {
            Id = usuario.Id!,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Token = token,
            IsCasal = usuario.IsCasal
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
    {
        _logger.LogInformation("Tentativa de login para email: {Email}", dto.Email);
        
        var resultado = await _authService.Login(dto);
        
        if (resultado == null)
        {
            _logger.LogWarning("Login falhou para: {Email}", dto.Email);
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }
        
        _logger.LogInformation("Login bem-sucedido para: {Email}", dto.Email);
        return Ok(resultado);
    }

    [HttpPost("login-casal")]
    public async Task<ActionResult<LoginResponseDto>> LoginCasal([FromBody] LoginDto dto)
    {
        _logger.LogInformation("=== INÍCIO LoginCasal ===");
        
        if (dto.Email != "casal@email.com" || dto.Senha != "casal123")
        {
            _logger.LogWarning("Credenciais inválidas");
            return Unauthorized(new { message = "Credenciais do casal inválidas" });
        }
        
        var usuario = await _authService.ObterUsuarioPorEmail("casal@email.com");
        
        if (usuario == null)
        {
            _logger.LogError("Usuário do casal não encontrado no banco!");
            
            // TENTAR CRIAR O USUÁRIO
            _logger.LogInformation("Tentando criar usuário do casal...");
            
            usuario = new Usuario
            {
                Nome = "Casal",
                Email = "casal@email.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("casal123"),
                IsCasal = true,
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.Usuarios.InsertOneAsync(usuario); // <-- AGORA _context FUNCIONA
            _logger.LogInformation("Usuário criado com ID: {Id}", usuario.Id);
        }
        
        _logger.LogInformation("Usuário encontrado: ID={Id}, Nome={Nome}, Email={Email}", 
            usuario.Id, usuario.Nome, usuario.Email);
        
        var token = _authService.GerarToken(usuario);
        _logger.LogInformation("Token gerado: {Token}", token);
        
        var response = new LoginResponseDto
        {
            Id = usuario.Id!,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Token = token,
            IsCasal = true
        };
        
        _logger.LogInformation("=== FIM LoginCasal ===");
        
        return Ok(response);
    }
}