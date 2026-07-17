using System;

namespace CasalPlanner.Domain.Exceptions
{
    /// <summary>
    /// Lançada quando Pessoa 1 e Pessoa 2 informam o mesmo email no registro de casal.
    /// Distinta do caso de "email já cadastrado" para permitir uma mensagem correta ao usuário.
    /// </summary>
    public class EmailsIguaisException : Exception
    {
        public EmailsIguaisException()
            : base("Pessoa 1 e Pessoa 2 não podem usar o mesmo email")
        {
        }
    }
}
