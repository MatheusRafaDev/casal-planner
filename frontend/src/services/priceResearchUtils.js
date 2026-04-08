// services/priceResearchUtils.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ─── IA para identificar marca ──────────────────────────────────────────────

export async function identificarMarcaComIA(nomeProduto) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em identificar MARCAS de produtos.
          
Regras:
1. Analise o nome do produto e identifique a MARCA (fabricante)
2. Se não encontrar marca clara, retorne marca vazia
3. Retorne SOMENTE JSON: {"marca": "nome da marca"}

Exemplos:
"Smart TV 55 Samsung QLED 4K" → {"marca": "Samsung"}
"Geladeira Electrolux Frost Free 443L" → {"marca": "Electrolux"}
"iPhone 15 Pro Max Apple" → {"marca": "Apple"}`,
        },
        {
          role: 'user',
          content: `Produto: "${nomeProduto}"`,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return result.marca || '';
  } catch (error) {
    console.error('Erro na IA:', error);
    return '';
  }
}

// ─── IA para limpar nome do produto ──────────────────────────────────────────

export async function limparNomeProdutoComIA(nomeCompleto, marcaDetectada) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em limpar nomes de produtos para e-commerce.

REGRAS IMPORTANTES:
1. Mantenha informações ESSENCIAIS: polegadas (55", 65"), resolução (4K, UHD, Full HD), tecnologia (QLED, OLED, LED), capacidade (128GB, 443L), voltagem (110V, 220V), frequência (60Hz, 120Hz), cor, modelo básico
2. REMOVA: códigos de modelo complexos (UN55U8600FGXZD, 55CU7700), sistemas operacionais (Tizen, WebOS), acessórios (+ Controle X, + Cabo), palavras redundantes (original, oficial, lacrado)
3. Mantenha a marca apenas se não foi fornecida separadamente
4. Retorne SOMENTE JSON: {"nomeLimpo": "nome limpo do produto"}

EXEMPLOS:
"Smart TV 55 4K Crystal UHD UN55U8600FGXZD - Tizen + Controle X Samsung" → {"nomeLimpo": "Smart TV 55 4K Crystal UHD"}
"Smart TV 55 UHD 4K Samsung 55CU7700 + Antena Digital" → {"nomeLimpo": "Smart TV 55 UHD 4K"}
"Geladeira Frost Free Electrolux 443L Inox com Prateleiras" → {"nomeLimpo": "Geladeira Frost Free 443L Inox"}
"iPhone 15 Pro Max Apple 256GB Azul + Carregador" → {"nomeLimpo": "iPhone 15 Pro Max 256GB Azul"}`,
        },
        {
          role: 'user',
          content: `Produto: "${nomeCompleto}"${marcaDetectada ? `\nMarca identificada: ${marcaDetectada} (remova do nome se presente)` : ''}`,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return result.nomeLimpo || nomeCompleto;
  } catch (error) {
    console.error('Erro na IA ao limpar nome:', error);
    // Fallback para limpeza básica
    return limparNomeProdutoBasico(nomeCompleto, marcaDetectada);
  }
}

// ─── IA para extrair especificações ──────────────────────────────────────────

export async function extrairEspecificacoesIA(nomeProduto) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em extrair especificações técnicas de produtos.

Extraia do nome do produto:
- polegadas (tamanho de tela)
- resolucao (4K, Full HD, etc.)
- tecnologia (QLED, OLED, LED, etc.)
- capacidade (GB, TB, L, etc.)
- voltagem (110V, 220V, bivolt)
- frequencia (Hz)
- cor

Retorne SOMENTE JSON com os campos encontrados (se não encontrar, retorne null):
{
  "polegadas": "55" ou null,
  "resolucao": "4K" ou null,
  "tecnologia": "QLED" ou null,
  "capacidade": "256GB" ou null,
  "voltagem": "110V" ou null,
  "frequencia": "60Hz" ou null,
  "cor": "Preto" ou null
}`,
        },
        {
          role: 'user',
          content: `Produto: "${nomeProduto}"`,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return result;
  } catch (error) {
    console.error('Erro na IA ao extrair especificações:', error);
    return {};
  }
}

// ─── Funções de fallback (sem IA) ───────────────────────────────────────────

export function formatarMarca(marca) {
  if (!marca) return '';
  const marcasMaiusculas = ['LG', 'HP', 'DELL', 'ACER', 'ASUS', 'IBM', '3M'];
  if (marcasMaiusculas.includes(marca.toUpperCase())) {
    return marca.toUpperCase();
  }
  return marca.charAt(0).toUpperCase() + marca.slice(1).toLowerCase();
}

// Função de fallback para limpar nome sem IA
function limparNomeProdutoBasico(nomeCompleto, marcaDetectada) {
  let nomeLimpo = nomeCompleto;
  
  // Remove a marca
  if (marcaDetectada && marcaDetectada.length > 0) {
    const regex = new RegExp(`\\b${marcaDetectada}\\b`, 'gi');
    nomeLimpo = nomeLimpo.replace(regex, '').trim();
  }
  
  // Remove códigos de modelo (ex: UN55U8600FGXZD, 55CU7700)
  nomeLimpo = nomeLimpo.replace(/\b[A-Z]{2,}[0-9]{2,}[A-Z0-9]+\b/g, '');
  nomeLimpo = nomeLimpo.replace(/\b[A-Z]{2,}[0-9]{3,}\b/g, '');
  
  // Remove sistemas operacionais
  const sistemas = ['\\bTizen\\b', '\\bWebOS\\b', '\\bAndroid TV\\b', '\\bGoogle TV\\b', '\\bRoku TV\\b'];
  sistemas.forEach(sistema => {
    const regex = new RegExp(sistema, 'gi');
    nomeLimpo = nomeLimpo.replace(regex, '').trim();
  });
  
  // Remove acessórios
  const acessorios = ['\\+ Controle\\b', '\\+ Cabo\\b', '\\+ Suporte\\b', 'com controle', 'inclui'];
  acessorios.forEach(acessorio => {
    const regex = new RegExp(acessorio, 'gi');
    nomeLimpo = nomeLimpo.replace(regex, '').trim();
  });
  
  // Remove palavras redundantes
  const redundantes = ['original', 'oficial', 'lacrado', 'nota fiscal', 'com garantia'];
  redundantes.forEach(palavra => {
    const regex = new RegExp(`\\b${palavra}\\b`, 'gi');
    nomeLimpo = nomeLimpo.replace(regex, '').trim();
  });
  
  // Limpa espaços e caracteres especiais
  nomeLimpo = nomeLimpo.replace(/\s+/g, ' ');
  nomeLimpo = nomeLimpo.replace(/\s*[-–—]\s*/g, ' ');
  nomeLimpo = nomeLimpo.trim();
  
  // Se ficou muito curto, retorna original sem os códigos
  if (nomeLimpo.length < 5) {
    const palavras = nomeCompleto.split(' ');
    const palavrasFiltradas = palavras.filter(p => 
      !p.match(/\b[A-Z]{2,}[0-9]{2,}/) && 
      !sistemas.some(s => new RegExp(s, 'i').test(p)) &&
      p.length > 2
    ).slice(0, 6);
    return palavrasFiltradas.join(' ');
  }
  
  return nomeLimpo;
}

// ─── Função para extrair preço ──────────────────────────────────────────────

export function extrairPreco(priceValue) {
  if (!priceValue) return 0;
  
  try {
    if (typeof priceValue === 'number') return priceValue;
    
    let priceStr = String(priceValue);
    priceStr = priceStr.replace(/[^\d,.]/g, '');
    
    if (priceStr.includes(',') && priceStr.includes('.')) {
      priceStr = priceStr.replace(/\./g, '');
      priceStr = priceStr.replace(',', '.');
    } else if (priceStr.includes(',')) {
      priceStr = priceStr.replace(',', '.');
    }
    
    const preco = parseFloat(priceStr);
    return isNaN(preco) ? 0 : preco;
  } catch (error) {
    console.error('Erro ao extrair preço:', priceValue, error);
    return 0;
  }
}

// ─── Função para processar produtos da API ──────────────────────────────────

export function processarProdutosAPI(shoppingResults, sitesMenorPrioridade = []) {
  const todosResultados = (shoppingResults ?? [])
    .filter((r) => r.price !== undefined && r.price !== null)
    .map((r, index) => ({
      id: r.position || index,
      nome: r.title || 'Sem nome',
      loja: r.source || 'Loja desconhecida',
      preco: extrairPreco(r.price),
      link: r.product_link || r.link,
      imagem: r.thumbnail,
      rating: r.rating,
      reviews: r.reviews,
      delivery: r.delivery,
      isTrusted: r.is_trusted || false,
      isLowPriority: sitesMenorPrioridade.some(site => 
        r.source?.toLowerCase().includes(site)
      )
    }))
    .filter((r) => r.preco > 0 && r.nome !== 'Sem nome');

  if (todosResultados.length === 0) return [];

  // Ordenar resultados
  const resultadosOrdenados = todosResultados.sort((a, b) => {
    if (a.isTrusted && !b.isTrusted) return -1;
    if (!a.isTrusted && b.isTrusted) return 1;
    if (a.isLowPriority && !b.isLowPriority) return 1;
    if (!a.isLowPriority && b.isLowPriority) return -1;
    return a.preco - b.preco;
  });
  
  return resultadosOrdenados.slice(0, 10);
}

// ─── Função para extrair marca sem IA (fallback) ────────────────────────────

export function extrairMarcaBasica(nomeProduto) {
  const palavras = nomeProduto.split(' ');
  const marcasConhecidas = ['Samsung', 'LG', 'Apple', 'Electrolux', 'Dell', 'HP', 'Acer', 'Asus', 'Sony', 'Philips', 'Panasonic', 'Brastemp', 'Consul', 'Xiaomi', 'Motorola', 'Nokia'];
  
  // Procura por marcas conhecidas
  for (const marca of marcasConhecidas) {
    if (nomeProduto.toLowerCase().includes(marca.toLowerCase())) {
      return marca;
    }
  }
  
  // Se não encontrar, pega primeira palavra com letra maiúscula
  const possivelMarca = palavras.find(p => p.length > 2 && p[0] === p[0].toUpperCase());
  return possivelMarca || '';
}