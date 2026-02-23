using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MongoDB.Driver;
using CasalPlanner.API.Models;
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
    
    private string? GetUsuarioId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
    {
        try
        {
            var usuarioId = GetUsuarioId();
            
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { message = "Usuário não autenticado" });
            }
            
            var filter = Builders<Categoria>.Filter.Or(
                Builders<Categoria>.Filter.Eq(c => c.UsuarioId, null),
                Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId)
            );
            
            var categorias = await _context.Categorias
                .Find(filter)
                .ToListAsync();
            
            // Ordenação em memória
            var categoriasOrdenadas = categorias
                .OrderBy(c => c.IsPadrao ? 0 : 1)
                .ThenBy(c => c.Nome)
                .ToList();
            
            return Ok(categoriasOrdenadas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar categorias");
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Categoria>> GetCategoria(string id)
    {
        try
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
            
            if (categoria == null)
                return NotFound();
                
            return Ok(categoria);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar categoria {Id}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    [HttpPost]
    public async Task<ActionResult<Categoria>> CreateCategoria([FromBody] CriarCategoriaDto dto)
    {
        try
        {
            var usuarioId = GetUsuarioId();
            
            var categoria = new Categoria
            {
                Nome = string.IsNullOrEmpty(dto.Icone) ? $"📁 {dto.Nome}" : $"{dto.Icone} {dto.Nome}",
                Bg = dto.Bg,
                Text = dto.Text,
                IsPadrao = false,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            };
            
            await _context.Categorias.InsertOneAsync(categoria);
            
            return CreatedAtAction(nameof(GetCategoria), new { id = categoria.Id }, categoria);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar categoria");
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategoria(string id)
    {
        try
        {
            var usuarioId = GetUsuarioId();
            
            var categoria = await _context.Categorias
                .Find(c => c.Id == id && c.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();
            
            if (categoria == null)
                return NotFound();
                
            if (categoria.IsPadrao)
                return BadRequest("Não é possível remover categorias padrão");
            
            await _context.Itens.DeleteManyAsync(
                i => i.CategoriaId == id && i.UsuarioId == usuarioId
            );
            
            await _context.Categorias.DeleteOneAsync(c => c.Id == id);
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar categoria {Id}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }
}