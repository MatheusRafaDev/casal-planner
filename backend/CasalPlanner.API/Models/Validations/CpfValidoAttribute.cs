using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.Validations
{
    public class CpfValidoAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value)
        {
            if (value == null || string.IsNullOrEmpty(value.ToString()))
                return new ValidationResult("CPF é obrigatório");

            var cpf = value.ToString()!;

            // Remove pontos, traços e espaços
            var cpfLimpo = new string(cpf.Where(char.IsDigit).ToArray());

            // Verifica se tem exatamente 11 dígitos
            if (cpfLimpo.Length != 11)
                return new ValidationResult("CPF deve ter 11 dígitos");

            // Rejeita CPFs com todos os dígitos iguais
            if (cpfLimpo.Distinct().Count() == 1)
                return new ValidationResult("CPF inválido");

            // Calcula e valida o 1º dígito verificador
            var soma = 0;
            for (int i = 0; i < 9; i++)
                soma += int.Parse(cpfLimpo[i].ToString()) * (10 - i);

            var resto = soma % 11;
            var digito1 = resto < 2 ? 0 : 11 - resto;

            if (digito1 != int.Parse(cpfLimpo[9].ToString()))
                return new ValidationResult("CPF inválido");

            // Calcula e valida o 2º dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++)
                soma += int.Parse(cpfLimpo[i].ToString()) * (11 - i);

            resto = soma % 11;
            var digito2 = resto < 2 ? 0 : 11 - resto;

            if (digito2 != int.Parse(cpfLimpo[10].ToString()))
                return new ValidationResult("CPF inválido");

            return ValidationResult.Success;
        }
    }
}
