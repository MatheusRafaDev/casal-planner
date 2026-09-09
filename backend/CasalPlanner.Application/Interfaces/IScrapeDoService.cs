namespace CasalPlanner.Application.Interfaces;

public interface IScrapeDoService
{
    Task<string?> GetDirectStoreLinkAsync(string productName, string storeName, string fallbackUrl);
}
