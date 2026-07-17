namespace CasalPlanner.Application.DTOs;

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

public class ProdutoPrecoDto
{
    public string Nome { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public string Loja { get; set; } = string.Empty;
    public bool IsTrusted { get; set; }
    public bool IsMarketplace { get; set; }
}

public class AnalisarPrecosRequestDto
{
    public string NomeProduto { get; set; } = string.Empty;
    public List<ProdutoPrecoDto> Produtos { get; set; } = new();
}
