using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Data;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authorization;

namespace CasalPlanner.API.Services
{
    public interface IItemService
    {
        Task<List<Item>> GetItensByUsuarioId(string usuarioId);
        Task<Item?> GetItemById(string id, string usuarioId);
        Task<Item> CriarItem(CriarItemDto dto, string usuarioId);
        Task<Item?> AtualizarItem(string id, AtualizarItemDto dto, string usuarioId);
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
                FotoUrl = dto.FotoUrl
            };

            await _context.Itens.InsertOneAsync(item);
            return item;
        }

        public async Task<Item?> AtualizarItem(string id, AtualizarItemDto dto, string usuarioId)
        {
            var item = await GetItemById(id, usuarioId);
            if (item == null)
                return null;

            var update = Builders<Item>.Update;
            var updates = new List<UpdateDefinition<Item>>();

            if (!string.IsNullOrEmpty(dto.Nome))
                updates.Add(update.Set(i => i.Nome, dto.Nome));

            if (!string.IsNullOrEmpty(dto.Marca))
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

            if (!string.IsNullOrEmpty(dto.Loja))
                updates.Add(update.Set(i => i.Loja, dto.Loja));

            if (!string.IsNullOrEmpty(dto.LinkProduto))
                updates.Add(update.Set(i => i.LinkProduto, dto.LinkProduto));

            if (!string.IsNullOrEmpty(dto.FotoUrl))
                updates.Add(update.Set(i => i.FotoUrl, dto.FotoUrl));

            updates.Add(update.Set(i => i.UpdatedAt, DateTime.UtcNow));

            await _context.Itens.UpdateOneAsync(
                i => i.Id == id,
                update.Combine(updates)
            );

            return await GetItemById(id, usuarioId);
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