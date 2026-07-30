using System.Threading.Tasks;
using CasalPlanner.Domain.Entities;

namespace CasalPlanner.Application.Interfaces
{
    public interface IPushService
    {
        Task SendPushToPartnerAsync(Usuario usuario, int currentPessoaId, string title, string message);
    }
}
