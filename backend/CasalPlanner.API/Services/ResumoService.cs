using CasalPlanner.API.Data;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
using MongoDB.Bson;
using MongoDB.Driver;

namespace CasalPlanner.API.Services
{
    public class ResumoService : IResumoService
    {
        private readonly MongoDbContext _context;
        private readonly ILogger<ResumoService> _logger;

        public ResumoService(MongoDbContext context, ILogger<ResumoService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ResumoResponseDto> ObterResumo(string usuarioId)
        {
            try
            {
                var hoje              = DateTime.UtcNow;
                var inicioMesPassado  = hoje.AddMonths(-1);
                var inicioMesRetrasado = hoje.AddMonths(-2);

                // Uma única agregação no MongoDB: filtra, calcula e agrupa tudo no servidor.
                // Antes: ToListAsync() carregava todos os itens do usuário em memória e
                // filtrava por data em C#. Agora zero documentos são transferidos além
                // do único doc de resultado.
                var pipeline = new[]
                {
                    // 1. Filtra apenas os itens do usuário autenticado
                    new BsonDocument("$match", new BsonDocument("UsuarioId", usuarioId)),

                    // 2. Projeta campos utilizados + ValorTotal calculado no servidor
                    new BsonDocument("$project", new BsonDocument
                    {
                        { "CategoriaId", 1 },
                        { "Pagamento",   1 },
                        { "Comprado",    1 },
                        { "CreatedAt",   1 },
                        { "Quantidade",  1 },
                        { "ValorTotal",  new BsonDocument("$multiply",
                            new BsonArray { "$Preco", "$Quantidade" }) },
                        // flags de período para os $cond no $group
                        { "IsMesPassado", new BsonDocument("$and",
                            new BsonArray {
                                new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesPassado) }),
                                new BsonDocument("$lt",  new BsonArray { "$CreatedAt", new BsonDateTime(hoje) })
                            }) },
                        { "IsMesRetrasado", new BsonDocument("$and",
                            new BsonArray {
                                new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesRetrasado) }),
                                new BsonDocument("$lt",  new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesPassado) })
                            }) },
                    }),

                    // 3. Grupo único acumulando todos os totais de uma vez
                    new BsonDocument("$group", new BsonDocument
                    {
                        { "_id", BsonNull.Value },

                        // ── Resumo atual (todos os itens, sem filtro de data) ──
                        { "TotalGeral",   new BsonDocument("$sum", "$ValorTotal") },
                        { "TotalVR",      new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }), "$ValorTotal", 0 })) },
                        { "TotalNormal",  new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$eq", new BsonArray { "$Pagamento", "normal" }), "$ValorTotal", 0 })) },
                        { "TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { "$Comprado", 1, 0 })) },
                        { "TotalItens",   new BsonDocument("$sum", 1) },

                        // Array de itens para calcular porCategoria depois
                        { "PorCategoria", new BsonDocument("$push", new BsonDocument
                            {
                                { "CategoriaId", "$CategoriaId" },
                                { "ValorTotal",  "$ValorTotal"  },
                                { "Quantidade",  "$Quantidade"  },
                            }) },

                        // ── Mês passado ──
                        { "MP_TotalGeral",    new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { "$IsMesPassado", "$ValorTotal", 0 })) },
                        { "MP_TotalVR",       new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado",
                                new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                        { "MP_TotalNormal",   new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado",
                                new BsonDocument("$eq", new BsonArray { "$Pagamento", "normal" }) }), "$ValorTotal", 0 })) },
                        { "MP_TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado", "$Comprado" }), 1, 0 })) },

                        // ── Mês retrasado (só TotalGeral para a tendência) ──
                        { "MR_TotalGeral",    new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { "$IsMesRetrasado", "$ValorTotal", 0 })) },
                    })
                };

                var cursor = await _context.Itens.AggregateAsync<BsonDocument>(pipeline);
                var doc    = await cursor.FirstOrDefaultAsync();

                return new ResumoResponseDto
                {
                    Atual       = doc == null ? new ResumoDto()      : MontarResumoDto(doc),
                    Comparativo = doc == null ? new ComparativoDto() : MontarComparativoDto(doc),
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter resumo para usuário {UsuarioId}", usuarioId);
                throw;
            }
        }

        // ── helpers ─────────────────────────────────────────────────────────────────

        private static ResumoDto MontarResumoDto(BsonDocument doc)
        {
            var porCategoria          = new Dictionary<string, decimal>();
            var quantidadePorCategoria = new Dictionary<string, int>();

            if (doc.TryGetValue("PorCategoria", out var arr) && arr is BsonArray items)
            {
                foreach (var item in items.OfType<BsonDocument>())
                {
                    var catId = item.GetValue("CategoriaId", BsonNull.Value).IsBsonNull
                        ? "" : item["CategoriaId"].AsString;
                    if (string.IsNullOrEmpty(catId)) continue;

                    var valor = (decimal)item.GetValue("ValorTotal", 0).ToDouble();
                    var qtd   = item.GetValue("Quantidade", 1).ToInt32();

                    if (porCategoria.TryGetValue(catId, out _))
                    {
                        porCategoria[catId]           += valor;
                        quantidadePorCategoria[catId] += qtd;
                    }
                    else
                    {
                        porCategoria[catId]           = valor;
                        quantidadePorCategoria[catId] = qtd;
                    }
                }
            }

            return new ResumoDto
            {
                TotalGeral             = (decimal)doc.GetValue("TotalGeral",    0).ToDouble(),
                TotalVR                = (decimal)doc.GetValue("TotalVR",       0).ToDouble(),
                TotalNormal            = (decimal)doc.GetValue("TotalNormal",   0).ToDouble(),
                TotalComprados         = (decimal)doc.GetValue("TotalComprados",0).ToDouble(),
                TotalItens             = doc.GetValue("TotalItens", 0).ToInt32(),
                PorCategoria           = porCategoria,
                QuantidadePorCategoria = quantidadePorCategoria,
            };
        }

        private static ComparativoDto MontarComparativoDto(BsonDocument doc)
        {
            var atualGeral  = (decimal)doc.GetValue("TotalGeral",       0).ToDouble();
            var atualVR     = (decimal)doc.GetValue("TotalVR",          0).ToDouble();
            var atualNormal = (decimal)doc.GetValue("TotalNormal",      0).ToDouble();
            var atualComp   = (decimal)doc.GetValue("TotalComprados",   0).ToDouble();

            var mpGeral     = (decimal)doc.GetValue("MP_TotalGeral",    0).ToDouble();
            var mpVR        = (decimal)doc.GetValue("MP_TotalVR",       0).ToDouble();
            var mpNormal    = (decimal)doc.GetValue("MP_TotalNormal",   0).ToDouble();
            var mpComp      = (decimal)doc.GetValue("MP_TotalComprados",0).ToDouble();
            var mrGeral     = (decimal)doc.GetValue("MR_TotalGeral",    0).ToDouble();

            var mediaGeral  = (mrGeral + mpGeral + atualGeral) / 3;

            return new ComparativoDto
            {
                TotalGeral      = Variacao(atualGeral,  mpGeral),
                TotalVR         = Variacao(atualVR,     mpVR),
                TotalNormal     = Variacao(atualNormal, mpNormal),
                TotalComprados  = Variacao(atualComp,   mpComp),
                PercentualGeral = mediaGeral > 0
                    ? Math.Round((atualGeral - mediaGeral) / mediaGeral * 100, 2)
                    : 0,
            };
        }

        private static decimal Variacao(decimal atual, decimal anterior)
        {
            if (anterior == 0) return atual > 0 ? 100 : 0;
            return Math.Round((atual - anterior) / anterior * 100, 2);
        }
    }
}
