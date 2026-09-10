// Services/EmailService.cs
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private const string SITE_URL = "https://casalplanner.vercel.app";

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        private string GetMinimalistTemplate(string subject, string content)
        {
            var anoAtual = DateTime.UtcNow.Year;
            return $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{subject}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 4px; border: 1px solid #e5e7eb; }}
        h1 {{ font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #111827; }}
        p {{ margin-bottom: 16px; font-size: 15px; color: #374151; }}
        .footer {{ margin-top: 40px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }}
        .button {{ display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; margin-top: 10px; margin-bottom: 20px; }}
        .code {{ font-family: monospace; font-size: 24px; font-weight: bold; padding: 15px; background: #f3f4f6; text-align: center; letter-spacing: 4px; border-radius: 4px; margin: 20px 0; color: #111827; }}
        a {{ color: #111827; }}
    </style>
</head>
<body>
    <div class='container'>
        <h1>CasalPlanner</h1>
        {content}
        <div class='footer'>
            CasalPlanner &copy; {anoAtual}
        </div>
    </div>
</body>
</html>";
        }

        private async Task<bool> EnviarViaBrevoAsync(MailMessage mailMessage, string logContexto)
        {
            var apiKey = Environment.GetEnvironmentVariable("BREVO_API_KEY") ?? _configuration["Brevo:ApiKey"];

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogWarning("BREVO_API_KEY não configurada. Cancelando envio de {Contexto}.", logContexto);
                return false;
            }

            var fromEmail = Environment.GetEnvironmentVariable("BREVO_FROM_EMAIL") ?? _configuration["Brevo:FromEmail"] ?? "noreply@casalplanner.com";
            var destinatario = mailMessage.To[0].Address;

            var payload = new
            {
                sender = new { name = "CasalPlanner", email = fromEmail },
                to = new[] { new { email = destinatario } },
                subject = mailMessage.Subject,
                htmlContent = mailMessage.Body
            };

            try
            {
                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Add("api-key", apiKey);
                client.DefaultRequestHeaders.Add("Accept", "application/json");

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://api.brevo.com/v3/smtp/email", content);
                var body = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Email ({Contexto}) enviado via Brevo API para {Email}.", logContexto, destinatario);
                    return true;
                }

                _logger.LogError("Brevo API retornou {Status} ao enviar email ({Contexto}) para {Email}: {Body}",
                    (int)response.StatusCode, logContexto, destinatario, body);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email ({Contexto}) via Brevo API para {Email}", logContexto, destinatario);
                return false;
            }
        }

        private Task<bool> EnviarEmailAsync(MailMessage mailMessage, string logContexto)
            => EnviarViaBrevoAsync(mailMessage, logContexto);

        public async Task<bool> EnviarCodigoRedefinicaoSenha(string email, string codigo, string nome = "")
        {
            try
            {
                var saudacao = string.IsNullOrEmpty(nome) ? "Olá" : $"Olá, {nome}";
                var subject = "Recuperação de senha";
                var content = $@"<p>{saudacao}.</p>
<p>Recebemos uma solicitação para redefinir sua senha.</p>
<p>Utilize o código abaixo para prosseguir:</p>
<div class='code'>{codigo}</div>
<p>Este código é válido por 15 minutos. Se você não solicitou essa alteração, ignore este e-mail.</p>";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = subject,
                    Body = GetMinimalistTemplate(subject, content),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);
                return await EnviarEmailAsync(mailMessage, "recuperacao-senha");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de recuperação para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarEmailBoasVindas(string email, string nome, bool isCasal = false)
        {
            try
            {
                var tipo = isCasal ? "conta de casal" : "conta individual";
                var subject = "Bem-vindo ao CasalPlanner";
                var content = $@"<p>Olá, {nome}.</p>
<p>Sua {tipo} foi criada com sucesso no CasalPlanner.</p>
<p>Acesse sua conta para começar a organizar suas finanças:</p>
<a href='{SITE_URL}/login' class='button'>Acessar conta</a>";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = subject,
                    Body = GetMinimalistTemplate(subject, content),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);
                return await EnviarEmailAsync(mailMessage, "boas-vindas");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de boas-vindas para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarEmailExclusaoConta(string email, string nome, bool isCasal = false)
        {
            try
            {
                var tipo = isCasal ? "conta de casal" : "conta";
                var subject = "Conta excluída";
                var content = $@"<p>Olá, {nome}.</p>
<p>Sua {tipo} foi excluída permanentemente conforme sua solicitação.</p>
<p>Todos os seus dados foram removidos dos nossos servidores.</p>";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = subject,
                    Body = GetMinimalistTemplate(subject, content),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);
                return await EnviarEmailAsync(mailMessage, "exclusao-conta");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de exclusão para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarAvisoSenhaAlterada(string email, string nome)
        {
            try
            {
                var subject = "Senha alterada";
                var content = $@"<p>Olá, {nome}.</p>
<p>Sua senha foi alterada com sucesso.</p>
<p>Se você não realizou esta alteração, entre em contato imediatamente com o suporte.</p>";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = subject,
                    Body = GetMinimalistTemplate(subject, content),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);
                return await EnviarEmailAsync(mailMessage, "senha-alterada");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar aviso de senha alterada para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarEmailConviteParceiro(string email, string nomeConvidante, string linkConvite, DateTime expiraEm)
        {
            try
            {
                var subject = "Convite para CasalPlanner";
                var content = $@"<p>Olá.</p>
<p><strong>{nomeConvidante}</strong> convidou você para ser parceiro(a) no CasalPlanner.</p>
<p>Aceite o convite clicando no botão abaixo:</p>
<a href='{linkConvite}' class='button'>Aceitar convite</a>
<p>Este convite é válido até {expiraEm:dd/MM/yyyy}.</p>";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = subject,
                    Body = GetMinimalistTemplate(subject, content),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);
                return await EnviarEmailAsync(mailMessage, "convite-parceiro");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de convite para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarNotificacaoParceiroAsync(string emailDestino, string nomeParceiro, string assunto, string mensagem, CasalPlanner.Domain.Entities.Item? item = null)
        {
            try
            {
                var contentBuilder = new StringBuilder();
                contentBuilder.Append($@"<p>Olá.</p>
<p>Seu parceiro(a) <strong>{nomeParceiro}</strong> atualizou a lista:</p>
<p><em>{mensagem}</em></p>");

                if (item != null)
                {
                    contentBuilder.Append(@"<div style='margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;'>");
                    
                    if (!string.IsNullOrEmpty(item.FotoUrl))
                    {
                        contentBuilder.Append($"<div style='text-align: center;'><img src='{item.FotoUrl}' alt='{item.Nome}' style='max-width: 100%; height: auto; max-height: 200px; border-radius: 4px; margin-bottom: 10px;' /></div>");
                    }
                    
                    contentBuilder.Append($"<h3 style='margin: 0 0 10px 0; font-size: 16px; color: #111827;'>{item.Nome}</h3>");
                    
                    if (item.Preco > 0)
                    {
                        contentBuilder.Append($"<p style='margin: 0 0 5px 0; font-weight: bold; color: #111827;'>Preço: R$ {item.Preco:N2}</p>");
                    }
                    
                    if (!string.IsNullOrEmpty(item.Loja))
                    {
                        contentBuilder.Append($"<p style='margin: 0 0 5px 0; font-size: 14px; color: #374151;'>Loja: {item.Loja}</p>");
                    }

                    if (!string.IsNullOrEmpty(item.LinkProduto))
                    {
                        contentBuilder.Append($"<div style='margin-top: 15px;'><a href='{item.LinkProduto}' class='button' style='margin-bottom: 0;'>Ver Produto na Loja</a></div>");
                    }
                    
                    contentBuilder.Append("</div>");
                }

                contentBuilder.Append($"<p style='margin-top: 20px;'>Acesse o <a href='{SITE_URL}'>CasalPlanner</a> para conferir os detalhes completos.</p>");

                var content = contentBuilder.ToString();

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = assunto,
                    Body = GetMinimalistTemplate(assunto, content),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(emailDestino);
                return await EnviarEmailAsync(mailMessage, "NotificacaoParceiro");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar notificação de parceiro para {Email}", emailDestino);
                return false;
            }
        }

        public async Task<bool> EnviarAlertaPrecoBaixoAsync(string emailDestino, string nomeUsuario, CasalPlanner.Domain.Entities.Item item, decimal novoPreco, string urlNovoPreco, string loja)
        {
            try
            {
                var subject = $"🔥 Queda de preço: {item.Nome}";
                var economia = item.Preco - novoPreco;
                var percentual = (economia / item.Preco) * 100;
                
                var contentBuilder = new StringBuilder();
                contentBuilder.Append($@"<p>Olá, {nomeUsuario}!</p>
<p>O preço de um dos itens da sua lista caiu <strong>{percentual:N0}%</strong>!</p>");

                contentBuilder.Append(@"<div style='margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;'>");
                
                if (!string.IsNullOrEmpty(item.FotoUrl))
                {
                    contentBuilder.Append($"<div style='text-align: center;'><img src='{item.FotoUrl}' alt='{item.Nome}' style='max-width: 100%; height: auto; max-height: 200px; border-radius: 4px; margin-bottom: 10px;' /></div>");
                }
                
                contentBuilder.Append($"<h3 style='margin: 0 0 10px 0; font-size: 16px; color: #111827;'>{item.Nome}</h3>");
                contentBuilder.Append($"<p style='margin: 0 0 5px 0; text-decoration: line-through; color: #9ca3af;'>Preço alvo: R$ {item.Preco:N2}</p>");
                contentBuilder.Append($"<p style='margin: 0 0 5px 0; font-weight: bold; color: #10b981; font-size: 18px;'>Novo preço: R$ {novoPreco:N2}</p>");
                contentBuilder.Append($"<p style='margin: 0 0 15px 0; font-size: 14px; color: #374151;'>Loja: {loja}</p>");

                if (!string.IsNullOrEmpty(urlNovoPreco))
                {
                    contentBuilder.Append($"<a href='{urlNovoPreco}' class='button'>Aproveitar Oferta</a>");
                }
                
                contentBuilder.Append("</div>");
                
                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = subject,
                    Body = GetMinimalistTemplate(subject, contentBuilder.ToString()),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(emailDestino);
                return await EnviarEmailAsync(mailMessage, "alerta-preco");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar alerta de preço para {Email}", emailDestino);
                return false;
            }
        }

        public async Task<bool> EnviarEmailPresenteRecebidoAsync(string emailDestino, string nomeUsuario, string nomeConvidado, CasalPlanner.Domain.Entities.Item item)
        {
            try
            {
                var subject = "🎁 Você ganhou um presente!";
                var contentBuilder = new StringBuilder();
                contentBuilder.Append($@"<p>Olá, {nomeUsuario}!</p>
<p>Boas notícias! <strong>{nomeConvidado}</strong> acabou de prometer dar o seguinte item da sua lista de presentes:</p>");

                contentBuilder.Append(@"<div style='margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fdfbf7;'>");
                
                if (!string.IsNullOrEmpty(item.FotoUrl))
                {
                    contentBuilder.Append($"<div style='text-align: center;'><img src='{item.FotoUrl}' alt='{item.Nome}' style='max-width: 100%; height: auto; max-height: 200px; border-radius: 4px; margin-bottom: 10px;' /></div>");
                }
                
                contentBuilder.Append($"<h3 style='margin: 0 0 10px 0; font-size: 16px; color: #111827;'>{item.Nome}</h3>");
                contentBuilder.Append("</div>");
                contentBuilder.Append($"<p>O item já foi marcado como 'comprado' no seu enxoval para evitar presentes duplicados.</p>");
                contentBuilder.Append($"<p>Acesse o <a href='{SITE_URL}'>CasalPlanner</a> para ver como está ficando a sua lista!</p>");
                
                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = subject,
                    Body = GetMinimalistTemplate(subject, contentBuilder.ToString()),
                    IsBodyHtml = true
                };

                mailMessage.To.Add(emailDestino);
                return await EnviarEmailAsync(mailMessage, "presente-recebido");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email de presente para {Email}", emailDestino);
                return false;
            }
        }
    }
}
