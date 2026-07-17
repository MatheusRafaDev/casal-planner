using System;
using System.Collections.Generic;

namespace CasalPlanner.Application.DTOs
{
    public class ResumoDto
    {
        public decimal TotalGeral { get; set; }
        public decimal TotalVR { get; set; }
        public decimal TotalNormal { get; set; }
        public int TotalComprados { get; set; }
        public int TotalItens { get; set; }
        public Dictionary<string, decimal> PorCategoria { get; set; } = new();
        public Dictionary<string, int> QuantidadePorCategoria { get; set; } = new();
        public decimal PercentualConcluido { get; set; }
    }

    public class ComparativoDto
    {
        public decimal TotalGeral { get; set; }
        public decimal TotalVR { get; set; }
        public decimal TotalNormal { get; set; }
        public decimal TotalComprados { get; set; }
        public decimal PercentualGeral { get; set; }
    }

    public class ResumoEnxovalDto
    {
        public decimal? MetaGlobalEnxoval { get; set; }
        public decimal PercentualMetaGlobal { get; set; }
        public decimal TotalRestanteParaMeta { get; set; }
        public int TotalItensComprados { get; set; }
        public int TotalItensPendentes { get; set; }
    }

    public class ResumoResponseDto
    {
        public ResumoDto Atual { get; set; } = new();
        public ComparativoDto Comparativo { get; set; } = new();
        public ResumoEnxovalDto Enxoval { get; set; } = new();
    }
}