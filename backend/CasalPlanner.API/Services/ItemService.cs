using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Data;
using MongoDB.Driver;

namespace CasalPlanner.API.Services
{
    public interface IItemService
    {
        Task<List<Item>> GetItensByUsuarioId(string usuarioId);
        Task<Item?> GetItemById(string id, string usuarioId);
        Task<Item> CriarItem(CriarItemDto dto, string usuarioId);
        Task<Item?> AtualizarItem(string id, AtualizarItemDto dto, string usuarioId);
        Task<Item?> AtualizarComprado(string id, bool comprado, string usuarioId);
        Task<bool> DeletarItem(string id, string usuarioId);
        Task<List<Item>> GetItensByCategoria(string categoriaId, string usuarioId);
    }

    public class ItemService : IItemService
    {
        private readonly MongoDbContext _context;

        public ItemService(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<List<Item>> GetItensByUsuarioId(string usuarioId)
        {
            return await _context.Itens
                .Find(i => i.UsuarioId == usuarioId)
                .SortByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<Item?> GetItemById(string id, string usuarioId)
        {
            return await _context.Itens
                .Find(i => i.Id == id && i.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();
        }

        public async Task<Item> CriarItem(CriarItemDto dto, string usuarioId)
        {
            var item = new Item
            {
                Nome = dto.Nome,
                Marca = dto.Marca,
                Preco = dto.Preco,
                Quantidade = dto.Quantidade,
                CategoriaId = dto.CategoriaId,
                Pagamento = dto.Pagamento,
                Prioridade = dto.Prioridade ?? "normal",
                UsuarioId = usuarioId,
                Comprado = false,
                CreatedAt = DateTime.UtcNow,
                Loja = dto.Loja,
                LinkProduto = dto.LinkProduto,
                FotoUrl = dto.FotoUrl,
                Origem = dto.Origem ?? "comprado"
            };

            await _context.Itens.InsertOneAsync(item);
            return item;
        }

        public async Task<Item?> AtualizarItem(string id, AtualizarItemDto dto, string usuarioId)
        {
            var update = Builders<Item>.Update;
            var updates = new List<UpdateDefinition<Item>>();

            if (!string.IsNullOrEmpty(dto.Nome))
                updates.Add(update.Set(i => i.Nome, dto.Nome));

            if (dto.Marca != null)
                updates.Add(update.Set(i => i.Marca, dto.Marca));

            if (dto.Preco.HasValue)
                updates.Add(update.Set(i => i.Preco, dto.Preco.Value));

            if (dto.Quantidade.HasValue)
                updates.Add(update.Set(i => i.Quantidade, dto.Quantidade.Value));

            if (!string.IsNullOrEmpty(dto.CategoriaId))
                updates.Add(update.Set(i => i.CategoriaId, dto.CategoriaId));

            if (!string.IsNullOrEmpty(dto.Pagamento))
                updates.Add(update.Set(i => i.Pagamento, dto.Pagamento));

            if (!string.IsNullOrEmpty(dto.Prioridade))
                updates.Add(update.Set(i => i.Prioridade, dto.Prioridade));

            if (dto.Comprado.HasValue)
                updates.Add(update.Set(i => i.Comprado, dto.Comprado.Value));

            if (dto.Loja != null)
                updates.Add(update.Set(i => i.Loja, dto.Loja));

            if (dto.LinkProduto != null)
                updates.Add(update.Set(i => i.LinkProduto, dto.LinkProduto));

            if (dto.FotoUrl != null)
                updates.Add(update.Set(i => i.FotoUrl, dto.FotoUrl));

            if (!string.IsNullOrEmpty(dto.Origem))
                updates.Add(update.Set(i => i.Origem, dto.Origem));

            if (updates.Count == 0)
                return await GetItemById(id, usuarioId);

            updates.Add(update.Set(i => i.UpdatedAt, DateTime.UtcNow));

            // FindOneAndUpdate: atualiza e retorna o documento em UMA operação (evita double-fetch)
            var options = new FindOneAndUpdateOptions<Item>
            {
                ReturnDocument = ReturnDocument.After
            };

            var filter = Builders<Item>.Filter.And(
                Builders<Item>.Filter.Eq(i => i.Id, id),
                Builders<Item>.Filter.Eq(i => i.UsuarioId, usuarioId)
            );

            return await _context.Itens.FindOneAndUpdateAsync(
                filter,
                update.Combine(updates),
                options
            );
        }

        // Endpoint dedicado para toggle comprado — sem busca prévia, sem double-fetch
        public async Task<Item?> AtualizarComprado(string id, bool comprado, string usuarioId)
        {
            var filter = Builders<Item>.Filter.And(
                Builders<Item>.Filter.Eq(i => i.Id, id),
                Builders<Item>.Filter.Eq(i => i.UsuarioId, usuarioId)
            );

            var update = Builders<Item>.Update
                .Set(i => i.Comprado, comprado)
                .Set(i => i.UpdatedAt, DateTime.UtcNow);

            var options = new FindOneAndUpdateOptions<Item>
            {
                ReturnDocument = ReturnDocument.After
            };

            return await _context.Itens.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<bool> DeletarItem(string id, string usuarioId)
        {
            var result = await _context.Itens.DeleteOneAsync(
                i => i.Id == id && i.UsuarioId == usuarioId
            );
            return result.DeletedCount > 0;
        }

        public async Task<List<Item>> GetItensByCategoria(string categoriaId, string usuarioId)
        {
            return await _context.Itens
                .Find(i => i.CategoriaId == categoriaId && i.UsuarioId == usuarioId)
                .ToListAsync();
        }
    }
}

