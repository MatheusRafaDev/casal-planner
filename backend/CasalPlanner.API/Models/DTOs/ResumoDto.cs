using System;
using System.Collections.Generic;

namespace CasalPlanner.API.Models.DTOs
{
    public class ResumoDto
    {
        public decimal TotalGeral { get; set; }
        public decimal TotalVR { get; set; }
        public decimal TotalNormal { get; set; }
        public int TotalComprados { get; set; }
        public int TotalItens { get; set; }
        public decimal MediaPreco { get; set; }
        public Dictionary<string, int> ItensPorCategoria { get; set; } = new();
        public Dictionary<string, decimal> ValorPorCategoria { get; set; } = new();
        public List<ItemResponseDto> UltimosItens { get; set; } = new();
    }

    public class ResumoSemanalDto
    {
        public string Semana { get; set; } = string.Empty;
        public DateTime DataInicio { get; set; }
        public DateTime DataFim { get; set; }
        public decimal TotalGasto { get; set; }
        public int TotalItens { get; set; }
        public Dictionary<string, decimal> GastoPorDia { get; set; } = new();
    }

    public class ResumoMensalDto
    {
        public int Mes { get; set; }
        public int Ano { get; set; }
        public decimal TotalGasto { get; set; }
        public int TotalItens { get; set; }
        public Dictionary<string, decimal> GastoPorCategoria { get; set; } = new();
        public Dictionary<int, decimal> GastoPorSemana { get; set; } = new();
    }
}