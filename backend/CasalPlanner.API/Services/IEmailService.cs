// Services/IEmailService.cs
namespace CasalPlanner.API.Services
{
    public interface IEmailService
    {
        Task<bool> EnviarCodigoRedefinicaoSenha(string email, string codigo, string nome = "");
        Task<bool> EnviarEmailBoasVindas(string email, string nome, bool isCasal = false);
        Task<bool> EnviarEmailExclusaoConta(string email, string nome, bool isCasal = false);
        Task<bool> EnviarAvisoSenhaAlterada(string email, string nome);
    }
}