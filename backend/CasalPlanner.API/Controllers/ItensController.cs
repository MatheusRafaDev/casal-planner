using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Services;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ItensController : ControllerBase
    {
        private readonly IItemService _itemService;
        private readonly CloudinaryService _cloudinaryService;

        public ItensController(IItemService itemService, CloudinaryService cloudinaryService)
        {
            _itemService = itemService;
            _cloudinaryService = cloudinaryService;
        }

        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? throw new UnauthorizedAccessException("Usuário não autenticado");
        }

        private string GetUsuarioEmailAutenticado()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Email)?.Value
                ?? string.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetItens()
        {
            var usuarioId = GetUsuarioId();
            var itens = await _itemService.GetItensByUsuarioId(usuarioId);
            return Ok(itens);
        }

        [HttpGet("page")]
        public async Task<IActionResult> GetItensPaginated(
            [FromQuery] string? categoriaId,
            [FromQuery] string? busca,
            [FromQuery] string? status,
            [FromQuery] string? pagamento,
            [FromQuery] int? responsavelId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var usuarioId = GetUsuarioId();
            var pagedResult = await _itemService.GetItensPaginated(usuarioId, categoriaId, busca, status, pagamento, responsavelId, page, pageSize);
            return Ok(pagedResult);
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
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CriarItem([FromForm] CriarItemDto dto, IFormFile? fotoFile)
        {
            var usuarioId = GetUsuarioId();
            var email = GetUsuarioEmailAutenticado();

            if (fotoFile != null && fotoFile.Length > 0)
            {
                var (url, publicId) = await _cloudinaryService.UploadImageAsync(fotoFile);
                dto.FotoUrl = url;
                dto.FotoPublicId = publicId;
            }

            var item = await _itemService.CriarItem(dto, usuarioId, email);
            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AtualizarItem(string id, [FromForm] AtualizarItemDto dto, IFormFile? fotoFile)
        {
            var usuarioId = GetUsuarioId();
            var email = GetUsuarioEmailAutenticado();

            if (fotoFile != null && fotoFile.Length > 0)
            {
                // Delete old image if there is one
                var itemAtual = await _itemService.GetItemById(id, usuarioId);
                if (itemAtual != null && !string.IsNullOrEmpty(itemAtual.FotoPublicId))
                {
                    await _cloudinaryService.DeleteImageAsync(itemAtual.FotoPublicId);
                }

                var (url, publicId) = await _cloudinaryService.UploadImageAsync(fotoFile);
                dto.FotoUrl = url;
                dto.FotoPublicId = publicId;
            }

            var item = await _itemService.AtualizarItem(id, dto, usuarioId, email);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPatch("{id}/comprado")]
        public async Task<IActionResult> AtualizarComprado(string id, [FromBody] UpdateCompradoDto dto)
        {
            var usuarioId = GetUsuarioId();
            var email = GetUsuarioEmailAutenticado();
            var item = await _itemService.AtualizarComprado(id, dto.Comprado, usuarioId, email);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPut("{id}/categoria")]
        public async Task<IActionResult> UpdateCategoria(string id, [FromBody] UpdateCategoriaDto dto)
        {
            var usuarioId = GetUsuarioId();
            var email = GetUsuarioEmailAutenticado();
            var updateDto = new AtualizarItemDto { CategoriaId = dto.CategoriaId };
            var item = await _itemService.AtualizarItem(id, updateDto, usuarioId, email);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarItem(string id)
        {
            var usuarioId = GetUsuarioId();

            // Delete image from Cloudinary if exists
            var item = await _itemService.GetItemById(id, usuarioId);
            if (item != null && !string.IsNullOrEmpty(item.FotoPublicId))
            {
                await _cloudinaryService.DeleteImageAsync(item.FotoPublicId);
            }

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
