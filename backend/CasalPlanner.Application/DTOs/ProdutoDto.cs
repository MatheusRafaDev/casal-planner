namespace CasalPlanner.Application.DTOs;

public class ProdutoDto
{
    public string Nome { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public decimal? PrecoOriginal { get; set; }
    public decimal? Desconto => PrecoOriginal.HasValue && PrecoOriginal > Preco ? PrecoOriginal - Preco : null;
    public string Loja { get; set; } = string.Empty;
    public bool IsMarketplace { get; set; }
    public string Imagem { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public decimal? Frete { get; set; }
    public decimal? Avaliacao { get; set; }
    public int? QuantidadeAvaliacoes { get; set; }
    public bool Disponivel { get; set; } = true;
    public string Moeda { get; set; } = "BRL";
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Fonte { get; set; } = string.Empty;
    public decimal Score { get; set; } // Score de confiança (0 a 100)
    public DateTime DataConsulta { get; set; } = DateTime.UtcNow;
    public string? Parcelamento { get; set; }
    public string LogoLoja { get; set; } = string.Empty;
    public string LogoMarca { get; set; } = string.Empty;
    public bool IsTrusted { get; set; }
    public bool IsUsed { get; set; }
}
