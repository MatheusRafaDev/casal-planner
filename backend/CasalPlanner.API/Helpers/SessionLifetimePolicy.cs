namespace CasalPlanner.API.Helpers;

public static class SessionLifetimePolicy
{
    private static readonly TimeSpan DesktopLifetime = TimeSpan.FromDays(7);
    private static readonly TimeSpan MobileLifetime = TimeSpan.FromDays(3650);

    public static bool IsMobileClient(HttpRequest request)
    {
        var mobileHint = request.Headers["Sec-CH-UA-Mobile"].ToString();
        var userAgent = request.Headers["User-Agent"].ToString();
        return mobileHint == "?1"
            || userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPod", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("Mobile", StringComparison.OrdinalIgnoreCase);
    }

    public static TimeSpan GetLifetime(HttpRequest request) =>
        IsMobileClient(request) ? MobileLifetime : DesktopLifetime;
}
