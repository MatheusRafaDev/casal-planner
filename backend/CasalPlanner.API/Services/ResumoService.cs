using CasalPlanner.API.Data;
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
            _logger  = logger;
        }

        public async Task<ResumoResponseDto> ObterResumo(string usuarioId)
        {
            try
            {
                var hoje               = DateTime.UtcNow;
                var inicioMesAtual    = new DateTime(hoje.Year, hoje.Month, 1);
                var inicioMesPassado   = inicioMesAtual.AddMonths(-1);
                var inicioMesRetrasado = inicioMesAtual.AddMonths(-2);

                // Uma única agregação no MongoDB: filtra, calcula e agrupa no servidor.
                // Antes: ToListAsync() carregava todos os itens em memória e filtrava
                // por data em C#. Agora apenas um documento de resultado trafega.
                var pipeline = new[]
                {
                    // 1. Filtra apenas os itens do usuário autenticado
                    new BsonDocument("$match", new BsonDocument("UsuarioId", usuarioId)),

                    // 2. Projeta ValorTotal + flags de período (calculadas no servidor)
                    new BsonDocument("$project", new BsonDocument
                    {
                        { "CategoriaId", 1 },
                        { "Pagamento",   1 },
                        { "Comprado",    1 },
                        { "Quantidade",  1 },
                        { "Origem",      1 },

                        { "ValorTotal",  new BsonDocument("$multiply",
                            new BsonArray { "$Preco", "$Quantidade" }) },
                        { "IsMesAtual", new BsonDocument("$and",
                            new BsonArray {
                                new BsonDocument("$gte", new BsonArray { "$CreatedAt", new BsonDateTime(inicioMesAtual) }),
                                new BsonDocument("$lt",  new BsonArray { "$CreatedAt", new BsonDateTime(hoje) })
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

                        // Array para calcular porCategoria depois
                        { "PorCategoria",   new BsonDocument("$push", new BsonDocument
                            {
                                { "CategoriaId", "$CategoriaId" },
                                { "ValorTotal",  "$ValorTotal"  },
                                { "Quantidade",  "$Quantidade"  },
                            }) },

                        { "PorOrigem",      new BsonDocument("$push", new BsonDocument
                            {
                                { "Origem",      "$Origem"      },
                                { "ValorTotal",  "$ValorTotal"  },
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
                    TotalItensPendentes = resumoDto.TotalItens - resumoDto.TotalComprados,
                    TotalEconomizadoComPresentes = resumoDto.TotalEconomizado
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

            var porOrigem              = new Dictionary<string, decimal>();

            if (doc.TryGetValue("PorCategoria", out var arr) && arr is BsonArray items)
            {
                foreach (var element in items)
                {
                    if (element is not BsonDocument item) continue;

                    var catVal = item.GetValue("CategoriaId", BsonNull.Value);
                    if (catVal.IsBsonNull) continue;
                    var catId = catVal.AsString;
                    if (string.IsNullOrEmpty(catId)) continue;

                    var valor = ToDecimal(item.GetValue("ValorTotal", 0));
                    var qtd   = item.GetValue("Quantidade", 1).ToInt32();

                    if (porCategoria.ContainsKey(catId))
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



            if (doc.TryGetValue("PorOrigem", out var origemArr) && origemArr is BsonArray origemItems)
            {
                foreach (var element in origemItems)
                {
                    if (element is not BsonDocument item) continue;

                    var origemVal = item.GetValue("Origem", BsonNull.Value);
                    if (origemVal.IsBsonNull) continue;
                    var origem = origemVal.AsString;
                    if (string.IsNullOrEmpty(origem)) continue;

                    var valor = ToDecimal(item.GetValue("ValorTotal", 0));

                    if (porOrigem.ContainsKey(origem))
                    {
                        porOrigem[origem] += valor;
                    }
                    else
                    {
                        porOrigem[origem] = valor;
                    }
                }
            }

            var totalGeral = ToDecimal(doc.GetValue("TotalGeral", 0));
            var totalComprados = doc.GetValue("TotalComprados", 0).ToInt32();
            var totalItens = doc.GetValue("TotalItens", 0).ToInt32();

            // Calcular TotalEconomizado (soma de itens que não foram comprados pelo casal)
            var totalEconomizado = porOrigem.ContainsKey("presente") ? porOrigem["presente"] : 0m;

            // Calcular PercentualConcluido
            var percentualConcluido = totalItens > 0 
                ? Math.Round((decimal)totalComprados / totalItens * 100, 2) 
                : 0m;

            return new ResumoDto
            {
                TotalGeral             = totalGeral,
                TotalVR                = ToDecimal(doc.GetValue("TotalVR",       0)),
                TotalNormal            = ToDecimal(doc.GetValue("TotalNormal",   0)),
                TotalComprados         = totalComprados,
                TotalItens             = totalItens,
                PorCategoria           = porCategoria,
                QuantidadePorCategoria = quantidadePorCategoria,

                PorOrigem              = porOrigem,
                TotalEconomizado       = totalEconomizado,
                PercentualConcluido    = percentualConcluido,
            };
        }

        private static ComparativoDto MontarComparativoDto(BsonDocument doc)
        {
            var atualGeral  = ToDecimal(doc.GetValue("MA_TotalGeral",    0));
            var atualVR     = ToDecimal(doc.GetValue("MA_TotalVR",       0));
            var atualNormal = ToDecimal(doc.GetValue("MA_TotalNormal",   0));
            var atualComp   = ToDecimal(doc.GetValue("MA_TotalComprados",0));

            var mpGeral     = ToDecimal(doc.GetValue("MP_TotalGeral",    0));
            var mpVR        = ToDecimal(doc.GetValue("MP_TotalVR",       0));
            var mpNormal    = ToDecimal(doc.GetValue("MP_TotalNormal",   0));
            var mpComp      = ToDecimal(doc.GetValue("MP_TotalComprados",0));
            var mrGeral     = ToDecimal(doc.GetValue("MR_TotalGeral",    0));

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
            };
        }

        /// <summary>
        /// Converte BsonValue para decimal com segurança, independente de o MongoDB
        /// retornar BsonDouble, BsonInt32 ou BsonInt64.
        /// </summary>
        private static decimal ToDecimal(BsonValue v) => (decimal)v.ToDouble();

        private static decimal Variacao(decimal atual, decimal anterior)
        {
            if (anterior == 0) return atual > 0 ? 100 : 0;
            return Math.Round((atual - anterior) / anterior * 100, 2);
        }
    }
}
