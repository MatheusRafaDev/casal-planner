using CasalPlanner.API.Models.DTOs;

namespace CasalPlanner.API.Services
{
    public interface IResumoService
    {
        Task<ResumoResponseDto> ObterResumo(string usuarioId);
    }
}