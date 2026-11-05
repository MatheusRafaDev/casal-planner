using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.API.Controllers;

/// <summary>
/// Controller para pesquisa de preços de produtos em múltiplas fontes e prévias de vídeos demonstrativos.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PesquisaPrecosController : ControllerBase
{
    private readonly IPesquisaPrecosService _pesquisaPrecosService;
    private readonly IExtratorLinkService _extratorLinkService;
    private readonly ITikTokPreviewService _tikTokPreviewService;
    private readonly ILogger<PesquisaPrecosController> _logger;

    public PesquisaPrecosController(
        IPesquisaPrecosService pesquisaPrecosService,
        IExtratorLinkService extratorLinkService,
        ITikTokPreviewService tikTokPreviewService,
        ILogger<PesquisaPrecosController> logger)
    {
        _pesquisaPrecosService = pesquisaPrecosService;
        _extratorLinkService = extratorLinkService;
        _tikTokPreviewService = tikTokPreviewService;
        _logger = logger;
    }

    /// <summary>
    /// Pesquisa preços de um produto em múltiplas fontes simultaneamente.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Get(
        [FromQuery] string q,
        [FromQuery] string? marca = null,
        [FromQuery] string? buscaUsuario = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length > 300)
            return BadRequest(new { error = "Consulta inválida. O parâmetro 'q' é obrigatório e deve ter no máximo 300 caracteres." });

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

    public class ExtrairLinkRequest
    {
        public string Url { get; set; } = string.Empty;
    }

    /// <summary>
    /// Extrai dados de um produto a partir de um link de e-commerce.
    /// </summary>
    [HttpPost("extrair-link")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExtrairDeLink(
        [FromBody] ExtrairLinkRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Url) || !Uri.TryCreate(request.Url, UriKind.Absolute, out _))
            return BadRequest(new { error = "URL inválida." });

        var produto = await _extratorLinkService.ExtrairAsync(request.Url, cancellationToken);

        if (produto == null)
            return NotFound(new { error = "Não foi possível extrair dados deste link. Tente preencher manualmente." });

        return Ok(produto);
    }

    /// <summary>
    /// Busca vídeos de demonstração / reviews no TikTok e plataformas de vídeo.
    /// </summary>
    [HttpGet("videos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BuscarVideos(
        [FromQuery] string q,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "O parâmetro 'q' é obrigatório." });

        var videos = await _tikTokPreviewService.BuscarVideosAsync(q, cancellationToken);
        return Ok(videos);
    }

    /// <summary>
    /// Obtém os dados de preview (player embed, título, thumbnail) para uma URL de vídeo específica.
    /// </summary>
    [HttpPost("video-preview")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPreviewVideo(
        [FromBody] VideoPreviewRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request?.Url))
            return BadRequest(new { error = "URL inválida." });

        var preview = await _tikTokPreviewService.ObterPreviewPorUrlAsync(request.Url, cancellationToken);
        if (preview == null)
            return NotFound(new { error = "Não foi possível carregar o preview deste vídeo." });

        return Ok(preview);
    }
}
