using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace CasalPlanner.Application.Services
{
    public class ResumoService : IResumoService
    {
        private readonly IItemRepository _itemRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly ILogger<ResumoService> _logger;
        private readonly ICacheService? _cacheService;

        public ResumoService(
            IItemRepository itemRepository,
            IUsuarioRepository usuarioRepository,
            ILogger<ResumoService> logger,
            ICacheService? cacheService = null)
        {
            _itemRepository = itemRepository;
            _usuarioRepository = usuarioRepository;
            _logger = logger;
            _cacheService = cacheService;
        }

        public async Task<ResumoResponseDto> ObterResumo(string usuarioId)
        {
            var cacheKey = $"casal:resumo:{usuarioId}";
            if (_cacheService != null)
            {
                var cached = await _cacheService.GetAsync<ResumoResponseDto>(cacheKey);
                if (cached != null)
                {
                    _logger.LogInformation("⚡ [CACHE HIT] Resumo carregado instantaneamente do Redis para {UsuarioId}", usuarioId);
                    return cached;
                }
            }
            try
            {
                var (resumoDto, comparativoDto) = await _itemRepository.ObterResumoAgregadoAsync(usuarioId);

                var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
                var metaGlobalEnxoval = usuario?.MetaGlobalEnxoval;
                var percentualMetaGlobal = metaGlobalEnxoval > 0 ? Math.Round(resumoDto.TotalGeral / metaGlobalEnxoval.Value * 100, 2) : 0;
                var totalRestanteParaMeta = Math.Max(0, (metaGlobalEnxoval ?? 0) - resumoDto.TotalGeral);
                
                var resumoEnxovalDto = new ResumoEnxovalDto
                {
                    MetaGlobalEnxoval = metaGlobalEnxoval,
                    PercentualMetaGlobal = percentualMetaGlobal,
                    TotalRestanteParaMeta = totalRestanteParaMeta,
                    TotalItensComprados = resumoDto.TotalComprados,
                    TotalItensPendentes = resumoDto.TotalItens - resumoDto.TotalComprados
                };

                var resultado = new ResumoResponseDto
                {
                    Atual = resumoDto,
                    Comparativo = comparativoDto,
                    Enxoval = resumoEnxovalDto
                };

                if (_cacheService != null)
                {
                    await _cacheService.SetAsync(cacheKey, resultado, TimeSpan.FromHours(24));
                }

                return resultado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter resumo para usuário {UsuarioId}", usuarioId);
                throw;
            }
        }
    }
}
