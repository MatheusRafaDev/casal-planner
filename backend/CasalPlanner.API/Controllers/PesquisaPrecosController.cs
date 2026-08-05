using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Infrastructure.Services;

namespace CasalPlanner.API.Controllers;

/// <summary>
/// Controller para pesquisa de preços de produtos em múltiplas fontes.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PesquisaPrecosController : ControllerBase
{
    private readonly IPesquisaPrecosService _pesquisaPrecosService;
    private readonly GroqVisionService _groqVisionService;
    private readonly ILogger<PesquisaPrecosController> _logger;

    public PesquisaPrecosController(
        IPesquisaPrecosService pesquisaPrecosService,
        GroqVisionService groqVisionService,
        ILogger<PesquisaPrecosController> logger)
    {
        _pesquisaPrecosService = pesquisaPrecosService;
        _groqVisionService = groqVisionService;
        _logger = logger;
    }

    /// <summary>
    /// Pesquisa preços de um produto em múltiplas fontes simultaneamente.
    /// </summary>
    /// <param name="q">Nome ou descrição do produto (ex: "iPhone 15 Pro 256GB")</param>
    /// <param name="marca">Marca do produto (opcional). Se não informado, será identificado automaticamente.</param>
    /// <param name="buscaUsuario">Busca original do usuário para contexto na validação (opcional).</param>
    /// <returns>Lista de produtos com preços de diferentes lojas.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Get(
        [FromQuery] string q,
        [FromQuery] string? marca = null,
        [FromQuery] string? buscaUsuario = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length > 300)
        {
            _logger.LogWarning("Consulta inválida recebida: '{Query}'", q);
            return BadRequest(new { error = "Consulta inválida. O parâmetro 'q' é obrigatório e deve ter no máximo 300 caracteres." });
        }

        var (produtos, marcaIdentificada, nomeValidado, queryUtilizada) = 
            await _pesquisaPrecosService.PesquisarAsync(q, marca, buscaUsuario);

        return Ok(new
        {
            produtos,
            marca_identificada = marcaIdentificada,
            nome_validado = nomeValidado,
            query_utilizada = queryUtilizada,
            total = produtos.Count()
        });
    }

    /// <summary>
    /// Identifica um produto por foto e pesquisa os preços encontrados para ele.
    /// </summary>
    [HttpPost("analisar-foto")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    public async Task<IActionResult> AnalisarFoto(
        [FromBody] AnalisarFotoPesquisaPrecosRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ImagemBase64))
            return BadRequest(new { message = "Envie uma foto do produto para pesquisar os preços." });

        if (request.ImagemBase64.Length > 12_000_000)
            return BadRequest(new { message = "A imagem é muito grande. Envie uma foto menor." });

        AnalisarFotoPrecoResponse identificacao;
        try
        {
            identificacao = await _groqVisionService.AnalisarAsync(request.ImagemBase64, cancellationToken);
        }
        catch (OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status408RequestTimeout, new
            {
                message = "A identificação da foto demorou demais. Tente novamente."
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao identificar produto na foto para pesquisa de preços.");
            return UnprocessableEntity(new
            {
                message = "Não consegui identificar o produto na foto, tente digitar manualmente.",
                etapa = "identificacao"
            });
        }

        try
        {
            var produtoNome = identificacao.ProdutoNome.Trim();
            var marca = string.IsNullOrWhiteSpace(identificacao.Marca) ? null : identificacao.Marca.Trim();
            var (produtos, marcaIdentificada, nomeValidado, queryUtilizada) =
                await _pesquisaPrecosService.PesquisarAsync(produtoNome, marca, produtoNome);

            return Ok(new
            {
                produtos,
                marca_identificada = marcaIdentificada,
                nome_validado = nomeValidado,
                query_utilizada = queryUtilizada,
                produto_identificado = new
                {
                    produto_nome = produtoNome,
                    marca,
                    preco = identificacao.Preco,
                    unidade = identificacao.Unidade
                },
                total = produtos.Count()
            });
        }
        catch (OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status408RequestTimeout, new
            {
                message = "A busca de preços demorou demais. Tente novamente ou digite manualmente.",
                etapa = "pesquisa"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Produto identificado, mas a pesquisa de preços falhou. Produto: {ProdutoNome}", identificacao.ProdutoNome);
            return StatusCode(StatusCodes.Status502BadGateway, new
            {
                message = "Identifiquei o produto, mas não consegui buscar os preços agora. Tente novamente ou digite manualmente.",
                etapa = "pesquisa"
            });
        }
    }
}
