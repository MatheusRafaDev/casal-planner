using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;

namespace CasalPlanner.API.Services;

public interface IWishlistService
{
    Task<WishlistPublica> CriarWishlist(string usuarioId, CriarWishlistDto dto);
    Task<WishlistPublicaResponseDto?> ObterPublicaPorSlug(string slug);
    Task<WishlistPrivadaResponseDto?> ObterPrivadaPorUsuario(string usuarioId);
    Task<bool> ReservarItem(string slug, string itemId, ReservarItemDto dto);
    Task<bool> CancelarReserva(string slug, string itemId, string nomePresente);
    Task<WishlistPublica?> AtualizarWishlist(string usuarioId, AtualizarWishlistDto dto);
    Task<bool> SlugDisponivel(string slug);
}
