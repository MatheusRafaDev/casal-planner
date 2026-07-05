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
        private readonly ILogger<ItensController> _logger;

        public ItensController(IItemService itemService, ILogger<ItensController> logger)
        {
            _itemService = itemService;
            _logger = logger;
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
            try
            {
                var usuarioId = GetUsuarioId();
                var itens = await _itemService.GetItensByUsuarioId(usuarioId);
                return Ok(itens);
            }
            catch (UnauthorizedAccessException ex) 
            { 
                return Unauthorized(new { error = ex.Message }); 
            }
            catch (Exception ex) 
            { 
                _logger.LogError(ex, "Erro ao buscar itens para usuário {UsuarioId}", GetUsuarioId());
                return StatusCode(500, new { error = "Erro interno ao buscar itens." }); 
            }
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
    }
}

