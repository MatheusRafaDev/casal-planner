using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.DTOs
{

    using System.ComponentModel.DataAnnotations;

    namespace CasalPlanner.API.Models.DTOs
    {

        public class UsuarioResponseDto
        {
            public string Id { get; set; } = string.Empty;
            public string? NomeCompleto { get; set; }
            public string? Email { get; set; }
            public string? CPF { get; set; }
            public DateTime? DataNascimento { get; set; }
            public decimal? RendaMensal { get; set; }
            public string TipoConta { get; set; } = "Individual";
            public bool IsCasal { get; set; }
            public bool ModoEscuro { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? LastLoginAt { get; set; }

            // Para conta casal (propriedades diretas)
            public string? NomeCompletoPessoa1 { get; set; }
            public string? EmailPessoa1 { get; set; }
            public string? CPFPessoa1 { get; set; }
            public DateTime? DataNascimentoPessoa1 { get; set; }
            public decimal? RendaMensalPessoa1 { get; set; }

            public string? NomeCompletoPessoa2 { get; set; }
            public string? EmailPessoa2 { get; set; }
            public string? CPFPessoa2 { get; set; }
            public DateTime? DataNascimentoPessoa2 { get; set; }
            public decimal? RendaMensalPessoa2 { get; set; }
            public string? Token { get; set; }
        }
    }

    public class CasalInfoDto
    {
        // Pessoa 1
        public string? NomeCompletoPessoa1 { get; set; }
        public string? EmailPessoa1 { get; set; }
        public string? CPFPessoa1 { get; set; }
        public DateTime? DataNascimentoPessoa1 { get; set; }
        public decimal? RendaMensalPessoa1 { get; set; }

        // Pessoa 2
        public string? NomeCompletoPessoa2 { get; set; }
        public string? EmailPessoa2 { get; set; }
        public string? CPFPessoa2 { get; set; }
        public DateTime? DataNascimentoPessoa2 { get; set; }
        public decimal? RendaMensalPessoa2 { get; set; }

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

        [Range(0, 999999.99)]
        public decimal? RendaMensal { get; set; }

        [RegularExpression(@"^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$")]
        public string? CPF { get; set; }


    }
  


    public class AtualizarCasalDto
    {
        // Pessoa 1
        [StringLength(100, MinimumLength = 3)]
        public string? NomeCompletoPessoa1 { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DataNascimentoPessoa1 { get; set; }

        [Range(0, 999999.99)]
        public decimal? RendaMensalPessoa1 { get; set; }

        [StringLength(100, MinimumLength = 3)]
        public string? NomeCompletoPessoa2 { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DataNascimentoPessoa2 { get; set; }

        [Range(0, 999999.99)]
        public decimal? RendaMensalPessoa2 { get; set; }

        public decimal? RendaMensal { get; set; }
    }

    public class AlterarSenhaDto
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha atual é obrigatória")]
        public string SenhaAtual { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nova senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A nova senha deve ter no mínimo 6 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")]
        public string NovaSenha { get; set; } = string.Empty;
    }

    public class ModoEscuroDto
    {
        public bool ModoEscuro { get; set; }
    }
}