// Services/IRecuperarSenhaService.cs
using CasalPlanner.API.Models.DTOs;

namespace CasalPlanner.API.Services
{
    public interface IRecuperarSenhaService
    {
        Task<EsqueciSenhaResponseDto> SolicitarRecuperacaoAsync(string email);
        Task<ValidarCodigoResponseDto> ValidarCodigoAsync(string codigo);
        Task<RedefinirSenhaResponseDto> RedefinirSenhaAsync(string token, string novaSenha);
        void LimparCodigoExpirado(string email);
    }
}