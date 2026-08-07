using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Persistence;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace CasalPlanner.Infrastructure.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly MongoDbContext _context;

        public UsuarioRepository(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario?> GetByIdAsync(string id)
        {
            return await _context.Usuarios.Find(u => u.Id == id).FirstOrDefaultAsync();
        }
    }
}
