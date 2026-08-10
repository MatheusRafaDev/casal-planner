using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Persistence;
using MongoDB.Driver;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CasalPlanner.Infrastructure.Repositories
{
    public class ItemRepository : IItemRepository
    {
        private readonly MongoDbContext _context;

        public ItemRepository(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<List<Item>> GetByUsuarioIdAsync(string usuarioId)
        {
            return await _context.Itens
                .Find(i => i.UsuarioId == usuarioId)
                .SortByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<(List<Item> Items, long TotalCount)> GetPaginatedAsync(string usuarioId, string? categoriaId, string? busca, string? status, string? pagamento, int? responsavelId, int page, int pageSize)
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

            return (items, totalCount);
        }

        public async Task<Item?> GetByIdAsync(string id, string usuarioId)
        {
            return await _context.Itens
                .Find(i => i.Id == id && i.UsuarioId == usuarioId)
                .FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Item item)
        {
            await _context.Itens.InsertOneAsync(item);
        }

        public async Task<Item?> UpdateAsync(string id, string usuarioId, AtualizarItemDto dto, Item itemAtual)
        {
            var update = Builders<Item>.Update;
            var updates = new List<UpdateDefinition<Item>>();

            if (!string.IsNullOrEmpty(dto.Nome)) updates.Add(update.Set(i => i.Nome, dto.Nome));
            if (dto.Marca != null) updates.Add(update.Set(i => i.Marca, dto.Marca));
            if (dto.Preco.HasValue) updates.Add(update.Set(i => i.Preco, dto.Preco.Value));
            if (dto.Quantidade.HasValue) updates.Add(update.Set(i => i.Quantidade, dto.Quantidade.Value));
            if (!string.IsNullOrEmpty(dto.CategoriaId)) updates.Add(update.Set(i => i.CategoriaId, dto.CategoriaId));
            if (!string.IsNullOrEmpty(dto.Pagamento)) updates.Add(update.Set(i => i.Pagamento, dto.Pagamento));
            if (!string.IsNullOrEmpty(dto.Prioridade)) updates.Add(update.Set(i => i.Prioridade, dto.Prioridade));
            if (dto.Comprado.HasValue) updates.Add(update.Set(i => i.Comprado, dto.Comprado.Value));
            if (dto.Loja != null) updates.Add(update.Set(i => i.Loja, dto.Loja));
            if (dto.LinkProduto != null) updates.Add(update.Set(i => i.LinkProduto, dto.LinkProduto));
            if (dto.FotoUrl != null) updates.Add(update.Set(i => i.FotoUrl, dto.FotoUrl));
            if (dto.FotoPublicId != null) updates.Add(update.Set(i => i.FotoPublicId, dto.FotoPublicId));
            if (!string.IsNullOrEmpty(dto.Origem)) updates.Add(update.Set(i => i.Origem, dto.Origem));
            if (dto.Parcelas.HasValue) updates.Add(update.Set(i => i.Parcelas, dto.Parcelas.Value));
            if (dto.OrigemDescricao != null) updates.Add(update.Set(i => i.OrigemDescricao, dto.OrigemDescricao));
            if (dto.Variantes != null) updates.Add(update.Set(i => i.Variantes, dto.Variantes));

            if (dto.ClearVarianteSelecionadaId) updates.Add(update.Set(i => i.VarianteSelecionadaId, null));
            else if (dto.VarianteSelecionadaId != null) updates.Add(update.Set(i => i.VarianteSelecionadaId, dto.VarianteSelecionadaId));

            if (dto.ClearResponsavelId) updates.Add(update.Set(i => i.ResponsavelId, null));
            else if (dto.ResponsavelId.HasValue) updates.Add(update.Set(i => i.ResponsavelId, dto.ResponsavelId.Value));

            if (dto.ClearDivisaoPagamento) updates.Add(update.Set(i => i.DivisaoPagamento, null));
            else if (dto.DivisaoPagamento != null) updates.Add(update.Set(i => i.DivisaoPagamento, new DivisaoPagamento { ValorPessoa1 = dto.DivisaoPagamento.ValorPessoa1, ValorPessoa2 = dto.DivisaoPagamento.ValorPessoa2 }));

            if (updates.Count == 0) return itemAtual;

            updates.Add(update.Set(i => i.UpdatedAt, DateTime.UtcNow));

            var options = new FindOneAndUpdateOptions<Item> { ReturnDocument = ReturnDocument.After };
            var filter = Builders<Item>.Filter.And(Builders<Item>.Filter.Eq(i => i.Id, id), Builders<Item>.Filter.Eq(i => i.UsuarioId, usuarioId));

            return await _context.Itens.FindOneAndUpdateAsync(filter, update.Combine(updates), options);
        }

        public async Task<Item?> UpdateCompradoAsync(string id, string usuarioId, bool comprado)
        {
            var filter = Builders<Item>.Filter.And(Builders<Item>.Filter.Eq(i => i.Id, id), Builders<Item>.Filter.Eq(i => i.UsuarioId, usuarioId));
            var update = Builders<Item>.Update.Set(i => i.Comprado, comprado).Set(i => i.UpdatedAt, DateTime.UtcNow);
            var options = new FindOneAndUpdateOptions<Item> { ReturnDocument = ReturnDocument.After };
            return await _context.Itens.FindOneAndUpdateAsync(filter, update, options);
        }

        public async Task<bool> DeleteAsync(string id, string usuarioId)
        {
            var result = await _context.Itens.DeleteOneAsync(i => i.Id == id && i.UsuarioId == usuarioId);
            return result.DeletedCount > 0;
        }

        public async Task<List<Item>> GetByCategoriaAsync(string categoriaId, string usuarioId)
        {
            return await _context.Itens.Find(i => i.CategoriaId == categoriaId && i.UsuarioId == usuarioId).ToListAsync();
        }

        public async Task<(ResumoDto Resumo, ComparativoDto Comparativo)> ObterResumoAgregadoAsync(string usuarioId)
        {
            var hoje = DateTime.UtcNow;
            var inicioMesAtual = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var inicioMesPassado = inicioMesAtual.AddMonths(-1);
            var inicioMesRetrasado = inicioMesAtual.AddMonths(-2);
            var inicioProximoMes = inicioMesAtual.AddMonths(1);

            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument("UsuarioId", new ObjectId(usuarioId))),
                new BsonDocument("$project", new BsonDocument
                {
                    { "CategoriaId", 1 },
                    { "Pagamento", 1 },
                    { "Comprado", 1 },
                    { "Quantidade", 1 },
                    { "ValorTotal", new BsonDocument("$multiply", new BsonArray { new BsonDocument("$convert", new BsonDocument { { "input", "$Preco" }, { "to", "double" }, { "onError", 0.0 }, { "onNull", 0.0 } }), new BsonDocument("$convert", new BsonDocument { { "input", "$Quantidade" }, { "to", "double" }, { "onError", 1.0 }, { "onNull", 1.0 } }) }) },
                    { "IsMesAtual", new BsonDocument("$and", new BsonArray { new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesAtual) }), new BsonDocument("$lt", new BsonArray { "$CreatedAt", new BsonDateTime(inicioProximoMes) }) }) },
                    { "IsMesPassado", new BsonDocument("$and", new BsonArray { new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesPassado) }), new BsonDocument("$lt", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesAtual) }) }) },
                    { "IsMesRetrasado", new BsonDocument("$and", new BsonArray { new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesRetrasado) }), new BsonDocument("$lt", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesPassado) }) }) },
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", BsonNull.Value },
                    { "TotalGeral", new BsonDocument("$sum", "$ValorTotal") },
                    { "TotalVR", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }), "$ValorTotal", 0 })) },
                    { "TotalNormal", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$ne", new BsonArray { "$Pagamento", "vr" }), "$ValorTotal", 0 })) },
                    { "TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { "$Comprado", 1, 0 })) },
                    { "TotalItens", new BsonDocument("$sum", 1) },
                    { "TotalPessoa1", new BsonDocument("$sum", new BsonDocument("$ifNull", new BsonArray { new BsonDocument("$convert", new BsonDocument { { "input", "$DivisaoPagamento.ValorPessoa1" }, { "to", "double" }, { "onError", BsonNull.Value }, { "onNull", BsonNull.Value } }), new BsonDocument("$cond", new BsonArray { new BsonDocument("$eq", new BsonArray { "$ResponsavelId", 1 }), "$ValorTotal", 0 }) })) },
                    { "TotalPessoa2", new BsonDocument("$sum", new BsonDocument("$ifNull", new BsonArray { new BsonDocument("$convert", new BsonDocument { { "input", "$DivisaoPagamento.ValorPessoa2" }, { "to", "double" }, { "onError", BsonNull.Value }, { "onNull", BsonNull.Value } }), new BsonDocument("$cond", new BsonArray { new BsonDocument("$eq", new BsonArray { "$ResponsavelId", 2 }), "$ValorTotal", 0 }) })) },
                    { "PorCategoria", new BsonDocument("$push", new BsonDocument { { "CategoriaId", "$CategoriaId" }, { "ValorTotal", "$ValorTotal" }, { "Quantidade", "$Quantidade" }, { "Comprado", "$Comprado" } }) },
                    { "MA_TotalGeral", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { "$IsMesAtual", "$ValorTotal", 0 })) },
                    { "MA_TotalVR", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesAtual", new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                    { "MA_TotalNormal", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesAtual", new BsonDocument("$ne", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                    { "MA_TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesAtual", "$Comprado" }), 1, 0 })) },
                    { "MP_TotalGeral", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { "$IsMesPassado", "$ValorTotal", 0 })) },
                    { "MP_TotalVR", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado", new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                    { "MP_TotalNormal", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado", new BsonDocument("$ne", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                    { "MP_TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado", "$Comprado" }), 1, 0 })) },
                    { "MR_TotalGeral", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { "$IsMesRetrasado", "$ValorTotal", 0 })) },
                })
            };

            var cursor = await _context.Itens.AggregateAsync<BsonDocument>(pipeline);
            var doc = await cursor.FirstOrDefaultAsync();

            var resumoDto = doc == null ? new ResumoDto() : MontarResumoDto(doc);
            var comparativoDto = doc == null ? new ComparativoDto() : MontarComparativoDto(doc);

            return (resumoDto, comparativoDto);
        }

        private static ResumoDto MontarResumoDto(BsonDocument doc)
        {
            var porCategoria = new Dictionary<string, decimal>();
            var quantidadePorCategoria = new Dictionary<string, int>();
            var compradosPorCategoria = new Dictionary<string, int>();

            if (doc.TryGetValue("PorCategoria", out var arr) && arr is BsonArray items)
            {
                foreach (var element in items)
                {
                    if (element is not BsonDocument item) continue;

                    var catVal = item.GetValue("CategoriaId", BsonNull.Value);
                    if (catVal.IsBsonNull) continue;
                    var catId = catVal.ToString();
                    if (string.IsNullOrEmpty(catId)) continue;

                    var valor = ToDecimalSafe(item.GetValue("ValorTotal", 0));
                    var qtd = ToIntSafe(item.GetValue("Quantidade", 1));
                    var comprado = ToBoolSafe(item.GetValue("Comprado", false)) ? 1 : 0;

                    if (porCategoria.ContainsKey(catId))
                    {
                        porCategoria[catId] += valor;
                        quantidadePorCategoria[catId] += qtd;
                        compradosPorCategoria[catId] += comprado;
                    }
                    else
                    {
                        porCategoria[catId] = valor;
                        quantidadePorCategoria[catId] = qtd;
                        compradosPorCategoria[catId] = comprado;
                    }
                }
            }

            var totalGeral = ToDecimalSafe(doc.GetValue("TotalGeral", 0));
            var totalComprados = ToIntSafe(doc.GetValue("TotalComprados", 0));
            var totalItens = ToIntSafe(doc.GetValue("TotalItens", 0));

            var percentualConcluido = totalItens > 0 ? Math.Round((decimal)totalComprados / totalItens * 100, 2) : 0m;

            return new ResumoDto
            {
                TotalGeral = totalGeral,
                TotalVR = ToDecimalSafe(doc.GetValue("TotalVR", 0)),
                TotalNormal = ToDecimalSafe(doc.GetValue("TotalNormal", 0)),
                TotalComprados = totalComprados,
                TotalItens = totalItens,
                TotalPessoa1 = ToDecimalSafe(doc.GetValue("TotalPessoa1", 0)),
                TotalPessoa2 = ToDecimalSafe(doc.GetValue("TotalPessoa2", 0)),
                PorCategoria = porCategoria,
                QuantidadePorCategoria = quantidadePorCategoria,
                CompradosPorCategoria = compradosPorCategoria,
                PercentualConcluido = percentualConcluido,
            };
        }

        private static ComparativoDto MontarComparativoDto(BsonDocument doc)
        {
            var atualGeral = ToDecimalSafe(doc.GetValue("MA_TotalGeral", 0));
            var atualVR = ToDecimalSafe(doc.GetValue("MA_TotalVR", 0));
            var atualNormal = ToDecimalSafe(doc.GetValue("MA_TotalNormal", 0));
            var atualComp = ToDecimalSafe(doc.GetValue("MA_TotalComprados", 0));
            var mpGeral = ToDecimalSafe(doc.GetValue("MP_TotalGeral", 0));
            var mpVR = ToDecimalSafe(doc.GetValue("MP_TotalVR", 0));
            var mpNormal = ToDecimalSafe(doc.GetValue("MP_TotalNormal", 0));
            var mpComp = ToDecimalSafe(doc.GetValue("MP_TotalComprados", 0));
            var mrGeral = ToDecimalSafe(doc.GetValue("MR_TotalGeral", 0));
            var mediaGeral = (mrGeral + mpGeral + atualGeral) / 3;

            return new ComparativoDto
            {
                TotalGeral = Variacao(atualGeral, mpGeral),
                TotalVR = Variacao(atualVR, mpVR),
                TotalNormal = Variacao(atualNormal, mpNormal),
                TotalComprados = Variacao(atualComp, mpComp),
                PercentualGeral = mediaGeral > 0 ? Math.Round((atualGeral - mediaGeral) / mediaGeral * 100, 2) : 0,
                MesAtual = atualGeral,
                MesPassado = mpGeral,
                MesRetrasado = mrGeral,
            };
        }

        private static int ToIntSafe(BsonValue v)
        {
            if (v.IsInt32) return v.AsInt32;
            if (v.IsInt64) return (int)v.AsInt64;
            if (v.IsDouble) return (int)v.AsDouble;
            if (int.TryParse(v.ToString(), out var result)) return result;
            return 0;
        }

        private static decimal ToDecimalSafe(BsonValue v)
        {
            if (v.IsDouble) return (decimal)v.AsDouble;
            if (v.IsInt32) return v.AsInt32;
            if (v.IsInt64) return v.AsInt64;
            if (v.IsDecimal128) return v.AsDecimal;
            if (decimal.TryParse(v.ToString(), out var result)) return result;
            return 0m;
        }

        private static bool ToBoolSafe(BsonValue v)
        {
            if (v.IsBoolean) return v.AsBoolean;
            if (bool.TryParse(v.ToString(), out var result)) return result;
            return false;
        }

        private static decimal Variacao(decimal atual, decimal anterior)
        {
            if (anterior == 0) return atual > 0 ? 100 : 0;
            return Math.Round((atual - anterior) / anterior * 100, 2);
        }
    }
}
