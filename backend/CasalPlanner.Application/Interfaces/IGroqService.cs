using CasalPlanner.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CasalPlanner.Application.Interfaces
{
    public interface IGroqService
    {
        Task<(string Marca, string NomeValidado)> ValidateProductAsync(string productName, string userSearch);
        Task<StoreValidationResult> ValidateStoreAsync(string storeName, string storeUrl); // Use object or define StoreValidationResultDto
        Task<SugestaoItensDto?> SugerirItensFaltantesPorComodo(string nomeComodo, List<string> itensExistentes);
        Task<DuplicataDto?> DetectarItemRedundante(string nomeNovoItem, List<string> itensExistentes);
        Task<EstimativaComodoDto?> EstimarOrcamentoPorComodo(string nomeComodo, string cidade);
        Task<string?> GerarResumoEnxoval(ResumoEnxovalDto resumo, string nomesCasal);
        Task<string?> GerarResumoEnxovalContexto(object contexto);
        Task<Dictionary<string, string>?> DescobrirDominios(List<string> nomes);
    }
}
