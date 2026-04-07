using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShoppingController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ShoppingController> _logger;

        public ShoppingController(
            IHttpClientFactory httpClientFactory,
            ILogger<ShoppingController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { error = "Parâmetro 'q' obrigatório." });

            // Limitar tamanho da consulta
            if (q.Length > 200)
                return BadRequest(new { error = "Consulta muito longa." });

            var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");
            
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SERPAPI_KEY não configurada no ambiente");
                return StatusCode(500, new { error = "Configuração de API ausente." });
            }

            var url = $"https://serpapi.com/search?" +
                      $"engine=google_shopping" +
                      $"&q={Uri.EscapeDataString(q)}" +
                      $"&gl=br&hl=pt&num=10" +
                      $"&api_key={apiKey}";

            try
            {
                var client = _httpClientFactory.CreateClient("SerpApiClient");
                var response = await client.GetAsync(url);
                
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("SerpApi retornou {StatusCode}: {Content}", 
                        response.StatusCode, content);
                    return StatusCode(502, new { error = "Erro ao buscar produtos." });
                }

                return Content(content, "application/json");
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Timeout na requisição para SerpApi");
                return StatusCode(504, new { error = "Tempo limite excedido." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro inesperado ao consultar SerpApi");
                return StatusCode(500, new { error = "Erro interno no servidor." });
            }
        }
    }
}