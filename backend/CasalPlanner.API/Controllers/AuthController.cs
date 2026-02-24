using Microsoft.AspNetCore.Mvc;
using CasalPlanner.API.Models;
using CasalPlanner.API.Services;
using CasalPlanner.API.Data;
using MongoDB.Driver;

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

    #region Endpoints Individuais

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
            NomeCompleto = usuario.NomeCompleto ?? "",
            Email = usuario.Email ?? "",
            Token = token,
            IsCasal = usuario.IsCasal,
            TipoConta = usuario.TipoConta.ToString()
        });
    }

    [HttpPost("login")]
public async Task<ActionResult<object>> Login([FromBody] LoginDto dto)
{
    _logger.LogInformation("Tentativa de login para email: {Email}", dto.Email);

    // Primeiro, tenta encontrar como usuário individual
    var usuarioIndividual = await _authService.ObterUsuarioPorEmail(dto.Email);
    
    if (usuarioIndividual != null && usuarioIndividual.SenhaHash != null)
    {
        // Verificar senha do usuário individual
        if (!BCrypt.Net.BCrypt.Verify(dto.Senha, usuarioIndividual.SenhaHash))
        {
            _logger.LogWarning("Senha inválida para usuário individual: {Email}", dto.Email);
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        // Atualizar último login
        var update = Builders<Usuario>.Update
            .Set(u => u.LastLoginAt, DateTime.UtcNow);
        await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioIndividual.Id, update);

        var token = _authService.GerarToken(usuarioIndividual);

        _logger.LogInformation("Login individual bem-sucedido: {Email}", dto.Email);

        return Ok(new
        {
            id = usuarioIndividual.Id,
            nomeCompleto = usuarioIndividual.NomeCompleto,
            email = usuarioIndividual.Email,
            token = token,
            tipoConta = "Individual",
            isCasal = false
        });
    }

    // Se não encontrou como individual, tenta como casal
    var usuarioCasal = await _authService.ObterCasalPorEmail(dto.Email);
    
    if (usuarioCasal?.CasalInfo != null)
    {
        string pessoaQueLogou = "";
        bool senhaValida = false;

        // Verificar qual pessoa do casal está fazendo login
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
        {
            _logger.LogWarning("Senha inválida para casal: {Email}", dto.Email);
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        // Atualizar último login
        var update = Builders<Usuario>.Update
            .Set(u => u.LastLoginAt, DateTime.UtcNow);
        await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);

        var token = _authService.GerarTokenCasal(usuarioCasal, pessoaQueLogou);
        
        var nome = pessoaQueLogou == "pessoa1" 
            ? usuarioCasal.CasalInfo.NomeCompletoPessoa1 
            : usuarioCasal.CasalInfo.NomeCompletoPessoa2;

        _logger.LogInformation("Login de casal bem-sucedido: {Email}", dto.Email);

        return Ok(new
        {
            id = usuarioCasal.Id,
            nomeCompleto = nome,
            email = dto.Email,
            token = token,
            tipoConta = "Casal",
            isCasal = true,
            pessoaQueLogou = pessoaQueLogou,
            nomeCompletoPessoa1 = usuarioCasal.CasalInfo.NomeCompletoPessoa1,
            emailPessoa1 = usuarioCasal.CasalInfo.EmailPessoa1,
            nomeCompletoPessoa2 = usuarioCasal.CasalInfo.NomeCompletoPessoa2,
            emailPessoa2 = usuarioCasal.CasalInfo.EmailPessoa2,
            dataCasamento = usuarioCasal.CasalInfo.DataCasamento
        });
    }

    // Se não encontrou em lugar nenhum
    _logger.LogWarning("Usuário não encontrado: {Email}", dto.Email);
    return Unauthorized(new { message = "Email ou senha inválidos" });
}

    #endregion

    #region Endpoints para Casal

    [HttpPost("registrar-casal")]
    public async Task<ActionResult<UsuarioResponseDto>> RegistrarCasal([FromBody] RegistroCasalDto dto)
    {
        _logger.LogInformation("Tentativa de registro de casal: {Email1} e {Email2}",
            dto.EmailPessoa1, dto.EmailPessoa2);

        var usuario = await _authService.RegistrarCasal(dto);

        if (usuario == null)
        {
            _logger.LogWarning("Registro de casal falhou: emails já existentes");
            return BadRequest(new { message = "Um dos emails já está cadastrado" });
        }

        var token = _authService.GerarTokenCasal(usuario, "pessoa1");

        var response = new UsuarioResponseDto
        {
            Id = usuario.Id!,
            TipoConta = "Casal",
            CreatedAt = usuario.CreatedAt,
            NomeCompletoPessoa1 = usuario.CasalInfo?.NomeCompletoPessoa1,
            EmailPessoa1 = usuario.CasalInfo?.EmailPessoa1,
            CPFPessoa1 = usuario.CasalInfo?.CPFPessoa1,
            DataNascimentoPessoa1 = usuario.CasalInfo?.DataNascimentoPessoa1,
            TelefonePessoa1 = usuario.CasalInfo?.TelefonePessoa1,
            RendaMensalPessoa1 = usuario.CasalInfo?.RendaMensalPessoa1,
            NomeCompletoPessoa2 = usuario.CasalInfo?.NomeCompletoPessoa2,
            EmailPessoa2 = usuario.CasalInfo?.EmailPessoa2,
            CPFPessoa2 = usuario.CasalInfo?.CPFPessoa2,
            DataNascimentoPessoa2 = usuario.CasalInfo?.DataNascimentoPessoa2,
            TelefonePessoa2 = usuario.CasalInfo?.TelefonePessoa2,
            RendaMensalPessoa2 = usuario.CasalInfo?.RendaMensalPessoa2,
            DataCasamento = usuario.CasalInfo?.DataCasamento,
            Preferencias = usuario.Preferencias,
            Token = token
        };

        _logger.LogInformation("Casal registrado com sucesso: {Id}", usuario.Id);
        return Ok(response);
    }

    [HttpPost("login-casal")]
    public async Task<ActionResult<LoginCasalResponseDto>> LoginCasal([FromBody] LoginCasalDto dto)
    {
        _logger.LogInformation("Tentativa de login do casal com email: {Email}", dto.Email);

        var resultado = await _authService.LoginCasal(dto);

        if (resultado == null)
        {
            _logger.LogWarning("Login do casal falhou para: {Email}", dto.Email);
            return Unauthorized(new { message = "Email ou senha inválidos" });
        }

        return Ok(resultado);
    }

    [HttpGet("perfil-casal/{id}")]
    public async Task<ActionResult<UsuarioResponseDto>> ObterPerfilCasal(string id)
    {
        _logger.LogInformation("Buscando perfil do casal: {Id}", id);

        var usuario = await _authService.ObterUsuarioPorId(id);

        if (usuario == null || usuario.TipoConta != TipoConta.Casal)
            return NotFound(new { message = "Casal não encontrado" });

        var response = new UsuarioResponseDto
        {
            Id = usuario.Id!,
            TipoConta = "Casal",
            CreatedAt = usuario.CreatedAt,
            LastLoginAt = usuario.LastLoginAt,
            NomeCompletoPessoa1 = usuario.CasalInfo?.NomeCompletoPessoa1,
            EmailPessoa1 = usuario.CasalInfo?.EmailPessoa1,
            CPFPessoa1 = usuario.CasalInfo?.CPFPessoa1,
            DataNascimentoPessoa1 = usuario.CasalInfo?.DataNascimentoPessoa1,
            TelefonePessoa1 = usuario.CasalInfo?.TelefonePessoa1,
            RendaMensalPessoa1 = usuario.CasalInfo?.RendaMensalPessoa1,
            NomeCompletoPessoa2 = usuario.CasalInfo?.NomeCompletoPessoa2,
            EmailPessoa2 = usuario.CasalInfo?.EmailPessoa2,
            CPFPessoa2 = usuario.CasalInfo?.CPFPessoa2,
            DataNascimentoPessoa2 = usuario.CasalInfo?.DataNascimentoPessoa2,
            TelefonePessoa2 = usuario.CasalInfo?.TelefonePessoa2,
            RendaMensalPessoa2 = usuario.CasalInfo?.RendaMensalPessoa2,
            DataCasamento = usuario.CasalInfo?.DataCasamento,
            Preferencias = usuario.Preferencias
        };

        return Ok(response);
    }

    [HttpPut("perfil-casal/{id}")]
    public async Task<ActionResult<UsuarioResponseDto>> AtualizarPerfilCasal(
        string id,
        [FromBody] AtualizarCasalDto dto)
    {
        _logger.LogInformation("Atualizando perfil do casal: {Id}", id);

        var usuario = await _authService.AtualizarPerfilCasal(id, dto);

        if (usuario == null)
            return NotFound(new { message = "Casal não encontrado" });

        var response = new UsuarioResponseDto
        {
            Id = usuario.Id!,
            TipoConta = "Casal",
            CreatedAt = usuario.CreatedAt,
            LastLoginAt = usuario.LastLoginAt,
            NomeCompletoPessoa1 = usuario.CasalInfo?.NomeCompletoPessoa1,
            EmailPessoa1 = usuario.CasalInfo?.EmailPessoa1,
            CPFPessoa1 = usuario.CasalInfo?.CPFPessoa1,
            DataNascimentoPessoa1 = usuario.CasalInfo?.DataNascimentoPessoa1,
            TelefonePessoa1 = usuario.CasalInfo?.TelefonePessoa1,
            RendaMensalPessoa1 = usuario.CasalInfo?.RendaMensalPessoa1,
            NomeCompletoPessoa2 = usuario.CasalInfo?.NomeCompletoPessoa2,
            EmailPessoa2 = usuario.CasalInfo?.EmailPessoa2,
            CPFPessoa2 = usuario.CasalInfo?.CPFPessoa2,
            DataNascimentoPessoa2 = usuario.CasalInfo?.DataNascimentoPessoa2,
            TelefonePessoa2 = usuario.CasalInfo?.TelefonePessoa2,
            RendaMensalPessoa2 = usuario.CasalInfo?.RendaMensalPessoa2,
            DataCasamento = usuario.CasalInfo?.DataCasamento,
            Preferencias = usuario.Preferencias
        };

        return Ok(response);
    }

    #endregion
}