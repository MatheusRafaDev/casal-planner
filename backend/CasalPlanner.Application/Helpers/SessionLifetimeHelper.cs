namespace CasalPlanner.Application.Helpers;

public static class SessionLifetimeHelper
{
    // Sessão longa padrão: 180 dias no desktop (6 meses), 3650 dias no mobile/PWA (10 anos)
    public static readonly TimeSpan DesktopLifetime = TimeSpan.FromDays(180);
    public static readonly TimeSpan MobileLifetime = TimeSpan.FromDays(3650);

    public static TimeSpan GetLifetime(bool isMobile)
    {
        // Variável de ambiente expressa em dias, se configurada no servidor (ex: 180, 365)
        if (int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRES_DAYS"), out var d) && d > 0)
            return TimeSpan.FromDays(d);

        // Se houver JWT_EXPIRES_IN (em minutos), apenas usa se for >= 1440 min (1 dia)
        // para evitar que boilerplates de 60 minutos derrubem a sessão do usuário rapidamente
        if (int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRES_IN"), out var m) && m >= 1440)
            return TimeSpan.FromMinutes(m);

        return isMobile ? MobileLifetime : DesktopLifetime;
    }
}
