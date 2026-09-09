using System;
using System.Text.RegularExpressions;
class Program {
    static void Main() {
        string priceStr = "111.29";
        var cleaned = Regex.Replace(priceStr, @"[^\d,.]", "");
        if (cleaned.Contains(",") && cleaned.LastIndexOf(",") > cleaned.LastIndexOf("."))
        {
            cleaned = cleaned.Replace(".", "").Replace(",", ".");
        }
        else if (cleaned.Contains(",") && !cleaned.Contains("."))
        {
            cleaned = cleaned.Replace(",", ".");
        }
        Console.WriteLine(cleaned);
    }
}
