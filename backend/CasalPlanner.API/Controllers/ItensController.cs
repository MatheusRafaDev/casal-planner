using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CasalPlanner.API.Services;
using CasalPlanner.API.Models.DTOs;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ItensController : ControllerBase
    {
        private readonly IItemService _itemService;

        public ItensController(IItemService itemService)
        {
            _itemService = itemService;
        }

        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("Usuário não autenticado");
        }

        [HttpGet]
        public async Task<IActionResult> GetItens()
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var itens = await _itemService.GetItensByUsuarioId(usuarioId);
                return Ok(itens);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(string id)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var item = await _itemService.GetItemById(id, usuarioId);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPost]
        public async Task<IActionResult> CriarItem([FromBody] CriarItemDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var item = await _itemService.CriarItem(dto, usuarioId);
                return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarItem(string id, [FromBody] AtualizarItemDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var item = await _itemService.AtualizarItem(id, dto, usuarioId);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // Endpoint dedicado para toggle comprado — operação única no MongoDB (FindOneAndUpdate)
        // Não faz GetItemById antes, não recarrega nada no frontend
        [HttpPut("{id}/comprado")]
        public async Task<IActionResult> UpdateComprado(string id, [FromBody] UpdateCompradoDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var item = await _itemService.AtualizarComprado(id, dto.Comprado, usuarioId);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        // Endpoint dedicado para mover item de categoria
        [HttpPut("{id}/categoria")]
        public async Task<IActionResult> UpdateCategoria(string id, [FromBody] UpdateCategoriaDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var updateDto = new AtualizarItemDto { CategoriaId = dto.CategoriaId };
                var item = await _itemService.AtualizarItem(id, updateDto, usuarioId);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarItem(string id)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var deletado = await _itemService.DeletarItem(id, usuarioId);
                if (!deletado) return NotFound();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpGet("categoria/{categoriaId}")]
        public async Task<IActionResult> GetItensByCategoria(string categoriaId)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var itens = await _itemService.GetItensByCategoria(categoriaId, usuarioId);
                return Ok(itens);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }

        [HttpPut("{id}/variantes")]
        public async Task<IActionResult> AtualizarVariantes(string id, [FromBody] AtualizarVariantesDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var item = await _itemService.AtualizarVariantes(id, dto.Variantes, dto.VarianteSelecionadaId, usuarioId);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (Exception ex) { return BadRequest(new { error = ex.Message }); }
        }
    }
}

