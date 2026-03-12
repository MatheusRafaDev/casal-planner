using Microsoft.AspNetCore.Mvc;
using CasalPlanner.API.Models;
using CasalPlanner.API.Services;
using CasalPlanner.API.Data;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

    private string GetUsuarioId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
    }

    private async Task CriarCategoriasPadrao(string usuarioId)
    {
        var categoriasPadrao = new List<Categoria>
        {
            new() {
                Nome = "Cozinha",
                Bg = "#2c5e2c",
                Icon = "🍳",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Sala",
                Bg = "#b84a2c",
                Icon = "🛋️",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Quarto",
                Bg = "#2c528",
                Icon = "🛏️",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Banheiro",
                Bg = "#e2d9ed",
                Icon = "🛁",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Lavanderia",
                Bg = "#97266d",
                Icon = "🧼",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _context.Categorias.InsertManyAsync(categoriasPadrao);
    }

    #region Endpoints Públicos

    [AllowAnonymous]
    [HttpPost("registrar")]
    public async Task<ActionResult<LoginResponseDto>> Registrar([FromBody] RegistroDto dto)
    {
        var usuario = await _authService.Registrar(dto);
        if (usuario == null)
            return BadRequest(new { message = "Email já cadastrado" });

        // Criar categorias padrão para o novo usuário
        await CriarCategoriasPadrao(usuario.Id!);

        var token = _authService.GerarToken(usuario);
        
        return Ok(new LoginResponseDto
        {
            Id = usuario.Id!,
            NomeCompleto = usuario.NomeCompleto ?? "",
            Email = usuario.Email ?? "",
            Token = token,
            IsCasal = usuario.IsCasal,
            TipoConta = usuario.TipoConta.ToString(),
            ModoEscuro = usuario.ModoEscuro
        });
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
                modoEscuro = usuarioIndividual.ModoEscuro
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

            return Ok(new
            {
                id = usuarioCasal.Id,
                nomeCompleto = nome,
                email = dto.Email,
                token = token,
                tipoConta = "Casal",
                isCasal = true,
                pessoaQueLogou = pessoaQueLogou,
                casalInfo = usuarioCasal.CasalInfo,
                modoEscuro = usuarioCasal.ModoEscuro
            });
        }

        return Unauthorized(new { message = "Email ou senha inválidos" });
    }

    [AllowAnonymous]
    [HttpPost("registrar-casal")]
    public async Task<ActionResult<UsuarioResponseDto>> RegistrarCasal([FromBody] RegistroCasalDto dto)
    {
        var usuario = await _authService.RegistrarCasal(dto);
        if (usuario == null)
            return BadRequest(new { message = "Um dos emails já está cadastrado" });

        // Criar categorias padrão para o novo casal
        await CriarCategoriasPadrao(usuario.Id!);

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
            RendaMensalPessoa1 = usuario.CasalInfo?.RendaMensalPessoa1,
            NomeCompletoPessoa2 = usuario.CasalInfo?.NomeCompletoPessoa2,
            EmailPessoa2 = usuario.CasalInfo?.EmailPessoa2,
            CPFPessoa2 = usuario.CasalInfo?.CPFPessoa2,
            DataNascimentoPessoa2 = usuario.CasalInfo?.DataNascimentoPessoa2,
            RendaMensalPessoa2 = usuario.CasalInfo?.RendaMensalPessoa2,
            DataCasamento = usuario.CasalInfo?.DataCasamento,
            ModoEscuro = usuario.ModoEscuro,
            Token = token
        };

        return Ok(response);
    }

    #endregion

    #region Endpoints Protegidos

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
                id = usuario.Id,
                tipoConta = "Casal",
                isCasal = true,
                casalInfo = usuario.CasalInfo,
                modoEscuro = usuario.ModoEscuro,
                createdAt = usuario.CreatedAt,
                lastLoginAt = usuario.LastLoginAt
            });
        }
        else
        {
            return Ok(new
            {
                id = usuario.Id,
                nomeCompleto = usuario.NomeCompleto,
                email = usuario.Email,
                cpf = usuario.CPF,
                dataNascimento = usuario.DataNascimento,
                rendaMensal = usuario.RendaMensal,
                tipoConta = "Individual",
                isCasal = false,
                modoEscuro = usuario.ModoEscuro,
                createdAt = usuario.CreatedAt,
                lastLoginAt = usuario.LastLoginAt
            });
        }
    }

    [Authorize]
    [HttpPut("perfil/{id}")]
    public async Task<ActionResult<object>> AtualizarPerfil(string id, [FromBody] AtualizarPerfilDto dto)
    {
        var usuario = await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (usuario == null)
            return NotFound();

        var update = Builders<Usuario>.Update;
        var updates = new List<UpdateDefinition<Usuario>>();

        if (dto.NomeCompleto != null)
            updates.Add(update.Set(u => u.NomeCompleto, dto.NomeCompleto));
        if (dto.DataNascimento.HasValue)
            updates.Add(update.Set(u => u.DataNascimento, dto.DataNascimento.Value));
        if (dto.RendaMensal.HasValue)
            updates.Add(update.Set(u => u.RendaMensal, dto.RendaMensal.Value));

        if (updates.Any())
            await _context.Usuarios.UpdateOneAsync(u => u.Id == id, update.Combine(updates));

        var usuarioAtualizado = await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();
        return Ok(usuarioAtualizado);
    }

    [Authorize]
    [HttpPut("perfil-casal/{id}")]
    public async Task<ActionResult<object>> AtualizarPerfilCasal(string id, [FromBody] AtualizarCasalDto dto)
    {
        var usuario = await _context.Usuarios
            .Find(u => u.Id == id && u.TipoConta == TipoConta.Casal)
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound();

        var update = Builders<Usuario>.Update;
        var updates = new List<UpdateDefinition<Usuario>>();
        var renda = dto.RendaMensalPessoa1 + dto.RendaMensalPessoa2;

        if (usuario.CasalInfo != null)
        {
            if (dto.NomeCompletoPessoa1 != null)
                updates.Add(update.Set(u => u.CasalInfo.NomeCompletoPessoa1, dto.NomeCompletoPessoa1));
            if (dto.DataNascimentoPessoa1.HasValue)
                updates.Add(update.Set(u => u.CasalInfo.DataNascimentoPessoa1, dto.DataNascimentoPessoa1.Value));
            if (dto.RendaMensalPessoa1.HasValue)
                updates.Add(update.Set(u => u.CasalInfo.RendaMensalPessoa1, dto.RendaMensalPessoa1.Value));

            if (dto.NomeCompletoPessoa2 != null)
                updates.Add(update.Set(u => u.CasalInfo.NomeCompletoPessoa2, dto.NomeCompletoPessoa2));
            if (dto.DataNascimentoPessoa2.HasValue)
                updates.Add(update.Set(u => u.CasalInfo.DataNascimentoPessoa2, dto.DataNascimentoPessoa2.Value));
            if (dto.RendaMensalPessoa2.HasValue)
                updates.Add(update.Set(u => u.CasalInfo.RendaMensalPessoa2, dto.RendaMensalPessoa2.Value));

            if (dto.DataCasamento.HasValue)
                updates.Add(update.Set(u => u.CasalInfo.DataCasamento, dto.DataCasamento.Value));

            updates.Add(update.Set(u => u.CasalInfo.UpdatedAt, DateTime.UtcNow));

            updates.Add(update.Set(u => u.RendaMensal, renda));   
        }

        if (updates.Any())
            await _context.Usuarios.UpdateOneAsync(u => u.Id == id, update.Combine(updates));

        var usuarioAtualizado = await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();
        return Ok(usuarioAtualizado);
    }

    [Authorize]
    [HttpPut("modo-escuro/{id}")]
    public async Task<IActionResult> AtualizarModoEscuro(string id, [FromBody] ModoEscuroDto dto)
    {
        var update = Builders<Usuario>.Update.Set(u => u.ModoEscuro, dto.ModoEscuro);
        var result = await _context.Usuarios.UpdateOneAsync(u => u.Id == id, update);

        if (result.MatchedCount == 0)
            return NotFound();

        return Ok(new { modoEscuro = dto.ModoEscuro });
    }

    [Authorize]
    [HttpPost("alterar-senha")]
    public async Task<IActionResult> AlterarSenha([FromBody] AlterarSenhaDto dto)
    {
        var usuario = await _authService.ObterUsuarioPorEmail(dto.Email);
        
        if (usuario != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuario.SenhaHash))
                return BadRequest(new { message = "Senha atual incorreta" });

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            var update = Builders<Usuario>.Update.Set(u => u.SenhaHash, novaSenhaHash);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuario.Id, update);
            
            return Ok(new { message = "Senha alterada com sucesso" });
        }

        var usuarioCasal = await _authService.ObterCasalPorEmail(dto.Email);
        
        if (usuarioCasal?.CasalInfo != null)
        {
            if (usuarioCasal.CasalInfo.EmailPessoa1 == dto.Email)
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuarioCasal.CasalInfo.SenhaHashPessoa1))
                    return BadRequest(new { message = "Senha atual incorreta" });

                var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
                var update = Builders<Usuario>.Update.Set(u => u.CasalInfo.SenhaHashPessoa1, novaSenhaHash);
                await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);
            }
            else if (usuarioCasal.CasalInfo.EmailPessoa2 == dto.Email)
            {
                if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuarioCasal.CasalInfo.SenhaHashPessoa2))
                    return BadRequest(new { message = "Senha atual incorreta" });

                var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
                var update = Builders<Usuario>.Update.Set(u => u.CasalInfo.SenhaHashPessoa2, novaSenhaHash);
                await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);
            }
            else
            {
                return NotFound();
            }

            return Ok(new { message = "Senha alterada com sucesso" });
        }

        return NotFound();
    }

    [Authorize]
    [HttpDelete("usuario/{id}")]
    public async Task<IActionResult> ExcluirConta(string id)
    {
        var result = await _context.Usuarios.DeleteOneAsync(u => u.Id == id);
        if (result.DeletedCount == 0)
            return NotFound();

        return Ok(new { message = "Conta excluída com sucesso" });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logout realizado com sucesso" });
    }

    #endregion
}