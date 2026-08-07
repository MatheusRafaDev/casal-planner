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

        public ResumoService(IItemRepository itemRepository, IUsuarioRepository usuarioRepository, ILogger<ResumoService> logger)
        {
            _itemRepository = itemRepository;
            _usuarioRepository = usuarioRepository;
            _logger = logger;
        }

        public async Task<ResumoResponseDto> ObterResumo(string usuarioId)
        {
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

                return new ResumoResponseDto
                {
                    Atual = resumoDto,
                    Comparativo = comparativoDto,
                    Enxoval = resumoEnxovalDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao obter resumo para usuário {UsuarioId}", usuarioId);
                throw;
            }
        }
    }
}
