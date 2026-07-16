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
            var usuarioId = GetUsuarioId();

            var itens = await _context.Itens.Find(i => i.UsuarioId == usuarioId).ToListAsync();
            var nomes = itens.Select(i => i.Nome).ToList();

            var sugestoes = await _groqService.SugerirItensFaltantesPorComodo(comodo, nomes);
            if (sugestoes == null)
                return BadRequest(new { error = "Não foi possível gerar sugestões" });

            return Ok(sugestoes);
        }

        [HttpPost("detectar-duplicata")]
        public async Task<IActionResult> DetectarItemRedundante([FromBody] DetectarDuplicataDto dto)
        {
            var usuarioId = GetUsuarioId();

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

        [HttpGet("estimativa-comodo")]
        public async Task<IActionResult> EstimarOrcamentoPorComodo([FromQuery] string comodo, [FromQuery] string cidade)
        {
            var estimativa = await _groqService.EstimarOrcamentoPorComodo(comodo, cidade);
            if (estimativa == null)
                return BadRequest(new { error = "Não foi possível estimar orçamento" });

            return Ok(estimativa);
        }

        [HttpGet("resumo-enxoval")]
        public async Task<IActionResult> GerarResumoEnxoval()
        {
            var usuarioId = GetUsuarioId();

            var resumo = await _resumoService.ObterResumo(usuarioId);
            var resumoEnxoval = resumo.Enxoval;

            var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
            var nomesCasal = usuario?.NomeCompleto ?? "o casal";

            var texto = await _groqService.GerarResumoEnxoval(resumoEnxoval, nomesCasal);
            if (texto == null)
                return BadRequest(new { error = "Não foi possível gerar resumo" });

            return Ok(new { resumo = texto });
        }
    }

    public class DetectarDuplicataDto
    {
        public string NomeNovoItem { get; set; } = string.Empty;
    }
}