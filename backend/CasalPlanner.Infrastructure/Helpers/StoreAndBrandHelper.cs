namespace CasalPlanner.Infrastructure.Helpers;

public static class StoreAndBrandHelper
{
    private static readonly HashSet<string> TrustedDomains = new(StringComparer.OrdinalIgnoreCase)
    {
        "magazine luiza", "magalu", "americanas", "mercado livre", "amazon",
        "casas bahia", "ponto frio", "extra", "submarino", "shoptime",
        "kabum", "pichau", "terabyte", "dell", "lenovo", "acer", "samsung",
        "lg", "apple", "xiaomi", "motorola", "nokia", "sony", "philips",
        "hp", "asus", "positivo", "iplace", "fast shop", "fastshop",
        "carrefour", "leroy merlin", "tok stok", "etna", "riachuelo",
        "renner", "havan", "centauro", "netshoes", "dafiti", "marisa",
        "natura", "boticario", "epocacosmeticos", "beleza na web",
        "multilaser", "multiloja", "eletrosom", "novo mundo",
        "colombo", "ricardo eletro", "loja do mecanico", "ferramentas kennedy"
    };

    private static readonly Dictionary<string, string> StoreDomainMap = new(StringComparer.OrdinalIgnoreCase)
    {
        { "magazine luiza", "magazineluiza.com.br" },
        { "magalu", "magazineluiza.com.br" },
        { "americanas", "americanas.com.br" },
        { "mercado livre", "mercadolivre.com.br" },
        { "amazon", "amazon.com.br" },
        { "casas bahia", "casasbahia.com.br" },
        { "ponto frio", "pontofrio.com.br" },
        { "ponto", "pontofrio.com.br" },
        { "extra", "extra.com.br" },
        { "submarino", "submarino.com.br" },
        { "shoptime", "shoptime.com.br" },
        { "kabum", "kabum.com.br" },
        { "pichau", "pichau.com.br" },
        { "terabyte", "terabyteshop.com.br" },
        { "shopee", "shopee.com.br" },
        { "aliexpress", "aliexpress.com" },
        { "ebay", "ebay.com" },
        { "dell", "dell.com" },
        { "lenovo", "lenovo.com" },
        { "samsung", "samsung.com.br" },
        { "apple", "apple.com/br" },
        { "lg", "lge.com" },
        { "fast shop", "fastshop.com.br" },
        { "fastshop", "fastshop.com.br" },
        { "carrefour", "carrefour.com.br" },
        { "leroy merlin", "leroymerlin.com.br" },
        { "tok stok", "tokstok.com.br" },
        { "centauro", "centauro.com.br" },
        { "netshoes", "netshoes.com.br" },
        { "dafiti", "dafiti.com.br" },
        { "iplace", "iplace.com.br" },
        { "novo mundo", "novomundo.com.br" },
        { "colombo", "colombo.com.br" },
    };

    private static readonly HashSet<string> MarketplaceDomains = new(StringComparer.OrdinalIgnoreCase)
    {
        "olx", "enjoei", "shopee", "aliexpress", "ebay",
        "etsy", "facebook", "marketplace", "trocafone", "bne store",
        "wireless source", "taqi", "br celulares", "elo7"
    };

    private static readonly HashSet<string> UsedProductKeywords = new(StringComparer.OrdinalIgnoreCase)
    {
        "usado", "semi-novo", "semi novo", "seminovo", "recondicionado",
        "refurbished", "open box", "como novo", "bom estado", "excelente estado",
        "segunda mão", "segunda mao", "c/ avaria", "avariado"
    };

    private static readonly Dictionary<string, string> BrandDomainMap = new(StringComparer.OrdinalIgnoreCase)
    {
        { "apple", "apple.com" }, { "samsung", "samsung.com" }, { "lg", "lg.com" }, { "xiaomi", "mi.com" },
        { "motorola", "motorola.com" }, { "nokia", "nokia.com" }, { "sony", "sony.com" }, { "philips", "philips.com" },
        { "dell", "dell.com" }, { "hp", "hp.com" }, { "lenovo", "lenovo.com" }, { "acer", "acer.com" },
        { "asus", "asus.com" }, { "positivo", "positivotecnologia.com.br" }, { "multilaser", "multilaser.com.br" },
        { "braun", "braun.com" }, { "bosch", "bosch.com" }, { "electrolux", "electrolux.com.br" },
        { "tramontina", "tramontina.com.br" }, { "mondial", "emondial.com.br" }, { "cadence", "cadence.com.br" },
        { "panasonic", "panasonic.com" }, { "jbl", "jbl.com.br" }, { "bose", "bose.com" }, { "logitech", "logitech.com" },
        { "razer", "razer.com" }, { "hyperx", "hyperxgaming.com" }, { "corsair", "corsair.com" }, { "intel", "intel.com" },
        { "amd", "amd.com" }, { "nvidia", "nvidia.com" }, { "wd", "westerndigital.com" }, { "seagate", "seagate.com" },
        { "kingston", "kingston.com" }, { "brastemp", "brastemp.com.br" }, { "consul", "consul.com.br" },
        { "arno", "arno.com.br" }, { "philco", "philco.com.br" }, { "britânia", "britania.com.br" },
        { "oster", "oster.com.br" }, { "midea", "midea.com/br" }, { "tcl", "tcl.com/br" }, { "aoc", "aoc.com/br" },
        { "walita", "walita.com.br" }, { "black+decker", "blackanddecker.com.br" }, { "fischer", "fischer.com.br" },
        { "suggar", "suggar.com.br" }, { "mueller", "mueller.ind.br" }, { "dako", "dako.com.br" },
        { "atlas", "atlas.ind.br" }, { "gree", "gree.com.br" }, { "daikin", "daikin.com.br" },
        { "elgin", "elgin.com.br" }, { "wap", "wap.ind.br" }, { "kitchenaid", "kitchenaid.com.br" },
        { "mallory", "mallory.com.br" }
    };

    public static string GetStoreLogo(string storeName, string productLink)
    {
        var storeKey = StoreDomainMap.Keys
            .FirstOrDefault(k => storeName.Contains(k, StringComparison.OrdinalIgnoreCase));

        if (storeKey != null)
            return $"https://www.google.com/s2/favicons?sz=32&domain={StoreDomainMap[storeKey]}";

        try
        {
            var uri = new Uri(productLink);
            return $"https://www.google.com/s2/favicons?sz=32&domain={uri.Host}";
        }
        catch
        {
            return "";
        }
    }

    public static string GetBrandLogo(string brandName)
    {
        if (string.IsNullOrWhiteSpace(brandName)) return "";
        
        var brandKey = BrandDomainMap.Keys
            .FirstOrDefault(k => brandName.Contains(k, StringComparison.OrdinalIgnoreCase));

        if (brandKey != null)
            return $"https://www.google.com/s2/favicons?sz=32&domain={BrandDomainMap[brandKey]}";

        return "";
    }

    public static string NormalizarNomeLoja(string storeName)
    {
        if (string.IsNullOrEmpty(storeName)) return storeName;
        var lower = storeName.ToLowerInvariant();
        if (lower.Contains("magazine luiza") || lower.Contains("magalu")) return "Magazine Luiza";
        if (lower.Contains("mercado livre")) return "Mercado Livre";
        if (lower.Contains("casas bahia")) return "Casas Bahia";
        if (lower.Contains("ponto frio") || lower.Contains("ponto:")) return "Ponto Frio";
        if (lower.Contains("fast shop") || lower.Contains("fastshop")) return "Fast Shop";
        if (lower.Contains("leroy merlin")) return "Leroy Merlin";
        if (lower.Contains("tok stok") || lower.Contains("tok&stok")) return "Tok&Stok";
        if (lower.Contains("americanas")) return "Americanas";
        if (lower.Contains("amazon")) return "Amazon";
        if (lower.Contains("kabum")) return "KaBuM!";
        if (lower.Contains("pichau")) return "Pichau";
        if (lower.Contains("shopee")) return "Shopee";
        return storeName;
    }

    public static bool IsTrustedStore(string storeName)
    {
        if (string.IsNullOrEmpty(storeName)) return false;
        var lower = storeName.ToLowerInvariant();
        return TrustedDomains.Any(d => lower.Contains(d.ToLowerInvariant()));
    }

    public static bool IsMarketplaceStore(string storeName, string productTitle, bool isUsed)
    {
        if (string.IsNullOrEmpty(storeName)) return false;
        if (isUsed) return true;

        var storeLower = storeName.ToLowerInvariant();
        var titleLower = (productTitle ?? "").ToLowerInvariant();

        if (MarketplaceDomains.Any(m => storeLower.Contains(m.ToLowerInvariant())))
            return true;

        if (UsedProductKeywords.Any(k => titleLower.Contains(k.ToLowerInvariant())))
            return true;

        return false;
    }

    public static bool IsUsedProduct(string productTitle)
    {
        if (string.IsNullOrEmpty(productTitle)) return false;
        var lower = productTitle.ToLowerInvariant();
        return UsedProductKeywords.Any(k => lower.Contains(k.ToLowerInvariant()));
    }

    public static string ExtractBrandFallback(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";

        var words = text.Split(new[] { ' ', '-', '_', '/' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in words)
        {
            foreach (var marca in BrandDomainMap.Keys)
            {
                if (word.Equals(marca, StringComparison.OrdinalIgnoreCase))
                    return marca;
            }
        }

        foreach (var marca in BrandDomainMap.Keys)
        {
            if (text.Contains(marca, StringComparison.OrdinalIgnoreCase))
                return marca;
        }

        return "";
    }
}
