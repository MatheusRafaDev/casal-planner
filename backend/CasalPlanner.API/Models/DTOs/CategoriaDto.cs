using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.DTOs
{
    public class CriarCategoriaDto
    {
        [Required(ErrorMessage = "Nome da categoria é obrigatório")]
        public string Nome { get; set; } = string.Empty;

        public string? Icon { get; set; }

        [Required(ErrorMessage = "Cor de fundo é obrigatória")]
        public string Bg { get; set; } = "#d6e9d6";

        public decimal? MetaOrcamento { get; set; }
    }

    public class AtualizarCategoriaDto
    {
        public string? Nome { get; set; }
        public string? Icon { get; set; }
        public string? Bg { get; set; }
        public decimal? MetaOrcamento { get; set; }
        public bool RemoverMeta { get; set; } = false;
    }

    public class CategoriaResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string Bg { get; set; } = string.Empty;
        public bool IsPadrao { get; set; }
        public string UsuarioId { get; set; } = string.Empty;
        public int Ordem { get; set; }
        public decimal? MetaOrcamento { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ReordenarCategoriasDto
    {
        [Required(ErrorMessage = "Lista de categorias é obrigatória")]
        public List<string> CategoriaIds { get; set; } = new();
    }
}