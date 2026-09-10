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

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            var filter = Builders<Usuario>.Filter.Eq(u => u.Email, email);
            return await _context.Usuarios.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<Usuario?> GetBySlugListaPublicaAsync(string slug)
        {
            var filter = Builders<Usuario>.Filter.Eq(u => u.SlugListaPublica, slug);
            return await _context.Usuarios.Find(filter).FirstOrDefaultAsync();
        }
    }
}
