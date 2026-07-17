using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces;

public interface IPesquisaPrecosService
{
    Task<(IEnumerable<ProdutoDto> Produtos, string MarcaIdentificada, string NomeValidado, string QueryUtilizada)> 
        PesquisarAsync(string q, string? marca = null, string? buscaUsuario = null);
}
