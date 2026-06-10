using System.ComponentModel.DataAnnotations;

namespace CasalPlanner.API.Models.Validations
{
    public class CpfValidoAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null || string.IsNullOrEmpty(value.ToString()))
                return new ValidationResult("CPF é obrigatório");

            var cpf = value.ToString()!;
            var cpfLimpo = new string(cpf.Where(char.IsDigit).ToArray());

            if (cpfLimpo.Length != 11)
                return new ValidationResult("CPF deve ter 11 dígitos");

            if (cpfLimpo.Distinct().Count() == 1)
                return new ValidationResult("CPF inválido");

            var soma = 0;
            for (int i = 0; i < 9; i++)
                soma += int.Parse(cpfLimpo[i].ToString()) * (10 - i);

            var resto = soma % 11;
            var digito1 = resto < 2 ? 0 : 11 - resto;

            if (digito1 != int.Parse(cpfLimpo[9].ToString()))
                return new ValidationResult("CPF inválido");

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