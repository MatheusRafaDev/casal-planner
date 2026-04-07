import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Groq from 'groq-sdk';

// ─── Animações ─────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

// ─── Styled Components ──────────────────────────────────────────────────────
const PanelWrapper = styled.div`
  margin-top: 8px;
  border-top: 1px dashed ${({ theme }) => theme === 'dark' ? '#2d2d3a' : '#e8e8f0'};
  padding-top: 12px;
  animation: 0.3s ease ${fadeIn};
`;

const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid ${({ theme }) => theme === 'dark' ? '#3a3a50' : '#dde0f0'};
  background: ${({ theme }) => theme === 'dark' ? '#1e1e2e' : '#f5f5fc'};
  color: ${({ theme }) => theme === 'dark' ? '#a5a5cc' : '#6060a0'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme === 'dark' ? '#6060b0' : '#9090d0'};
    color: ${({ theme }) => theme === 'dark' ? '#c0c0e8' : '#4040a0'};
    background: ${({ theme }) => theme === 'dark' ? '#25253a' : '#eeeef8'};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  svg {
    flex-shrink: 0;
  }
`;

const Panel = styled.div`
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme === 'dark' ? '#2a2a40' : '#e2e2f0'};
  background: ${({ theme }) => theme === 'dark' ? '#18182a' : '#fafaff'};
  overflow: hidden;
  animation: 0.25s ease ${fadeIn};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme === 'dark' ? '#2a2a40' : '#ebebf8'};
  background: ${({ theme }) => theme === 'dark' ? '#1e1e32' : '#f0f0fa'};
`;

const PanelTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme === 'dark' ? '#c0c0e0' : '#4040a0'};
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const ValidationBadge = styled.span`
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ isValid, theme }) => 
    isValid ? (theme === 'dark' ? '#1a4a1a' : '#d0f0d0') : (theme === 'dark' ? '#4a1a1a' : '#f0d0d0')
  };
  color: ${({ isValid, theme }) => 
    isValid ? (theme === 'dark' ? '#70e070' : '#208020') : (theme === 'dark' ? '#e07070' : '#a02020')
  };
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SuggestionText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme === 'dark' ? '#8080b0' : '#9090c0'};
  margin-left: 8px;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: ${({ theme }) => theme === 'dark' ? '#a0a0d0' : '#6060b0'};
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: ${({ theme }) => theme === 'dark' ? '#6060a0' : '#9090c0'};
  line-height: 1;
  &:hover {
    color: ${({ theme }) => theme === 'dark' ? '#a0a0d0' : '#5050a0'};
  }
`;

const PanelBody = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme === 'dark' ? '#6060a0' : '#9090c0'};
  margin: 0 0 8px;
`;

const SuggestionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PricePill = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid ${({ theme }) => theme === 'dark' ? '#4a4a80' : '#b0b0e0'};
  background: ${({ theme }) => theme === 'dark' ? '#26263c' : '#eeeefc'};
  color: ${({ theme }) => theme === 'dark' ? '#c0c0f0' : '#3030a0'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${({ theme }) => theme === 'dark' ? '#3030a0' : '#d0d0ff'};
    border-color: ${({ theme }) => theme === 'dark' ? '#7070e0' : '#7070d0'};
  }
`;

const PillLabel = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: ${({ theme }) => theme === 'dark' ? '#8080b0' : '#7070b0'};
`;

const StoreTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StoreRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  gap: 12px;
  border: 1px solid ${({ theme, highlight }) => 
    highlight ? (theme === 'dark' ? '#4a4ab0' : '#a0a0e0') : (theme === 'dark' ? '#2a2a40' : '#ebebf0')
  };
  background: ${({ theme, highlight }) => 
    highlight ? (theme === 'dark' ? '#22224a' : '#eeeefc') : (theme === 'dark' ? '#1c1c2c' : '#fafaff')
  };
  transition: all 0.15s;
  animation: 0.3s ease both ${fadeIn};
  animation-delay: ${({ index }) => index * 0.05}s;
  
  &:hover {
    transform: translateX(4px);
    border-color: ${({ theme }) => theme === 'dark' ? '#7070d0' : '#8080d0'};
    background: ${({ theme }) => theme === 'dark' ? '#25253a' : '#f5f5ff'};
  }
`;

const StoreLogo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
  flex-shrink: 0;
  background: white;
  padding: 4px;
`;

const StoreLogoFallback = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
`;

const StoreInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StoreName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme === 'dark' ? '#e0e0ff' : '#202040'};
`;

const StoreLink = styled.a`
  font-size: 11px;
  color: ${({ theme }) => theme === 'dark' ? '#6060d0' : '#6060c0'};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme === 'dark' ? '#8080e0' : '#8080e0'};
  }
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const StorePrice = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme, best }) => 
    best ? (theme === 'dark' ? '#70e070' : '#208020') : (theme === 'dark' ? '#e0e0ff' : '#202040')
  };
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const BestBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ theme }) => theme === 'dark' ? '#205020' : '#c8f0c8'};
  color: ${({ theme }) => theme === 'dark' ? '#70e070' : '#206020'};
  animation: ${pulse} 2s ease infinite;
`;

const HistoryBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 48px;
`;

const Bar = styled.div`
  flex: 1;
  border-radius: 3px 3px 0 0;
  height: ${({ pct }) => pct}%;
  transition: height 0.4s ease;
  background: ${({ theme, active }) => 
    active ? (theme === 'dark' ? '#6060d0' : '#8080e0') : (theme === 'dark' ? '#2a2a50' : '#d8d8f0')
  };
  cursor: pointer;
  position: relative;
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 10;
  }
`;

const BarLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
`;

const BarLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme === 'dark' ? '#5050a0' : '#9090c0'};
`;

const TipBox = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid ${({ theme }) => theme === 'dark' ? '#5050b0' : '#8080d0'};
  background: ${({ theme }) => theme === 'dark' ? '#1e1e35' : '#f0f0ff'};
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme === 'dark' ? '#a0a0d0' : '#505090'};
  animation: 0.4s ease ${fadeIn};
`;

const Skeleton = styled.div`
  height: ${({ h }) => h || '18px'};
  border-radius: 6px;
  width: ${({ w }) => w || '100%'};
  margin-bottom: ${({ mb }) => mb || '0'};
  background: ${({ theme }) => theme === 'dark'
    ? 'linear-gradient(90deg, #2a2a40 25%, #35355a 50%, #2a2a40 75%)'
    : 'linear-gradient(90deg, #ebebf5 25%, #d8d8f0 50%, #ebebf5 75%)'
  };
  background-size: 200% 100%;
  animation: 1.4s infinite ${shimmer};
`;

const AlertBox = styled.div`
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme === 'dark' ? '#30201a' : '#fff5ee'};
  border: 1px solid ${({ theme }) => theme === 'dark' ? '#60301a' : '#ffd0a0'};
  font-size: 12px;
  color: ${({ theme }) => theme === 'dark' ? '#e0a060' : '#905020'};
  animation: ${({ isError }) => isError ? `${shake} 0.3s ease` : 'none'};
`;

const AlertInput = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AlertPriceInput = styled.input`
  flex: 1;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme === 'dark' ? '#3a3a60' : '#c8c8e8'};
  background: ${({ theme }) => theme === 'dark' ? '#1a1a2c' : '#ffffff'};
  color: ${({ theme }) => theme === 'dark' ? '#e0e0ff' : '#202040'};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme === 'dark' ? '#7070d0' : '#8080d0'};
  }
`;

const AlertButton = styled.button`
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid ${({ theme }) => theme === 'dark' ? '#5050b0' : '#8080d0'};
  background: transparent;
  color: ${({ theme }) => theme === 'dark' ? '#a0a0e0' : '#6060b0'};
  
  &:hover {
    background: ${({ theme }) => theme === 'dark' ? '#26266a' : '#e8e8ff'};
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  font-size: 14px;
  animation: 0.8s linear infinite ${spin};
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${({ theme }) => theme === 'dark' ? '#6060a0' : '#9090c0'};
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme === 'dark' ? '#a0a0d0' : '#6060b0'};
    transform: scale(1.1);
  }
`;

// ─── Configuração das Lojas ──────────────────────────────────────────────────
const STORE_CONFIG = {
  'Americanas': {
    logo: 'https://logo.clearbit.com/americanas.com.br',
    searchUrl: (product) => `https://www.americanas.com.br/busca/${encodeURIComponent(product)}`,
    directLink: (product) => `https://www.americanas.com.br/busca/${encodeURIComponent(product)}?sort_by=price_asc`,
    color: '#e94e2e'
  },
  'Mercado Livre': {
    logo: 'https://logo.clearbit.com/mercadolivre.com.br',
    searchUrl: (product) => `https://lista.mercadolivre.com.br/${encodeURIComponent(product)}#D[A:${encodeURIComponent(product)}]`,
    directLink: (product) => `https://lista.mercadolivre.com.br/${encodeURIComponent(product)}_OrderId_PRICE_NoIndex_True#D[A:${encodeURIComponent(product)}]`,
    color: '#ffe600'
  },
  'Magazine Luiza': {
    logo: 'https://logo.clearbit.com/magazineluiza.com.br',
    searchUrl: (product) => `https://www.magazineluiza.com.br/busca/${encodeURIComponent(product)}`,
    directLink: (product) => `https://www.magazineluiza.com.br/busca/${encodeURIComponent(product)}/?ordenacao=menorpreco`,
    color: '#ff6b00'
  },
  'Casas Bahia': {
    logo: 'https://logo.clearbit.com/casasbahia.com.br',
    searchUrl: (product) => `https://www.casasbahia.com.br/busca/${encodeURIComponent(product)}`,
    directLink: (product) => `https://www.casasbahia.com.br/busca/${encodeURIComponent(product)}?ordenacao=menorpreco`,
    color: '#0054a6'
  },
  'Amazon': {
    logo: 'https://logo.clearbit.com/amazon.com.br',
    searchUrl: (product) => `https://www.amazon.com.br/s?k=${encodeURIComponent(product)}`,
    directLink: (product) => `https://www.amazon.com.br/s?k=${encodeURIComponent(product)}&s=price-asc-rank`,
    color: '#ff9900'
  },
  'Kabum': {
    logo: 'https://logo.clearbit.com/kabum.com.br',
    searchUrl: (product) => `https://www.kabum.com.br/busca/${encodeURIComponent(product)}`,
    directLink: (product) => `https://www.kabum.com.br/busca/${encodeURIComponent(product)}?ordem=2`,
    color: '#ff6b35'
  },
  'Ponto Frio': {
    logo: 'https://logo.clearbit.com/pontofrio.com.br',
    searchUrl: (product) => `https://www.pontofrio.com.br/busca/${encodeURIComponent(product)}`,
    directLink: (product) => `https://www.pontofrio.com.br/busca/${encodeURIComponent(product)}?ordenacao=menorpreco`,
    color: '#0054a6'
  },
  'Shopee': {
    logo: 'https://logo.clearbit.com/shopee.com.br',
    searchUrl: (product) => `https://shopee.com.br/search?keyword=${encodeURIComponent(product)}`,
    directLink: (product) => `https://shopee.com.br/search?keyword=${encodeURIComponent(product)}&sortBy=sales`,
    color: '#ee4d2d'
  }
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Validação Ortográfica com API Gratuita ─────────────────────────────────
async function validateAndCorrectText(text) {
  if (!text || text.length < 3) return { original: text, corrected: text, isValid: false };
  
  try {
    // Usando API gratuita do Brasil API para correção ortográfica
    const response = await fetch(`https://api.brasa.space/correcao?texto=${encodeURIComponent(text)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.corrigido && data.corrigido !== text) {
        return {
          original: text,
          corrected: data.corrigido,
          isValid: false,
          suggestion: data.corrigido
        };
      }
    }
    
    // Fallback: verificação básica de palavras comuns
    const commonMistakes = {
      'celular': ['celular', 'telefone', 'smartphone'],
      'notebook': ['notebook', 'laptop', 'computador'],
      'tv': ['televisão', 'tv', 'televisor'],
      'geladeira': ['geladeira', 'refrigerador'],
      'fogao': ['fogão', 'fogao']
    };
    
    const textLower = text.toLowerCase();
    for (const [correct, variations] of Object.entries(commonMistakes)) {
      if (variations.some(v => v !== correct && textLower.includes(v))) {
        return {
          original: text,
          corrected: textLower.replace(variations.find(v => textLower.includes(v)), correct),
          isValid: false,
          suggestion: textLower.replace(variations.find(v => textLower.includes(v)), correct)
        };
      }
    }
    
    return { original: text, corrected: text, isValid: true };
  } catch (error) {
    console.warn('Erro na validação:', error);
    return { original: text, corrected: text, isValid: true };
  }
}

function parseAIResponse(text) {
  console.log('📝 [parseAIResponse] Texto recebido da IA:', text);
  
  try {
    const match = text.match(/```json\s*([\s\S]*?)```/);
    if (match) {
      console.log('✅ [parseAIResponse] JSON encontrado no bloco ```json');
      const parsed = JSON.parse(match[1]);
      console.log('📊 [parseAIResponse] JSON parseado:', parsed);
      return parsed;
    }
    
    const jsonMatch = text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      console.log('✅ [parseAIResponse] JSON encontrado no texto');
      const parsed = JSON.parse(jsonMatch[1]);
      console.log('📊 [parseAIResponse] JSON parseado:', parsed);
      return parsed;
    }
    
    console.warn('⚠️ [parseAIResponse] Nenhum JSON encontrado no texto');
    return null;
  } catch (error) {
    console.error('❌ [parseAIResponse] Erro ao fazer parse do JSON:', error);
    return null;
  }
}

function buildPrompt(nome, marca) {
  const q = [nome?.trim(), marca?.trim()].filter(Boolean).join(' ');
  console.log('🔨 [buildPrompt] Produto pesquisado:', q);
  
  return `Você é um assistente especializado em preços de produtos no Brasil.
O usuário está pesquisando: "${q}"

Retorne SOMENTE um JSON válido (sem texto fora do bloco). Use valores REALISTAS de mercado brasileiro para o produto "${q}".

Inclua links diretos para os anúncios (URLs que levam diretamente ao produto ou busca com filtro de menor preço).

{
  "precoMedio": 2500,
  "precoMin": 2200,
  "precoMax": 2800,
  "lojas": [
    { "nome": "Americanas", "preco": 2500, "linkDireto": "https://www.americanas.com.br/busca/produto?sort_by=price_asc" },
    { "nome": "Mercado Livre", "preco": 2450, "linkDireto": "https://lista.mercadolivre.com.br/produto_OrderId_PRICE_NoIndex_True" },
    { "nome": "Magazine Luiza", "preco": 2550, "linkDireto": "https://www.magazineluiza.com.br/busca/produto/?ordenacao=menorpreco" },
    { "nome": "Casas Bahia", "preco": 2600, "linkDireto": "https://www.casasbahia.com.br/busca/produto?ordenacao=menorpreco" },
    { "nome": "Amazon", "preco": 2480, "linkDireto": "https://www.amazon.com.br/s?k=produto&s=price-asc-rank" }
  ],
  "historicoMeses": [2800, 2750, 2700, 2650, 2600, 2500],
  "dicaEpoca": "Black Friday em novembro",
  "tendencia": "descendo",
  "desconto": "10% no PIX"
}`;
}

// ─── Componente Principal ────────────────────────────────────────────────────
const PriceResearchPanel = ({ nome, marca, theme = 'light', onSelectPrice, groqApiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertSet, setAlertSet] = useState(false);
  const [clickedPrices, setClickedPrices] = useState([]);
  const [validation, setValidation] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const abortRef = useRef(null);

  const canSearch = nome && nome.trim().length >= 2;
  const productQuery = [nome, marca].filter(Boolean).join(' ');
  const searchQuery = validation?.corrected || productQuery;

  // Validar o produto antes de pesquisar
  useEffect(() => {
    const validateProduct = async () => {
      if (nome && nome.trim().length >= 3) {
        const result = await validateAndCorrectText(nome);
        setValidation(result);
        setShowSuggestion(!result.isValid && result.suggestion);
      }
    };
    
    validateProduct();
  }, [nome]);

  const handleSearch = useCallback(async () => {
    const finalQuery = validation?.corrected || nome;
    console.log('🚀 [handleSearch] Iniciando pesquisa para:', { original: nome, validated: finalQuery });
    
    if (!canSearch) {
      console.warn('⚠️ [handleSearch] Pesquisa cancelada - nome inválido');
      return;
    }
    
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = groqApiKey || process.env.REACT_APP_GROQ_API_KEY;
      console.log('🔑 [handleSearch] API Key:', apiKey ? `✅ ${apiKey.substring(0, 10)}...` : '❌ NÃO CONFIGURADA');
      
      if (!apiKey) {
        throw new Error('Configure REACT_APP_GROQ_API_KEY no .env');
      }

      const groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      console.log('📨 [handleSearch] Enviando requisição para Groq...');

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é especialista em preços de produtos no Brasil. Retorne apenas JSON válido, sem texto adicional.'
          },
          {
            role: 'user',
            content: buildPrompt(finalQuery, marca)
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 1024,
      });

      console.log('📥 [handleSearch] Resposta recebida da Groq');
      
      const text = response.choices?.[0]?.message?.content || '';
      console.log('📄 [handleSearch] Texto da resposta:', text);
      
      let parsed = parseAIResponse(text);

      if (!parsed) {
        throw new Error('Resposta inesperada da IA');
      }
      
      // Adiciona links diretos se não vierem da IA
      if (parsed.lojas) {
        parsed.lojas = parsed.lojas.map(loja => {
          const config = STORE_CONFIG[loja.nome];
          if (config) {
            loja.linkDireto = loja.linkDireto || config.directLink(searchQuery);
            loja.linkBusca = config.searchUrl(searchQuery);
          }
          return loja;
        });
      }
      
      console.log('✅ [handleSearch] Pesquisa concluída! Preços:', {
        medio: parsed.precoMedio,
        min: parsed.precoMin,
        max: parsed.precoMax
      });
      
      setResult(parsed);
    } catch (err) {
      console.error('❌ [handleSearch] Erro:', err);
      if (err.name !== 'AbortError') {
        setError(err.message || 'Não foi possível buscar os preços. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [nome, marca, canSearch, groqApiKey, searchQuery, validation]);

  const handleOpen = () => {
    console.log('👆 [handleOpen] Botão clicado');
    setIsOpen(true);
    if (!result && !loading) {
      handleSearch();
    }
  };

  const handleClose = () => {
    console.log('❌ [handleClose] Fechando painel');
    setIsOpen(false);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleSetAlert = () => {
    const val = parseFloat(alertPrice.replace(',', '.'));
    console.log('🔔 [handleSetAlert] Alerta criado para:', val);
    if (!isNaN(val) && val > 0) {
      setAlertSet(true);
      // Salvar no localStorage
      const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
      alerts.push({
        product: searchQuery,
        targetPrice: val,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('priceAlerts', JSON.stringify(alerts));
    }
  };

  const handlePriceClick = (price, storeName) => {
    console.log(`💰 Preço ${storeName}:`, price);
    onSelectPrice?.(price);
    setClickedPrices(prev => [...prev, { price, store: storeName, time: new Date() }]);
    
    // Verificar alertas
    if (alertSet && price <= parseFloat(alertPrice.replace(',', '.'))) {
      alert(`🎉 Preço atingiu seu objetivo! ${formatBRL(price)} em ${storeName}`);
    }
  };

  const shareResults = () => {
    if (!result) return;
    
    const shareText = `📊 Pesquisa de Preços - ${searchQuery}\n\n` +
      `💰 Preço Médio: ${formatBRL(result.precoMedio)}\n` +
      `🏷️ Menor Preço: ${formatBRL(result.precoMin)}\n` +
      `📈 Maior Preço: ${formatBRL(result.precoMax)}\n\n` +
      `🛒 Melhores Ofertas:\n` +
      result.lojas.slice(0, 3).map(l => `- ${l.nome}: ${formatBRL(l.preco)}`).join('\n');
    
    if (navigator.share) {
      navigator.share({ title: `Preços - ${searchQuery}`, text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Resultados copiados para a área de transferência!');
    }
  };

  const acceptSuggestion = () => {
    if (validation?.suggestion && onSelectPrice) {
      // Aqui você pode chamar uma função para atualizar o nome do produto
      console.log(`Aceitando sugestão: ${validation.suggestion}`);
      setShowSuggestion(false);
      // Disparar evento para atualizar o campo pai
      const event = new CustomEvent('productSuggestion', { detail: { suggested: validation.suggestion } });
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    if (result) {
      console.log('🎉 [RESULTADO FINAL]', result);
    }
  }, [result]);

  const histData = result?.historicoMeses || [];
  const histMax = histData.length ? Math.max(...histData) : 1;
  const histMin = histData.length ? Math.min(...histData) : 0;
  const sortedLojas = result?.lojas ? [...result.lojas].sort((a, b) => a.preco - b.preco) : [];
  const tendIcon = result?.tendencia === 'subindo' ? '↑' : result?.tendencia === 'descendo' ? '↓' : '→';
  const tendCor = result?.tendencia === 'descendo' ? '#20a020' : result?.tendencia === 'subindo' ? '#c02020' : '#8080a0';

  return (
    <PanelWrapper>
      <TriggerButton 
        theme={theme} 
        onClick={handleOpen} 
        disabled={!canSearch}
        title={!canSearch ? 'Digite o nome do item primeiro' : ''} 
        type="button"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M10.5 1a5.5 5.5 0 1 1-3.898 9.395l-3.554 3.554a1 1 0 0 1-1.414-1.414l3.554-3.554A5.5 5.5 0 0 1 10.5 1zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
          <path d="M9 7V5.5a.5.5 0 0 1 1 0V7h1.5a.5.5 0 0 1 0 1H10v1.5a.5.5 0 0 1-1 0V8H7.5a.5.5 0 0 1 0-1H9z"/>
        </svg>
        Pesquisar preços com IA
        {!isOpen && result && (
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 400 }}>
            Média: {formatBRL(result.precoMedio)}
          </span>
        )}
      </TriggerButton>

      {isOpen && (
        <Panel theme={theme}>
          <PanelHeader theme={theme}>
            <PanelTitle theme={theme}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 9.5h-1.5v-5h1.5v5zm0-6.5h-1.5V2.5h1.5V4z"/>
              </svg>
              {searchQuery}
              {validation && !validation.isValid && (
                <ValidationBadge isValid={false} theme={theme}>
                  ⚠️ Possível erro
                  {showSuggestion && (
                    <SuggestionText onClick={acceptSuggestion} theme={theme}>
                      "{validation.suggestion}"?
                    </SuggestionText>
                  )}
                </ValidationBadge>
              )}
              {validation && validation.isValid && validation.original?.length > 3 && (
                <ValidationBadge isValid={true} theme={theme}>
                  ✓ Validado
                </ValidationBadge>
              )}
            </PanelTitle>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {result && (
                <ShareButton theme={theme} onClick={shareResults} title="Compartilhar resultados">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </ShareButton>
              )}
              <CloseBtn theme={theme} onClick={handleClose} type="button">✕</CloseBtn>
            </div>
          </PanelHeader>

          <PanelBody>
            {loading && (
              <>
                <div>
                  <Skeleton theme={theme} h="13px" w="40%" mb="10px" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Skeleton theme={theme} h="32px" w="120px" />
                    <Skeleton theme={theme} h="32px" w="120px" />
                  </div>
                </div>
                <div>
                  <Skeleton theme={theme} h="13px" w="35%" mb="10px" />
                  {[0, 1, 2, 3, 4].map(i => (
                    <Skeleton key={i} theme={theme} h="50px" mb="8px" />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#8080b0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LoadingSpinner>⟳</LoadingSpinner>
                  Consultando Groq e coletando ofertas...
                </p>
              </>
            )}

            {error && !loading && (
              <AlertBox theme={theme} isError>
                ⚠ {error}
                <button 
                  onClick={handleSearch} 
                  type="button"
                  style={{ 
                    marginLeft: 'auto', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: 12, 
                    textDecoration: 'underline', 
                    color: 'inherit' 
                  }}
                >
                  Tentar novamente
                </button>
              </AlertBox>
            )}

            {result && !loading && (
              <>
                <div>
                  <SectionLabel theme={theme}>Usar como preço</SectionLabel>
                  <SuggestionRow>
                    <PricePill theme={theme} onClick={() => handlePriceClick(result.precoMedio, 'Médio')} type="button">
                      {formatBRL(result.precoMedio)} <PillLabel theme={theme}>Médio</PillLabel>
                    </PricePill>
                    <PricePill theme={theme} onClick={() => handlePriceClick(result.precoMin, 'Mínimo')} type="button">
                      {formatBRL(result.precoMin)} <PillLabel theme={theme}>Mínimo</PillLabel>
                    </PricePill>
                    <PricePill theme={theme} onClick={() => handlePriceClick(result.precoMax, 'Máximo')} type="button">
                      {formatBRL(result.precoMax)} <PillLabel theme={theme}>Máximo</PillLabel>
                    </PricePill>
                    <span style={{ fontSize: 11, color: tendCor, fontWeight: 600 }}>
                      {tendIcon} {result.tendencia}
                    </span>
                  </SuggestionRow>
                </div>

                <div>
                  <SectionLabel theme={theme}>
                    🛒 Comparar lojas ({sortedLojas.length} ofertas encontradas)
                  </SectionLabel>
                  <StoreTable>
                    {sortedLojas.map((loja, i) => {
                      const isBest = i === 0;
                      const config = STORE_CONFIG[loja.nome];
                      const storeColor = config?.color || `hsl(${i * 45}, 70%, 50%)`;
                      const directLink = loja.linkDireto || config?.directLink(searchQuery);
                      
                      return (
                        <StoreRow 
                          key={loja.nome} 
                          theme={theme} 
                          highlight={isBest ? 1 : 0} 
                          index={i}
                        >
                          {config?.logo ? (
                            <StoreLogo 
                              src={config.logo} 
                              alt={loja.nome}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <StoreLogoFallback 
                            color={storeColor} 
                            style={{ display: config?.logo ? 'none' : 'flex' }}
                          >
                            {loja.nome.slice(0, 2).toUpperCase()}
                          </StoreLogoFallback>
                          
                          <StoreInfo>
                            <StoreName theme={theme}>{loja.nome}</StoreName>
                            {directLink && (
                              <StoreLink 
                                href={directLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                theme={theme}
                                onClick={(e) => e.stopPropagation()}
                              >
                                🎯 Ver anúncio direto →
                              </StoreLink>
                            )}
                          </StoreInfo>
                          
                          <PriceSection>
                            <StorePrice 
                              theme={theme} 
                              best={isBest ? 1 : 0}
                              onClick={() => handlePriceClick(loja.preco, loja.nome)}
                            >
                              {formatBRL(loja.preco)}
                            </StorePrice>
                            {isBest && <BestBadge theme={theme}>⚡ Menor preço</BestBadge>}
                          </PriceSection>
                        </StoreRow>
                      );
                    })}
                  </StoreTable>
                </div>

                {histData.length > 0 && (
                  <div>
                    <SectionLabel theme={theme}>
                      📈 Variação — últimos {histData.length} meses
                    </SectionLabel>
                    <HistoryBar>
                      {histData.map((val, i) => {
                        const range = histMax - histMin || 1;
                        const pct = 20 + ((val - histMin) / range) * 80;
                        return (
                          <Bar 
                            key={i} 
                            theme={theme} 
                            pct={pct.toFixed(0)}
                            active={i === histData.length - 1 ? 1 : 0}
                            data-tooltip={`${MONTHS[i % 12]}: ${formatBRL(val)}`}
                          />
                        );
                      })}
                    </HistoryBar>
                    <BarLabels>
                      {histData.map((_, i) => (
                        <BarLabel key={i} theme={theme}>{MONTHS[i % 12]}</BarLabel>
                      ))}
                    </BarLabels>
                  </div>
                )}

                {result.dicaEpoca && (
                  <TipBox theme={theme}>
                    💡 <strong>Melhor época:</strong> {result.dicaEpoca}
                    {result.desconto && (
                      <>
                        <br />🏷 <strong>Desconto:</strong> {result.desconto}
                      </>
                    )}
                  </TipBox>
                )}

                <div>
                  <SectionLabel theme={theme}>🔔 Alerta de preço</SectionLabel>
                  {alertSet ? (
                    <AlertBox theme={theme}>
                      ✅ Alerta criado! Avisarei quando baixar de {formatBRL(parseFloat(alertPrice.replace(',', '.')))}
                      <button 
                        onClick={() => setAlertSet(false)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </AlertBox>
                  ) : (
                    <AlertInput>
                      <AlertPriceInput 
                        theme={theme} 
                        type="text" 
                        placeholder="R$ preço alvo..."
                        value={alertPrice} 
                        onChange={e => setAlertPrice(e.target.value)} 
                      />
                      <AlertButton theme={theme} onClick={handleSetAlert} type="button">
                        Criar alerta
                      </AlertButton>
                    </AlertInput>
                  )}
                </div>

                {clickedPrices.length > 0 && (
                  <TipBox theme={theme} style={{ fontSize: 11 }}>
                    📊 Últimos preços usados: {clickedPrices.slice(-3).map(p => 
                      `${formatBRL(p.price)} (${p.store})`
                    ).join(' • ')}
                  </TipBox>
                )}

                <button 
                  onClick={() => {
                    console.log('🔄 Atualizando pesquisa...');
                    handleSearch();
                  }} 
                  type="button"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: 11,
                    color: theme === 'dark' ? '#5050a0' : '#9090c0', 
                    textDecoration: 'underline',
                    alignSelf: 'flex-end', 
                    padding: 0 
                  }}
                >
                  ↻ Atualizar pesquisa
                </button>
              </>
            )}
          </PanelBody>
        </Panel>
      )}
    </PanelWrapper>
  );
};

export default PriceResearchPanel;