using CasalPlanner.Application.Interfaces;
using CasalPlanner.Domain.Entities;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CasalPlanner.API.Services
{
    public class PriceAlertBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PriceAlertBackgroundService> _logger;
        // Intervalo de 12 horas para a verificação
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(12);

        public PriceAlertBackgroundService(IServiceProvider serviceProvider, ILogger<PriceAlertBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PriceAlertBackgroundService iniciado.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await VerificarPrecosAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro no ciclo do PriceAlertBackgroundService.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task VerificarPrecosAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var itemRepository = scope.ServiceProvider.GetRequiredService<IItemRepository>();
            var pesquisaService = scope.ServiceProvider.GetRequiredService<IPesquisaPrecosService>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var usuarioRepository = scope.ServiceProvider.GetRequiredService<IUsuarioRepository>();

            var todosItens = await itemRepository.GetAllAsync(); // Idealmente teríamos GetItensParaAlertaAsync
            var itensPrioridade = todosItens.Where(i => i.Comprado == false && i.Prioridade == "alta").ToList();

            if (!itensPrioridade.Any()) return;

            foreach (var item in itensPrioridade)
            {
                if (stoppingToken.IsCancellationRequested) break;
                if (item.Preco <= 0) continue;

                // Evitar spam de alertas: verifica se o último alerta foi há menos de 3 dias
                if (item.UltimoAlertaPrecoAt.HasValue && (DateTime.UtcNow - item.UltimoAlertaPrecoAt.Value).TotalDays < 3)
                    continue;

                try
                {
                    // Tenta não estourar a API, pequena pausa
                    await Task.Delay(2000, stoppingToken);

                    // Buscar usando nome e loja como heurística, ou apenas nome (BuscarAsync) - Precisamos checar a assinatura correta de PesquisaPrecosService
                    // Mas para esse escopo usarei Search (ou método apropriado)
                    // IPesquisaPrecosService tem método PesquisarAsync(string query, string? marca = null, bool buscaUsuario = true)
                    var resultados = await pesquisaService.PesquisarAsync(item.Nome, item.Marca, null); // busca automatizada
                    if (resultados.Produtos == null || !resultados.Produtos.Any()) continue;

                    // Procura o menor preço confiável
                    var menorPreco = resultados.Produtos
                        .Where(r => r.Preco > 0)
                        .OrderBy(r => r.Preco)
                        .FirstOrDefault();

                    if (menorPreco == null) continue;

                    var economia = item.Preco - menorPreco.Preco;
                    var percentualQueda = (economia / item.Preco) * 100;

                    // Alerta apenas se cair 10% ou mais
                    if (percentualQueda >= 10)
                    {
                        var usuario = await usuarioRepository.GetByIdAsync(item.UsuarioId);
                        if (usuario == null) continue;

                        if (!usuario.IsCasal)
                        {
                            if (!string.IsNullOrEmpty(usuario.Email) && usuario.ReceberNotificacoes)
                            {
                                await emailService.EnviarAlertaPrecoBaixoAsync(usuario.Email, usuario.NomeCompleto ?? "Usuário", item, menorPreco.Preco, menorPreco.Url, menorPreco.Loja);
                            }
                        }
                        else
                        {
                            var info = usuario.CasalInfo;
                            if (info != null)
                            {
                                if (info.ReceberNotificacoesPessoa1 && !string.IsNullOrEmpty(info.EmailPessoa1))
                                {
                                    await emailService.EnviarAlertaPrecoBaixoAsync(info.EmailPessoa1, info.NomeCompletoPessoa1, item, menorPreco.Preco, menorPreco.Url, menorPreco.Loja);
                                }
                                if (info.ReceberNotificacoesPessoa2 && !string.IsNullOrEmpty(info.EmailPessoa2))
                                {
                                    await emailService.EnviarAlertaPrecoBaixoAsync(info.EmailPessoa2, info.NomeCompletoPessoa2, item, menorPreco.Preco, menorPreco.Url, menorPreco.Loja);
                                }
                            }
                        }

                        // Atualiza timestamp
                        item.UltimoAlertaPrecoAt = DateTime.UtcNow;
                        await itemRepository.UpdateRawAsync(item);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao verificar preço do item {ItemId}", item.Id);
                }
            }
        }
    }
}
