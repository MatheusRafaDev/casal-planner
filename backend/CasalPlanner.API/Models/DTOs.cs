using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models
{
    // DTOs existentes
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

        public string? Telefone { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Renda mensal inválida")]
        public decimal? RendaMensal { get; set; }

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




    public class ResumoDto
    {
        public decimal TotalGeral { get; set; }
        public decimal TotalVR { get; set; }
        public decimal TotalNormal { get; set; }
        public int TotalComprados { get; set; }
        public int TotalItens { get; set; }
        public Dictionary<string, int> ItensPorCategoria { get; set; } = new();
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

        public string? TelefonePessoa1 { get; set; }

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

        public string? TelefonePessoa2 { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Renda mensal inválida")]
        public decimal? RendaMensalPessoa2 { get; set; }

        // Informações do casal (COM DATA DE CASAMENTO)
        public DateTime? DataCasamento { get; set; }

        // Data de inclusão
        public DateTime DataInclusao { get; set; } = DateTime.UtcNow;
    }

    public class LoginCasalDto
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        public string Senha { get; set; } = string.Empty;
    }

    public class LoginCasalResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string NomeCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string TipoConta { get; set; } = "Casal";
        public string PessoaQueLogou { get; set; } = string.Empty;

        public string NomeCompletoPessoa1 { get; set; } = string.Empty;
        public string EmailPessoa1 { get; set; } = string.Empty;
        public string CPFPessoa1 { get; set; } = string.Empty;
        public DateTime? DataNascimentoPessoa1 { get; set; }

        public string NomeCompletoPessoa2 { get; set; } = string.Empty;
        public string EmailPessoa2 { get; set; } = string.Empty;
        public string CPFPessoa2 { get; set; } = string.Empty;
        public DateTime? DataNascimentoPessoa2 { get; set; }

        public DateTime? DataCasamento { get; set; }
    }

    public class AtualizarCasalDto
    {
        // Pessoa 1
        public string? NomeCompletoPessoa1 { get; set; }
        public string? TelefonePessoa1 { get; set; }
        public DateTime? DataNascimentoPessoa1 { get; set; }
        public decimal? RendaMensalPessoa1 { get; set; }
        public string? AvatarPessoa1 { get; set; }

        // Pessoa 2
        public string? NomeCompletoPessoa2 { get; set; }
        public string? TelefonePessoa2 { get; set; }
        public DateTime? DataNascimentoPessoa2 { get; set; }
        public decimal? RendaMensalPessoa2 { get; set; }
        public string? AvatarPessoa2 { get; set; }

        // Informações do casal
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

    public class UsuarioResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string TipoConta { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        // Para conta individual
        public string? NomeCompleto { get; set; }
        public string? Email { get; set; }
        public string? CPF { get; set; }
        public DateTime? DataNascimento { get; set; }
        public string? Telefone { get; set; }
        public decimal? RendaMensal { get; set; }

        // Para conta casal
        public string? NomeCompletoPessoa1 { get; set; }
        public string? EmailPessoa1 { get; set; }
        public string? CPFPessoa1 { get; set; }
        public DateTime? DataNascimentoPessoa1 { get; set; }
        public string? TelefonePessoa1 { get; set; }
        public decimal? RendaMensalPessoa1 { get; set; }

        public string? NomeCompletoPessoa2 { get; set; }
        public string? EmailPessoa2 { get; set; }
        public string? CPFPessoa2 { get; set; }
        public DateTime? DataNascimentoPessoa2 { get; set; }
        public string? TelefonePessoa2 { get; set; }
        public decimal? RendaMensalPessoa2 { get; set; }

        // Informações do casal
        public DateTime? DataCasamento { get; set; }

        // Preferências
        public PreferenciasUsuario? Preferencias { get; set; }

        // Token (opcional)
        public string? Token { get; set; }
    }

    public class CriarCategoriaDto
    {
        [Required]
        public string Nome { get; set; } = string.Empty;

        public string? Icon { get; set; }

        [Required]
        public string Bg { get; set; } = "#d6e9d6";
    }

    public class AtualizarCategoriaDto
    {
        public string? Nome { get; set; }
        public string? Icon { get; set; }
        public string? Bg { get; set; }
    }


    public class AtualizarCompradoDto
    {
        public bool Comprado { get; set; }
    }

}