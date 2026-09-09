using System;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using CasalPlanner.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace CasalPlanner.Infrastructure.Services;

public class ScrapeDoService : IScrapeDoService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ScrapeDoService> _logger;

    public ScrapeDoService(HttpClient httpClient, ILogger<ScrapeDoService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string?> GetDirectStoreLinkAsync(string productName, string storeName, string fallbackUrl)
    {
        try
        {
            var token = Environment.GetEnvironmentVariable("SCRAPEDO_TOKEN");
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("SCRAPEDO_TOKEN não configurada.");
                return fallbackUrl;
            }

            // Atraso configurável para evitar rate limit excessivo em loops
            var delayMsStr = Environment.GetEnvironmentVariable("IA_CALL_DELAY_MS");
            if (int.TryParse(delayMsStr, out int delay) && delay > 0)
            {
                await Task.Delay(delay);
            }

            var query = $"{productName} {storeName}";
            
            // Usando DuckDuckGo Lite via Scrape.do para encontrar o link oficial
            var targetUrl = "https://html.duckduckgo.com/html/?q=" + Uri.EscapeDataString(query);
            var proxyUrl = $"http://api.scrape.do/?token={token}&url={Uri.EscapeDataString(targetUrl)}";

            var response = await _httpClient.GetAsync(proxyUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Scrape.do Search falhou com status {Status}", response.StatusCode);
                return fallbackUrl;
            }

            var html = await response.Content.ReadAsStringAsync();
            
            // Procura o primeiro link nos resultados do DuckDuckGo HTML
            var match = Regex.Match(html, @"class=""result__url"" href=""([^""]+)""");
            if (match.Success)
            {
                var rawLink = match.Groups[1].Value;
                
                // Extrai o link limpo do parâmetro uddg do DuckDuckGo
                var uddgMatch = Regex.Match(rawLink, @"uddg=([^&]+)");
                if (uddgMatch.Success)
                {
                    var finalUrl = HttpUtility.UrlDecode(uddgMatch.Groups[1].Value);
                    if (!string.IsNullOrEmpty(finalUrl) && !finalUrl.Contains("google.com/shopping") && !finalUrl.Contains("duckduckgo.com"))
                    {
                        return finalUrl;
                    }
                }
            }

            return fallbackUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao resolver link direto via Scrape.do para {Product} na {Store}", productName, storeName);
            return fallbackUrl;
        }
    }
}
