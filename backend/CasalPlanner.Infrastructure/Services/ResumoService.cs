using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.Application.DTOs;
using MongoDB.Bson;
using MongoDB.Driver;

using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services
{
    public class ResumoService : IResumoService
    {
        private readonly MongoDbContext _context;
        private readonly ILogger<ResumoService> _logger;

        public ResumoService(MongoDbContext context, ILogger<ResumoService> logger)
        {
            _context = context;
            _logger  = logger;
        }

        public async Task<ResumoResponseDto> ObterResumo(string usuarioId)
        {
            try
            {
                var hoje               = DateTime.UtcNow;
                var inicioMesAtual     = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var inicioMesPassado   = inicioMesAtual.AddMonths(-1);
                var inicioMesRetrasado = inicioMesAtual.AddMonths(-2);
                var inicioProximoMes   = inicioMesAtual.AddMonths(1);

                // Uma única agregação no MongoDB: filtra, calcula e agrupa no servidor.
                // Antes: ToListAsync() carregava todos os itens em memória e filtrava
                // por data em C#. Agora apenas um documento de resultado trafega.
                var pipeline = new[]
                {
                    // 1. Filtra apenas os itens do usuário autenticado (convertendo a string para ObjectId)
                    new BsonDocument("$match", new BsonDocument("UsuarioId", new ObjectId(usuarioId))),

                    // 2. Projeta ValorTotal + flags de período (calculadas no servidor)
                    new BsonDocument("$project", new BsonDocument
                    {
                        { "CategoriaId", 1 },
                        { "Pagamento",   1 },
                        { "Comprado",    1 },
                        { "Quantidade",  1 },

                        { "ValorTotal",  new BsonDocument("$multiply",
                            new BsonArray { 
                                new BsonDocument("$convert", new BsonDocument { { "input", "$Preco" }, { "to", "double" }, { "onError", 0.0 }, { "onNull", 0.0 } }), 
                                new BsonDocument("$convert", new BsonDocument { { "input", "$Quantidade" }, { "to", "double" }, { "onError", 1.0 }, { "onNull", 1.0 } }) 
                            }) },
                        { "IsMesAtual", new BsonDocument("$and",
                            new BsonArray {
                                new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesAtual) }),
                                new BsonDocument("$lt",  new BsonArray { "$CreatedAt", new BsonDateTime(inicioProximoMes) })
                            }) },
                        { "IsMesPassado", new BsonDocument("$and",
                            new BsonArray {
                                new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesPassado) }),
                                new BsonDocument("$lt",  new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesAtual) })
                            }) },
                        { "IsMesRetrasado", new BsonDocument("$and",
                            new BsonArray {
                                new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesRetrasado) }),
                                new BsonDocument("$lt",  new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesPassado) })
                            }) },
                    }),

                    // 3. Grupo único — todos os acumuladores em uma passagem
                    new BsonDocument("$group", new BsonDocument
                    {
                        { "_id", BsonNull.Value },

                        // Totais gerais (todos os itens, sem filtro de data)
                        { "TotalGeral",     new BsonDocument("$sum", "$ValorTotal") },
                        { "TotalVR",        new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }), "$ValorTotal", 0 })) },
                        { "TotalNormal",    new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$ne", new BsonArray { "$Pagamento", "vr" }), "$ValorTotal", 0 })) },
                        { "TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { "$Comprado", 1, 0 })) },
                        { "TotalItens",     new BsonDocument("$sum", 1) },

                        { "TotalPessoa1", new BsonDocument("$sum", new BsonDocument("$ifNull", new BsonArray
                            {
                                new BsonDocument("$convert", new BsonDocument { { "input", "$DivisaoPagamento.ValorPessoa1" }, { "to", "double" }, { "onError", BsonNull.Value }, { "onNull", BsonNull.Value } }),
                                new BsonDocument("$cond", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$ResponsavelId", 1 }),
                                    "$ValorTotal",
                                    0
                                })
                            })) },
                        { "TotalPessoa2", new BsonDocument("$sum", new BsonDocument("$ifNull", new BsonArray
                            {
                                new BsonDocument("$convert", new BsonDocument { { "input", "$DivisaoPagamento.ValorPessoa2" }, { "to", "double" }, { "onError", BsonNull.Value }, { "onNull", BsonNull.Value } }),
                                new BsonDocument("$cond", new BsonArray
                                {
                                    new BsonDocument("$eq", new BsonArray { "$ResponsavelId", 2 }),
                                    "$ValorTotal",
                                    0
                                })
                            })) },

                        // Array para calcular porCategoria depois
                        { "PorCategoria",   new BsonDocument("$push", new BsonDocument
                            {
                                { "CategoriaId", "$CategoriaId" },
                                { "ValorTotal",  "$ValorTotal"  },
                                { "Quantidade",  "$Quantidade"  },
                                { "Comprado",    "$Comprado"    },
                            }) },

                        // Mês atual
                        { "MA_TotalGeral",     new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { "$IsMesAtual", "$ValorTotal", 0 })) },
                        { "MA_TotalVR",        new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesAtual",
                                new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                        { "MA_TotalNormal",    new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesAtual",
                                new BsonDocument("$ne", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                        { "MA_TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesAtual", "$Comprado" }), 1, 0 })) },

                        // Mês passado
                        { "MP_TotalGeral",     new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { "$IsMesPassado", "$ValorTotal", 0 })) },
                        { "MP_TotalVR",        new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado",
                                new BsonDocument("$eq", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                        { "MP_TotalNormal",    new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado",
                                new BsonDocument("$ne", new BsonArray { "$Pagamento", "vr" }) }), "$ValorTotal", 0 })) },
                        { "MP_TotalComprados", new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { new BsonDocument("$and", new BsonArray { "$IsMesPassado", "$Comprado" }), 1, 0 })) },

                        // Mês retrasado (só TotalGeral para o cálculo de tendência)
                        { "MR_TotalGeral",     new BsonDocument("$sum", new BsonDocument("$cond",
                            new BsonArray { "$IsMesRetrasado", "$ValorTotal", 0 })) },
                    })
                };

                var cursor = await _context.Itens.AggregateAsync<BsonDocument>(pipeline);
                var doc    = await cursor.FirstOrDefaultAsync();

                var resumoDto = doc == null ? new ResumoDto() : MontarResumoDto(doc);
                var comparativoDto = doc == null ? new ComparativoDto() : MontarComparativoDto(doc);

                // Buscar MetaGlobalEnxoval do usuário e montar ResumoEnxovalDto
                var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
                var metaGlobalEnxoval = usuario?.MetaGlobalEnxoval;
                var percentualMetaGlobal = metaGlobalEnxoval > 0 ? Math.Round(resumoDto.TotalGeral / metaGlobalEnxoval.Value * 100, 2) : 0;
                var totalRestanteParaMeta = Math.Max(0, (metaGlobalEnxoval ?? 0) - resumoDto.TotalGeral);
                var resumoEnxovalDto = new ResumoEnxovalDto
                {
                    MetaGlobalEnxoval = metaGlobalEnxoval,
                    PercentualMetaGlobal = percentualMetaGlobal,
                    TotalRestanteParaMeta = totalRestanteParaMeta,
                    TotalItensComprados = resumoDto.TotalComprados,
                    TotalItensPendentes = resumoDto.TotalItens - resumoDto.TotalComprados
                };

                return new ResumoResponseDto
                {
                    Atual       = resumoDto,
                    Comparativo = comparativoDto,
                    Enxoval     = resumoEnxovalDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter resumo para usuário {UsuarioId}", usuarioId);
                throw;
            }
        }

        // ── helpers ──────────────────────────────────────────────────────────────

        private static ResumoDto MontarResumoDto(BsonDocument doc)
        {
            var porCategoria           = new Dictionary<string, decimal>();
            var quantidadePorCategoria = new Dictionary<string, int>();
            var compradosPorCategoria  = new Dictionary<string, int>();

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
                    var qtd   = ToIntSafe(item.GetValue("Quantidade", 1));
                    var comprado = ToBoolSafe(item.GetValue("Comprado", false)) ? 1 : 0;

                    if (porCategoria.ContainsKey(catId))
                    {
                        porCategoria[catId]           += valor;
                        quantidadePorCategoria[catId] += qtd;
                        compradosPorCategoria[catId]  += comprado;
                    }
                    else
                    {
                        porCategoria[catId]           = valor;
                        quantidadePorCategoria[catId] = qtd;
                        compradosPorCategoria[catId]  = comprado;
                    }
                }
            }

            var totalGeral = ToDecimalSafe(doc.GetValue("TotalGeral", 0));
            var totalComprados = ToIntSafe(doc.GetValue("TotalComprados", 0));
            var totalItens = ToIntSafe(doc.GetValue("TotalItens", 0));

            // Calcular PercentualConcluido
            var percentualConcluido = totalItens > 0 
                ? Math.Round((decimal)totalComprados / totalItens * 100, 2) 
                : 0m;

            return new ResumoDto
            {
                TotalGeral             = totalGeral,
                TotalVR                = ToDecimalSafe(doc.GetValue("TotalVR",       0)),
                TotalNormal            = ToDecimalSafe(doc.GetValue("TotalNormal",   0)),
                TotalComprados         = totalComprados,
                TotalItens             = totalItens,
                TotalPessoa1           = ToDecimalSafe(doc.GetValue("TotalPessoa1",  0)),
                TotalPessoa2           = ToDecimalSafe(doc.GetValue("TotalPessoa2",  0)),
                PorCategoria           = porCategoria,
                QuantidadePorCategoria = quantidadePorCategoria,
                CompradosPorCategoria  = compradosPorCategoria,
                PercentualConcluido    = percentualConcluido,
            };
        }

        private static ComparativoDto MontarComparativoDto(BsonDocument doc)
        {
            var atualGeral  = ToDecimalSafe(doc.GetValue("MA_TotalGeral",    0));
            var atualVR     = ToDecimalSafe(doc.GetValue("MA_TotalVR",       0));
            var atualNormal = ToDecimalSafe(doc.GetValue("MA_TotalNormal",   0));
            var atualComp   = ToDecimalSafe(doc.GetValue("MA_TotalComprados",0));

            var mpGeral     = ToDecimalSafe(doc.GetValue("MP_TotalGeral",    0));
            var mpVR        = ToDecimalSafe(doc.GetValue("MP_TotalVR",       0));
            var mpNormal    = ToDecimalSafe(doc.GetValue("MP_TotalNormal",   0));
            var mpComp      = ToDecimalSafe(doc.GetValue("MP_TotalComprados",0));
            var mrGeral     = ToDecimalSafe(doc.GetValue("MR_TotalGeral",    0));

            var mediaGeral  = (mrGeral + mpGeral + atualGeral) / 3;

            return new ComparativoDto
            {
                TotalGeral      = Variacao(atualGeral,  mpGeral),
                TotalVR         = Variacao(atualVR,     mpVR),
                TotalNormal     = Variacao(atualNormal, mpNormal),
                // ComparativoDto.TotalComprados é decimal (variação %)
                TotalComprados  = Variacao(atualComp,   mpComp),
                PercentualGeral = mediaGeral > 0
                    ? Math.Round((atualGeral - mediaGeral) / mediaGeral * 100, 2)
                    : 0,
                MesAtual        = atualGeral,
                MesPassado      = mpGeral,
                MesRetrasado    = mrGeral,
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
