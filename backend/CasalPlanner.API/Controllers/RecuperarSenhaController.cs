// Controllers/RecuperarSenhaController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Services;
using CasalPlanner.API.Data;
using MongoDB.Driver;
using System.Security.Cryptography;

namespace CasalPlanner.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class RecuperarSenhaController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmailService _emailService;
    private readonly ILogger<RecuperarSenhaController> _logger;
    private readonly MongoDbContext _context;

    public RecuperarSenhaController(
        IAuthService authService,
        IEmailService emailService,
        ILogger<RecuperarSenhaController> logger,
        MongoDbContext context)
    {
        _authService = authService;
        _emailService = emailService;
        _logger = logger;
        _context = context;
    }

    /// <summary>
    /// Passo 1: Solicitar código de recuperação
    /// </summary>
    [HttpPost("esqueci-senha")]
    public async Task<IActionResult> EsqueciSenha([FromBody] EsqueciSenhaDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Email inválido",
                errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
            });
        }

        var email = request.Email.Trim().ToLowerInvariant();

        // 1. Verificar se é conta individual
        var usuarioIndividual = await _authService.ObterUsuarioPorEmail(email);

        if (usuarioIndividual != null)
        {
            return await ProcessarRecuperacaoIndividual(usuarioIndividual, email);
        }

        // 2. Verificar se é conta casal
        var usuarioCasal = await _authService.ObterCasalPorEmail(email);

        if (usuarioCasal != null && usuarioCasal.CasalInfo != null)
        {
            var pessoa = usuarioCasal.CasalInfo.EmailPessoa1 == email ? "pessoa1" : "pessoa2";
            return await ProcessarRecuperacaoCasal(usuarioCasal, email, pessoa);
        }

        // 3. Email não encontrado
        _logger.LogWarning("Tentativa de recuperação para email não cadastrado: {Email}", email);

        return Ok(new
        {
            success = true,
            message = "Se o email estiver cadastrado, você receberá um código de verificação."
        });
    }

    /// <summary>
    /// Processar recuperação para conta individual
    /// </summary>
    private async Task<IActionResult> ProcessarRecuperacaoIndividual(Usuario usuario, string email)
    {
        // Gerar código de 6 dígitos
        var codigo = GerarCodigoVerificacao();
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        // Salvar código no banco
        var salvou = await _authService.SalvarCodigoRedefinicao(usuario.Id!, codigo, expiresAt);

        if (!salvou)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Erro ao processar solicitação",
                code = "DATABASE_ERROR"
            });
        }

        // Enviar email
        var nome = usuario.NomeCompleto ?? "";
        var emailEnviado = await _emailService.EnviarCodigoRedefinicaoSenha(email, codigo, nome);

        if (!emailEnviado)
        {
            _logger.LogError("Falha ao enviar email para {Email}", email);
            return StatusCode(503, new
            {
                success = false,
                message = "Erro ao enviar email. Tente novamente.",
                code = "EMAIL_SEND_ERROR"
            });
        }

        _logger.LogInformation("Código enviado para conta individual: {Email}", email);

        return Ok(new
        {
            success = true,
            message = "Se o email estiver cadastrado, você receberá um código de verificação."
        });
    }

    /// <summary>
    /// Processar recuperação para conta casal
    /// </summary>
    private async Task<IActionResult> ProcessarRecuperacaoCasal(Usuario usuario, string email, string pessoa)
    {
        // Gerar código de 6 dígitos
        var codigo = GerarCodigoVerificacao();
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        // Salvar código no banco
        var salvou = await _authService.SalvarCodigoRedefinicaoCasal(usuario.Id!, pessoa, codigo, expiresAt);

        if (!salvou)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Erro ao processar solicitação",
                code = "DATABASE_ERROR"
            });
        }

        // Obter nome da pessoa
        var nome = pessoa == "pessoa1"
            ? usuario.CasalInfo?.NomeCompletoPessoa1 ?? ""
            : usuario.CasalInfo?.NomeCompletoPessoa2 ?? "";

        // Enviar email
        var emailEnviado = await _emailService.EnviarCodigoRedefinicaoSenha(email, codigo, nome);

        if (!emailEnviado)
        {
            _logger.LogError("Falha ao enviar email para {Email}", email);
            return StatusCode(503, new
            {
                success = false,
                message = "Erro ao enviar email. Tente novamente.",
                code = "EMAIL_SEND_ERROR"
            });
        }

        _logger.LogInformation("Código enviado para conta casal: {Email} ({Pessoa})", email, pessoa);

        return Ok(new
        {
            success = true,
            message = "Se o email estiver cadastrado, você receberá um código de verificação."
        });
    }

    /// <summary>
    /// Passo 2: Validar código recebido
    /// </summary>
    [HttpPost("validar-codigo")]
    public async Task<IActionResult> ValidarCodigo([FromBody] ValidarCodigoDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Código inválido",
                code = "INVALID_CODE_FORMAT"
            });
        }

        var codigo = request.Codigo.Trim();

        // 1. Verificar se código pertence a conta individual
        var usuarioIndividual = await _authService.ObterUsuarioPorCodigo(codigo);

        if (usuarioIndividual != null)
        {
            return await ProcessarValidacaoIndividual(usuarioIndividual, codigo);
        }

        // 2. Verificar se código pertence a conta casal
        var usuarioCasal = await _authService.ObterCasalPorCodigo(codigo);

        if (usuarioCasal != null && usuarioCasal.CasalInfo != null)
        {
            // Descobrir qual pessoa está validando
            string pessoa;
            if (usuarioCasal.CasalInfo.ResetCodePessoa1 == codigo)
                pessoa = "pessoa1";
            else if (usuarioCasal.CasalInfo.ResetCodePessoa2 == codigo)
                pessoa = "pessoa2";
            else
                pessoa = "";

            return await ProcessarValidacaoCasal(usuarioCasal, codigo, pessoa);
        }

        // 3. Código inválido
        return BadRequest(new
        {
            success = false,
            message = "Código inválido ou expirado",
            code = "INVALID_CODE"
        });
    }

    /// <summary>
    /// Processar validação para conta individual
    /// </summary>
    private async Task<IActionResult> ProcessarValidacaoIndividual(Usuario usuario, string codigo)
    {
        // Verificar se código é válido
        var codigoValido = await _authService.VerificarCodigoRedefinicao(usuario.Id!, codigo);

        if (!codigoValido)
        {
            return BadRequest(new
            {
                success = false,
                message = "Código inválido ou expirado",
                code = "INVALID_CODE"
            });
        }

        // Gerar token de redefinição
        var token = GerarTokenUnico();
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        // Salvar token
        var salvou = await _authService.SalvarTokenRedefinicao(usuario.Id!, token, expiresAt);

        if (!salvou)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Erro ao processar validação",
                code = "DATABASE_ERROR"
            });
        }

        _logger.LogInformation("Código validado para conta individual: {Email}", usuario.Email);

        return Ok(new
        {
            success = true,
            message = "Código válido!",
            token = token,
            tipoConta = "individual"
        });
    }

    /// <summary>
    /// Processar validação para conta casal
    /// </summary>
    private async Task<IActionResult> ProcessarValidacaoCasal(Usuario usuario, string codigo, string pessoa)
    {
        // Verificar se código é válido
        var codigoValido = await _authService.VerificarCodigoRedefinicaoCasal(usuario.Id!, pessoa, codigo);

        if (!codigoValido)
        {
            return BadRequest(new
            {
                success = false,
                message = "Código inválido ou expirado",
                code = "INVALID_CODE"
            });
        }

        // Gerar token de redefinição
        var token = GerarTokenUnico();
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        // Salvar token
        var salvou = await _authService.SalvarTokenRedefinicaoCasal(usuario.Id!, pessoa, token, expiresAt);

        if (!salvou)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Erro ao processar validação",
                code = "DATABASE_ERROR"
            });
        }

        var email = pessoa == "pessoa1"
            ? usuario.CasalInfo?.EmailPessoa1
            : usuario.CasalInfo?.EmailPessoa2;

        _logger.LogInformation("Código validado para conta casal: {Email}", email);

        return Ok(new
        {
            success = true,
            message = "Código válido!",
            token = token,
            tipoConta = "casal",
            pessoa = pessoa
        });
    }

    /// <summary>
    /// Passo 3: Redefinir senha
    /// </summary>
    [HttpPost("redefinir-senha")]
    public async Task<IActionResult> RedefinirSenha([FromBody] RedefinirSenhaDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Senha inválida. A senha deve ter no mínimo 6 caracteres, com letra maiúscula, minúscula e número.",
                code = "INVALID_PASSWORD"
            });
        }

        var token = request.Token;

        // 1. Verificar se token pertence a conta individual
        var usuarioIndividual = await _authService.ObterUsuarioPorTokenRedefinicao(token);

        if (usuarioIndividual != null)
        {
            return await ProcessarRedefinicaoIndividual(usuarioIndividual, request.NovaSenha, token);
        }

        // 2. Verificar se token pertence a conta casal
        var usuarioCasal = await _authService.ObterCasalPorTokenRedefinicao(token);

        if (usuarioCasal != null && usuarioCasal.CasalInfo != null)
        {
            // Descobrir qual pessoa está redefinindo
            string pessoa;
            if (usuarioCasal.CasalInfo.ResetTokenPessoa1 == token)
                pessoa = "pessoa1";
            else if (usuarioCasal.CasalInfo.ResetTokenPessoa2 == token)
                pessoa = "pessoa2";
            else
                pessoa = "";

            return await ProcessarRedefinicaoCasal(usuarioCasal, request.NovaSenha, token, pessoa);
        }

        // 3. Token inválido
        return BadRequest(new
        {
            success = false,
            message = "Token inválido ou expirado. Solicite uma nova recuperação.",
            code = "INVALID_TOKEN"
        });
    }

    /// <summary>
    /// Processar redefinição para conta individual
    /// </summary>
    private async Task<IActionResult> ProcessarRedefinicaoIndividual(Usuario usuario, string novaSenha, string token)
    {
        // Verificar se token é válido
        var tokenValido = await _authService.VerificarTokenRedefinicao(usuario.Id!, token);

        if (!tokenValido)
        {
            return BadRequest(new
            {
                success = false,
                message = "Token inválido ou expirado",
                code = "INVALID_TOKEN"
            });
        }

        // Atualizar senha
        var atualizado = await _authService.AtualizarSenha(usuario.Id!, novaSenha);

        if (!atualizado)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Erro ao atualizar senha",
                code = "DATABASE_ERROR"
            });
        }

        // Limpar dados de recuperação
        await _authService.LimparDadosRedefinicao(usuario.Id!);

        _logger.LogInformation("Senha redefinida com sucesso para conta individual: {Email}", usuario.Email);

        return Ok(new
        {
            success = true,
            message = "Senha redefinida com sucesso!"
        });
    }

    /// <summary>
    /// Processar redefinição para conta casal
    /// </summary>
    private async Task<IActionResult> ProcessarRedefinicaoCasal(Usuario usuario, string novaSenha, string token, string pessoa)
    {
        // Verificar se token é válido
        var tokenValido = await _authService.VerificarTokenRedefinicaoCasal(usuario.Id!, pessoa, token);

        if (!tokenValido)
        {
            return BadRequest(new
            {
                success = false,
                message = "Token inválido ou expirado",
                code = "INVALID_TOKEN"
            });
        }

        // Atualizar senha
        var atualizado = await _authService.AtualizarSenhaCasal(usuario.Id!, pessoa, novaSenha);

        if (!atualizado)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Erro ao atualizar senha",
                code = "DATABASE_ERROR"
            });
        }

        // Limpar dados de recuperação
        await _authService.LimparDadosRedefinicaoCasal(usuario.Id!, pessoa);

        var email = pessoa == "pessoa1"
            ? usuario.CasalInfo?.EmailPessoa1
            : usuario.CasalInfo?.EmailPessoa2;

        _logger.LogInformation("Senha redefinida com sucesso para conta casal: {Email}", email);

        return Ok(new
        {
            success = true,
            message = "Senha redefinida com sucesso!"
        });
    }

    /// <summary>
    /// Gerar código de 6 dígitos
    /// </summary>
    private string GerarCodigoVerificacao() =>
        (RandomNumberGenerator.GetInt32(100000, 1000000)).ToString();

    /// <summary>
    /// Gerar token único
    /// </summary>
    // Controllers/RecuperarSenhaController.cs
    // Substitua o método GerarTokenUnico por este:

    private string GerarTokenUnico()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "")
            .Substring(0, 64);
    }
}