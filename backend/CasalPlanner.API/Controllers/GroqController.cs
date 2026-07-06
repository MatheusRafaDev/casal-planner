using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CasalPlanner.API.Services;
using CasalPlanner.API.Models.DTOs;
using CasalPlanner.API.Data;
using MongoDB.Driver;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroqController : ControllerBase
    {
        private readonly GroqService _groqService;
        private readonly IResumoService _resumoService;
        private readonly MongoDbContext _context;
        private readonly ILogger<GroqController> _logger;

        public GroqController(GroqService groqService, IResumoService resumoService, MongoDbContext context, ILogger<GroqController> logger)
        {
            _groqService = groqService;
            _resumoService = resumoService;
            _context = context;
            _logger = logger;
        }

        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? throw new UnauthorizedAccessException("Usuário não autenticado");
        }

        [HttpGet("sugestoes-comodo")]
        public async Task<IActionResult> SugerirItensFaltantesPorComodo([FromQuery] string comodo)
        {
            try
            {
                var usuarioId = GetUsuarioId();
                
                // Buscar nomes dos itens do usuário na categoria informada
                var itens = await _context.Itens.Find(i => i.UsuarioId == usuarioId).ToListAsync();
                var nomes = itens.Select(i => i.Nome).ToList();

                var sugestoes = await _groqService.SugerirItensFaltantesPorComodo(comodo, nomes);
                if (sugestoes == null)
                    return BadRequest(new { error = "Não foi possível gerar sugestões" });

                return Ok(sugestoes);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao sugerir itens por cômodo");
                return BadRequest(new { error = "Erro ao gerar sugestões. Tente novamente mais tarde." });
            }
        }

        [HttpPost("detectar-duplicata")]
        public async Task<IActionResult> DetectarItemRedundante([FromBody] DetectarDuplicataDto dto)
        {
            try
            {
                var usuarioId = GetUsuarioId();

                // Buscar nomes de todos os itens do usuário
                var itens = await _context.Itens.Find(i => i.UsuarioId == usuarioId).ToListAsync();
                var nomes = itens.Select(i => i.Nome).ToList();

                var duplicata = await _groqService.DetectarItemRedundante(dto.NomeNovoItem, nomes);
                
                // Fallback: se a API Groq falhar, retornar resultado padrão (sem duplicata detectada)
                if (duplicata == null)
                {
                    _logger.LogWarning("Groq API falhou ao detectar duplicata para '{NomeNovoItem}', retornando fallback", dto.NomeNovoItem);
                    return Ok(new DuplicataDto 
                    { 
                        Detectado = false, 
                        ItemSimilar = null, 
                        Mensagem = null 
                    });
                }

                return Ok(duplicata);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao detectar duplicata");
                return BadRequest(new { error = "Erro ao detectar duplicata. Tente novamente mais tarde." });
            }
        }

        [HttpGet("estimativa-comodo")]
        public async Task<IActionResult> EstimarOrcamentoPorComodo([FromQuery] string comodo, [FromQuery] string cidade)
        {
            try
            {
                var estimativa = await _groqService.EstimarOrcamentoPorComodo(comodo, cidade);
                if (estimativa == null)
                    return BadRequest(new { error = "Não foi possível estimar orçamento" });

                return Ok(estimativa);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao estimar orçamento");
                return BadRequest(new { error = "Erro ao estimar orçamento. Tente novamente mais tarde." });
            }
        }

        [HttpGet("resumo-enxoval")]
        public async Task<IActionResult> GerarResumoEnxoval()
        {
            try
            {
                var usuarioId = GetUsuarioId();

                // Buscar ResumoEnxovalDto via ResumoService
                var resumo = await _resumoService.ObterResumo(usuarioId);
                var resumoEnxoval = resumo.Enxoval;

                // Buscar nomesCasal do Usuario
                var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
                var nomesCasal = usuario?.NomeCompleto ?? "o casal";

                var texto = await _groqService.GerarResumoEnxoval(resumoEnxoval, nomesCasal);
                if (texto == null)
                    return BadRequest(new { error = "Não foi possível gerar resumo" });

                return Ok(new { resumo = texto });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar resumo do enxoval");
                return BadRequest(new { error = "Erro ao gerar resumo. Tente novamente mais tarde." });
            }
        }
    }

    public class DetectarDuplicataDto
    {
        public string NomeNovoItem { get; set; } = string.Empty;
    }
}