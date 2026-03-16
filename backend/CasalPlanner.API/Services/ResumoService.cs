using CasalPlanner.API.Data;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;
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
                var hoje = DateTime.UtcNow;
                var mesPassado = hoje.AddMonths(-1);
                var mesRetrasado = hoje.AddMonths(-2);

                // Buscar todos os itens do usuário
                var itens = await _context.Itens
                    .Find(i => i.UsuarioId == usuarioId)
                    .ToListAsync();

                // Resumo atual (todos os itens)
                var resumoAtual = CalcularResumo(itens);

                // Resumo do mês passado (para comparativo)
                var itensMesPassado = itens
                    .Where(i => i.CreatedAt >= mesPassado && i.CreatedAt < hoje)
                    .ToList();

                var resumoMesPassado = CalcularResumo(itensMesPassado);

                // Resumo do mês retrasado (para comparativo)
                var itensMesRetrasado = itens
                    .Where(i => i.CreatedAt >= mesRetrasado && i.CreatedAt < mesPassado)
                    .ToList();

                var resumoMesRetrasado = CalcularResumo(itensMesRetrasado);

                // Calcular comparativo
                var comparativo = CalcularComparativo(resumoAtual, resumoMesPassado, resumoMesRetrasado);

                return new ResumoResponseDto
                {
                    Atual = resumoAtual,
                    Comparativo = comparativo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter resumo para usuário {UsuarioId}", usuarioId);
                throw;
            }
        }

        private ResumoDto CalcularResumo(List<Item> itens)
        {
            var resumo = new ResumoDto
            {
                TotalGeral = 0,
                TotalVR = 0,
                TotalNormal = 0,
                TotalComprados = 0,
                TotalItens = itens.Count,
                PorCategoria = new Dictionary<string, decimal>(),
                QuantidadePorCategoria = new Dictionary<string, int>()
            };

            foreach (var item in itens)
            {
                var totalItem = item.Preco * item.Quantidade;

                // Totais gerais
                resumo.TotalGeral += totalItem;

                if (item.Pagamento == "vr")
                {
                    resumo.TotalVR += totalItem;
                }
                else
                {
                    resumo.TotalNormal += totalItem;
                }

                if (item.Comprado)
                {
                    resumo.TotalComprados++;
                }

                // Totais por categoria
                if (!string.IsNullOrEmpty(item.CategoriaId))
                {
                    if (resumo.PorCategoria.ContainsKey(item.CategoriaId))
                    {
                        resumo.PorCategoria[item.CategoriaId] += totalItem;
                        resumo.QuantidadePorCategoria[item.CategoriaId]++;
                    }
                    else
                    {
                        resumo.PorCategoria[item.CategoriaId] = totalItem;
                        resumo.QuantidadePorCategoria[item.CategoriaId] = 1;
                    }
                }
            }

            return resumo;
        }

        private ComparativoDto CalcularComparativo(ResumoDto atual, ResumoDto mesPassado, ResumoDto mesRetrasado)
        {
            var comparativo = new ComparativoDto();

            // Calcular variação percentual
            comparativo.TotalGeral = CalcularVariacao(atual.TotalGeral, mesPassado.TotalGeral);
            comparativo.TotalVR = CalcularVariacao(atual.TotalVR, mesPassado.TotalVR);
            comparativo.TotalNormal = CalcularVariacao(atual.TotalNormal, mesPassado.TotalNormal);
            comparativo.TotalComprados = CalcularVariacao(atual.TotalComprados, mesPassado.TotalComprados);

            // Tendência geral (média dos últimos 3 meses)
            var mediaGeral = (mesRetrasado.TotalGeral + mesPassado.TotalGeral + atual.TotalGeral) / 3;
            comparativo.PercentualGeral = mediaGeral > 0 
                ? Math.Round((atual.TotalGeral - mediaGeral) / mediaGeral * 100, 2)
                : 0;

            return comparativo;
        }

        private decimal CalcularVariacao(decimal atual, decimal anterior)
        {
            if (anterior == 0) return atual > 0 ? 100 : 0;
            return Math.Round((atual - anterior) / anterior * 100, 2);
        }
    }
}