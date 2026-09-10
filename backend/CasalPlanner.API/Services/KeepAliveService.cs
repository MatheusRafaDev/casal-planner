using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace CasalPlanner.API.Services
{
    public class KeepAliveService : BackgroundService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<KeepAliveService> _logger;
        private readonly string? _keepAliveUrl;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(14); // Render dorme em 15 min de inatividade

        public KeepAliveService(IHttpClientFactory httpClientFactory, ILogger<KeepAliveService> logger, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _keepAliveUrl = configuration["KEEP_ALIVE_URL"];
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (string.IsNullOrEmpty(_keepAliveUrl))
            {
                _logger.LogWarning("KEEP_ALIVE_URL não configurada. Serviço KeepAlive desativado.");
                return;
            }

            _logger.LogInformation($"KeepAliveService iniciado. Pingando {_keepAliveUrl} a cada 14 minutos.");

            // Loop infinito enquanto não houver cancelamento
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Espera 14 minutos antes do próximo ping
                    await Task.Delay(_interval, stoppingToken);

                    if (stoppingToken.IsCancellationRequested) break;

                    _logger.LogInformation($"Executando ping em {_keepAliveUrl} às {DateTime.UtcNow} UTC");
                    
                    var client = _httpClientFactory.CreateClient("KeepAlive");
                    client.Timeout = TimeSpan.FromSeconds(10);
                    
                    var response = await client.GetAsync(_keepAliveUrl, stoppingToken);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("Ping executado com sucesso.");
                    }
                    else
                    {
                        _logger.LogWarning($"Aviso: Ping falhou com status {response.StatusCode}");
                    }
                }
                catch (TaskCanceledException)
                {
                    // Cancelado pelo stoppingToken
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Erro ao executar ping: {ex.Message}");
                }
            }
        }
    }
}
