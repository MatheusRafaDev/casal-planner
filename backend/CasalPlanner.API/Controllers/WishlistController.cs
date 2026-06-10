using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CasalPlanner.API.Services;
using CasalPlanner.API.Models.DTOs;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("Usuário não autenticado");
        }

        [AllowAnonymous]
        [HttpGet("{slug}")]
        public async Task<IActionResult> ObterPublicaPorSlug(string slug)
        {
            try
            {
                var wishlist = await _wishlistService.ObterPublicaPorSlug(slug);
                if (wishlist == null || !wishlist.Ativa)
                    return NotFound();
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("{slug}/reservar/{itemId}")]
        public async Task<IActionResult> ReservarItem(string slug, string itemId, [FromBody] ReservarItemDto dto)
        {
            try
            {
                var sucesso = await _wishlistService.ReservarItem(slug, itemId, dto);
                if (!sucesso)
                    return BadRequest(new { error = "Não foi possível reservar o item" });
                return Ok(new { message = "Item reservado com sucesso" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpDelete("{slug}/reservar/{itemId}")]
        public async Task<IActionResult> CancelarReserva(string slug, string itemId, [FromBody] CancelarReservaDto dto)
        {
            try
            {
                var sucesso = await _wishlistService.CancelarReserva(slug, itemId, dto.NomePresente);
                if (!sucesso)
                    return BadRequest(new { error = "Não foi possível cancelar a reserva" });
                return Ok(new { message = "Reserva cancelada com sucesso" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("minha")]
        public async Task<IActionResult> ObterPrivadaPorUsuario()
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var wishlist = await _wishlistService.ObterPrivadaPorUsuario(usuarioId);
                if (wishlist == null)
                    return NotFound();
                return Ok(wishlist);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CriarWishlist([FromBody] CriarWishlistDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var wishlist = await _wishlistService.CriarWishlist(usuarioId, dto);
                return CreatedAtAction(nameof(ObterPublicaPorSlug), new { slug = wishlist.Slug }, wishlist);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> AtualizarWishlist([FromBody] AtualizarWishlistDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                var wishlist = await _wishlistService.AtualizarWishlist(usuarioId, dto);
                if (wishlist == null)
                    return NotFound();
                return Ok(wishlist);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("slug-disponivel")]
        public async Task<IActionResult> SlugDisponivel([FromQuery] string slug)
        {
            try
            {
                var disponivel = await _wishlistService.SlugDisponivel(slug);
                return Ok(new { disponivel });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
