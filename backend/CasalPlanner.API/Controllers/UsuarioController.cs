using Microsoft.AspNetCore.Mvc;
using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Services;
using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.API.Helpers;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using CasalPlanner.Domain.Exceptions;
namespace CasalPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuarioController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<UsuarioController> _logger;
    private readonly MongoDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IWebHostEnvironment _environment;

    public UsuarioController(
    IAuthService authService,
    ILogger<UsuarioController> logger,
    MongoDbContext context,
    IWebHostEnvironment environment,
    IEmailService emailService) // ADICIONE ESTE PARÂMETRO
    {
        _authService = authService;
        _logger = logger;
        _context = context;
        _environment = environment;
        _emailService = emailService; // ADICIONE ESTA LINHA
    }

    private void SetAuthCookies(string token, string refreshToken)
    {
        var sameSite = _environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None;
        var secure = !_environment.IsDevelopment();
        Response.Cookies.Append("cp_token", token, new CookieOptions { HttpOnly = true, Secure = secure, SameSite = sameSite, Expires = DateTime.UtcNow.AddDays(7) });
        Response.Cookies.Append("cp_refresh_token", refreshToken, new CookieOptions { HttpOnly = true, Secure = secure, SameSite = sameSite, Path = "/api/auth", Expires = DateTime.UtcNow.AddDays(30) });
    }

    private string GetUsuarioId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? string.Empty;
    }

    // Lê o e-mail do usuário autenticado a partir do próprio token JWT,
    // em vez de confiar em qualquer valor enviado pelo cliente no corpo da requisição.
    private string GetUsuarioEmailAutenticado()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Email)?.Value
            ?? string.Empty;
    }

    private async Task CriarCategoriasPadrao(string usuarioId)
    {
        var categoriasPadrao = new List<Categoria>
        {
            new() {
                Nome = "Cozinha",
                Bg = "#2c5e2c",
                Icon = "Utensils",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Sala",
                Bg = "#b84a2c",
                Icon = "Armchair",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Quarto",
                Bg = "#2c5280",
                Icon = "BedDouble",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Banheiro",
                Bg = "#6b5ea8",
                Icon = "Bath",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            },
            new() {
                Nome = "Lavanderia",
                Bg = "#97266d",
                Icon = "Droplet",
                IsPadrao = true,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            }
        };

        await _context.Categorias.InsertManyAsync(categoriasPadrao);

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

        // ENVIAR EMAIL DE BOAS-VINDAS (não interrompe o registro se falhar)
        try
        {
            await _emailService.EnviarEmailBoasVindas(usuario.Email!, usuario.NomeCompleto ?? "Usuário", false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar email de boas-vindas para {Email}", usuario.Email);
        }

        var token = _authService.GerarToken(usuario);
        var refreshToken = await _authService.GerarERegistrarRefreshToken(usuario.Id!);
        SetAuthCookies(token, refreshToken.Token);

        // Retornar dados completos do usuário
        return Ok(new
        {
            success = true,
            message = "Registro realizado com sucesso",
            usuario = UsuarioMapper.MapearIndividual(usuario)
        });
    }

    [AllowAnonymous]
    [HttpPost("registrar-casal")]
    public async Task<ActionResult<object>> RegistrarCasal([FromBody] RegistroCasalDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Usuario? usuario;
        try
        {
            usuario = await _authService.RegistrarCasal(dto);
        }
        catch (EmailsIguaisException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        if (usuario == null)
            return BadRequest(new { message = "Um dos emails já está cadastrado" });

        await CriarCategoriasPadrao(usuario.Id!);

        // ENVIAR EMAIL DE BOAS-VINDAS PARA AMBAS AS PESSOAS (não interrompe o registro se falhar)
        if (usuario.CasalInfo != null)
        {
            try
            {
                await _emailService.EnviarEmailBoasVindas(
                    usuario.CasalInfo.EmailPessoa1,
                    usuario.CasalInfo.NomeCompletoPessoa1 ?? "Usuário",
                    true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de boas-vindas para pessoa1: {Email}", usuario.CasalInfo.EmailPessoa1);
            }

            try
            {
                await _emailService.EnviarEmailBoasVindas(
                    usuario.CasalInfo.EmailPessoa2,
                    usuario.CasalInfo.NomeCompletoPessoa2 ?? "Usuário",
                    true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de boas-vindas para pessoa2: {Email}", usuario.CasalInfo.EmailPessoa2);
            }
        }

        var token = _authService.GerarTokenCasal(usuario, "pessoa1");
        var refreshToken = await _authService.GerarERegistrarRefreshToken(usuario.Id!, "pessoa1");
        SetAuthCookies(token, refreshToken.Token);

        // Retornar dados completos do casal
        return Ok(new
        {
            success = true,
            message = "Registro de casal realizado com sucesso",
            usuario = UsuarioMapper.MapearCasal(usuario, "pessoa1")
        });
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

        var usuarioMapeado = usuario.TipoConta == TipoConta.Casal
            ? UsuarioMapper.MapearCasal(usuario, User.FindFirst("PessoaLogada")?.Value)
            : UsuarioMapper.MapearIndividual(usuario);

        return Ok(usuarioMapeado);
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

        // Now safely access CasalInfo properties since we've verified it's not null
        if (!string.IsNullOrWhiteSpace(dto.NomeCompletoPessoa1))
            updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa1, dto.NomeCompletoPessoa1));

        if (dto.DataNascimentoPessoa1.HasValue)
            updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa1, dto.DataNascimentoPessoa1.Value));

        if (!string.IsNullOrWhiteSpace(dto.NomeCompletoPessoa2))
            updates.Add(update.Set(u => u.CasalInfo!.NomeCompletoPessoa2, dto.NomeCompletoPessoa2));

        if (dto.DataNascimentoPessoa2.HasValue)
            updates.Add(update.Set(u => u.CasalInfo!.DataNascimentoPessoa2, dto.DataNascimentoPessoa2.Value));

        updates.Add(update.Set(u => u.CasalInfo!.UpdatedAt, DateTime.UtcNow));

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
            CasalInfo = new
            {
                NomeCompletoPessoa1 = casalInfo?.NomeCompletoPessoa1 ?? "",
                EmailPessoa1 = casalInfo?.EmailPessoa1 ?? "",
                DataNascimentoPessoa1 = casalInfo?.DataNascimentoPessoa1?.ToString("yyyy-MM-dd"),
                NomeCompletoPessoa2 = casalInfo?.NomeCompletoPessoa2 ?? "",
                EmailPessoa2 = casalInfo?.EmailPessoa2 ?? "",
                DataNascimentoPessoa2 = casalInfo?.DataNascimentoPessoa2?.ToString("yyyy-MM-dd"),
                CreatedAt = casalInfo?.CreatedAt,
                UpdatedAt = casalInfo?.UpdatedAt
            }
        });

    }

    [Authorize]
    [HttpPut("modo-escuro/{id}")]
    public async Task<IActionResult> AtualizarModoEscuro(string id, [FromBody] ModoEscuroDto dto)
    {
        if (id != GetUsuarioId())
            return Forbid();

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
        // CORREÇÃO DE SEGURANÇA: o e-mail da conta a ser alterada NUNCA deve vir
        // do corpo da requisição (dto.Email), pois isso permite que qualquer usuário
        // autenticado tente trocar a senha de QUALQUER conta (IDOR), bastando saber
        // a senha atual da vítima. O e-mail correto é sempre o do token JWT do
        // próprio usuário logado.
        var emailAutenticado = GetUsuarioEmailAutenticado();

        if (string.IsNullOrEmpty(emailAutenticado))
            return Unauthorized(new { message = "Não foi possível identificar o usuário autenticado" });

        var usuario = await _authService.ObterUsuarioPorEmail(emailAutenticado);

        if (usuario != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuario.SenhaHash))
                return BadRequest(new { message = "Senha atual incorreta" });

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            var update = Builders<Usuario>.Update.Set(u => u.SenhaHash, novaSenhaHash);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuario.Id, update);

            // Enviar email de aviso
            await _emailService.EnviarAvisoSenhaAlterada(usuario.Email!, usuario.NomeCompleto ?? "Usuário");

            return Ok(new { message = "Senha alterada com sucesso" });
        }

        var usuarioCasal = await _authService.ObterCasalPorEmail(emailAutenticado);

        if (usuarioCasal?.CasalInfo == null)
            return NotFound();

        if (usuarioCasal.CasalInfo.EmailPessoa1 == emailAutenticado)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuarioCasal.CasalInfo.SenhaHashPessoa1))
                return BadRequest(new { message = "Senha atual incorreta" });

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            var update = Builders<Usuario>.Update.Set(u => u.CasalInfo!.SenhaHashPessoa1, novaSenhaHash);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);

            // Enviar email de aviso para a pessoa que alterou
            await _emailService.EnviarAvisoSenhaAlterada(usuarioCasal.CasalInfo.EmailPessoa1, usuarioCasal.CasalInfo.NomeCompletoPessoa1 ?? "Usuário");

            // Enviar email de aviso para o parceiro
            if (!string.IsNullOrEmpty(usuarioCasal.CasalInfo.EmailPessoa2))
            {
                await _emailService.EnviarAvisoSenhaAlterada(
                    usuarioCasal.CasalInfo.EmailPessoa2,
                    usuarioCasal.CasalInfo.NomeCompletoPessoa2 ?? "Usuário");
            }
        }
        else if (usuarioCasal.CasalInfo.EmailPessoa2 == emailAutenticado)
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuarioCasal.CasalInfo.SenhaHashPessoa2))
                return BadRequest(new { message = "Senha atual incorreta" });

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            var update = Builders<Usuario>.Update.Set(u => u.CasalInfo!.SenhaHashPessoa2, novaSenhaHash);
            await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioCasal.Id, update);

            // Enviar email de aviso para a pessoa que alterou
            await _emailService.EnviarAvisoSenhaAlterada(usuarioCasal.CasalInfo.EmailPessoa2, usuarioCasal.CasalInfo.NomeCompletoPessoa2 ?? "Usuário");

            // Enviar email de aviso para o parceiro
            if (!string.IsNullOrEmpty(usuarioCasal.CasalInfo.EmailPessoa1))
            {
                await _emailService.EnviarAvisoSenhaAlterada(
                    usuarioCasal.CasalInfo.EmailPessoa1,
                    usuarioCasal.CasalInfo.NomeCompletoPessoa1 ?? "Usuário");
            }
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
            .Find(u => u.Id == usuarioId)
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound(new { message = "Usuário não encontrado" });

        var update = Builders<Usuario>.Update;
        var updates = new List<UpdateDefinition<Usuario>>();

        if (usuario.TipoConta == TipoConta.Individual)
        {
            if (!string.IsNullOrWhiteSpace(dto.NomeCompleto))
                updates.Add(update.Set(u => u.NomeCompleto, dto.NomeCompleto));

            if (dto.DataNascimento.HasValue)
                updates.Add(update.Set(u => u.DataNascimento, dto.DataNascimento.Value));
        }

        if (dto.MetaGlobalEnxoval.HasValue)
            updates.Add(update.Set(u => u.MetaGlobalEnxoval, dto.MetaGlobalEnxoval.Value));

        if (!updates.Any())
            return Ok(new { message = "Nenhum campo para atualizar" });

        await _context.Usuarios.UpdateOneAsync(
            u => u.Id == usuarioId,
            update.Combine(updates)
        );

        var usuarioAtualizado = await _context.Usuarios
            .Find(u => u.Id == usuarioId)
            .FirstOrDefaultAsync();

        var usuarioMapeado = usuarioAtualizado!.TipoConta == TipoConta.Casal
            ? UsuarioMapper.MapearCasal(usuarioAtualizado, User.FindFirst("PessoaLogada")?.Value)
            : UsuarioMapper.MapearIndividual(usuarioAtualizado);

        return Ok(usuarioMapeado);
    }


    [Authorize]
    [HttpDelete("usuario/{id}")]
    public async Task<IActionResult> ExcluirConta(string id)
    {
        if (id != GetUsuarioId()) return Forbid();

        // Buscar usuário antes de excluir para ter os dados do email
        var usuario = await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound();

        // Salvar dados para enviar email após exclusão
        var email = usuario.Email;
        var nome = usuario.NomeCompleto ?? "Usuário";
        var isCasal = usuario.IsCasal;
        var casalInfo = usuario.CasalInfo;

        // Deletar itens e categorias do usuário antes de deletar o usuário
        await Task.WhenAll(
            _context.Itens.DeleteManyAsync(i => i.UsuarioId == id),
            _context.Categorias.DeleteManyAsync(c => c.UsuarioId == id)
        );

        var result = await _context.Usuarios.DeleteOneAsync(u => u.Id == id);

        if (result.DeletedCount == 0)
            return NotFound();

        // ENVIAR EMAIL DE CONFIRMAÇÃO DE EXCLUSÃO (ASSÍNCRONO, NÃO BLOQUEIA A RESPOSTA)
        {
            try
            {
                if (!string.IsNullOrEmpty(email))
                {
                    // Para conta individual
                    await _emailService.EnviarEmailExclusaoConta(email, nome, false);
                }
                else if (isCasal && casalInfo != null)
                {
                    // Para conta casal, enviar para ambas as pessoas
                    if (!string.IsNullOrEmpty(casalInfo.EmailPessoa1))
                        await _emailService.EnviarEmailExclusaoConta(casalInfo.EmailPessoa1, casalInfo.NomeCompletoPessoa1 ?? "Usuário", true);

                    if (!string.IsNullOrEmpty(casalInfo.EmailPessoa2))
                        await _emailService.EnviarEmailExclusaoConta(casalInfo.EmailPessoa2, casalInfo.NomeCompletoPessoa2 ?? "Usuário", true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de exclusão para {Email}", email);
            }
        }

        return Ok(new { message = "Conta excluída com sucesso" });
    }

    // ========== CONVITE DE PARCEIRO ==========

    [Authorize]
    [HttpPost("convite")]
    public async Task<ActionResult<ConviteResponseDto>> CriarConvite([FromBody] CriarConviteDto dto)
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
            return Unauthorized();

        var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
        if (usuario == null)
            return NotFound();

        // Verificar se já é conta casal
        if (usuario.TipoConta == TipoConta.Casal)
            return BadRequest(new { message = "Esta conta já é uma conta de casal" });

        // Verificar se o email do parceiro já está cadastrado
        var parceiroExistente = await _context.Usuarios
            .Find(u => u.Email == dto.EmailParceiro)
            .FirstOrDefaultAsync();
        
        if (parceiroExistente != null)
            return BadRequest(new { message = "Este email já está cadastrado no sistema" });

        // Gerar token de convite
        var token = Guid.NewGuid().ToString("N");
        var expiraEm = DateTime.UtcNow.AddDays(7); // Convite válido por 7 dias

        // Salvar convite no usuário
        var update = Builders<Usuario>.Update
            .Set(u => u.ConviteParceiroToken, token)
            .Set(u => u.ConviteParceiroEmail, dto.EmailParceiro)
            .Set(u => u.ConviteParceiroExpiraEm, expiraEm);

        await _context.Usuarios.UpdateOneAsync(u => u.Id == usuarioId, update);

        // Gerar link de convite
        var envFrontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
        var frontendUrl = !string.IsNullOrEmpty(envFrontendUrl) ? envFrontendUrl : "https://casalplanner.vercel.app";
        var linkConvite = $"{frontendUrl.TrimEnd('/')}/convite?token={token}";

        // Enviar email de convite
        try
        {
            var enviado = await _emailService.EnviarEmailConviteParceiro(
                dto.EmailParceiro,
                usuario.NomeCompleto ?? "Um usuário",
                linkConvite,
                expiraEm);

            if (!enviado)
            {
                return BadRequest(new { message = "Falha ao enviar o email de convite (modo sandbox?). Verifique o endereço." });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar email de convite para {Email}", dto.EmailParceiro);
            return BadRequest(new { message = "Falha ao enviar o email de convite." });
        }

        return Ok(new ConviteResponseDto
        {
            Token = token,
            LinkConvite = linkConvite,
            ExpiraEm = expiraEm
        });
    }

    [AllowAnonymous]
    [HttpGet("convite/{token}")]
    public async Task<ActionResult> ObterInfoConvite(string token)
    {
        var usuario = await _context.Usuarios
            .Find(u => u.ConviteParceiroToken == token)
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound(new { message = "Convite não encontrado ou inválido" });

        if (usuario.ConviteParceiroExpiraEm < DateTime.UtcNow)
            return BadRequest(new { message = "Convite expirado" });

        return Ok(new { 
            nomeConvidante = usuario.NomeCompleto ?? "Alguém",
            emailConvidante = usuario.Email ?? string.Empty
        });
    }

    [Authorize]
    [HttpPost("aceitar-convite")]
    public async Task<ActionResult> AceitarConvite([FromBody] AceitarConviteDto dto)
    {
        var usuarioIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(usuarioIdClaim)) return Unauthorized();
        
        var invitedUser = await _context.Usuarios.Find(u => u.Id == usuarioIdClaim).FirstOrDefaultAsync();
        if (invitedUser == null) return Unauthorized();

        if (invitedUser.TipoConta == TipoConta.Casal)
            return BadRequest(new { message = "Você já está em uma conta de casal e não pode ser vinculado novamente." });

        // Buscar usuário que convidou (A)
        var inviter = await _context.Usuarios
            .Find(u => u.ConviteParceiroToken == dto.Token)
            .FirstOrDefaultAsync();

        if (inviter == null)
            return NotFound(new { message = "Convite não encontrado" });

        if (inviter.ConviteParceiroExpiraEm < DateTime.UtcNow)
            return BadRequest(new { message = "Convite expirado" });

        if (inviter.TipoConta == TipoConta.Casal)
            return BadRequest(new { message = "Este convite já foi aceito" });

        var emailParceiro = inviter.ConviteParceiroEmail;
        if (string.IsNullOrEmpty(emailParceiro))
            return BadRequest(new { message = "Email do parceiro não encontrado no convite" });

        // Criar estrutura de casal com os dados de B (invitedUser)
        var casalInfo = new CasalInfo
        {
            NomeCompletoPessoa1 = inviter.NomeCompleto ?? string.Empty,
            EmailPessoa1 = inviter.Email ?? string.Empty,
            DataNascimentoPessoa1 = inviter.DataNascimento,
            SenhaHashPessoa1 = inviter.SenhaHash ?? string.Empty,
            
            NomeCompletoPessoa2 = invitedUser.NomeCompleto ?? string.Empty,
            EmailPessoa2 = invitedUser.Email ?? emailParceiro,
            DataNascimentoPessoa2 = invitedUser.DataNascimento,
            SenhaHashPessoa2 = invitedUser.SenhaHash ?? string.Empty,
            
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Atualizar inviter
        var updateInviter = Builders<Usuario>.Update
            .Set(u => u.TipoConta, TipoConta.Casal)
            .Set(u => u.IsCasal, true)
            .Set(u => u.CasalInfo, casalInfo)
            .Set(u => u.ConviteParceiroToken, null)
            .Set(u => u.ConviteParceiroEmail, null)
            .Set(u => u.ConviteParceiroExpiraEm, null);

        await _context.Usuarios.UpdateOneAsync(u => u.Id == inviter.Id, updateInviter);

        // Migrar dados se solicitado
        if (dto.MigrarDados)
        {
            var updateItems = Builders<Item>.Update.Set(i => i.UsuarioId, inviter.Id);
            await _context.Itens.UpdateManyAsync(i => i.UsuarioId == invitedUser.Id, updateItems);

            var updatePrecos = Builders<RegistroPrecoFoto>.Update.Set(rp => rp.UsuarioId, inviter.Id);
            await _context.RegistrosPreco.UpdateManyAsync(rp => rp.UsuarioId == invitedUser.Id, updatePrecos);
        }

        // Deletar a conta antiga de B
        await _context.Usuarios.DeleteOneAsync(u => u.Id == invitedUser.Id);

        // Gerar novo token para B (agora como pessoa2 na conta de A)
        var updatedInviter = await _context.Usuarios.Find(u => u.Id == inviter.Id).FirstOrDefaultAsync();
        var newToken = _authService.GerarTokenCasal(updatedInviter!, "pessoa2");
        var refreshToken = await _authService.GerarERegistrarRefreshToken(updatedInviter!.Id!, "pessoa2");
        SetAuthCookies(newToken, refreshToken.Token);

        return Ok(new { 
            message = "Contas vinculadas com sucesso!",
            token = newToken,
            usuario = UsuarioMapper.MapearCasal(updatedInviter, "pessoa2")
        });
    }

    // ========== PUSH NOTIFICATIONS ==========

    [HttpGet("push/vapidPublicKey")]
    [AllowAnonymous]
    public IActionResult GetVapidPublicKey([FromServices] IConfiguration config)
    {
        var publicKey = config["Vapid:PublicKey"];
        if (string.IsNullOrEmpty(publicKey))
            return NotFound(new { message = "VAPID configuration is missing." });
        return Ok(new { publicKey });
    }

    [HttpPost("push/subscribe")]
    [Authorize]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionDto dto)
    {
        var uid = GetUsuarioId();
        if (string.IsNullOrEmpty(uid)) return Unauthorized();

        var usuario = await _authService.ObterUsuarioPorId(uid);
        if (usuario == null) return NotFound();

        // Check who is logged in (Pessoa 1 or Pessoa 2) by email
        var email = GetUsuarioEmailAutenticado();
        int pessoaId = 1;
        if (usuario.IsCasal && usuario.CasalInfo != null && usuario.CasalInfo.EmailPessoa2 == email)
        {
            pessoaId = 2;
        }

        // Remove if exists
        usuario.PushSubscriptions ??= new List<PushSubscriptionInfo>();
        usuario.PushSubscriptions.RemoveAll(p => p.Endpoint == dto.Endpoint);

        usuario.PushSubscriptions.Add(new PushSubscriptionInfo
        {
            Endpoint = dto.Endpoint,
            P256dh = dto.P256dh,
            Auth = dto.Auth,
            PessoaId = pessoaId
        });

        var update = Builders<Usuario>.Update.Set(u => u.PushSubscriptions, usuario.PushSubscriptions);
        await _context.Usuarios.UpdateOneAsync(u => u.Id == uid, update);

        return Ok(new { message = "Push subscription saved." });
    }
}
