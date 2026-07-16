using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.DTOs
{
    // ========== LOGIN ==========
    public class LoginDto
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        public string Senha { get; set; } = string.Empty;
    }

    // ========== REGISTRO INDIVIDUAL ==========
    public class RegistroDto
    {
        [Required(ErrorMessage = "Nome completo é obrigatório")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 100 caracteres")]
        public string NomeCompleto { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$",
            ErrorMessage = "A senha deve conter letra maiúscula, minúscula, número e caractere especial")]
        public string Senha { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de nascimento é obrigatória")]
        [DataType(DataType.Date)]
        public DateTime DataNascimento { get; set; }

        public DateTime DataInclusao { get; set; } = DateTime.UtcNow;
    }

    // ========== REGISTRO CASAL ==========
    public class RegistroCasalDto
    {
        // Pessoa 1
        [Required(ErrorMessage = "Nome da primeira pessoa é obrigatório")]
        [StringLength(100, MinimumLength = 3)]
        public string NomeCompletoPessoa1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email da primeira pessoa é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string EmailPessoa1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha da primeira pessoa é obrigatória")]
        [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$",
            ErrorMessage = "A senha deve conter letra maiúscula, minúscula, número e caractere especial")]
        public string SenhaPessoa1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de nascimento da primeira pessoa é obrigatória")]
        [DataType(DataType.Date)]
        public DateTime DataNascimentoPessoa1 { get; set; }

        // Pessoa 2
        [Required(ErrorMessage = "Nome da segunda pessoa é obrigatório")]
        [StringLength(100, MinimumLength = 3)]
        public string NomeCompletoPessoa2 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email da segunda pessoa é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string EmailPessoa2 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha da segunda pessoa é obrigatória")]
        [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$",
            ErrorMessage = "A senha deve conter letra maiúscula, minúscula, número e caractere especial")]
        public string SenhaPessoa2 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de nascimento da segunda pessoa é obrigatória")]
        [DataType(DataType.Date)]
        public DateTime DataNascimentoPessoa2 { get; set; }

        public DateTime DataInclusao { get; set; } = DateTime.UtcNow;
    }

    // ========== RESPOSTAS DE LOGIN ==========
    public class LoginResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string NomeCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public bool IsCasal { get; set; }
        public string? TipoConta { get; set; }
        public bool ModoEscuro { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class LoginCasalResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string NomeCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string TipoConta { get; set; } = "Casal";
        public string PessoaQueLogou { get; set; } = string.Empty;
        public bool ModoEscuro { get; set; }
        public decimal? RendaMensal { get; set; }
        public DateTime CreatedAt { get; set; }

        // Pessoa 1
        public string NomeCompletoPessoa1 { get; set; } = string.Empty;
        public string EmailPessoa1 { get; set; } = string.Empty;
        public DateTime? DataNascimentoPessoa1 { get; set; }

        // Pessoa 2
        public string NomeCompletoPessoa2 { get; set; } = string.Empty;
        public string EmailPessoa2 { get; set; } = string.Empty;
        public DateTime? DataNascimentoPessoa2 { get; set; }

    }
}