using CasalPlanner.API.Models;

namespace CasalPlanner.API.Helpers
{
    public static class UsuarioMapper
    {
        public static object MapearIndividual(Usuario usuario)
        {
            string? dataNascimento = usuario.DataNascimento?.ToString("yyyy-MM-dd");

            return new
            {
                id = usuario.Id,
                nomeCompleto = usuario.NomeCompleto,
                email = usuario.Email,
                dataNascimento = dataNascimento,
                tipoConta = "Individual",
                isCasal = false,
                modoEscuro = usuario.ModoEscuro,
                createdAt = usuario.CreatedAt,
                lastLoginAt = usuario.LastLoginAt
            };
        }

        public static object MapearCasal(Usuario usuario, string? pessoaQueLogou = null)
        {
            string? dataNascimentoPessoa1 = usuario.CasalInfo?.DataNascimentoPessoa1?.ToString("yyyy-MM-dd");

            string? dataNascimentoPessoa2 = usuario.CasalInfo?.DataNascimentoPessoa2?.ToString("yyyy-MM-dd");

            if (pessoaQueLogou != null)
            {
                // Resposta para login (inclui pessoaLogada)
                return new
                {
                    id = usuario.Id,
                    tipoConta = "Casal",
                    isCasal = true,
                    modoEscuro = usuario.ModoEscuro,
                    createdAt = usuario.CreatedAt,
                    lastLoginAt = usuario.LastLoginAt,
                    pessoaLogada = pessoaQueLogou,
                    pessoa1 = new
                    {
                        nomeCompleto = usuario.CasalInfo?.NomeCompletoPessoa1,
                        email = usuario.CasalInfo?.EmailPessoa1,
                        dataNascimento = dataNascimentoPessoa1
                    },
                    pessoa2 = new
                    {
                        nomeCompleto = usuario.CasalInfo?.NomeCompletoPessoa2,
                        email = usuario.CasalInfo?.EmailPessoa2,
                        dataNascimento = dataNascimentoPessoa2
                    }
                };
            }
            else
            {
                // Resposta para GetCurrentUser (inclui casalInfo)
                return new
                {
                    id = usuario.Id,
                    nomeCompleto = usuario.NomeCompleto,
                    email = usuario.Email,
                    tipoConta = "Casal",
                    isCasal = true,
                    modoEscuro = usuario.ModoEscuro,
                    createdAt = usuario.CreatedAt,
                    lastLoginAt = usuario.LastLoginAt,
                    casalInfo = new
                    {
                        pessoa1 = new
                        {
                            nomeCompleto = usuario.CasalInfo?.NomeCompletoPessoa1,
                            email = usuario.CasalInfo?.EmailPessoa1,
                            dataNascimento = dataNascimentoPessoa1
                        },
                        pessoa2 = new
                        {
                            nomeCompleto = usuario.CasalInfo?.NomeCompletoPessoa2,
                            email = usuario.CasalInfo?.EmailPessoa2,
                            dataNascimento = dataNascimentoPessoa2
                        }
                    }
                };
            }
        }
    }
}
