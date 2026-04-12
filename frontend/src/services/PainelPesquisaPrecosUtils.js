
const LOW_PRIORITY_SITES = ['enjoei', 'olx', 'shopee', 'aliexpress', 'mercadolivre'];




// ─── Extrair preço de string ou número ────────────────────────────────────
function extrairPreco(priceValue) {
  if (!priceValue) return 0;
  if (typeof priceValue === 'number') return priceValue;
  
  const priceStr = String(priceValue).replace(/[^\d,.]/g, '');
  const normalized = priceStr.includes(',') ? priceStr.replace('.', '').replace(',', '.') : priceStr;
  const preco = parseFloat(normalized);
  
  return isNaN(preco) ? 0 : preco;
}

// ─── Processar resultados da API ──────────────────────────────────────────
export function processarProdutosAPI(shoppingResults) {

  const produtos = (shoppingResults ?? [])
    .filter(r => r.price != null)
    .map((r, idx) => ({
      id: r.position || idx,
      nome: r.title || 'Sem nome',
      loja: r.source || 'Desconhecida',
      preco: extrairPreco(r.price),
      link: r.product_link || r.link,
      imagem: r.thumbnail,
      isTrusted: r.is_trusted || false,
      isLowPriority: LOW_PRIORITY_SITES.some(site => 
        r.source?.toLowerCase().includes(site)
      )
    }))
    .filter(r => r.preco > 0 && r.nome !== 'Sem nome')
    .sort((a, b) => {
      if (a.isTrusted !== b.isTrusted) return a.isTrusted ? -1 : 1;
      if (a.isLowPriority !== b.isLowPriority) return a.isLowPriority ? 1 : -1;
      return a.preco - b.preco;
    });

  return produtos.slice(0, 10);
}
