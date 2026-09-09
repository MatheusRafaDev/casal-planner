using System;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        TestParse("111.29");
        TestParse("111,29");
        TestParse("11.129,00");
        TestParse("1.234.567,89");
        TestParse("11129");
        TestParse("11129.00");
        TestParse("11129,00");
    }

    static void TestParse(string priceStr) {
        var cleaned = Regex.Replace(priceStr, @"[^\d,.]", "");
        
        if (cleaned.Contains(",") && cleaned.LastIndexOf(",") > cleaned.LastIndexOf("."))
        {
            cleaned = cleaned.Replace(".", "").Replace(",", ".");
        }
        else if (cleaned.Contains(",") && !cleaned.Contains("."))
        {
            cleaned = cleaned.Replace(",", ".");
        }

        Console.WriteLine($"{priceStr} -> {cleaned} -> {(decimal.TryParse(cleaned, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var price) ? price : 0)}");
    }
}
