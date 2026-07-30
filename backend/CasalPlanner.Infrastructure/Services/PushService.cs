using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WebPush;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Domain.Entities;
using System;

namespace CasalPlanner.Infrastructure.Services
{
    public class PushService : IPushService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<PushService> _logger;

        public PushService(IConfiguration config, ILogger<PushService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendPushToPartnerAsync(Usuario usuario, int currentPessoaId, string title, string message)
        {
            if (usuario == null || !usuario.IsCasal || usuario.PushSubscriptions == null) return;

            int partnerId = currentPessoaId == 1 ? 2 : 1;
            var partnerSubs = usuario.PushSubscriptions.Where(p => p.PessoaId == partnerId).ToList();

            if (partnerSubs.Count == 0) return;

            var subject = _config["Vapid:Subject"];
            var publicKey = _config["Vapid:PublicKey"];
            var privateKey = _config["Vapid:PrivateKey"];

            if (string.IsNullOrEmpty(subject) || string.IsNullOrEmpty(publicKey) || string.IsNullOrEmpty(privateKey))
            {
                _logger.LogWarning("VAPID config is missing, cannot send push notifications.");
                return;
            }

            var vapidDetails = new VapidDetails(subject, publicKey, privateKey);
            var webPushClient = new WebPushClient();

            var payload = JsonSerializer.Serialize(new { title, body = message });

            foreach (var subInfo in partnerSubs)
            {
                try
                {
                    var pushSubscription = new PushSubscription(subInfo.Endpoint, subInfo.P256dh, subInfo.Auth);
                    await webPushClient.SendNotificationAsync(pushSubscription, payload, vapidDetails);
                }
                catch (WebPushException ex)
                {
                    _logger.LogError(ex, "Failed to send push to partner endpoint {Endpoint}", subInfo.Endpoint);
                    // Aqui poderia remover a inscrição expirada, se o status for 410 (Gone)
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error sending push");
                }
            }
        }
    }
}
