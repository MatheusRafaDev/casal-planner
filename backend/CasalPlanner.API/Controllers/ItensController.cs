using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
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
                ?? User.FindFirst("sub")?.Value
                ?? throw new UnauthorizedAccessException("Usuário não autenticado");
        }

        [HttpGet]
        public async Task<IActionResult> GetItens()
        {
            var usuarioId = GetUsuarioId();
            var itens = await _itemService.GetItensByUsuarioId(usuarioId);
            return Ok(itens);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(string id)
        {
            var usuarioId = GetUsuarioId();
            var item = await _itemService.GetItemById(id, usuarioId);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> CriarItem([FromBody] CriarItemDto dto)
        {
            var usuarioId = GetUsuarioId();
            var item = await _itemService.CriarItem(dto, usuarioId);
            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarItem(string id, [FromBody] AtualizarItemDto dto)
        {
            var usuarioId = GetUsuarioId();
            var item = await _itemService.AtualizarItem(id, dto, usuarioId);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPut("{id}/comprado")]
        public async Task<IActionResult> UpdateComprado(string id, [FromBody] UpdateCompradoDto dto)
        {
            var usuarioId = GetUsuarioId();
            var item = await _itemService.AtualizarComprado(id, dto.Comprado, usuarioId);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPut("{id}/categoria")]
        public async Task<IActionResult> UpdateCategoria(string id, [FromBody] UpdateCategoriaDto dto)
        {
            var usuarioId = GetUsuarioId();
            var updateDto = new AtualizarItemDto { CategoriaId = dto.CategoriaId };
            var item = await _itemService.AtualizarItem(id, updateDto, usuarioId);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarItem(string id)
        {
            var usuarioId = GetUsuarioId();
            var deletado = await _itemService.DeletarItem(id, usuarioId);
            if (!deletado) return NotFound();
            return NoContent();
        }

        [HttpGet("categoria/{categoriaId}")]
        public async Task<IActionResult> GetItensByCategoria(string categoriaId)
        {
            var usuarioId = GetUsuarioId();
            var itens = await _itemService.GetItensByCategoria(categoriaId, usuarioId);
            return Ok(itens);
        }
    }
}

