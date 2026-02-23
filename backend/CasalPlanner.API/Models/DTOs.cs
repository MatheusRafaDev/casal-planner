using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models
{
    public class RegistroDto
    {
        [Required]
        public string Nome { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Senha { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Senha { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public bool IsCasal { get; set; }
    }

    public class CriarItemDto
    {
        [Required]
        public string Nome { get; set; } = string.Empty;
        
        public string Marca { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Preco { get; set; }
        
        [Range(1, int.MaxValue)]
        public int Quantidade { get; set; } = 1;
        
        [Required]
        public string CategoriaId { get; set; } = string.Empty;
        
        public string Pagamento { get; set; } = "normal";
    }

    public class AtualizarItemDto
    {
        public string? Nome { get; set; }
        public string? Marca { get; set; }
        public decimal? Preco { get; set; }
        public int? Quantidade { get; set; }
        public string? CategoriaId { get; set; }
        public bool? Comprado { get; set; }
        public string? Pagamento { get; set; }
    }

    public class CriarCategoriaDto
    {
        [Required]
        public string Nome { get; set; } = string.Empty;
        
        public string? Icone { get; set; }
        public string Bg { get; set; } = "#d6e9d6";
        public string Text { get; set; } = "#2c5e2c";
    }

    public class ResumoDto
    {
        public decimal TotalGeral { get; set; }
        public decimal TotalVR { get; set; }
        public decimal TotalNormal { get; set; }
        public int TotalComprados { get; set; }
        public int TotalItens { get; set; }
        public Dictionary<string, int> ItensPorCategoria { get; set; } = new();
    }
}