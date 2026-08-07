namespace CasalPlanner.Application.DTOs;

public class PriceSearchOptions
{
    public int CacheExpirationMinutes { get; set; } = 15;
    public int TimeoutSeconds { get; set; } = 15;
    public int RetryCount { get; set; } = 2;
    public bool EnableGoogleShopping { get; set; } = true;
    public bool EnableMercadoLivre { get; set; } = true;
    public bool EnableAmazon { get; set; } = false; // Disabled by default, needs API key
}
