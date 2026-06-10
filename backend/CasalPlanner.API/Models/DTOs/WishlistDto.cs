using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.DTOs;

public class CriarWishlistDto
{
    [Required(ErrorMessage = "Título é obrigatório")]
    [StringLength(100, MinimumLength = 3)]
    public string Titulo { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descricao { get; set; }

    [Required(ErrorMessage = "Slug é obrigatório")]
    [RegularExpression(@"^[a-z0-9-]{5,60}$", ErrorMessage = "Slug deve conter apenas letras minúsculas, números e hífens, com 5-60 caracteres")]
    public string Slug { get; set; } = string.Empty;
}

public class AtualizarWishlistDto
{
    [StringLength(100, MinimumLength = 3)]
    public string? Titulo { get; set; }

    [StringLength(500)]
    public string? Descricao { get; set; }

    public bool? Ativa { get; set; }

    public List<string>? ItemIds { get; set; }

    public DateTime? ExpiraEm { get; set; }
}

public class ReservarItemDto
{
    [Required(ErrorMessage = "Nome do presenteador é obrigatório")]
    [StringLength(100, MinimumLength = 2)]
    public string NomePresente { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Mensagem { get; set; }
}

public class CancelarReservaDto
{
    [Required(ErrorMessage = "Nome do presenteador é obrigatório")]
    public string NomePresente { get; set; } = string.Empty;
}

public class ItemPublicoDto
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public string Loja { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public bool Reservado { get; set; }
}

public class WishlistPublicaResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativa { get; set; }
    public DateTime CriadaEm { get; set; }
    public DateTime? ExpiraEm { get; set; }
    public List<ItemPublicoDto> Itens { get; set; } = new();
}

public class ReservaPresenteDto
{
    public string ItemId { get; set; } = string.Empty;
    public string NomePresente { get; set; } = string.Empty;
    public string? Mensagem { get; set; }
    public DateTime ReservadoEm { get; set; }
}

public class WishlistPrivadaResponseDto : WishlistPublicaResponseDto
{
    public List<ReservaPresenteDto> Reservas { get; set; } = new();
}
