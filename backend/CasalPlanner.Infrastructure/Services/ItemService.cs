using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Infrastructure.Persistence;
using MongoDB.Driver;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;

using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services
{

    public class ItemService : IItemService
    {
        private readonly MongoDbContext _context;
        private readonly IPushService _pushService;
        private readonly ILogger<ItemService> _logger;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;

        public ItemService(
            MongoDbContext context, 
            IPushService pushService, 
            ILogger<ItemService> logger,
            IEmailService emailService,
            IMemoryCache cache)
        {
            _context = context;
            _pushService = pushService;
            _logger = logger;
            _emailService = emailService;
            _cache = cache;
        }

        public async Task<List<Item>> GetItensByUsuarioId(string usuarioId)
        {
            return await _context.Itens
                .Find(i => i.UsuarioId == usuarioId)
                .SortByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<PagedResult<Item>> GetItensPaginated(string usuarioId, string? categoriaId, string? busca, string? status, string? pagamento, int? responsavelId, int page, int pageSize)
        {
            var builder = Builders<Item>.Filter;
            var filter = builder.Eq(i => i.UsuarioId, usuarioId);

            if (!string.IsNullOrEmpty(categoriaId) && categoriaId != "tudo")
                filter &= builder.Eq(i => i.CategoriaId, categoriaId);

            if (!string.IsNullOrEmpty(busca))
            {
                var buscaLower = busca.ToLower();
                var buscaFilter = builder.Regex(i => i.Nome, new MongoDB.Bson.BsonRegularExpression(buscaLower, "i")) |
                                  builder.Regex(i => i.Marca, new MongoDB.Bson.BsonRegularExpression(buscaLower, "i"));
                filter &= buscaFilter;
            }

            if (!string.IsNullOrEmpty(status) && status != "todos")
            {
                if (status == "comprados") filter &= builder.Eq(i => i.Comprado, true);
                else if (status == "faltando") filter &= builder.Eq(i => i.Comprado, false);
                else if (status == "presentes") filter &= builder.Eq(i => i.Origem, "ganho");
            }

            if (!string.IsNullOrEmpty(pagamento) && pagamento != "todos")
                filter &= builder.Eq(i => i.Pagamento, pagamento);

            if (responsavelId.HasValue && responsavelId.Value > 0)
                filter &= builder.Eq(i => i.ResponsavelId, responsavelId.Value);

            var totalCount = await _context.Itens.CountDocumentsAsync(filter);
            var items = await _context.Itens
                .Find(filter)
                .SortByDescending(i => i.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return new PagedResult<Item>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
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

            // Dispara push em background — não bloqueia a resposta HTTP
            var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
            if (usuario != null && usuario.IsCasal)
            {
                int currentPessoaId = (usuario.CasalInfo?.EmailPessoa2 == emailAutenticado) ? 2 : 1;
                var itemNome = item.Nome;
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _pushService.SendPushToPartnerAsync(usuario, currentPessoaId,
                            "Novo Item Adicionado",
                            $"Um novo item foi adicionado: {itemNome}");

                        var cacheKey = $"email_throttle_{usuarioId}";
                        if (!_cache.TryGetValue(cacheKey, out _))
                        {
                            string emailParceiro = currentPessoaId == 1 ? usuario.CasalInfo?.EmailPessoa2 ?? "" : usuario.CasalInfo?.EmailPessoa1 ?? "";
                            string nomeParceiro = currentPessoaId == 1 ? usuario.CasalInfo?.NomeCompletoPessoa2 ?? "" : usuario.CasalInfo?.NomeCompletoPessoa1 ?? "";
                            
                            if (!string.IsNullOrEmpty(emailParceiro))
                            {
                                await _emailService.EnviarNotificacaoParceiroAsync(
                                    emailParceiro,
                                    nomeParceiro,
                                    "Novo Item Adicionado",
                                    $"Um novo item foi adicionado à lista: {itemNome}");
                                
                                _cache.Set(cacheKey, true, TimeSpan.FromMinutes(30));
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Falha ao enviar notificação de novo item (background). Item: {Nome}", itemNome);
                    }
                });
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
                // Dispara push em background — não bloqueia a resposta HTTP
                var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
                if (usuario != null && usuario.IsCasal)
                {
                    int currentPessoaId = (usuario.CasalInfo?.EmailPessoa2 == emailAutenticado) ? 2 : 1;
                    var itemNome = item.Nome;
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _pushService.SendPushToPartnerAsync(usuario, currentPessoaId,
                                "Item Comprado!",
                                $"O item '{itemNome}' foi marcado como comprado.");

                            var cacheKey = $"email_throttle_{usuarioId}";
                            if (!_cache.TryGetValue(cacheKey, out _))
                            {
                                string emailParceiro = currentPessoaId == 1 ? usuario.CasalInfo?.EmailPessoa2 ?? "" : usuario.CasalInfo?.EmailPessoa1 ?? "";
                                string nomeParceiro = currentPessoaId == 1 ? usuario.CasalInfo?.NomeCompletoPessoa2 ?? "" : usuario.CasalInfo?.NomeCompletoPessoa1 ?? "";
                                
                                if (!string.IsNullOrEmpty(emailParceiro))
                                {
                                    await _emailService.EnviarNotificacaoParceiroAsync(
                                        emailParceiro,
                                        nomeParceiro,
                                        "Item Comprado",
                                        $"O item '{itemNome}' foi marcado como comprado.");
                                    
                                    _cache.Set(cacheKey, true, TimeSpan.FromMinutes(30));
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Falha ao enviar notificação de item comprado (background). Item: {Nome}", itemNome);
                        }
                    });
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

