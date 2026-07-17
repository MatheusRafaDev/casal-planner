using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces;

public interface IAuthService
{
    // Registro
    Task<Usuario?> Registrar(RegistroDto dto);
    Task<Usuario?> RegistrarCasal(RegistroCasalDto dto);

    // Consulta
    Task<Usuario?> ObterUsuarioPorEmail(string email);
    Task<Usuario?> ObterCasalPorEmail(string email);
    Task<Usuario?> ObterUsuarioPorId(string id);

    // Token
    string GerarToken(Usuario usuario);
    string GerarTokenCasal(Usuario usuario, string pessoa);

    // Perfil
    Task<Usuario?> AtualizarPerfilCasal(string id, AtualizarCasalDto dto);

    // Senha
    Task<bool> VerificarSenha(Usuario usuario, string senha, string? pessoa = null);

    // ========== RECUPERAÇÃO DE SENHA - INDIVIDUAL ==========
    Task<bool> SalvarCodigoRedefinicao(string usuarioId, string codigo, DateTime expiresAt);
    Task<Usuario?> ObterUsuarioPorCodigo(string codigo);
    Task<bool> VerificarCodigoRedefinicao(string usuarioId, string codigo);
    Task<bool> SalvarTokenRedefinicao(string usuarioId, string token, DateTime expiresAt);
    Task<Usuario?> ObterUsuarioPorTokenRedefinicao(string token);
    Task<bool> VerificarTokenRedefinicao(string usuarioId, string token);
    Task<bool> AtualizarSenha(string usuarioId, string novaSenha);
    Task<bool> LimparDadosRedefinicao(string usuarioId);

    // ========== RECUPERAÇÃO DE SENHA - CASAL ==========
    Task<bool> SalvarCodigoRedefinicaoCasal(string usuarioId, string pessoa, string codigo, DateTime expiresAt);
    Task<Usuario?> ObterCasalPorCodigo(string codigo);
    Task<bool> VerificarCodigoRedefinicaoCasal(string usuarioId, string pessoa, string codigo);
    Task<bool> SalvarTokenRedefinicaoCasal(string usuarioId, string pessoa, string token, DateTime expiresAt);
    Task<Usuario?> ObterCasalPorTokenRedefinicao(string token);
    Task<bool> VerificarTokenRedefinicaoCasal(string usuarioId, string pessoa, string token);
    Task<bool> AtualizarSenhaCasal(string usuarioId, string pessoa, string novaSenha);
    Task<bool> LimparDadosRedefinicaoCasal(string usuarioId, string pessoa);
}
