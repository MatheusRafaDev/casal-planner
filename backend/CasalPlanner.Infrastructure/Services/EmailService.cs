// Services/EmailService.cs
using System.Net;
using System.Net.Mail;

using Resend;
using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private const string SITE_URL = "https://casalplanner.vercel.app";

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        private async Task<bool> EnviarViaResendAsync(MailMessage mailMessage, string logContexto)
        {
            var resendApiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY") ?? _configuration["Resend:ApiKey"];
            if (string.IsNullOrEmpty(resendApiKey))
                return false;

            try
            {
                var resendFrom = Environment.GetEnvironmentVariable("RESEND_FROM_EMAIL")
                    ?? _configuration["Resend:FromEmail"]
                    ?? "onboarding@resend.dev";

                IResend resend = ResendClient.Create(resendApiKey);
                var destinatario = mailMessage.To[0].Address;

                var msg = new Resend.EmailMessage
                {
                    From = resendFrom,
                    Subject = mailMessage.Subject,
                    HtmlBody = mailMessage.Body,
                };
                msg.To.Add(destinatario);

                var response = await resend.EmailSendAsync(msg);
                _logger.LogInformation("Email ({Contexto}) enviado via Resend para {Email}. Id: {Id}",
                    logContexto, destinatario, response.Content);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar email ({Contexto}) via Resend para {Email}",
                    logContexto, mailMessage.To[0].Address);
                return false;
            }
        }

        public async Task<bool> EnviarCodigoRedefinicaoSenha(string email, string codigo, string nome = "")
        {
            try
            {


                var saudacao = string.IsNullOrEmpty(nome) ? "Olá" : $"Olá {nome}";
                var anoAtual = DateTime.UtcNow.Year;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = "🔐 Recuperação de senha - CasalPlanner",
                    Body = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset='utf-8'>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                            <title>Recuperação de senha - CasalPlanner</title>
                            <style>
                                * {{
                                    margin: 0;
                                    padding: 0;
                                    box-sizing: border-box;
                                }}
                                
                                body {{
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
                                    line-height: 1.6;
                                    background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                                    margin: 0;
                                    padding: 20px;
                                }}
                                
                                .container {{
                                    max-width: 560px;
                                    margin: 0 auto;
                                    background: #27272A;
                                    border-radius: 16px;
                                    overflow: hidden;
                                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                                    animation: slideUp 0.4s ease-out;
                                    border: 1px solid #3F3F46;
                                }}
                                
                                @keyframes slideUp {{
                                    from {{
                                        opacity: 0;
                                        transform: translateY(20px);
                                    }}
                                    to {{
                                        opacity: 1;
                                        transform: translateY(0);
                                    }}
                                }}
                                
                                .header {{
                                    background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                                    padding: 32px 24px;
                                    text-align: center;
                                }}
                                
                                .logo {{
                                    font-size: 28px;
                                    font-weight: 800;
                                    color: #ffffff;
                                    letter-spacing: -0.5px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 8px;
                                }}
                                
                                .logo-icon {{
                                    font-size: 32px;
                                }}
                                
                                .logo-text {{
                                    color: #ffffff;
                                }}
                                
                                .header-subtitle {{
                                    color: rgba(255, 255, 255, 0.9);
                                    font-size: 13px;
                                    margin-top: 8px;
                                }}
                                
                                .content {{
                                    padding: 40px 32px;
                                }}
                                
                                .greeting {{
                                    font-size: 24px;
                                    font-weight: 700;
                                    color: #F4F4F5;
                                    margin-bottom: 12px;
                                }}
                                
                                .message {{
                                    color: #D4D4D8;
                                    font-size: 15px;
                                    margin-bottom: 28px;
                                    line-height: 1.5;
                                }}
                                
                                .code-container {{
                                    background: #18181B;
                                    border-radius: 16px;
                                    padding: 28px;
                                    text-align: center;
                                    margin: 28px 0;
                                    border: 1px solid #3F3F46;
                                }}
                                
                                .code-label {{
                                    font-size: 12px;
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    letter-spacing: 2px;
                                    color: #A78BFA;
                                    margin-bottom: 16px;
                                }}
                                
                                .code {{
                                    font-size: 48px;
                                    letter-spacing: 12px;
                                    font-weight: 800;
                                    font-family: 'Courier New', 'SF Mono', monospace;
                                    color: #F9A8D4;
                                    background: #27272A;
                                    padding: 20px;
                                    border-radius: 12px;
                                    display: inline-block;
                                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                                    border: 1px solid #3F3F46;
                                }}
                                
                                .expiry {{
                                    font-size: 12px;
                                    color: #71717A;
                                    margin-top: 16px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 6px;
                                }}
                                
                                .info-box {{
                                    background: #18181B;
                                    border-left: 4px solid #34D399;
                                    padding: 16px 20px;
                                    border-radius: 12px;
                                    margin: 24px 0;
                                }}
                                
                                .info-box p {{
                                    color: #34D399;
                                    font-size: 14px;
                                    font-weight: 500;
                                    margin: 0;
                                }}
                                
                                .warning-box {{
                                    background: #18181B;
                                    border-left: 4px solid #F87171;
                                    padding: 16px 20px;
                                    border-radius: 12px;
                                    margin: 24px 0;
                                }}
                                
                                .warning-box p {{
                                    color: #F87171;
                                    font-size: 14px;
                                    font-weight: 500;
                                    margin: 0;
                                }}
                                
                                .tips {{
                                    background: #18181B;
                                    border-radius: 16px;
                                    padding: 20px;
                                    margin: 24px 0;
                                    border: 1px solid #3F3F46;
                                }}
                                
                                .tips-title {{
                                    font-size: 14px;
                                    font-weight: 700;
                                    color: #F9A8D4;
                                    margin-bottom: 12px;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                }}
                                
                                .tips-list {{
                                    list-style: none;
                                    padding: 0;
                                    margin: 0;
                                }}
                                
                                .tips-list li {{
                                    font-size: 13px;
                                    color: #D4D4D8;
                                    padding: 8px 0;
                                    padding-left: 24px;
                                    position: relative;
                                }}
                                
                                .tips-list li::before {{
                                    content: '✓';
                                    position: absolute;
                                    left: 0;
                                    color: #A78BFA;
                                    font-weight: bold;
                                }}
                                
                                .button {{
                                    display: inline-block;
                                    background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                                    color: white;
                                    padding: 12px 28px;
                                    border-radius: 40px;
                                    text-decoration: none;
                                    font-weight: 600;
                                    margin-top: 16px;
                                    transition: transform 0.2s;
                                }}
                                
                                .button:hover {{
                                    transform: translateY(-2px);
                                }}
                                
                                .footer {{
                                    background: #18181B;
                                    padding: 24px 32px;
                                    text-align: center;
                                    border-top: 1px solid #3F3F46;
                                }}
                                
                                .footer-text {{
                                    color: #71717A;
                                    font-size: 12px;
                                    margin: 8px 0;
                                }}
                                
                                @media (max-width: 600px) {{
                                    body {{
                                        padding: 12px;
                                    }}
                                    
                                    .content {{
                                        padding: 28px 20px;
                                    }}
                                    
                                    .code {{
                                        font-size: 32px;
                                        letter-spacing: 8px;
                                        padding: 16px;
                                    }}
                                    
                                    .greeting {{
                                        font-size: 20px;
                                    }}
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <div class='logo'>
                                        <span class='logo-icon'>💜</span>
                                        <span class='logo-text'>CasalPlanner</span>
                                    </div>
                                    <div class='header-subtitle'>
                                        Organizando sonhos juntos
                                    </div>
                                </div>
                                
                                <div class='content'>
                                    <div class='greeting'>
                                        {saudacao}! 👋
                                    </div>
                                    
                                    <div class='message'>
                                        Recebemos uma solicitação para redefinir sua senha no <strong>CasalPlanner</strong>.
                                        Utilize o código abaixo para prosseguir com a recuperação.
                                    </div>
                                    
                                    <div class='code-container'>
                                        <div class='code-label'>
                                            🔑 CÓDIGO DE VERIFICAÇÃO
                                        </div>
                                        <div class='code'>
                                            {codigo}
                                        </div>
                                        <div class='expiry'>
                                            ⏰ Válido por <strong>15 minutos</strong>
                                        </div>
                                    </div>
                                    
                                    <div class='info-box'>
                                        <p>
                                            📋 Digite este código na página de recuperação de senha para continuar.
                                        </p>
                                    </div>
                                    
                                    <div class='warning-box'>
                                        <p>
                                            ⚠️ Se você não solicitou essa alteração, ignore este email. Sua senha permanecerá inalterada.
                                        </p>
                                    </div>
                                    
                                    <div class='tips'>
                                        <div class='tips-title'>
                                            🔒 Dicas de segurança
                                        </div>
                                        <ul class='tips-list'>
                                            <li>Nunca compartilhe este código com ninguém</li>
                                            <li>Nossa equipe nunca solicitará este código</li>
                                            <li>Use uma senha forte e única para sua conta</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div class='footer'>
                                    <div class='footer-text'>
                                        💜 <strong>CasalPlanner</strong> - Organizando sonhos juntos
                                    </div>
                                    <div class='footer-text'>
                                        © {anoAtual} CasalPlanner. Todos os direitos reservados.
                                    </div>
                                    <div class='footer-text'>
                                        <a href='{SITE_URL}' style='color: #A78BFA; text-decoration: none;'>Acesse nosso site</a>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    ",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                var enviado = await EnviarViaResendAsync(mailMessage, "recuperacao-senha");
                if (enviado)
                    _logger.LogInformation("✅ Email de recuperação enviado com sucesso para {Email}", email);
                return enviado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao enviar email de recuperação para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarEmailBoasVindas(string email, string nome, bool isCasal = false)
        {
            try
            {
var anoAtual = DateTime.UtcNow.Year;


                var tipoContaTexto = isCasal ? "conta de casal" : "conta individual";
                var dicasAdicionais = isCasal
                    ? @"<li>Ambos podem acessar a mesma conta com seus próprios logins</li>
                        <li>Cada pessoa tem seus próprios gastos e categorias</li>
                        <li>A renda total é calculada automaticamente</li>"
                    : @"<li>Você pode convidar seu parceiro para transformar em conta de casal depois</li>
                        <li>Acompanhe seus gastos pessoais de forma simples</li>
                        <li>Receba insights sobre seus hábitos financeiros</li>";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = "🎉 Bem-vindo(a) ao CasalPlanner!",
                    Body = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset='utf-8'>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                            <title>Bem-vindo ao CasalPlanner</title>
                            <style>
                                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                                body {{
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
                                    line-height: 1.6;
                                    background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                                    margin: 0;
                                    padding: 20px;
                                }}
                                .container {{
                                    max-width: 560px;
                                    margin: 0 auto;
                                    background: #27272A;
                                    border-radius: 16px;
                                    overflow: hidden;
                                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                                    animation: slideUp 0.4s ease-out;
                                    border: 1px solid #3F3F46;
                                }}
                                @keyframes slideUp {{
                                    from {{ opacity: 0; transform: translateY(20px); }}
                                    to {{ opacity: 1; transform: translateY(0); }}
                                }}
                                .header {{
                                    background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                                    padding: 32px 24px;
                                    text-align: center;
                                }}
                                .logo {{
                                    font-size: 28px;
                                    font-weight: 800;
                                    color: #ffffff;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 12px;
                                }}
                                .content {{ padding: 40px 32px; }}
                                .greeting {{ font-size: 24px; font-weight: 700; color: #F4F4F5; margin-bottom: 12px; }}
                                .message {{ color: #D4D4D8; font-size: 15px; margin-bottom: 20px; }}
                                .highlight-box {{
                                    background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                                    border-radius: 16px;
                                    padding: 24px;
                                    margin: 24px 0;
                                    text-align: center;
                                    border: 1px solid #3F3F46;
                                }}
                                .highlight-box p {{ color: #D4D4D8; }}
                                .tips {{
                                    background: #18181B;
                                    border-radius: 16px;
                                    padding: 20px;
                                    margin: 24px 0;
                                    border: 1px solid #3F3F46;
                                }}
                                .tips-title {{
                                    font-size: 14px;
                                    font-weight: 700;
                                    color: #F9A8D4;
                                    margin-bottom: 12px;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                }}
                                .tips-list {{
                                    list-style: none;
                                    padding: 0;
                                    margin: 0;
                                }}
                                .tips-list li {{
                                    font-size: 13px;
                                    color: #D4D4D8;
                                    padding: 8px 0;
                                    padding-left: 24px;
                                    position: relative;
                                }}
                                .tips-list li::before {{
                                    content: '✓';
                                    position: absolute;
                                    left: 0;
                                    color: #A78BFA;
                                    font-weight: bold;
                                }}
                                .button {{
                                    display: inline-block;
                                    background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                                    color: white;
                                    padding: 12px 28px;
                                    border-radius: 40px;
                                    text-decoration: none;
                                    font-weight: 600;
                                    margin-top: 16px;
                                    transition: transform 0.2s;
                                }}
                                .button:hover {{ transform: translateY(-2px); }}
                                .footer {{
                                    background: #18181B;
                                    padding: 24px 32px;
                                    text-align: center;
                                    border-top: 1px solid #3F3F46;
                                }}
                                .footer-text {{ color: #71717A; font-size: 12px; margin: 8px 0; }}
                                @media (max-width: 600px) {{
                                    body {{ padding: 12px; }}
                                    .content {{ padding: 28px 20px; }}
                                    .greeting {{ font-size: 20px; }}
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <div class='logo'>
                                        <span>💜</span>
                                        <span>CasalPlanner</span>
                                    </div>
                                </div>
                                <div class='content'>
                                    <div class='greeting'>Bem-vindo(a) ao CasalPlanner, {nome}! 🎉</div>
                                    <div class='message'>
                                        Estamos muito felizes em ter você conosco! Sua {tipoContaTexto} foi criada com sucesso.
                                    </div>
                                    <div class='highlight-box'>
                                        <p style='color: #A78BFA; margin-bottom: 8px;'>✨ Seu primeiro passo ✨</p>
                                        <p>Comece agora mesmo organizando suas finanças e planejando seus sonhos!</p>
                                        <a href='{SITE_URL}/login' class='button'>Acessar minha conta</a>
                                    </div>
                                    <div class='tips'>
                                        <div class='tips-title'>💡 Dicas para começar</div>
                                        <ul class='tips-list'>
                                            <li>Complete seu perfil com suas informações pessoais</li>
                                            <li>Adicione suas despesas mensais nas categorias disponíveis</li>
                                            {dicasAdicionais}
                                            <li>Configure seu orçamento mensal</li>
                                        </ul>
                                    </div>
                                </div>
                                <div class='footer'>
                                    <div class='footer-text'>💜 CasalPlanner - Organizando sonhos juntos</div>
                                    <div class='footer-text'>© {anoAtual} CasalPlanner. Todos os direitos reservados.</div>
                                    <div class='footer-text'><a href='{SITE_URL}' style='color: #A78BFA; text-decoration: none;'>Visite nosso site</a></div>
                                </div>
                            </div>
                        </body>
                        </html>
                    ",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                var enviado = await EnviarViaResendAsync(mailMessage, "boas-vindas");
                if (enviado)
                    _logger.LogInformation("✅ Email de boas-vindas enviado para {Email}", email);
                return enviado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao enviar email de boas-vindas para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarEmailExclusaoConta(string email, string nome, bool isCasal = false)
        {
            try
            {
var anoAtual = DateTime.UtcNow.Year;


                var tipoContaTexto = isCasal ? "conta de casal" : "conta";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = "📋 Confirmação de exclusão de conta - CasalPlanner",
                    Body = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset='utf-8'>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                            <title>Conta excluída - CasalPlanner</title>
                            <style>
                                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                                body {{
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
                                    line-height: 1.6;
                                    background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                                    margin: 0;
                                    padding: 20px;
                                }}
                                .container {{
                                    max-width: 560px;
                                    margin: 0 auto;
                                    background: #27272A;
                                    border-radius: 16px;
                                    overflow: hidden;
                                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                                    animation: slideUp 0.4s ease-out;
                                    border: 1px solid #3F3F46;
                                }}
                                @keyframes slideUp {{
                                    from {{ opacity: 0; transform: translateY(20px); }}
                                    to {{ opacity: 1; transform: translateY(0); }}
                                }}
                                .header {{
                                    background: linear-gradient(135deg, #F87171 0%, #EF4444 100%);
                                    padding: 32px 24px;
                                    text-align: center;
                                }}
                                .logo {{
                                    font-size: 28px;
                                    font-weight: 800;
                                    color: #ffffff;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 12px;
                                }}
                                .content {{ padding: 40px 32px; }}
                                .greeting {{ font-size: 24px; font-weight: 700; color: #F4F4F5; margin-bottom: 12px; }}
                                .message {{ color: #D4D4D8; font-size: 15px; margin-bottom: 20px; }}
                                .warning-box {{
                                    background: #18181B;
                                    border-left: 4px solid #F87171;
                                    padding: 20px;
                                    border-radius: 12px;
                                    margin: 24px 0;
                                }}
                                .info-box {{
                                    background: #18181B;
                                    border-left: 4px solid #34D399;
                                    padding: 20px;
                                    border-radius: 12px;
                                    margin: 24px 0;
                                }}
                                .button {{
                                    display: inline-block;
                                    background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                                    color: white;
                                    padding: 12px 28px;
                                    border-radius: 40px;
                                    text-decoration: none;
                                    font-weight: 600;
                                    margin-top: 16px;
                                    transition: transform 0.2s;
                                }}
                                .button:hover {{ transform: translateY(-2px); }}
                                .footer {{
                                    background: #18181B;
                                    padding: 24px 32px;
                                    text-align: center;
                                    border-top: 1px solid #3F3F46;
                                }}
                                .footer-text {{ color: #71717A; font-size: 12px; margin: 8px 0; }}
                                @media (max-width: 600px) {{
                                    body {{ padding: 12px; }}
                                    .content {{ padding: 28px 20px; }}
                                    .greeting {{ font-size: 20px; }}
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <div class='logo'>
                                        <span>📋</span>
                                        <span>CasalPlanner</span>
                                    </div>
                                </div>
                                <div class='content'>
                                    <div class='greeting'>Olá {nome},</div>
                                    <div class='message'>
                                        Sua {tipoContaTexto} foi <strong>excluída permanentemente</strong> do CasalPlanner conforme sua solicitação.
                                    </div>
                                    
                                    <div class='warning-box'>
                                        <p style='color: #F87171; font-weight: 600; margin-bottom: 12px;'>⚠️ O que aconteceu com seus dados?</p>
                                        <ul style='color: #D4D4D8; margin-left: 20px;'>
                                            <li>Todos os seus dados financeiros foram removidos</li>
                                            <li>Suas categorias personalizadas foram deletadas</li>
                                            <li>Todo histórico de atividades foi apagado</li>
                                            <li>As informações não podem ser recuperadas</li>
                                        </ul>
                                    </div>
                                    
                                    <div class='info-box'>
                                        <p style='color: #34D399; font-weight: 600; margin-bottom: 8px;'>💡 Sentimos sua falta!</p>
                                        <p style='color: #D4D4D8; font-size: 14px;'>
                                            Se você mudar de ideia, pode criar uma nova conta a qualquer momento.
                                            Estaremos sempre aqui para ajudar você a organizar seus sonhos!
                                        </p>
                                        <a href='{SITE_URL}/login' class='button'>Criar nova conta</a>
                                    </div>
                                </div>
                                <div class='footer'>
                                    <div class='footer-text'>💜 CasalPlanner - Organizando sonhos juntos</div>
                                    <div class='footer-text'>© {anoAtual} CasalPlanner. Todos os direitos reservados.</div>
                                    <div class='footer-text'><a href='{SITE_URL}' style='color: #A78BFA; text-decoration: none;'>Visite nosso site</a></div>
                                </div>
                            </div>
                        </body>
                        </html>
                    ",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                var enviado = await EnviarViaResendAsync(mailMessage, "exclusao-conta");
                if (enviado)
                    _logger.LogInformation("✅ Email de confirmação de exclusão enviado para {Email}", email);
                return enviado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao enviar email de exclusão para {Email}", email);
                return false;
            }
        }

        // Services/EmailService.cs - Adicione este método
        public async Task<bool> EnviarAvisoSenhaAlterada(string email, string nome)
        {
            try
            {
var anoAtual = DateTime.UtcNow.Year;


                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = "🔒 Sua senha foi alterada - CasalPlanner",
                    Body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <title>Senha alterada - CasalPlanner</title>
                    <style>
                        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                        body {{
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
                            line-height: 1.6;
                            background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                            margin: 0;
                            padding: 20px;
                        }}
                        .container {{
                            max-width: 560px;
                            margin: 0 auto;
                            background: #27272A;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                            animation: slideUp 0.4s ease-out;
                            border: 1px solid #3F3F46;
                        }}
                        @keyframes slideUp {{
                            from {{ opacity: 0; transform: translateY(20px); }}
                            to {{ opacity: 1; transform: translateY(0); }}
                        }}
                        .header {{
                            background: linear-gradient(135deg, #F9A8D4 0%, #A78BFA 100%);
                            padding: 32px 24px;
                            text-align: center;
                        }}
                        .logo {{
                            font-size: 28px;
                            font-weight: 800;
                            color: #ffffff;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 12px;
                        }}
                        .content {{ padding: 40px 32px; }}
                        .greeting {{ font-size: 24px; font-weight: 700; color: #F4F4F5; margin-bottom: 12px; }}
                        .message {{ color: #D4D4D8; font-size: 15px; margin-bottom: 20px; }}
                        .info-box {{
                            background: #18181B;
                            border-left: 4px solid #F9A8D4;
                            padding: 20px;
                            border-radius: 12px;
                            margin: 24px 0;
                        }}
                        .warning-box {{
                            background: #18181B;
                            border-left: 4px solid #F87171;
                            padding: 20px;
                            border-radius: 12px;
                            margin: 24px 0;
                        }}
                        .button {{
                            display: inline-block;
                            background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                            color: white;
                            padding: 12px 28px;
                            border-radius: 40px;
                            text-decoration: none;
                            font-weight: 600;
                            margin-top: 16px;
                            transition: transform 0.2s;
                        }}
                        .button:hover {{ transform: translateY(-2px); }}
                        .footer {{
                            background: #18181B;
                            padding: 24px 32px;
                            text-align: center;
                            border-top: 1px solid #3F3F46;
                        }}
                        .footer-text {{ color: #71717A; font-size: 12px; margin: 8px 0; }}
                        @media (max-width: 600px) {{
                            body {{ padding: 12px; }}
                            .content {{ padding: 28px 20px; }}
                            .greeting {{ font-size: 20px; }}
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <div class='logo'>
                                <span>🔒</span>
                                <span>CasalPlanner</span>
                            </div>
                        </div>
                        <div class='content'>
                            <div class='greeting'>Olá {nome},</div>
                            <div class='message'>
                                Sua senha foi <strong>alterada com sucesso</strong> em sua conta do CasalPlanner.
                            </div>
                            
                            <div class='info-box'>
                                <p style='color: #F9A8D4; font-weight: 600; margin-bottom: 8px;'>✅ Alteração realizada</p>
                                <p style='color: #D4D4D8; font-size: 14px;'>
                                    Se você foi quem realizou esta alteração, nenhuma ação é necessária.
                                </p>
                            </div>
                            
                            <div class='warning-box'>
                                <p style='color: #F87171; font-weight: 600; margin-bottom: 8px;'>⚠️ Não foi você?</p>
                                <p style='color: #D4D4D8; font-size: 14px;'>
                                    Se você não reconhece esta alteração, entre em contato imediatamente com nosso suporte.
                                </p>
                                <a href='{SITE_URL}/recuperar-senha' class='button'>Recuperar acesso</a>
                            </div>
                        </div>
                        <div class='footer'>
                            <div class='footer-text'>💜 CasalPlanner - Organizando sonhos juntos</div>
                            <div class='footer-text'>© {anoAtual} CasalPlanner. Todos os direitos reservados.</div>
                        </div>
                    </div>
                </body>
                </html>
            ",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                var enviado = await EnviarViaResendAsync(mailMessage, "senha-alterada");
                if (enviado)
                    _logger.LogInformation("✅ Aviso de senha alterada enviado para {Email}", email);
                return enviado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao enviar aviso de senha alterada para {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnviarEmailConviteParceiro(string email, string nomeConvidante, string linkConvite, DateTime expiraEm)
        {
            try
            {
var anoAtual = DateTime.UtcNow.Year;
var dataExpiracao = expiraEm.ToString("dd/MM/yyyy");

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("noreply@casalplanner.com", "CasalPlanner"),
                    Subject = "💕 Convite para CasalPlanner",
                    Body = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset='utf-8'>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                            <title>Convite para CasalPlanner</title>
                            <style>
                                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                                body {{
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
                                    line-height: 1.6;
                                    background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                                    margin: 0;
                                    padding: 20px;
                                }}
                                .container {{
                                    max-width: 560px;
                                    margin: 0 auto;
                                    background: #27272A;
                                    border-radius: 16px;
                                    overflow: hidden;
                                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                                    animation: slideUp 0.4s ease-out;
                                    border: 1px solid #3F3F46;
                                }}
                                @keyframes slideUp {{
                                    from {{ opacity: 0; transform: translateY(20px); }}
                                    to {{ opacity: 1; transform: translateY(0); }}
                                }}
                                .header {{
                                    background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                                    padding: 32px 24px;
                                    text-align: center;
                                }}
                                .logo {{
                                    font-size: 28px;
                                    font-weight: 800;
                                    color: #ffffff;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 12px;
                                }}
                                .content {{ padding: 40px 32px; }}
                                .greeting {{ font-size: 24px; font-weight: 700; color: #F4F4F5; margin-bottom: 12px; }}
                                .message {{ color: #D4D4D8; font-size: 15px; margin-bottom: 20px; }}
                                .invite-box {{
                                    background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
                                    border-radius: 16px;
                                    padding: 28px;
                                    margin: 24px 0;
                                    text-align: center;
                                    border: 1px solid #3F3F46;
                                }}
                                .invite-box p {{ color: #D4D4D8; }}
                                .inviter-name {{ color: #F9A8D4; font-weight: 700; font-size: 18px; }}
                                .button {{
                                    display: inline-block;
                                    background: linear-gradient(135deg, #A78BFA 0%, #F9A8D4 100%);
                                    color: white;
                                    padding: 14px 32px;
                                    border-radius: 40px;
                                    text-decoration: none;
                                    font-weight: 600;
                                    margin-top: 20px;
                                    transition: transform 0.2s;
                                }}
                                .button:hover {{ transform: translateY(-2px); }}
                                .expiry {{
                                    font-size: 12px;
                                    color: #71717A;
                                    margin-top: 16px;
                                }}
                                .footer {{
                                    background: #18181B;
                                    padding: 24px 32px;
                                    text-align: center;
                                    border-top: 1px solid #3F3F46;
                                }}
                                .footer-text {{ color: #71717A; font-size: 12px; margin: 8px 0; }}
                                @media (max-width: 600px) {{
                                    body {{ padding: 12px; }}
                                    .content {{ padding: 28px 20px; }}
                                    .greeting {{ font-size: 20px; }}
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <div class='logo'>
                                        <span>💜</span>
                                        <span>CasalPlanner</span>
                                    </div>
                                </div>
                                <div class='content'>
                                    <div class='greeting'>Olá! 💕</div>
                                    <div class='message'>
                                        <span class='inviter-name'>{nomeConvidante}</span> convidou você para ser parceiro(a) no CasalPlanner!
                                    </div>
                                    <div class='invite-box'>
                                        <p style='color: #A78BFA; margin-bottom: 12px;'>💌 O que é o CasalPlanner?</p>
                                        <p style='color: #D4D4D8; font-size: 14px; margin-bottom: 16px;'>
                                            Um app para casais organizarem juntos o planejamento do enxoval, controlar gastos e compartilhar a lista de compras.
                                        </p>
                                        <a href='{linkConvite}' class='button'>Aceitar convite</a>
                                        <div class='expiry'>
                                            ⏰ Convite válido até {dataExpiracao}
                                        </div>
                                    </div>
                                    <div class='message' style='font-size: 13px;'>
                                        Ao aceitar, você poderá criar sua conta com este email e acessar o planejamento compartilhado.
                                    </div>
                                </div>
                                <div class='footer'>
                                    <div class='footer-text'>💜 CasalPlanner - Organizando sonhos juntos</div>
                                    <div class='footer-text'>© {anoAtual} CasalPlanner. Todos os direitos reservados.</div>
                                </div>
                            </div>
                        </body>
                        </html>
                    ",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                var enviado = await EnviarViaResendAsync(mailMessage, "convite-parceiro");
                if (enviado)
                    _logger.LogInformation("✅ Email de convite enviado para {Email}", email);
                return enviado;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao enviar email de convite para {Email}", email);
                return false;
            }
        }
        public async Task<bool> EnviarNotificacaoParceiroAsync(string emailDestino, string nomeParceiro, string assunto, string mensagem)
        {
            try
            {
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .content {{ background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .footer {{ text-align: center; font-size: 12px; color: #666; margin-top: 30px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='color: #8b5cf6;'>CasalPlanner</h1>
        </div>
        <div class='content'>
            <p>Olá!</p>
            <p>Seu parceiro(a) <strong>{nomeParceiro}</strong> tem uma atualização na lista:</p>
            <p style='font-size: 16px; font-weight: bold; padding: 15px; background: #fff; border-left: 4px solid #8b5cf6;'>
                {mensagem}
            </p>
            <p>Acesse o <a href='{SITE_URL}' style='color: #8b5cf6;'>CasalPlanner</a> para conferir.</p>
        </div>
        <div class='footer'>
            <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
    </div>
</body>
</html>";

                var mailMessage = new MailMessage
                {
                    Subject = assunto,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(emailDestino);

                return await EnviarViaResendAsync(mailMessage, "NotificacaoParceiro");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao enviar notificação de parceiro para {Email}", emailDestino);
                return false;
            }
        }
    }

}
