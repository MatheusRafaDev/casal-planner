using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces;

public interface IItemService
{
    Task<List<Item>> GetItensByUsuarioId(string usuarioId);
    Task<PagedResult<Item>> GetItensPaginated(string usuarioId, string? categoriaId, string? busca, string? status, string? pagamento, int? responsavelId, int page, int pageSize);
    Task<Item?> GetItemById(string id, string usuarioId);
    Task<Item> CriarItem(CriarItemDto dto, string usuarioId, string emailAutenticado);
    Task<Item?> AtualizarItem(string id, AtualizarItemDto dto, string usuarioId, string emailAutenticado);
    Task<Item?> AtualizarComprado(string id, bool comprado, string usuarioId, string emailAutenticado);
    Task<bool> DeletarItem(string id, string usuarioId);
    Task<List<Item>> GetItensByCategoria(string categoriaId, string usuarioId);
}
