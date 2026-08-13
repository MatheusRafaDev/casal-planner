using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.Application.DTOs
{
    public class UsuarioResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string? NomeCompleto { get; set; }
        public string? Email { get; set; }
        public DateTime? DataNascimento { get; set; }
        public string TipoConta { get; set; } = "Individual";
        public bool IsCasal { get; set; }
        public bool ModoEscuro { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        // Para conta casal (propriedades diretas)
        public string? NomeCompletoPessoa1 { get; set; }
        public string? EmailPessoa1 { get; set; }
        public DateTime? DataNascimentoPessoa1 { get; set; }

        public string? NomeCompletoPessoa2 { get; set; }
        public string? EmailPessoa2 { get; set; }
        public DateTime? DataNascimentoPessoa2 { get; set; }
        public string? Token { get; set; }
    }

    public class CasalInfoDto
    {
        // Pessoa 1
        public string? NomeCompletoPessoa1 { get; set; }
        public string? EmailPessoa1 { get; set; }
        public DateTime? DataNascimentoPessoa1 { get; set; }

        // Pessoa 2
        public string? NomeCompletoPessoa2 { get; set; }
        public string? EmailPessoa2 { get; set; }
        public DateTime? DataNascimentoPessoa2 { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    // ========== ATUALIZAÇÃO DE PERFIL ==========
    public class AtualizarPerfilDto
    {
        [StringLength(100, MinimumLength = 3)]
        public string? NomeCompleto { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DataNascimento { get; set; }

        [Range(0, 9999999.99)]
        public decimal? MetaGlobalEnxoval { get; set; }

        [StringLength(200)]
        public string? EnderecoNovaCasa { get; set; }

    }
  


    public class AtualizarCasalDto
    {
        // Pessoa 1
        [StringLength(100, MinimumLength = 3)]
        public string? NomeCompletoPessoa1 { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DataNascimentoPessoa1 { get; set; }

        [StringLength(100, MinimumLength = 3)]
        public string? NomeCompletoPessoa2 { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DataNascimentoPessoa2 { get; set; }

        [Range(0, 9999999.99)]
        public decimal? MetaGlobalEnxoval { get; set; }

        [StringLength(200)]
        public string? EnderecoNovaCasa { get; set; }
    }

    public class AlterarSenhaDto
    {
        [Required(ErrorMessage = "Senha atual é obrigatória")]
        public string SenhaAtual { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nova senha é obrigatória")]
        [MinLength(8, ErrorMessage = "A nova senha deve ter no mínimo 8 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$",
            ErrorMessage = "A senha deve conter letra maiúscula, minúscula, número e caractere especial")]
        public string NovaSenha { get; set; } = string.Empty;
    }

    public class ModoEscuroDto
    {
        public bool ModoEscuro { get; set; }
    }

    public class CriarConviteDto
    {
        [Required]
        [EmailAddress]
        public string EmailParceiro { get; set; } = string.Empty;
    }

    public class ConviteResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string LinkConvite { get; set; } = string.Empty;
        public DateTime ExpiraEm { get; set; }
    }

    public class AceitarConviteDto
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        
        public bool MigrarDados { get; set; } = false;
    }

    public class PushSubscriptionDto
    {
        [Required]
        public string Endpoint { get; set; } = string.Empty;
        [Required]
        public string P256dh { get; set; } = string.Empty;
        [Required]
        public string Auth { get; set; } = string.Empty;
    }
}