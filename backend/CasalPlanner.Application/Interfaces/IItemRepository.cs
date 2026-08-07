using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CasalPlanner.Application.Interfaces
{
    public interface IItemRepository
    {
        Task<List<Item>> GetByUsuarioIdAsync(string usuarioId);
        Task<(List<Item> Items, long TotalCount)> GetPaginatedAsync(string usuarioId, string? categoriaId, string? busca, string? status, string? pagamento, int? responsavelId, int page, int pageSize);
        Task<Item?> GetByIdAsync(string id, string usuarioId);
        Task CreateAsync(Item item);
        
        // Retorna o item atualizado
        Task<Item?> UpdateAsync(string id, string usuarioId, AtualizarItemDto dto, Item itemAtual);
        
        Task<Item?> UpdateCompradoAsync(string id, string usuarioId, bool comprado);
        Task<bool> DeleteAsync(string id, string usuarioId);
        Task<List<Item>> GetByCategoriaAsync(string categoriaId, string usuarioId);
        
        Task<(ResumoDto Resumo, ComparativoDto Comparativo)> ObterResumoAgregadoAsync(string usuarioId);
    }
}
