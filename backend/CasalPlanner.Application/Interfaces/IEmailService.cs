// Services/IEmailService.cs
namespace CasalPlanner.Application.Interfaces
{
    public interface IEmailService
    {
        Task<bool> EnviarCodigoRedefinicaoSenha(string email, string codigo, string nome = "");
        Task<bool> EnviarEmailBoasVindas(string email, string nome, bool isCasal = false);
        Task<bool> EnviarEmailExclusaoConta(string email, string nome, bool isCasal = false);
        Task<bool> EnviarAvisoSenhaAlterada(string email, string nome);
        Task<bool> EnviarEmailConviteParceiro(string email, string nomeConvidante, string linkConvite, DateTime expiraEm);
        Task<bool> EnviarNotificacaoParceiroAsync(string emailDestino, string nomeParceiro, string assunto, string mensagem, CasalPlanner.Domain.Entities.Item? item = null);
        Task<bool> EnviarAlertaPrecoBaixoAsync(string emailDestino, string nomeUsuario, CasalPlanner.Domain.Entities.Item item, decimal novoPreco, string urlNovoPreco, string loja);
        Task<bool> EnviarEmailPresenteRecebidoAsync(string emailDestino, string nomeUsuario, string nomeConvidado, CasalPlanner.Domain.Entities.Item item);
    }
}