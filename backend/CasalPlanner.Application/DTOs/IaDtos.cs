using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.Application.DTOs;

public class SugestaoItemDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public decimal? Estimativa { get; set; }
    public string? Prioridade { get; set; }
}

public class DetectarDuplicataRequestDto
{
    [Required]
    public string Nome { get; set; } = string.Empty;
    public string? CategoriaId { get; set; }
}

public class DetectarDuplicataResponseDto
{
    public bool Duplicata { get; set; }
    public string? ItemSimilar { get; set; }
    public string? Motivo { get; set; }
}

public class EstimativaComodoDto
{
    public string Comodo { get; set; } = string.Empty;
    public decimal FaixaEssencial { get; set; }
    public decimal FaixaMedia { get; set; }
    public decimal FaixaCompleta { get; set; }
    public string Descricao { get; set; } = string.Empty;
}

public class DescobrirDominiosRequestDto
{
    public List<string> Nomes { get; set; } = new();
}
