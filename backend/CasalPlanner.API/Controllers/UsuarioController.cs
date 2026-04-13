using Microsoft.AspNetCore.Mvc;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Services;
using CasalPlanner.API.Data;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CasalPlanner.API.Models.DTOs.CasalPlanner.API.Models.DTOs;

namespace CasalPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuarioController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<UsuarioController> _logger;
    private readonly MongoDbContext _context;

    public UsuarioController(
        IAuthService authService,
        ILogger<UsuarioController> logger,
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

    // ========== MÉTODOS DE MAPEAMENTO SEGUROS ==========

    private object MapearUsuarioIndividualParaResposta(Usuario usuario)
    {
        return new
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
        };
    }

    private object MapearUsuarioCasalParaResposta(Usuario usuario, string? pessoaQueLogou = null, string? emailLogado = null)
    {
        // Criar uma cópia segura do CasalInfo sem os hashes de senha
        var casalInfoSeguro = usuario.CasalInfo == null ? null : new
        {
            usuario.CasalInfo.NomeCompletoPessoa1,
            usuario.CasalInfo.EmailPessoa1,
            usuario.CasalInfo.CPFPessoa1,
            usuario.CasalInfo.DataNascimentoPessoa1,
            usuario.CasalInfo.RendaMensalPessoa1,
            usuario.CasalInfo.NomeCompletoPessoa2,
            usuario.CasalInfo.EmailPessoa2,
            usuario.CasalInfo.CPFPessoa2,
            usuario.CasalInfo.DataNascimentoPessoa2,
            usuario.CasalInfo.RendaMensalPessoa2,
            usuario.CasalInfo.CreatedAt,
            usuario.CasalInfo.UpdatedAt
        };

        return new
        {
            id = usuario.Id,
            tipoConta = "Casal",
            isCasal = true,
            rendaMensal = usuario.RendaMensal,
            casalInfo = casalInfoSeguro,
            modoEscuro = usuario.ModoEscuro,
            createdAt = usuario.CreatedAt,
            lastLoginAt = usuario.LastLoginAt
        };
    }

    // ========== ENDPOINTS PÚBLICOS (REGISTRO) ==========

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
            ModoEscuro = true
        });
    }

    [AllowAnonymous]
    [HttpPost("registrar-casal")]
    public async Task<ActionResult<UsuarioResponseDto>> RegistrarCasal([FromBody] RegistroCasalDto dto)
    {

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var usuario = await _authService.RegistrarCasal(dto);
        if (usuario == null)
            return BadRequest(new { message = "Um dos emails já está cadastrado" });

        await CriarCategoriasPadrao(usuario.Id!);

        var token = _authService.GerarTokenCasal(usuario, "pessoa1");

        var response = new UsuarioResponseDto
        {
            Id = usuario.Id!,
            TipoConta = "Casal",
            IsCasal = true,
            CreatedAt = usuario.CreatedAt,
            ModoEscuro = true,
            RendaMensal = usuario.RendaMensal,
            Token = token,

            // Pessoa 1
            NomeCompletoPessoa1 = usuario.CasalInfo?.NomeCompletoPessoa1,
            EmailPessoa1 = usuario.CasalInfo?.EmailPessoa1,
            CPFPessoa1 = usuario.CasalInfo?.CPFPessoa1,
            DataNascimentoPessoa1 = usuario.CasalInfo?.DataNascimentoPessoa1,
            RendaMensalPessoa1 = usuario.CasalInfo?.RendaMensalPessoa1,

            // Pessoa 2
            NomeCompletoPessoa2 = usuario.CasalInfo?.NomeCompletoPessoa2,
            EmailPessoa2 = usuario.CasalInfo?.EmailPessoa2,
            CPFPessoa2 = usuario.CasalInfo?.CPFPessoa2,
            DataNascimentoPessoa2 = usuario.CasalInfo?.DataNascimentoPessoa2,
            RendaMensalPessoa2 = usuario.CasalInfo?.RendaMensalPessoa2,
        };

        return Ok(response);
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
            // Safely access CasalInfo with null-conditional operator
            var casalInfo = usuario.CasalInfo;

            return Ok(new
            {
                usuario.Id,
                usuario.NomeCompleto,
                usuario.Email,
                usuario.TipoConta,
                usuario.IsCasal,
                usuario.ModoEscuro,
                usuario.RendaMensal,
                CasalInfo = casalInfo == null ? null : new
                {
                    casalInfo.NomeCompletoPessoa1,
                    casalInfo.EmailPessoa1,
                    casalInfo.CPFPessoa1,
                    DataNascimentoPessoa1 = casalInfo.DataNascimentoPessoa1.ToString("yyyy-MM-dd"),
                    casalInfo.RendaMensalPessoa1,
                    casalInfo.NomeCompletoPessoa2,
                    casalInfo.EmailPessoa2,
                    casalInfo.CPFPessoa2,
                    DataNascimentoPessoa2 = casalInfo.DataNascimentoPessoa2.ToString("yyyy-MM-dd"),
                    casalInfo.RendaMensalPessoa2,
                    casalInfo.CreatedAt
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

    [Authorize]
    [HttpPut("perfil-casal/{id}")]
    public async Task<ActionResult<object>> AtualizarPerfilCasal(string id, [FromBody] AtualizarCasalDto dto)
    {
        if (id != GetUsuarioId())
            return Forbid();

        var usuario = await _context.Usuarios
            .Find(u => u.Id == id && u.TipoConta == TipoConta.Casal)
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound();

        // Check if CasalInfo exists
        if (usuario.CasalInfo == null)
            return BadRequest(new { message = "Informações do casal não encontradas" });

        var update = Builders<Usuario>.Update;
        var updates = new List<UpdateDefinition<Usuario>>();

        var rendaPessoa1 = dto.RendaMensalPessoa1 ?? usuario.CasalInfo.RendaMensalPessoa1 ?? 0;
        var rendaPessoa2 = dto.RendaMensalPessoa2 ?? usuario.CasalInfo.RendaMensalPessoa2 ?? 0;
        var rendaTotal = rendaPessoa1 + rendaPessoa2;

        // Now safely access CasalInfo properties since we've verified it's not null
        if (!string.IsNullOrWhiteSpace(dto.NomeCompletoPessoa1))
            updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa1, dto.NomeCompletoPessoa1));

        if (dto.DataNascimentoPessoa1.HasValue)
            updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa1, dto.DataNascimentoPessoa1.Value));

        if (dto.RendaMensalPessoa1.HasValue)
            updates.Add(update.Set(u => u.CasalInfo!.RendaMensalPessoa1, dto.RendaMensalPessoa1.Value));

        if (!string.IsNullOrWhiteSpace(dto.NomeCompletoPessoa2))
            updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa2, dto.NomeCompletoPessoa2));

        if (dto.DataNascimentoPessoa2.HasValue)
            updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa2, dto.DataNascimentoPessoa2.Value));

        if (dto.RendaMensalPessoa2.HasValue)
            updates.Add(update.Set(u => u.CasalInfo!.RendaMensalPessoa2, dto.RendaMensalPessoa2.Value));

        updates.Add(update.Set(u => u.CasalInfo!.UpdatedAt, DateTime.UtcNow));

        if (dto.RendaMensalPessoa1.HasValue || dto.RendaMensalPessoa2.HasValue)
        {
            updates.Add(update.Set(u => u.RendaMensal, rendaTotal));
        }

        if (updates.Any())
        {
            await _context.Usuarios.UpdateOneAsync(
                u => u.Id == id,
                update.Combine(updates)
            );
        }

        var usuarioAtualizado = await _context.Usuarios
            .Find(u => u.Id == id)
            .FirstOrDefaultAsync();

        if (usuarioAtualizado == null)
            return NotFound();

        // Safely access CasalInfo for the response
        var casalInfo = usuarioAtualizado.CasalInfo;

        return Ok(new
        {
            usuarioAtualizado.Id,
            usuarioAtualizado.NomeCompleto,
            usuarioAtualizado.Email,
            usuarioAtualizado.TipoConta,
            usuarioAtualizado.IsCasal,
            usuarioAtualizado.ModoEscuro,
            usuarioAtualizado.RendaMensal,
            CasalInfo = new
            {
                NomeCompletoPessoa1 = casalInfo?.NomeCompletoPessoa1 ?? "",
                EmailPessoa1 = casalInfo?.EmailPessoa1 ?? "",
                CPFPessoa1 = casalInfo?.CPFPessoa1 ?? "",
                DataNascimentoPessoa1 = casalInfo?.DataNascimentoPessoa1.ToString("yyyy-MM-dd"),
                RendaMensalPessoa1 = casalInfo?.RendaMensalPessoa1 ?? 0,
                NomeCompletoPessoa2 = casalInfo?.NomeCompletoPessoa2 ?? "",
                EmailPessoa2 = casalInfo?.EmailPessoa2 ?? "",
                CPFPessoa2 = casalInfo?.CPFPessoa2 ?? "",
                DataNascimentoPessoa2 = casalInfo?.DataNascimentoPessoa2.ToString("yyyy-MM-dd"),
                RendaMensalPessoa2 = casalInfo?.RendaMensalPessoa2 ?? 0,
                CreatedAt = casalInfo?.CreatedAt,
                UpdatedAt = casalInfo?.UpdatedAt
            }
        });

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

        // Check if usuarioCasal exists and has CasalInfo
        if (usuarioCasal?.CasalInfo == null)
            return NotFound();

        // Now safely access CasalInfo properties
        if (usuarioCasal.CasalInfo.EmailPessoa1 == dto.Email)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuarioCasal.CasalInfo.SenhaHashPessoa1))
                return BadRequest(new { message = "Senha atual incorreta" });

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            var update = Builders<Usuario>.Update.Set(u => u.CasalInfo!.SenhaHashPessoa1, novaSenhaHash);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);
        }
        else if (usuarioCasal.CasalInfo.EmailPessoa2 == dto.Email)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuarioCasal.CasalInfo.SenhaHashPessoa2))
                return BadRequest(new { message = "Senha atual incorreta" });

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            var update = Builders<Usuario>.Update.Set(u => u.CasalInfo!.SenhaHashPessoa2, novaSenhaHash);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);
        }
        else
        {
            return NotFound();
        }

        return Ok(new { message = "Senha alterada com sucesso" });
    }

    [Authorize]
    [HttpPut("perfil")]
    public async Task<ActionResult<object>> AtualizarPerfil([FromBody] AtualizarPerfilDto dto)
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
            return Unauthorized();

        var usuario = await _context.Usuarios
            .Find(u => u.Id == usuarioId && u.TipoConta == TipoConta.Individual)
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound(new { message = "Usuário não encontrado ou não é conta individual" });

        var update = Builders<Usuario>.Update;
        var updates = new List<UpdateDefinition<Usuario>>();

        // Atualiza apenas os campos que vieram no DTO
        if (!string.IsNullOrWhiteSpace(dto.NomeCompleto))
            updates.Add(update.Set(u => u.NomeCompleto, dto.NomeCompleto));

        if (!string.IsNullOrWhiteSpace(dto.CPF))
            updates.Add(update.Set(u => u.CPF, dto.CPF));

        if (dto.DataNascimento.HasValue)
            updates.Add(update.Set(u => u.DataNascimento, dto.DataNascimento.Value));

        if (dto.RendaMensal.HasValue)
            updates.Add(update.Set(u => u.RendaMensal, dto.RendaMensal.Value));

        if (!updates.Any())
            return Ok(new { message = "Nenhum campo para atualizar", usuario });

        await _context.Usuarios.UpdateOneAsync(
            u => u.Id == usuarioId,
            update.Combine(updates)
        );

        var usuarioAtualizado = await _context.Usuarios
            .Find(u => u.Id == usuarioId)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            usuarioAtualizado?.Id,
            usuarioAtualizado?.NomeCompleto,
            usuarioAtualizado?.Email,
            usuarioAtualizado?.CPF,
            DataNascimento = usuarioAtualizado?.DataNascimento?.ToString("yyyy-MM-dd"),
            usuarioAtualizado?.RendaMensal,
            usuarioAtualizado?.ModoEscuro,
            usuarioAtualizado?.TipoConta,
            usuarioAtualizado?.IsCasal
        });
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
}