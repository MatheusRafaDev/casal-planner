using System;
using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.DTOs
{
    // ========== AUTENTICAÇÃO ==========
    public class RegistroDto
    {
        [Required(ErrorMessage = "Nome completo é obrigatório")]
        public string NomeCompleto { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
        public string Senha { get; set; } = string.Empty;

        [Required(ErrorMessage = "CPF é obrigatório")]
        [StringLength(14, MinimumLength = 11, ErrorMessage = "CPF inválido")]
        public string CPF { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de nascimento é obrigatória")]
        public DateTime DataNascimento { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Renda mensal inválida")]
        public decimal? RendaMensal { get; set; }

        public DateTime DataInclusao { get; set; } = DateTime.UtcNow;
    }

    public class RegistroCasalDto
    {
        // Pessoa 1
        [Required(ErrorMessage = "Nome da primeira pessoa é obrigatório")]
        public string NomeCompletoPessoa1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email da primeira pessoa é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string EmailPessoa1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha da primeira pessoa é obrigatória")]
        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
        public string SenhaPessoa1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "CPF da primeira pessoa é obrigatório")]
        [StringLength(14, MinimumLength = 11, ErrorMessage = "CPF inválido")]
        public string CPFPessoa1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de nascimento da primeira pessoa é obrigatória")]
        public DateTime DataNascimentoPessoa1 { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Renda mensal inválida")]
        public decimal? RendaMensalPessoa1 { get; set; }

        // Pessoa 2
        [Required(ErrorMessage = "Nome da segunda pessoa é obrigatório")]
        public string NomeCompletoPessoa2 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email da segunda pessoa é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string EmailPessoa2 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha da segunda pessoa é obrigatória")]
        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
        public string SenhaPessoa2 { get; set; } = string.Empty;

        [Required(ErrorMessage = "CPF da segunda pessoa é obrigatório")]
        [StringLength(14, MinimumLength = 11, ErrorMessage = "CPF inválido")]
        public string CPFPessoa2 { get; set; } = string.Empty;

        [Required(ErrorMessage = "Data de nascimento da segunda pessoa é obrigatória")]
        public DateTime DataNascimentoPessoa2 { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Renda mensal inválida")]
        public decimal? RendaMensalPessoa2 { get; set; }

        public DateTime? DataCasamento { get; set; }
        public DateTime DataInclusao { get; set; } = DateTime.UtcNow;
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        public string Senha { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string NomeCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public bool IsCasal { get; set; }
        public string? TipoConta { get; set; }
        public bool ModoEscuro { get; set; }
        public decimal? RendaMensal { get; set; }
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

        public string NomeCompletoPessoa1 { get; set; } = string.Empty;
        public string EmailPessoa1 { get; set; } = string.Empty;
        public string CPFPessoa1 { get; set; } = string.Empty;
        public DateTime? DataNascimentoPessoa1 { get; set; }
        public decimal? RendaMensalPessoa1 { get; set; }

        public string NomeCompletoPessoa2 { get; set; } = string.Empty;
        public string EmailPessoa2 { get; set; } = string.Empty;
        public string CPFPessoa2 { get; set; } = string.Empty;
        public DateTime? DataNascimentoPessoa2 { get; set; }
        public decimal? RendaMensalPessoa2 { get; set; }

        public DateTime? DataCasamento { get; set; }
    }

    public class UsuarioResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string TipoConta { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool ModoEscuro { get; set; }

        // Para conta individual
        public string? NomeCompleto { get; set; }
        public string? Email { get; set; }
        public string? CPF { get; set; }
        public DateTime? DataNascimento { get; set; }
        public decimal? RendaMensal { get; set; }

        // Para conta casal
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

        public DateTime? DataCasamento { get; set; }
        public string? Token { get; set; }
    }

    // ========== PERFIL ==========
    public class AtualizarPerfilDto
{
    public string? NomeCompleto { get; set; }
    public DateTime? DataNascimento { get; set; }
    public decimal? RendaMensal { get; set; }
    public string? CPF { get; set; } 
}

    public class AtualizarCasalDto
    {
        public string? NomeCompletoPessoa1 { get; set; }
        public DateTime? DataNascimentoPessoa1 { get; set; }
        public decimal? RendaMensalPessoa1 { get; set; }

        public string? NomeCompletoPessoa2 { get; set; }
        public DateTime? DataNascimentoPessoa2 { get; set; }
        public decimal? RendaMensalPessoa2 { get; set; }

        public decimal? RendaMensal { get; set; }
        public DateTime? DataCasamento { get; set; }
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
        public string NovaSenha { get; set; } = string.Empty;
    }

    public class ModoEscuroDto
    {
        public bool ModoEscuro { get; set; }
    }
}