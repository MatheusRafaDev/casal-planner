using System.Globalization;
using System.Text.Json;

namespace CasalPlanner.Infrastructure.Services;

public class GeocodingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeocodingService> _logger;

    public GeocodingService(HttpClient httpClient, ILogger<GeocodingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<(string Endereco, string? NomeLocal)> ReverseAsync(double? latitude, double? longitude, CancellationToken cancellationToken)
    {
        if (latitude is null || longitude is null) return (string.Empty, null);

        try
        {
            var lat = latitude.Value.ToString(CultureInfo.InvariantCulture);
            var lon = longitude.Value.ToString(CultureInfo.InvariantCulture);
            using var response = await _httpClient.GetAsync($"reverse?format=jsonv2&lat={lat}&lon={lon}&zoom=18&addressdetails=1", cancellationToken);
            if (!response.IsSuccessStatusCode) return (string.Empty, null);

            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var root = json.RootElement;
            var endereco = root.TryGetProperty("display_name", out var display) ? display.GetString() ?? string.Empty : string.Empty;
            var nome = root.TryGetProperty("name", out var name) ? name.GetString() : null;
            return (endereco, string.IsNullOrWhiteSpace(nome) ? null : nome);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogWarning(ex, "Falha ao obter sugestão de endereço no Nominatim.");
            return (string.Empty, null);
        }
    }
}
