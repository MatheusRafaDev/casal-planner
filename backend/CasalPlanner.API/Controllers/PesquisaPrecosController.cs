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

    private readonly ILogger<PesquisaPrecosController> _logger;

    public PesquisaPrecosController(
        IPesquisaPrecosService pesquisaPrecosService,
        ILogger<PesquisaPrecosController> logger)
    {
        _pesquisaPrecosService = pesquisaPrecosService;
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


}
