using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CasalPlanner.Application.DTOs
{
    public class DivisaoPagamentoDto
    {
        public decimal ValorPessoa1 { get; set; }
        public decimal ValorPessoa2 { get; set; }
    }

    public class CriarItemDto
    {
        [Required(ErrorMessage = "Nome do item é obrigatório")]
        public string Nome { get; set; } = string.Empty;

        public string Marca { get; set; } = string.Empty;

        [Required(ErrorMessage = "Preço é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Preço deve ser maior que zero")]
        public decimal Preco { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero")]
        public int Quantidade { get; set; } = 1;

        [Required(ErrorMessage = "Categoria é obrigatória")]
        public string CategoriaId { get; set; } = string.Empty;

        public string Pagamento { get; set; } = "normal";

        public string Prioridade { get; set; } = "normal";

        public string Loja { get; set; } = string.Empty;
        public string LinkProduto { get; set; } = string.Empty;
        public string FotoUrl { get; set; } = string.Empty;
        public string? FotoPublicId { get; set; }

        [JsonPropertyName("parcelas")]
        public int Parcelas { get; set; } = 1;
        [JsonPropertyName("variantes")]
        public List<string> Variantes { get; set; } = new List<string>();
        [JsonPropertyName("varianteSelecionadaId")]
        public string? VarianteSelecionadaId { get; set; }

        public string Origem { get; set; } = "comprado";
        public string? OrigemDescricao { get; set; }

        public int? ResponsavelId { get; set; }
        public DivisaoPagamentoDto? DivisaoPagamento { get; set; }
    }

    public class UpdateCompradoDto
    {
        public bool Comprado { get; set; }
    }

    public class AtualizarItemDto
    {
        public string? Nome { get; set; }
        public string? Marca { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Preço deve ser maior que zero")]
        public decimal? Preco { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero")]
        public int? Quantidade { get; set; }

        public string? CategoriaId { get; set; }
        public bool? Comprado { get; set; }
        public string? Pagamento { get; set; }
        public string? Prioridade { get; set; }

        public string? Loja { get; set; }
        public string? LinkProduto { get; set; }
        public string? FotoUrl { get; set; }
        public string? FotoPublicId { get; set; }
        [JsonPropertyName("parcelas")]
        public int? Parcelas { get; set; }
        [JsonPropertyName("variantes")]
        public List<string>? Variantes { get; set; }
        [JsonPropertyName("varianteSelecionadaId")]
        public string? VarianteSelecionadaId { get; set; }
        [JsonPropertyName("clearVarianteSelecionadaId")]
        public bool ClearVarianteSelecionadaId { get; set; }

        public string? Origem { get; set; }
        public string? OrigemDescricao { get; set; }

        public int? ResponsavelId { get; set; }
        public bool ClearResponsavelId { get; set; }

        public DivisaoPagamentoDto? DivisaoPagamento { get; set; }
        public bool ClearDivisaoPagamento { get; set; }
    }


    public class ItemResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Marca { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public int Quantidade { get; set; }
        public decimal Total { get; set; }
        public string CategoriaId { get; set; } = string.Empty;
        public string CategoriaNome { get; set; } = string.Empty;
        public string CategoriaIcon { get; set; } = string.Empty;
        public string CategoriaBg { get; set; } = string.Empty;
        public bool Comprado { get; set; }
        public string Pagamento { get; set; } = string.Empty;
        public string Prioridade { get; set; } = "normal";
        public string UsuarioId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Adicione no DTO de criação
        public string Loja { get; set; } = string.Empty;
        public string LinkProduto { get; set; } = string.Empty;
        public string FotoUrl { get; set; } = string.Empty;
        public int Parcelas { get; set; } = 1;
        public List<string> Variantes { get; set; } = new List<string>();
        public string? VarianteSelecionadaId { get; set; }
        public string Origem { get; set; } = "comprado";
        public string? OrigemDescricao { get; set; }
        public int? ResponsavelId { get; set; }
        public DivisaoPagamentoDto? DivisaoPagamento { get; set; }
    }

    public class UpdateCategoriaDto
    {
        public string CategoriaId { get; set; } = string.Empty;
    }
}