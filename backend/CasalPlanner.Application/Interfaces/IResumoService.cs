using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces
{
    public interface IResumoService
    {
        Task<ResumoResponseDto> ObterResumo(string usuarioId);
    }
}