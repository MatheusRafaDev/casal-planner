using System.Security.Claims;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasalPlanner.API.Controllers;

/// <summary>
/// Endpoints de Inteligência Artificial para o CasalPlanner.
/// Utiliza provedores de alto limite gratuito permanente (Groq, Gemini, OpenRouter)
/// catalogados em https://github.com/mnfst/awesome-free-llm-apis.
/// Suporta rotas legadas /api/groq/* e novas /api/ia/*.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
[Route("api/ia")]
public class GroqController : ControllerBase
{
    private readonly IIaService _iaService;
    private readonly IItemService _itemService;
    private readonly ILogger<GroqController> _logger;

    public GroqController(IIaService iaService, IItemService itemService, ILogger<GroqController> logger)
    {
        _iaService = iaService;
        _itemService = itemService;
        _logger = logger;
    }

    private string GetUsuarioId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value
        ?? throw new UnauthorizedAccessException("Usuário não autenticado");

    /// <summary>
    /// Sugestões inteligentes de itens essenciais para um determinado cômodo.
    /// </summary>
    [HttpGet("sugestoes-comodo")]
    public async Task<ActionResult<IEnumerable<SugestaoItemDto>>> ObterSugestoesComodo(
        [FromQuery] string comodo,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(comodo))
            return BadRequest(new { message = "O nome do cômodo é obrigatório." });

        try
        {
            var sugestoes = await _iaService.ObterSugestoesComodoAsync(comodo.Trim(), cancellationToken);
            return Ok(sugestoes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter sugestões para cômodo {Comodo}", comodo);
            return StatusCode(500, new { message = "Erro ao processar sugestões de cômodo." });
        }
    }

    /// <summary>
    /// Detecta semanticamente se o item sendo adicionado já existe no cômodo/enxoval do casal.
    /// </summary>
    [HttpPost("detectar-duplicata")]
    public async Task<ActionResult<DetectarDuplicataResponseDto>> DetectarDuplicata(
        [FromBody] DetectarDuplicataRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest(new { message = "O nome do item é obrigatório." });

        try
        {
            var usuarioId = GetUsuarioId();
            var itensUsuario = await _itemService.GetItensByUsuarioId(usuarioId);

            var nomesExistentes = itensUsuario
                .Where(i => string.IsNullOrWhiteSpace(request.CategoriaId) || i.CategoriaId == request.CategoriaId)
                .Select(i => i.Nome)
                .ToList();

            if (!nomesExistentes.Any())
                return Ok(new DetectarDuplicataResponseDto { Duplicata = false });

            var resultado = await _iaService.DetectarDuplicataAsync(request.Nome.Trim(), nomesExistentes, cancellationToken);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao detectar duplicata para o item {Nome}", request.Nome);
            return Ok(new DetectarDuplicataResponseDto { Duplicata = false });
        }
    }

    /// <summary>
    /// Fornece estimativas de orçamento em faixas (essencial, médio, completo) para um cômodo.
    /// </summary>
    [HttpGet("estimativa-comodo")]
    public async Task<ActionResult<EstimativaComodoDto>> ObterEstimativaComodo(
        [FromQuery] string comodo,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(comodo))
            return BadRequest(new { message = "O nome do cômodo é obrigatório." });

        try
        {
            var estimativa = await _iaService.ObterEstimativaComodoAsync(comodo.Trim(), cancellationToken);
            return Ok(estimativa);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter estimativa para cômodo {Comodo}", comodo);
            return StatusCode(500, new { message = "Erro ao calcular estimativa de cômodo." });
        }
    }

    /// <summary>
    /// Descobre e valida domínios web de lojas para renderização de logos e links.
    /// </summary>
    [HttpPost("dominios")]
    public async Task<ActionResult<Dictionary<string, string>>> DescobrirDominios(
        [FromBody] DescobrirDominiosRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request?.Nomes == null || !request.Nomes.Any())
            return Ok(new Dictionary<string, string>());

        try
        {
            var dominios = await _iaService.DescobrirDominiosAsync(request.Nomes, cancellationToken);
            return Ok(dominios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao descobrir domínios de lojas.");
            return Ok(new Dictionary<string, string>());
        }
    }
}
