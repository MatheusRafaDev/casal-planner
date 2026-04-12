// storeLogoService.js — versão otimizada com cache persistente (sessionStorage)

const KNOWN_DOMAINS = {
  'extra': 'extra.com.br',
  'mercadolivre': 'mercadolivre.com.br',
  'amazon': 'amazon.com.br',
  'magazine': 'magazineluiza.com.br',
  'magazineluiza': 'magazineluiza.com.br',
  'magalu': 'magazineluiza.com.br',
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
  'leroy': 'leroymerlin.com.br',
  'leroymerlin': 'leroymerlin.com.br',
  'havan': 'havan.com.br',
  'tok': 'tokstok.com.br',
  'tokstok': 'tokstok.com.br',
  'whirlpool': 'whirlpool.com.br',
  'lojas': 'lojasrenner.com.br',
};

const CACHE_KEY_PREFIX = 'storelogo_v2_';

class StoreLogoService {
  constructor() {
    // Cache em memória (rápido) + sessionStorage (persiste na sessão)
    this.memCache = new Map();
    this.pendingRequests = new Map();
    this._loadFromSession();
  }

  _loadFromSession() {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          const storeName = key.replace(CACHE_KEY_PREFIX, '');
          const domain = sessionStorage.getItem(key);
          if (domain) this.memCache.set(storeName, domain);
        }
      }
    } catch (_) { /* sessionStorage pode estar bloqueado */ }
  }

  _saveToSession(storeName, domain) {
    try {
      sessionStorage.setItem(CACHE_KEY_PREFIX + storeName, domain);
    } catch (_) {}
  }

  _normalizeName(storeName) {
    return storeName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  inferDomain(storeName) {
    const clean = this._normalizeName(storeName);
    for (const [key, domain] of Object.entries(KNOWN_DOMAINS)) {
      if (clean.includes(key) || key.includes(clean)) return domain;
    }
    return `${clean}.com.br`;
  }

  // Retorna URL do favicon diretamente (síncrono) sem chamadas de rede extras
  getLogoUrl(storeName, size = 32) {
    if (!storeName) return null;
    const cached = this.memCache.get(storeName);
    const domain = cached || this.inferDomain(storeName);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  }

  // Versão assíncrona para enriquecimento via IA (só se Groq key configurada)
  async fetchDomainWithAI(storeName) {
    if (!storeName) return null;
    if (this.memCache.has(storeName)) return this.memCache.get(storeName);
    if (this.pendingRequests.has(storeName)) return this.pendingRequests.get(storeName);

    // Tenta inferir primeiro (síncrono, sem rede)
    const inferred = this.inferDomain(storeName);
    this.memCache.set(storeName, inferred);
    this._saveToSession(storeName, inferred);

    const apiKey = process.env.REACT_APP_GROQ_API_KEY;
    if (!apiKey) return inferred;

    const promise = this._fetchFromGroq(storeName, apiKey).then(domain => {
      if (domain) {
        this.memCache.set(storeName, domain);
        this._saveToSession(storeName, domain);
      }
      this.pendingRequests.delete(storeName);
      return domain || inferred;
    }).catch(() => {
      this.pendingRequests.delete(storeName);
      return inferred;
    });

    this.pendingRequests.set(storeName, promise);
    return promise;
  }

  async _fetchFromGroq(storeName, apiKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 30,
          temperature: 0.1,
          messages: [
            { role: 'system', content: 'Responda APENAS com o domínio da loja, ex: amazon.com.br' },
            { role: 'user', content: `Domínio da loja: ${storeName}` }
          ],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      let domain = data.choices?.[0]?.message?.content?.trim().toLowerCase() || '';
      domain = domain.replace(/^www\./i, '').replace(/^https?:\/\//i, '').split('/')[0];
      return domain.includes('.') && domain.length > 3 ? domain : null;
    } catch { return null; }
  }

  clearCache() {
    this.memCache.clear();
    try {
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(CACHE_KEY_PREFIX)) keys.push(k);
      }
      keys.forEach(k => sessionStorage.removeItem(k));
    } catch (_) {}
  }
}

const storeLogoService = new StoreLogoService();
export default storeLogoService;
