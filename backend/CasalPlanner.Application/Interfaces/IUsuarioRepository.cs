using CasalPlanner.Domain.Entities;
using System.Threading.Tasks;

namespace CasalPlanner.Application.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> GetByIdAsync(string id);
        Task<Usuario?> GetByEmailAsync(string email);
        Task<Usuario?> GetBySlugListaPublicaAsync(string slug);
    }
}
