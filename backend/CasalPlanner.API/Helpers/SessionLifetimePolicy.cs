using CasalPlanner.Application.Helpers;

namespace CasalPlanner.API.Helpers;

public static class SessionLifetimePolicy
{
    public static readonly TimeSpan DesktopLifetime = SessionLifetimeHelper.DesktopLifetime;
    public static readonly TimeSpan MobileLifetime = SessionLifetimeHelper.MobileLifetime;

    public static bool IsMobileClient(HttpRequest request)
    {
        var clientType = request.Headers["X-Client-Type"].ToString();
        if (string.Equals(clientType, "mobile", StringComparison.OrdinalIgnoreCase))
            return true;

        var mobileHint = request.Headers["Sec-CH-UA-Mobile"].ToString();
        var userAgent = request.Headers["User-Agent"].ToString();
        return mobileHint == "?1"
            || userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPod", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("Mobile", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("PWA", StringComparison.OrdinalIgnoreCase);
    }

    public static TimeSpan GetLifetime(HttpRequest request) =>
        GetLifetime(IsMobileClient(request));

    public static TimeSpan GetLifetime(bool isMobile) =>
        SessionLifetimeHelper.GetLifetime(isMobile);
}

