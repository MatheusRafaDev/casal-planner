using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Infrastructure.Persistence;
using MongoDB.Driver;

using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services
{

    public class ItemService : IItemService
    {
        private readonly MongoDbContext _context;
        private readonly IPushService _pushService;

        public ItemService(MongoDbContext context, IPushService pushService)
        {
            _context = context;
            _pushService = pushService;
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

        public async Task<Item> CriarItem(CriarItemDto dto, string usuarioId, string emailAutenticado)
        {
            var categoria = await _context.Categorias.Find(c => c.Id == dto.CategoriaId).FirstOrDefaultAsync();
            if (categoria == null || (!categoria.IsPadrao && categoria.UsuarioId != usuarioId))
            {
                throw new ArgumentException("Categoria inválida ou não pertence ao usuário");
            }

            if (dto.DivisaoPagamento != null)
            {
                var soma = dto.DivisaoPagamento.ValorPessoa1 + dto.DivisaoPagamento.ValorPessoa2;
                if (soma != (dto.Preco * dto.Quantidade))
                {
                    throw new ArgumentException("A soma da divisão de pagamento deve ser igual ao valor total do item (Preço x Quantidade).");
                }
            }

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
                Origem = dto.Origem ?? "comprado",
                OrigemDescricao = dto.OrigemDescricao,
                Parcelas = dto.Parcelas,
                Variantes = dto.Variantes ?? new List<string>(),
                VarianteSelecionadaId = dto.VarianteSelecionadaId,
                ResponsavelId = dto.ResponsavelId,
                DivisaoPagamento = dto.DivisaoPagamento != null ? new DivisaoPagamento
                {
                    ValorPessoa1 = dto.DivisaoPagamento.ValorPessoa1,
                    ValorPessoa2 = dto.DivisaoPagamento.ValorPessoa2
                } : null
            };

            await _context.Itens.InsertOneAsync(item);

            // Fetch user for push notifications
            var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
            if (usuario != null && usuario.IsCasal)
            {
                int currentPessoaId = (usuario.CasalInfo?.EmailPessoa2 == emailAutenticado) ? 2 : 1;
                await _pushService.SendPushToPartnerAsync(usuario, currentPessoaId, 
                    "Novo Item Adicionado", 
                    $"Um novo item foi adicionado: {item.Nome}");
            }

            return item;
        }

        public async Task<Item?> AtualizarItem(string id, AtualizarItemDto dto, string usuarioId, string emailAutenticado)
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
            {
                var categoria = await _context.Categorias.Find(c => c.Id == dto.CategoriaId).FirstOrDefaultAsync();
                if (categoria == null || (!categoria.IsPadrao && categoria.UsuarioId != usuarioId))
                {
                    throw new ArgumentException("Categoria inválida ou não pertence ao usuário");
                }
                updates.Add(update.Set(i => i.CategoriaId, dto.CategoriaId));
            }

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

            if (dto.Parcelas.HasValue)
                updates.Add(update.Set(i => i.Parcelas, dto.Parcelas.Value));

            if (dto.OrigemDescricao != null)
                updates.Add(update.Set(i => i.OrigemDescricao, dto.OrigemDescricao));

            if (dto.Variantes != null)
                updates.Add(update.Set(i => i.Variantes, dto.Variantes));

            // Allow clearing VarianteSelecionadaId via clearVarianteSelecionadaId flag
            // (null means "don't update", true means "clear to null", value means "set to value")
            if (dto.ClearVarianteSelecionadaId)
            {
                updates.Add(update.Set(i => i.VarianteSelecionadaId, null));
            }
            else if (dto.VarianteSelecionadaId != null)
            {
                updates.Add(update.Set(i => i.VarianteSelecionadaId, dto.VarianteSelecionadaId));
            }

            if (dto.ClearResponsavelId)
            {
                updates.Add(update.Set(i => i.ResponsavelId, null));
            }
            else if (dto.ResponsavelId.HasValue)
            {
                updates.Add(update.Set(i => i.ResponsavelId, dto.ResponsavelId.Value));
            }

            if (dto.ClearDivisaoPagamento)
            {
                updates.Add(update.Set(i => i.DivisaoPagamento, null));
            }
            else if (dto.DivisaoPagamento != null)
            {
                updates.Add(update.Set(i => i.DivisaoPagamento, new DivisaoPagamento
                {
                    ValorPessoa1 = dto.DivisaoPagamento.ValorPessoa1,
                    ValorPessoa2 = dto.DivisaoPagamento.ValorPessoa2
                }));
            }

            // Validação de divisão na atualização (precisamos do preço e quantidade atualizados ou do banco)
            if (dto.DivisaoPagamento != null)
            {
                var itemAtual = await GetItemById(id, usuarioId);
                var precoFinal = dto.Preco ?? itemAtual?.Preco ?? 0;
                var qtdFinal = dto.Quantidade ?? itemAtual?.Quantidade ?? 1;
                var soma = dto.DivisaoPagamento.ValorPessoa1 + dto.DivisaoPagamento.ValorPessoa2;
                if (soma != (precoFinal * qtdFinal))
                {
                    throw new ArgumentException("A soma da divisão de pagamento deve ser igual ao valor total do item (Preço x Quantidade).");
                }
            }

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
        public async Task<Item?> AtualizarComprado(string id, bool comprado, string usuarioId, string emailAutenticado)
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

            var item = await _context.Itens.FindOneAndUpdateAsync(filter, update, options);

            if (item != null && comprado)
            {
                var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
                if (usuario != null && usuario.IsCasal)
                {
                    int currentPessoaId = (usuario.CasalInfo?.EmailPessoa2 == emailAutenticado) ? 2 : 1;
                    await _pushService.SendPushToPartnerAsync(usuario, currentPessoaId,
                        "Item Comprado!",
                        $"O item '{item.Nome}' foi marcado como comprado.");
                }
            }

            return item;
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

