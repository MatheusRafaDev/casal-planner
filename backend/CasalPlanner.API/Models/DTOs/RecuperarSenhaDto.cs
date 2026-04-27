// Models/DTOs/RecuperarSenhaDto.cs
using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.DTOs
{
    // ========== REQUESTS ==========
    public class EsqueciSenhaDto
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;
    }

    public class ValidarCodigoDto
    {
        [Required(ErrorMessage = "Código é obrigatório")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Código deve ter 6 dígitos")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Código deve conter apenas números")]
        public string Codigo { get; set; } = string.Empty;
    }

    public class RedefinirSenhaDto
    {
        [Required(ErrorMessage = "Token é obrigatório")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nova senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
            ErrorMessage = "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número")]
        public string NovaSenha { get; set; } = string.Empty;
    }

    // ========== RESPONSES ==========
    public class EsqueciSenhaResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Code { get; set; }
        public bool EmailExists { get; set; }
    }

    public class ValidarCodigoResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }

    public class RedefinirSenhaResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}