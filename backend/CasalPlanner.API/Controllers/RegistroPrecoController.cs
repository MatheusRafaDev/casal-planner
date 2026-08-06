using System.Security.Claims;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Domain.Entities;
using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace CasalPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RegistroPrecoController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly GroqVisionService _groqVision;
    private readonly GeocodingService _geocoding;
    private readonly ILogger<RegistroPrecoController> _logger;

    public RegistroPrecoController(MongoDbContext context, GroqVisionService groqVision, GeocodingService geocoding, ILogger<RegistroPrecoController> logger)
    {
        _context = context;
        _groqVision = groqVision;
        _geocoding = geocoding;
        _logger = logger;
    }

    private string GetUsuarioId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value
        ?? throw new UnauthorizedAccessException("Usuário não autenticado");

    [HttpPost("analisar")]
    public async Task<ActionResult<AnalisarFotoPrecoResponse>> Analisar([FromBody] AnalisarFotoPrecoRequest request, CancellationToken cancellationToken)
    {
        if (request.ImagemBase64.Length > 12_000_000) return BadRequest(new { message = "A imagem é muito grande. Envie uma foto menor." });
        try
        {
            var delayText = Environment.GetEnvironmentVariable("IA_CALL_DELAY_MS");
            if (int.TryParse(delayText, out var delay) && delay > 0) await Task.Delay(delay, cancellationToken);
            var analiseTask = _groqVision.AnalisarAsync(request.ImagemBase64, cancellationToken);
            var geocodingTask = _geocoding.ReverseAsync(request.Latitude, request.Longitude, cancellationToken);
            await Task.WhenAll(analiseTask, geocodingTask);
            var analise = await analiseTask;
            var local = await geocodingTask;
            analise.Endereco = local.Endereco;
            analise.NomeMercado = local.NomeLocal;
            analise.Latitude = request.Latitude;
            analise.Longitude = request.Longitude;
            return Ok(analise);
        }
        catch (OperationCanceledException) { return StatusCode(StatusCodes.Status408RequestTimeout, new { message = "A análise demorou demais. Tente novamente." }); }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao analisar foto de preço para o usuário {UsuarioId}", GetUsuarioId());
            return StatusCode(StatusCodes.Status502BadGateway, new { message = $"Não consegui ler a foto. Detalhes do erro: {ex.Message} {ex.InnerException?.Message}" });
        }
    }

    [HttpPost("confirmar")]
    public async Task<ActionResult<RegistroPrecoFoto>> Confirmar([FromBody] ConfirmarRegistroPrecoRequest request, CancellationToken cancellationToken)
    {
        var usuarioId = GetUsuarioId();
        if (!string.IsNullOrWhiteSpace(request.ItemId))
        {
            var itemExiste = await _context.Itens.Find(i => i.Id == request.ItemId && i.UsuarioId == usuarioId).AnyAsync(cancellationToken);
            if (!itemExiste) return BadRequest(new { message = "O item selecionado não pertence a este usuário." });
        }

        var registro = new RegistroPrecoFoto
        {
            UsuarioId = usuarioId,
            ItemId = string.IsNullOrWhiteSpace(request.ItemId) ? null : request.ItemId,
            ProdutoNome = request.ProdutoNome.Trim(), Marca = TrimOrNull(request.Marca), Preco = request.Preco,
            Unidade = TrimOrNull(request.Unidade), Endereco = request.Endereco.Trim(), NomeMercado = TrimOrNull(request.NomeMercado),
            Latitude = request.Latitude, Longitude = request.Longitude, DataCompra = request.DataCompra?.ToUniversalTime() ?? DateTime.UtcNow,
            CriadoEm = DateTime.UtcNow
        };
        await _context.RegistrosPreco.InsertOneAsync(registro, cancellationToken: cancellationToken);
        return CreatedAtAction(nameof(Historico), new { }, registro);
    }

    [HttpGet("historico")]
    public async Task<ActionResult<List<RegistroPrecoFoto>>> Historico(CancellationToken cancellationToken) => Ok(
        await _context.RegistrosPreco.Find(r => r.UsuarioId == GetUsuarioId()).SortByDescending(r => r.DataCompra).ToListAsync(cancellationToken));

    private static string? TrimOrNull(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
