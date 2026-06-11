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
        private readonly ILogger<WishlistController> _logger;

        public WishlistController(IWishlistService wishlistService, ILogger<WishlistController> logger)
        {
            _wishlistService = wishlistService;
            _logger = logger;
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
                _logger.LogError(ex, "Erro ao obter wishlist pública por slug");
                return BadRequest(new { error = "Erro ao buscar wishlist. Tente novamente mais tarde." });
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
                _logger.LogError(ex, "Erro ao reservar item");
                return BadRequest(new { error = "Erro ao reservar item. Tente novamente mais tarde." });
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
                _logger.LogError(ex, "Erro ao cancelar reserva");
                return BadRequest(new { error = "Erro ao cancelar reserva. Tente novamente mais tarde." });
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
                    return NoContent();
                return Ok(wishlist);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter wishlist privada do usuário");
                return BadRequest(new { error = "Erro ao buscar wishlist. Tente novamente mais tarde." });
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
                _logger.LogError(ex, "Erro de argumento ao criar wishlist");
                return BadRequest(new { error = "Dados inválidos para criar wishlist." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar wishlist");
                return BadRequest(new { error = "Erro ao criar wishlist. Tente novamente mais tarde." });
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
                _logger.LogError(ex, "Erro ao atualizar wishlist");
                return BadRequest(new { error = "Erro ao atualizar wishlist. Tente novamente mais tarde." });
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
                _logger.LogError(ex, "Erro ao verificar disponibilidade de slug");
                return BadRequest(new { error = "Erro ao verificar disponibilidade. Tente novamente mais tarde." });
            }
        }
    }
}
