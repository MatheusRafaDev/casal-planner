using System.Text.RegularExpressions;

namespace CasalPlanner.Infrastructure.Helpers;

public static class PriceTextHelper
{
    public static decimal ExtractPrice(string priceStr)
    {
        if (string.IsNullOrWhiteSpace(priceStr)) return 0;

        // Remove tudo exceto dígitos, ponto e vírgula
        var cleaned = Regex.Replace(priceStr, @"[^\d,.]", "");
        if (string.IsNullOrEmpty(cleaned)) return 0;

        // Formato BR: 1.234,56 → 1234.56
        if (cleaned.Contains(",") && cleaned.LastIndexOf(",") > cleaned.LastIndexOf("."))
        {
            cleaned = cleaned.Replace(".", "").Replace(",", ".");
        }
        // Apenas vírgula como decimal: 1234,56
        else if (cleaned.Contains(",") && !cleaned.Contains("."))
        {
            cleaned = cleaned.Replace(",", ".");
        }

        if (decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var price))
        {
            return price;
        }

        return 0;
    }

    public static string NormalizeSearchQuery(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return string.Empty;

        var normalized = query.ToLowerInvariant();
        normalized = RemoveAccents(normalized);
        normalized = Regex.Replace(normalized, @"\s+", " ").Trim();
        return normalized;
    }

    private static string RemoveAccents(string text)
    {
        var normalizedString = text.Normalize(System.Text.NormalizationForm.FormD);
        var stringBuilder = new System.Text.StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC);
    }
    
    public static decimal CalculateSimilarity(string source, string target)
    {
        if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target)) return 0;
        if (source == target) return 100;

        int stepsToSame = LevenshteinDistance(source, target);
        return (1.0m - ((decimal)stepsToSame / (decimal)Math.Max(source.Length, target.Length))) * 100;
    }

    private static int LevenshteinDistance(string source, string target)
    {
        if (string.IsNullOrEmpty(source))
        {
            if (string.IsNullOrEmpty(target)) return 0;
            return target.Length;
        }
        if (string.IsNullOrEmpty(target)) return source.Length;

        int n = source.Length;
        int m = target.Length;
        int[,] d = new int[n + 1, m + 1];

        for (int i = 0; i <= n; d[i, 0] = i++) { }
        for (int j = 0; j <= m; d[0, j] = j++) { }

        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j <= m; j++)
            {
                int cost = (target[j - 1] == source[i - 1]) ? 0 : 1;
                d[i, j] = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);
            }
        }

        return d[n, m];
    }
}
