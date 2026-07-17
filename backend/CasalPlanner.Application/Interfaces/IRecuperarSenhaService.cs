// Services/IRecuperarSenhaService.cs
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces
{
    public interface IRecuperarSenhaService
    {
        Task<EsqueciSenhaResponseDto> SolicitarRecuperacaoAsync(string email);
        Task<ValidarCodigoResponseDto> ValidarCodigoAsync(string codigo);
        Task<RedefinirSenhaResponseDto> RedefinirSenhaAsync(string token, string novaSenha);
        void LimparCodigoExpirado(string email);
    }
}