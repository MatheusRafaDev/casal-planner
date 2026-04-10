// services/storeLogoService.js
// Serviço para buscar domínio e logo de lojas - Versão sem CORS e sem bloqueadores

class StoreLogoService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.apiKey = process.env.REACT_APP_GROQ_API_KEY;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  }

  // Função principal para buscar domínio usando IA
  async fetchDomainWithAI(storeName) {
    if (!storeName) return null;

    // Verifica cache
    if (this.cache.has(storeName)) {
      return this.cache.get(storeName);
    }

    // Verifica requisição pendente
    if (this.pendingRequests.has(storeName)) {
      return this.pendingRequests.get(storeName);
    }

    const promise = this.searchDomainWithGroq(storeName);
    this.pendingRequests.set(storeName, promise);

    try {
      const domain = await promise;
      this.cache.set(storeName, domain);
      return domain;
    } finally {
      this.pendingRequests.delete(storeName);
    }
  }

  // Busca domínio usando Groq AI
  async searchDomainWithGroq(storeName) {
    if (!this.apiKey) {
      console.warn('GROQ API Key não configurada');
      return this.fallbackSearch(storeName);
    }

    try {
      const prompt = `Você é um especialista em identificar domínios de lojas online.
      
Para a loja "${storeName}", responda APENAS com o domínio principal no formato "dominio.com.br" ou "dominio.com".
Siga estas regras:
1. Use .com.br para lojas brasileiras, .com para internacionais
2. Remova "www." e "https://"
3. Apenas o domínio, sem barras ou paths

Responda APENAS com o domínio, sem explicações.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em identificar domínios de lojas online. Responda apenas com o domínio, sem explicações adicionais.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      let domain = data.choices[0]?.message?.content?.trim().toLowerCase();
      
      domain = domain.replace(/^www\./i, '');
      domain = domain.replace(/^https?:\/\//i, '');
      domain = domain.split('/')[0];
      
      if (domain && domain.includes('.') && domain.length > 3) {
        return domain;
      }
      
      return this.fallbackSearch(storeName);
      
    } catch (error) {
      console.error('Erro na busca com Groq:', error);
      return this.fallbackSearch(storeName);
    }
  }

  // Fallback usando métodos tradicionais
  async fallbackSearch(storeName) {
    const methods = [
      this.searchViaWikidata(storeName),
      this.searchViaDuckDuckGo(storeName)
    ];

    const allResults = await Promise.all(methods.map(m => m.catch(() => null)));
    const result = allResults.find(r => r !== null);
    
    if (result) return result;
    
    return this.inferCommonDomain(storeName);
  }

  // Busca via Wikidata
  async searchViaWikidata(storeName) {
    try {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(storeName)}&language=pt&format=json&origin=*&limit=3`;
      
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) throw new Error('Wikidata search failed');
      
      const searchData = await searchResponse.json();
      
      if (searchData.search && searchData.search.length > 0) {
        for (const entity of searchData.search) {
          const entityUrl = `https://www.wikidata.org/wiki/Special:EntityData/${entity.id}.json`;
          const entityResponse = await fetch(entityUrl);
          
          if (entityResponse.ok) {
            const entityData = await entityResponse.json();
            const claims = entityData.entities[entity.id]?.claims;
            
            if (claims && claims.P856) {
              const officialUrl = claims.P856[0]?.mainsnak?.datavalue?.value;
              if (officialUrl) {
                const domain = this.extractDomainFromUrl(officialUrl);
                if (domain) return domain;
              }
            }
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Busca via DuckDuckGo
  async searchViaDuckDuckGo(storeName) {
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(storeName)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('DuckDuckGo search failed');
      
      const data = await response.json();
      
      if (data.AbstractURL) {
        const domain = this.extractDomainFromUrl(data.AbstractURL);
        if (domain) return domain;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Inferir domínio comum (baseado em mapa conhecido)
  inferCommonDomain(storeName) {
    const cleanName = storeName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s/g, '');
    
    // Mapeamento de domínios conhecidos
    const knownDomains = {
      'extra': 'extra.com.br',
      'mercadolivre': 'mercadolivre.com.br',
      'amazon': 'amazon.com.br',
      'magazine': 'magazineluiza.com.br',
      'magazineluiza': 'magazineluiza.com.br',
      'americanas': 'americanas.com.br',
      'shopee': 'shopee.com.br',
      'aliexpress': 'aliexpress.com',
      'kabum': 'kabum.com.br',
      'pichau': 'pichau.com.br',
      'terabyte': 'terabyteshop.com.br',
      'carrefour': 'carrefour.com.br',
      'walmart': 'walmart.com.br',
      'casasbahia': 'casasbahia.com.br',
      'pontofrio': 'pontofrio.com.br',
      'submarino': 'submarino.com.br',
      'fastshop': 'fastshop.com.br',
      'renner': 'renner.com.br',
      'riachuelo': 'riachuelo.com.br',
      'cea': 'cea.com.br',
      'dafiti': 'dafiti.com.br',
      'netshoes': 'netshoes.com.br',
      'centauro': 'centauro.com.br',
      'madeiramadeira': 'madeiramadeira.com.br',
      'samsung': 'samsung.com.br',
      'apple': 'apple.com.br',
      'xiaomi': 'mi.com',
      'motorola': 'motorola.com.br',
      'lg': 'lg.com.br',
      'ramsons': 'ramsons.com.br'
    };
    
    // Tenta encontrar correspondência no mapa conhecido
    for (const [key, domain] of Object.entries(knownDomains)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return domain;
      }
    }
    
    // Se não encontrou, retorna domínio inferido
    return `${cleanName}.com.br`;
  }

  // Extrai domínio de URL
  extractDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname.replace('www.', '').toLowerCase();
      domain = domain.split(':')[0];
      
      if (domain.includes('.') && domain.length > 3) {
        return domain;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Busca URL do logo (apenas Google Favicons - não é bloqueado)
  getLogoUrl(storeName, size = 32) {
    const domain = this.cache.get(storeName);
    
    if (!domain) {
      const inferredDomain = this.inferCommonDomain(storeName);
      if (!inferredDomain) return null;
      
      // Usa apenas Google Favicons (não é bloqueado por adblockers)
      return `https://www.google.com/s2/favicons?domain=${inferredDomain}&sz=${size}`;
    }
    
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  }

  // Busca informações completas da loja
  async getStoreInfo(storeName) {
    // Tenta buscar com IA primeiro
    let domain = await this.fetchDomainWithAI(storeName);
    
    if (!domain) {
      domain = this.inferCommonDomain(storeName);
    }
    
    const logoUrl = domain ? this.getLogoUrl(storeName) : null;
    
    // Armazena no cache
    if (domain && !this.cache.has(storeName)) {
      this.cache.set(storeName, domain);
    }
    
    return {
      name: storeName,
      domain: domain,
      logoUrl: logoUrl,
      source: domain && await this.fetchDomainWithAI(storeName) ? 'groq-ai' : 'inference'
    };
  }

  // Limpa cache
  clearCache() {
    this.cache.clear();
  }
}

// Exporta instância única
const storeLogoService = new StoreLogoService();
export default storeLogoService;