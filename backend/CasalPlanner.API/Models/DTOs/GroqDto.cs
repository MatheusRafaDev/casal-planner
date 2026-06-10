namespace CasalPlanner.API.Models.DTOs;

public class SugestaoItemDto
{
    public string Nome { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal PrecoMedioEstimado { get; set; }
    public string Prioridade { get; set; } = "normal";
}

public class SugestaoItensDto
{
    public List<SugestaoItemDto> Itens { get; set; } = new();
}

public class DuplicataDto
{
    public bool Detectado { get; set; }
    public string? ItemSimilar { get; set; }
    public string? Mensagem { get; set; }
}

public class EstimativaComodoDto
{
    public decimal FaixaBasica { get; set; }
    public decimal FaixaMedia { get; set; }
    public decimal FaixaPremium { get; set; }
    public string? Observacao { get; set; }
}
