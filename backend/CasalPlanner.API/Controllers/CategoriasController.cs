using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using MongoDB.Driver;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Data;

namespace CasalPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly ILogger<CategoriasController> _logger;

    public CategoriasController(MongoDbContext context, ILogger<CategoriasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private string? GetUsuarioId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
        {
            _logger.LogWarning("GetCategorias: usuarioId is null or empty");
            return Unauthorized(new { message = "Usuário não autenticado" });
        }

        var filter = Builders<Categoria>.Filter.Or(
            Builders<Categoria>.Filter.Eq(c => c.UsuarioId, null),
            Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId)
        );

        var categoriasOrdenadas = await _context.Categorias
            .Find(filter)
            .SortByDescending(c => c.IsPadrao)
            .ThenBy(c => c.Nome)
            .ToListAsync();

        return Ok(categoriasOrdenadas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Categoria>> GetCategoria(string id)
    {
        var usuarioId = GetUsuarioId();

        var filter = Builders<Categoria>.Filter.And(
            Builders<Categoria>.Filter.Eq(c => c.Id, id),
            Builders<Categoria>.Filter.Or(
                Builders<Categoria>.Filter.Eq(c => c.UsuarioId, null),
                Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId)
            )
        );

        var categoria = await _context.Categorias
            .Find(filter)
            .FirstOrDefaultAsync();

        if (categoria == null) return NotFound();
        return Ok(categoria);
    }

    [HttpPost]
    public async Task<ActionResult<Categoria>> CreateCategoria([FromBody] CriarCategoriaDto dto)
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
            return Unauthorized(new { message = "Usuário não autenticado" });

        var categoria = new Categoria
        {
            Nome = dto.Nome,
            Icon = string.IsNullOrEmpty(dto.Icon) ? "📁" : dto.Icon,
            Bg = dto.Bg,
            IsPadrao = false,
            UsuarioId = usuarioId,
            MetaOrcamento = dto.MetaOrcamento,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Categorias.InsertOneAsync(categoria);
        return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, categoria);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategoria(string id, [FromBody] AtualizarCategoriaDto dto)
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
            return Unauthorized(new { message = "Usuário não autenticado" });

        var filterExistente = Builders<Categoria>.Filter.And(
            Builders<Categoria>.Filter.Eq(c => c.Id, id),
            Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId)
        );

        var categoriaExistente = await _context.Categorias
            .Find(filterExistente)
            .FirstOrDefaultAsync();

        if (categoriaExistente == null)
            return NotFound(new { message = "Categoria não encontrada ou não pertence a você" });

        var updateDefinitions = new List<UpdateDefinition<Categoria>>();

        if (!string.IsNullOrEmpty(dto.Nome))
            updateDefinitions.Add(Builders<Categoria>.Update.Set(c => c.Nome, dto.Nome));

        if (!string.IsNullOrEmpty(dto.Icon))
            updateDefinitions.Add(Builders<Categoria>.Update.Set(c => c.Icon, dto.Icon));

        if (!string.IsNullOrEmpty(dto.Bg) && dto.Bg != categoriaExistente.Bg)
            updateDefinitions.Add(Builders<Categoria>.Update.Set(c => c.Bg, dto.Bg));

        if (dto.RemoverMeta)
            updateDefinitions.Add(Builders<Categoria>.Update.Unset(c => c.MetaOrcamento));
        else if (dto.MetaOrcamento.HasValue)
            updateDefinitions.Add(Builders<Categoria>.Update.Set(c => c.MetaOrcamento, dto.MetaOrcamento));

        if (updateDefinitions.Count == 0)
            return Ok(new { message = "Nenhuma alteração necessária", categoria = categoriaExistente });

        var update = Builders<Categoria>.Update.Combine(updateDefinitions);

        var options = new FindOneAndUpdateOptions<Categoria>
        {
            ReturnDocument = ReturnDocument.After
        };

        var filterUpdate = Builders<Categoria>.Filter.And(
            Builders<Categoria>.Filter.Eq(c => c.Id, id),
            Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId)
        );

        var categoriaAtualizada = await _context.Categorias.FindOneAndUpdateAsync<Categoria>(
            filterUpdate,
            update,
            options
        );

        if (categoriaAtualizada == null)
            return NotFound(new { message = "Categoria não encontrada" });

        return Ok(new { message = "Categoria atualizada com sucesso", categoria = categoriaAtualizada });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategoria(string id)
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
            return Unauthorized(new { message = "Usuário não autenticado" });

        var categoria = await _context.Categorias
            .Find(c => c.Id == id && c.UsuarioId == usuarioId)
            .FirstOrDefaultAsync();

        if (categoria == null)
            return NotFound(new { message = "Categoria não encontrada ou não pertence a você" });

        await Task.WhenAll(
            _context.Itens.DeleteManyAsync(i => i.CategoriaId == id && i.UsuarioId == usuarioId),
            _context.Categorias.DeleteOneAsync(c => c.Id == id && c.UsuarioId == usuarioId)
        );

        return NoContent();
    }

    [HttpGet("usuario")]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategoriasDoUsuario()
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
            return Unauthorized(new { message = "Usuário não autenticado" });

        var categorias = await _context.Categorias
            .Find(c => c.UsuarioId == usuarioId)
            .ToListAsync();

        return Ok(categorias);
    }

    // BulkWrite: salva a ordem de N categorias em UMA única operação no MongoDB
    // (antes era N UpdateOneAsync em série, um por categoria)
    [HttpPut("reordenar")]
    public async Task<IActionResult> ReordenarCategorias([FromBody] ReordenarCategoriasDto dto)
    {
        var usuarioId = GetUsuarioId();
        if (string.IsNullOrEmpty(usuarioId))
            return Unauthorized(new { message = "Usuário não autenticado" });

        if (dto.CategoriaIds == null || dto.CategoriaIds.Count == 0)
            return BadRequest(new { message = "Lista de categorias vazia" });

        var writes = dto.CategoriaIds.Select((categoriaId, index) =>
            new UpdateOneModel<Categoria>(
                Builders<Categoria>.Filter.And(
                    Builders<Categoria>.Filter.Eq(c => c.Id, categoriaId),
                    Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId)
                ),
                Builders<Categoria>.Update.Set(c => c.Ordem, index)
            )
        ).ToList<WriteModel<Categoria>>();

        await _context.Categorias.BulkWriteAsync(writes, new BulkWriteOptions { IsOrdered = false });

        return Ok();
    }
}