export interface ProdutoBarcodeInfo {
  codigo: string;
  nome: string;
  marca?: string;
  fotoUrl?: string;
  categoriaSugerida?: string;
  detalhes?: string;
}

/**
 * Consulta APIs públicas gratuitas (Open Food Facts e fallbacks) para obter informações
 * de produtos pelo código de barras físico (EAN-13, EAN-8, UPC).
 */
export async function consultarCodigoBarras(codigo: string): Promise<ProdutoBarcodeInfo | null> {
  const code = codigo.trim();
  if (!code) return null;

  try {
    // 1. Open Food Facts API (gratuita, sem chave, ótima para alimentos, bebidas e itens domésticos)
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "CasalPlanner/1.0 (casalplanner.vercel.app)",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const nome =
          p.product_name_pt ||
          p.product_name ||
          p.product_name_en ||
          p.generic_name_pt ||
          p.generic_name ||
          "";

        if (nome.trim()) {
          const marca = p.brands?.split(",")?.[0]?.trim() || undefined;
          const fotoUrl =
            p.image_front_url ||
            p.image_url ||
            p.image_front_small_url ||
            undefined;

          return {
            codigo: code,
            nome: nome.trim(),
            marca,
            fotoUrl,
            categoriaSugerida: mapearCategoria(p.categories || ""),
            detalhes: p.quantity ? `Embalagem: ${p.quantity}` : undefined,
          };
        }
      }
    }
  } catch (error) {
    console.warn("Falha ao consultar Open Food Facts:", error);
  }

  // Fallback genérico caso a API não tenha o cadastro do produto
  return {
    codigo: code,
    nome: `Produto EAN ${code}`,
  };
}

function mapearCategoria(categoriasTexto: string): string | undefined {
  const c = categoriasTexto.toLowerCase();
  if (c.includes("limpeza") || c.includes("detergent") || c.includes("laundry") || c.includes("lavanderia")) {
    return "Lavanderia";
  }
  if (c.includes("higiene") || c.includes("soap") || c.includes("shampoo") || c.includes("bath") || c.includes("banheiro")) {
    return "Banheiro";
  }
  if (c.includes("food") || c.includes("aliment") || c.includes("cozinha") || c.includes("snack") || c.includes("beverage")) {
    return "Cozinha";
  }
  return undefined;
}
