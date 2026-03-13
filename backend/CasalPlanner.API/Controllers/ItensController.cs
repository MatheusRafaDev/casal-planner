using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MongoDB.Driver;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs; 
using CasalPlanner.API.Data;

namespace CasalPlanner.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ItensController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public ItensController(MongoDbContext context)
        {
            _context = context;
        }

        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "casal-default";
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Item>>> GetItens()
        {
            var usuarioId = GetUsuarioId();

            return await _context.Itens
                .Find(i => i.UsuarioId == usuarioId)
                .SortByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetItem(string id)
        {
            var usuarioId = GetUsuarioId();

            var item = await _context.Itens
                .Find(i => i.Id == id && i.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            return item;
        }

        [HttpGet("categoria/{categoriaId}")]
        public async Task<ActionResult<IEnumerable<Item>>> GetItensPorCategoria(string categoriaId)
        {
            var usuarioId = GetUsuarioId();

            var filter = Builders<Item>.Filter.And(
                Builders<Item>.Filter.Eq(i => i.CategoriaId, categoriaId),
                Builders<Item>.Filter.Eq(i => i.UsuarioId, usuarioId)
            );

            return await _context.Itens
                .Find(filter)
                .SortBy(i => i.Comprado)
                .ThenByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Item>> CreateItem([FromBody] CriarItemDto dto)
        {
            var usuarioId = GetUsuarioId();

            var categoria = await _context.Categorias
                .Find(c => c.Id == dto.CategoriaId)
                .FirstOrDefaultAsync();

            if (categoria == null)
                return BadRequest("Categoria não encontrada");

            var item = new Item
            {
                Nome = dto.Nome,
                Marca = dto.Marca,
                Preco = dto.Preco,
                Quantidade = dto.Quantidade,
                CategoriaId = dto.CategoriaId,
                Pagamento = dto.Pagamento,
                UsuarioId = usuarioId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Itens.InsertOneAsync(item);

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(string id, [FromBody] AtualizarItemDto dto)
        {
            var usuarioId = GetUsuarioId();

            var item = await _context.Itens
                .Find(i => i.Id == id && i.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            var update = Builders<Item>.Update;
            var updates = new List<UpdateDefinition<Item>>();

            if (dto.Nome != null)
                updates.Add(update.Set(i => i.Nome, dto.Nome));

            if (dto.Marca != null)
                updates.Add(update.Set(i => i.Marca, dto.Marca));

            if (dto.Preco.HasValue)
                updates.Add(update.Set(i => i.Preco, dto.Preco.Value));

            if (dto.Quantidade.HasValue)
                updates.Add(update.Set(i => i.Quantidade, dto.Quantidade.Value));

            if (dto.CategoriaId != null)
            {
                var categoria = await _context.Categorias
                    .Find(c => c.Id == dto.CategoriaId)
                    .FirstOrDefaultAsync();

                if (categoria == null)
                    return BadRequest("Categoria não encontrada");

                updates.Add(update.Set(i => i.CategoriaId, dto.CategoriaId));
            }

            if (dto.Comprado.HasValue)
                updates.Add(update.Set(i => i.Comprado, dto.Comprado.Value));

            if (dto.Pagamento != null)
                updates.Add(update.Set(i => i.Pagamento, dto.Pagamento));

            if (updates.Any())
            {
                await _context.Itens.UpdateOneAsync(
                    i => i.Id == id,
                    update.Combine(updates)
                );
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(string id)
        {
            var usuarioId = GetUsuarioId();

            var result = await _context.Itens.DeleteOneAsync(
                i => i.Id == id && i.UsuarioId == usuarioId
            );

            if (result.DeletedCount == 0)
                return NotFound();

            return NoContent();
        }

        [HttpPut("{id}/comprado")]
        public async Task<ActionResult<Item>> UpdateComprado(string id, [FromBody] AtualizarCompradoDto dto)
        {
            var usuarioId = GetUsuarioId();

            var item = await _context.Itens
                .Find(i => i.Id == id && i.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound();

            var update = Builders<Item>.Update
                .Set(i => i.Comprado, dto.Comprado);

            await _context.Itens.UpdateOneAsync(
                i => i.Id == id,
                update
            );

            // Busca o item atualizado
            var itemAtualizado = await _context.Itens
                .Find(i => i.Id == id && i.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();

            return Ok(itemAtualizado);
        }
    }



}