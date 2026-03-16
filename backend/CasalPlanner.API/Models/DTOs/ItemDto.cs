using System;
using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.DTOs
{
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
    }

    public class AtualizarCompradoDto
    {
        [Required(ErrorMessage = "Status de comprado é obrigatório")]
        public bool Comprado { get; set; }
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
        public string UsuarioId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}