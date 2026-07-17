// Services/RecuperarSenhaService.cs
using System.Security.Cryptography;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Infrastructure.Persistence;
using MongoDB.Driver;
using CasalPlanner.Domain.Entities; 
using BCrypt.Net;

using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services
{
    public class RecuperarSenhaService : IRecuperarSenhaService
    {
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private readonly MongoDbContext _context;
        private readonly ILogger<RecuperarSenhaService> _logger;

        private const string CACHE_PREFIX_EMAIL = "recuperar_senha_email_";
        private const string CACHE_PREFIX_CODIGO = "recuperar_senha_codigo_";
        private const string CACHE_PREFIX_TOKEN = "recuperar_senha_token_";

        public RecuperarSenhaService(
            IMemoryCache cache,
            IEmailService emailService,
            MongoDbContext context,
            ILogger<RecuperarSenhaService> logger)
        {
            _cache = cache;
            _emailService = emailService;
            _context = context;
            _logger = logger;
        }

        public async Task<EsqueciSenhaResponseDto> SolicitarRecuperacaoAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email) || !IsValidEmail(email))
                {
                    return new EsqueciSenhaResponseDto
                    {
                        Success = false,
                        Message = "Email inválido",
                        Code = "INVALID_EMAIL",
                        EmailExists = false
                    };
                }

                email = email.Trim().ToLower();

                // Verificar se o email existe (conta individual)
                var usuarioIndividual = await _context.Usuarios
                    .Find(u => u.Email == email && u.TipoConta == TipoConta.Individual)
                    .FirstOrDefaultAsync();

                // Verificar se é conta casal
                var usuarioCasal = await _context.Usuarios
                    .Find(u => u.TipoConta == TipoConta.Casal && u.CasalInfo != null &&
                              (u.CasalInfo.EmailPessoa1 == email || u.CasalInfo.EmailPessoa2 == email))
                    .FirstOrDefaultAsync();

                var usuario = usuarioIndividual ?? usuarioCasal;
                
                if (usuario == null)
                {
                    _logger.LogWarning("Tentativa de recuperação para email não cadastrado: {Email}", email);
                    return new EsqueciSenhaResponseDto
                    {
                        Success = false,
                        Message = "Este email não está cadastrado em nossa plataforma",
                        Code = "USER_NOT_FOUND",
                        EmailExists = false
                    };
                }

                // Verificar se já existe solicitação ativa
                var solicitacaoExistente = _cache.Get<DadosRecuperacaoSenha>(CACHE_PREFIX_EMAIL + email);
                if (solicitacaoExistente != null)
                {
                    var tempoRestante = TimeSpan.FromMinutes(15) - (DateTime.UtcNow - solicitacaoExistente.CriadoEm);
                    if (tempoRestante.TotalMinutes > 10)
                    {
                        return new EsqueciSenhaResponseDto
                        {
                            Success = false,
                            Message = $"Você já possui um código ativo. Aguarde {Math.Ceiling(tempoRestante.TotalMinutes)} minutos.",
                            Code = "ACTIVE_CODE_EXISTS",
                            EmailExists = true
                        };
                    }
                }

                // Gerar código e token
                var codigo = GerarCodigoVerificacao();
                var token = GerarTokenUnico();
                var nome = ObterNomeUsuario(usuario, email);

                var dadosRecuperacao = new DadosRecuperacaoSenha
                {
                    Codigo = codigo,
                    Email = email,
                    Token = token,
                    CriadoEm = DateTime.UtcNow,
                    ExpiracaoEm = DateTime.UtcNow.AddMinutes(15),
                    Tentativas = 0,
                    UsuarioId = usuario.Id!,
                    Nome = nome,
                    Status = "ACTIVE",
                    TipoConta = usuario.TipoConta.ToString(),
                    Pessoa = usuario.TipoConta == TipoConta.Casal ? ObterPessoaDoCasal(usuario, email) : null
                };

                // Armazenar em cache
                _cache.Set(CACHE_PREFIX_EMAIL + email, dadosRecuperacao, TimeSpan.FromMinutes(15));
                _cache.Set(CACHE_PREFIX_CODIGO + codigo, email, TimeSpan.FromMinutes(15));
                _cache.Set(CACHE_PREFIX_TOKEN + token, dadosRecuperacao, TimeSpan.FromMinutes(15));

                // Enviar email
                var emailEnviado = await _emailService.EnviarCodigoRedefinicaoSenha(email, codigo, nome);

                if (!emailEnviado)
                {
                    _logger.LogError("Falha ao enviar email para {Email}", email);
                    LimparSolicitacao(email);
                    
                    return new EsqueciSenhaResponseDto
                    {
                        Success = false,
                        Message = "Erro ao enviar email. Tente novamente.",
                        Code = "EMAIL_SEND_ERROR",
                        EmailExists = true
                    };
                }

                _logger.LogInformation("Código enviado para {Email}", email);
                
                return new EsqueciSenhaResponseDto
                {
                    Success = true,
                    Message = "Código enviado com sucesso!",
                    EmailExists = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao processar recuperação para {Email}", email);
                return new EsqueciSenhaResponseDto
                {
                    Success = false,
                    Message = "Erro interno. Tente novamente.",
                    Code = "INTERNAL_ERROR",
                    EmailExists = false
                };
            }
        }

        public async Task<ValidarCodigoResponseDto> ValidarCodigoAsync(string codigo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(codigo) || codigo.Length != 6 || !codigo.All(char.IsDigit))
                {
                    return new ValidarCodigoResponseDto
                    {
                        Success = false,
                        Message = "Código inválido",
                        Token = string.Empty
                    };
                }

                var email = _cache.Get<string>(CACHE_PREFIX_CODIGO + codigo);
                
                if (string.IsNullOrEmpty(email))
                {
                    return new ValidarCodigoResponseDto
                    {
                        Success = false,
                        Message = "Código inválido ou expirado",
                        Token = string.Empty
                    };
                }

                var dadosRecuperacao = _cache.Get<DadosRecuperacaoSenha>(CACHE_PREFIX_EMAIL + email);
                
                if (dadosRecuperacao == null)
                {
                    return new ValidarCodigoResponseDto
                    {
                        Success = false,
                        Message = "Sessão expirada",
                        Token = string.Empty
                    };
                }

                if (dadosRecuperacao.ExpiracaoEm < DateTime.UtcNow)
                {
                    LimparSolicitacao(email);
                    return new ValidarCodigoResponseDto
                    {
                        Success = false,
                        Message = "Código expirado",
                        Token = string.Empty
                    };
                }

                if (dadosRecuperacao.Status == "USED")
                {
                    return new ValidarCodigoResponseDto
                    {
                        Success = false,
                        Message = "Código já utilizado",
                        Token = string.Empty
                    };
                }

                if (dadosRecuperacao.Tentativas >= 5)
                {
                    LimparSolicitacao(email);
                    return new ValidarCodigoResponseDto
                    {
                        Success = false,
                        Message = "Muitas tentativas. Solicite novo código.",
                        Token = string.Empty
                    };
                }

                if (dadosRecuperacao.Codigo != codigo)
                {
                    dadosRecuperacao.Tentativas++;
                    _cache.Set(CACHE_PREFIX_EMAIL + email, dadosRecuperacao, TimeSpan.FromMinutes(15));
                    
                    var tentativasRestantes = 5 - dadosRecuperacao.Tentativas;
                    return new ValidarCodigoResponseDto
                    {
                        Success = false,
                        Message = $"Código incorreto. Tentativas restantes: {tentativasRestantes}",
                        Token = string.Empty
                    };
                }

                // Código válido! Gerar token de redefinição
                var tokenRedefinicao = GerarTokenUnico();
                dadosRecuperacao.TokenRedefinicao = tokenRedefinicao;
                dadosRecuperacao.Status = "VALIDATED";
                dadosRecuperacao.ValidadoEm = DateTime.UtcNow;
                _cache.Set(CACHE_PREFIX_EMAIL + email, dadosRecuperacao, TimeSpan.FromMinutes(15));
                _cache.Set(CACHE_PREFIX_TOKEN + tokenRedefinicao, dadosRecuperacao, TimeSpan.FromMinutes(15));

                return new ValidarCodigoResponseDto
                {
                    Success = true,
                    Message = "Código válido",
                    Token = tokenRedefinicao
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao validar código");
                return new ValidarCodigoResponseDto
                {
                    Success = false,
                    Message = "Erro ao validar código",
                    Token = string.Empty
                };
            }
        }

        public async Task<RedefinirSenhaResponseDto> RedefinirSenhaAsync(string token, string novaSenha)
        {
            try
            {
                var dadosRecuperacao = _cache.Get<DadosRecuperacaoSenha>(CACHE_PREFIX_TOKEN + token);
                
                if (dadosRecuperacao == null)
                {
                    return new RedefinirSenhaResponseDto
                    {
                        Success = false,
                        Message = "Token inválido ou expirado. Solicite uma nova recuperação."
                    };
                }

                // Verificar se token expirou
                if (dadosRecuperacao.ExpiracaoEm < DateTime.UtcNow)
                {
                    LimparSolicitacao(dadosRecuperacao.Email);
                    return new RedefinirSenhaResponseDto
                    {
                        Success = false,
                        Message = "Token expirado. Solicite uma nova recuperação."
                    };
                }

                var usuario = await _context.Usuarios
                    .Find(u => u.Id == dadosRecuperacao.UsuarioId)
                    .FirstOrDefaultAsync();
                
                if (usuario == null)
                {
                    return new RedefinirSenhaResponseDto
                    {
                        Success = false,
                        Message = "Usuário não encontrado"
                    };
                }

                var senhaHash = BCrypt.Net.BCrypt.HashPassword(novaSenha, workFactor: 12);
                var updateBuilder = Builders<Usuario>.Update;
                UpdateDefinition<Usuario>? updateDefinition = null;

                // Atualizar senha conforme tipo de conta
                if (usuario.TipoConta == TipoConta.Individual)
                {
                    updateDefinition = updateBuilder
                        .Set(u => u.SenhaHash, senhaHash)
                        .Set(u => u.LastLoginAt, null);
                }
                else if (usuario.TipoConta == TipoConta.Casal && !string.IsNullOrEmpty(dadosRecuperacao.Pessoa))
                {
                    if (dadosRecuperacao.Pessoa == "pessoa1")
                    {
                        updateDefinition = updateBuilder
                            .Set(u => u.CasalInfo!.SenhaHashPessoa1, senhaHash)
                            .Set(u => u.LastLoginAt, null);
                    }
                    else if (dadosRecuperacao.Pessoa == "pessoa2")
                    {
                        updateDefinition = updateBuilder
                            .Set(u => u.CasalInfo!.SenhaHashPessoa2, senhaHash)
                            .Set(u => u.LastLoginAt, null);
                    }
                }

                if (updateDefinition == null)
                {
                    return new RedefinirSenhaResponseDto
                    {
                        Success = false,
                        Message = "Erro ao identificar tipo de conta"
                    };
                }

                var result = await _context.Usuarios.UpdateOneAsync(
                    u => u.Id == dadosRecuperacao.UsuarioId,
                    updateDefinition
                );

                if (result.ModifiedCount == 0)
                {
                    return new RedefinirSenhaResponseDto
                    {
                        Success = false,
                        Message = "Erro ao atualizar senha"
                    };
                }

                // Limpar dados de recuperação
                LimparSolicitacao(dadosRecuperacao.Email);
                _cache.Remove(CACHE_PREFIX_TOKEN + token);

                _logger.LogInformation("Senha redefinida com sucesso para {Email}", dadosRecuperacao.Email);

                return new RedefinirSenhaResponseDto
                {
                    Success = true,
                    Message = "Senha redefinida com sucesso!"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao redefinir senha");
                return new RedefinirSenhaResponseDto
                {
                    Success = false,
                    Message = "Erro ao redefinir senha. Tente novamente."
                };
            }
        }

        public void LimparCodigoExpirado(string email)
        {
            LimparSolicitacao(email);
        }

        private void LimparSolicitacao(string email)
        {
            var dados = _cache.Get<DadosRecuperacaoSenha>(CACHE_PREFIX_EMAIL + email);
            if (dados != null)
            {
                _cache.Remove(CACHE_PREFIX_EMAIL + email);
                _cache.Remove(CACHE_PREFIX_CODIGO + dados.Codigo);
                if (!string.IsNullOrEmpty(dados.TokenRedefinicao))
                {
                    _cache.Remove(CACHE_PREFIX_TOKEN + dados.TokenRedefinicao);
                }
            }
        }

        private string GerarCodigoVerificacao()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private string GerarTokenUnico()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "")
                .Substring(0, 64);
        }

        private string ObterNomeUsuario(Usuario usuario, string email)
        {
            if (usuario.TipoConta == TipoConta.Individual)
            {
                return usuario.NomeCompleto ?? "";
            }
            
            if (usuario.TipoConta == TipoConta.Casal && usuario.CasalInfo != null)
            {
                if (usuario.CasalInfo.EmailPessoa1 == email)
                    return usuario.CasalInfo.NomeCompletoPessoa1 ?? "";
                if (usuario.CasalInfo.EmailPessoa2 == email)
                    return usuario.CasalInfo.NomeCompletoPessoa2 ?? "";
            }
            
            return "";
        }

        private string? ObterPessoaDoCasal(Usuario usuario, string email)
        {
            if (usuario.CasalInfo == null) return null;
            
            if (usuario.CasalInfo.EmailPessoa1 == email)
                return "pessoa1";
            if (usuario.CasalInfo.EmailPessoa2 == email)
                return "pessoa2";
            
            return null;
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }

    public class DadosRecuperacaoSenha
    {
        public string Codigo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string? TokenRedefinicao { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime ExpiracaoEm { get; set; }
        public DateTime? ValidadoEm { get; set; }
        public int Tentativas { get; set; }
        public string UsuarioId { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string TipoConta { get; set; } = string.Empty;
        public string? Pessoa { get; set; }
    }
}