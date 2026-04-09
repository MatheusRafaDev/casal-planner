// services/priceResearchUtils.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const LOW_PRIORITY_SITES = ['enjoei', 'olx', 'shopee', 'aliexpress', 'mercadolivre'];

// ─── PRINCIPAL: Validação cruzada entre produto e busca ───────────────────
export async function validarEFormatarProdutoComIA(produtoSelecionado, textoUsuario = '') {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.15,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Valide o produto cruzando com a busca do usuário. Priorize o produto. Remova códigos e sistemas.
          Retorne JSON: {"nomeValidado": "", "marca": "", "conflitos": [], "confianca": "alta/media/baixa"}`,
        },
        {
          role: 'user',
          content: `Produto: "${produtoSelecionado}"\n${textoUsuario ? `Busca: "${textoUsuario}"` : ''}`,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      nomeValidado: result.nomeValidado || produtoSelecionado,
      marca: result.marca || '',
      conflitos: result.conflitos || [],
      confianca: result.confianca || 'media',
    };
  } catch (error) {
    console.error('Erro na validação:', error);
    return {
      nomeValidado: produtoSelecionado,
      marca: extrairMarcaBasica(produtoSelecionado),
      conflitos: [],
      confianca: 'baixa',
    };
  }
}

// ─── Extrair marca básica (fallback rápido) ───────────────────────────────
export function extrairMarcaBasica(nomeProduto) {
  const marcas = ['Samsung', 'LG', 'Apple', 'Sony', 'Philips', 'Panasonic', 
                  'Brastemp', 'Consul', 'Electrolux', 'Dell', 'HP', 'Xiaomi'];
  
  const encontrada = marcas.find(marca => 
    nomeProduto.toLowerCase().includes(marca.toLowerCase())
  );
  
  return encontrada || '';
}

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
