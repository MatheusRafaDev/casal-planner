using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.Application.DTOs;

public class AnalisarFotoPrecoRequest
{
    [Required, MaxLength(12_000_000)]
    public string ImagemBase64 { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class AnalisarFotoPesquisaPrecosRequest
{
    [Required, MaxLength(12_000_000)]
    public string ImagemBase64 { get; set; } = string.Empty;
}

public class AnalisarFotoPrecoResponse
{
    public string ProdutoNome { get; set; } = string.Empty;
    public string? Marca { get; set; }
    public decimal Preco { get; set; }
    public string? Unidade { get; set; }
    public string Endereco { get; set; } = string.Empty;
    public string? NomeMercado { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class ConfirmarRegistroPrecoRequest
{
    public string? ItemId { get; set; }
    [Required, MaxLength(200)] public string ProdutoNome { get; set; } = string.Empty;
    [MaxLength(100)] public string? Marca { get; set; }
    [Range(0, 9_999_999)] public decimal Preco { get; set; }
    [MaxLength(80)] public string? Unidade { get; set; }
    [Required, MaxLength(500)] public string Endereco { get; set; } = string.Empty;
    [MaxLength(150)] public string? NomeMercado { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime? DataCompra { get; set; }
}
