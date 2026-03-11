using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MongoDB.Driver;
using MongoDB.Bson;
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

            // Buscar categorias do usuário + categorias padrão (global)
            var filter = Builders<Categoria>.Filter.Or(
                Builders<Categoria>.Filter.Eq(c => c.UsuarioId, null), // Categorias padrão
                Builders<Categoria>.Filter.Eq(c => c.UsuarioId, usuarioId) // Categorias do usuário
            );

            var categorias = await _context.Categorias
                .Find(filter)
                .ToListAsync();

            // Ordenação: primeiro as padrão, depois as do usuário
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

            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { message = "Usuário não autenticado" });
            }

            var categoria = new Categoria
            {
                Nome = dto.Nome,
                Icon = string.IsNullOrEmpty(dto.Icon) ? "📁" : dto.Icon,
                Bg = dto.Bg,
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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategoria(string id, [FromBody] AtualizarCategoriaDto dto)
    {
        try
        {
            var usuarioId = GetUsuarioId();

            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { message = "Usuário não autenticado" });
            }

            // Buscar a categoria existente (apenas do usuário logado)
            var categoriaExistente = await _context.Categorias
                .Find(c => c.Id == id && c.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();

            if (categoriaExistente == null)
            {
                return NotFound(new { message = "Categoria não encontrada ou não pertence a você" });
            }

            // Verificar se é categoria padrão (não pode editar)
            if (categoriaExistente.IsPadrao)
            {
                return BadRequest(new { message = "Não é possível editar categorias padrão do sistema" });
            }

            // Preparar as atualizações
            var updateDefinitions = new List<UpdateDefinition<Categoria>>();

            // Atualizar nome se fornecido
            if (!string.IsNullOrEmpty(dto.Nome))
            {
                updateDefinitions.Add(Builders<Categoria>.Update.Set(c => c.Nome, dto.Nome));
            }

            // Atualizar ícone se fornecido
            if (!string.IsNullOrEmpty(dto.Icon))
            {
                updateDefinitions.Add(Builders<Categoria>.Update.Set(c => c.Icon, dto.Icon));
            }

            // Atualizar cor de fundo se fornecida
            if (!string.IsNullOrEmpty(dto.Bg) && dto.Bg != categoriaExistente.Bg)
            {
                updateDefinitions.Add(Builders<Categoria>.Update.Set(c => c.Bg, dto.Bg));
            }

            // Se não houver nada para atualizar
            if (updateDefinitions.Count == 0)
            {
                return Ok(new
                {
                    message = "Nenhuma alteração necessária",
                    categoria = categoriaExistente
                });
            }

            // Combinar todas as atualizações
            var update = Builders<Categoria>.Update.Combine(updateDefinitions);

            // Executar a atualização
            var result = await _context.Categorias.UpdateOneAsync(
                c => c.Id == id && c.UsuarioId == usuarioId,
                update
            );

            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Categoria não encontrada" });
            }

            // Buscar a categoria atualizada para retornar
            var categoriaAtualizada = await _context.Categorias
                .Find(c => c.Id == id)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                message = "Categoria atualizada com sucesso",
                categoria = categoriaAtualizada
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar categoria {Id}", id);
            return StatusCode(500, new { error = ex.Message, message = "Erro interno ao atualizar categoria" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategoria(string id)
    {
        try
        {
            var usuarioId = GetUsuarioId();

            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { message = "Usuário não autenticado" });
            }

            // Buscar a categoria (apenas do usuário logado)
            var categoria = await _context.Categorias
                .Find(c => c.Id == id && c.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();

            if (categoria == null)
                return NotFound(new { message = "Categoria não encontrada ou não pertence a você" });

            if (categoria.IsPadrao)
                return BadRequest("Não é possível remover categorias padrão");

            // Remover todos os itens associados a esta categoria
            await _context.Itens.DeleteManyAsync(
                i => i.CategoriaId == id && i.UsuarioId == usuarioId
            );

            // Remover a categoria
            await _context.Categorias.DeleteOneAsync(c => c.Id == id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar categoria {Id}", id);
            return StatusCode(500, new { error = ex.Message });
        }
    }


    [HttpGet("usuario")]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategoriasDoUsuario()
    {
        try
        {
            var usuarioId = GetUsuarioId();

            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { message = "Usuário não autenticado" });
            }

            var categorias = await _context.Categorias
                .Find(c => c.UsuarioId == usuarioId)
                .ToListAsync();

            return Ok(categorias);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar categorias do usuário");
            return StatusCode(500, new { error = ex.Message });
        }

    }

    [HttpPut("reordenar")]
    public async Task<IActionResult> ReordenarCategorias([FromBody] ReordenarCategoriasDto dto)
    {
        var usuarioId = GetUsuarioId();

        for (int i = 0; i < dto.CategoriaIds.Count; i++)
        {
            var update = Builders<Categoria>.Update
                .Set(c => c.Ordem, i); // Adicione o campo Ordem no modelo

            await _context.Categorias.UpdateOneAsync(
                c => c.Id == dto.CategoriaIds[i] && c.UsuarioId == usuarioId,
                update
            );
        }

        return Ok();
    }
}