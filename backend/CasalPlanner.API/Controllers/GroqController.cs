using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Services;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Infrastructure.Persistence;
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
            if (!string.IsNullOrEmpty(dto.CategoriaId))
            {
                itens = itens.Where(i => i.CategoriaId == dto.CategoriaId).ToList();
            }
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

            var usuario = await _context.Usuarios.Find(u => u.Id == usuarioId).FirstOrDefaultAsync();
            var nomesCasal = usuario?.NomeCompleto ?? "o casal";

            ResumoResponseDto? resumo = null;
            try
            {
                resumo = await _resumoService.ObterResumo(usuarioId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao obter resumo para usuário {UsuarioId}", usuarioId);
            }

            // Monta contexto rico para a IA
            var atual = resumo?.Atual ?? new ResumoDto();
            var enxoval = resumo?.Enxoval ?? new ResumoEnxovalDto();

            var contexto = new
            {
                NomeCasal = nomesCasal,
                TotalGasto = atual.TotalGeral,
                TotalDinheiro = atual.TotalNormal,
                TotalVR = atual.TotalVR,
                TotalItens = atual.TotalItens,
                ItensComprados = atual.TotalComprados,
                ItensPendentes = atual.TotalItens - atual.TotalComprados,
                PercentualConcluido = atual.PercentualConcluido,
                MetaGlobal = enxoval.MetaGlobalEnxoval,
                PercentualMeta = enxoval.PercentualMetaGlobal,
                ValorRestanteMeta = enxoval.TotalRestanteParaMeta,
                GastoPorCategoria = atual.PorCategoria,
            };

            var texto = await _groqService.GerarResumoEnxovalContexto(contexto);

            var mensagem = texto ?? "Seu enxoval está sendo planejado com carinho! Adicione itens e defina uma meta para ver um resumo completo aqui.";

            return Ok(new { resumo = mensagem });
        }

        [HttpPost("dominios")]
        public async Task<IActionResult> DescobrirDominios([FromBody] DescobrirDominiosDto dto)
        {
            if (dto.Nomes == null || dto.Nomes.Count == 0)
                return Ok(new Dictionary<string, string>());

            var dominios = await _groqService.DescobrirDominios(dto.Nomes);
            
            if (dominios == null)
                return Ok(new Dictionary<string, string>()); // Fallback gracefully

            return Ok(dominios);
        }
    }

    public class DescobrirDominiosDto
    {
        public List<string> Nomes { get; set; } = new();
    }

    public class DetectarDuplicataDto
    {
        public string NomeNovoItem { get; set; } = string.Empty;
        public string? CategoriaId { get; set; }
    }
}