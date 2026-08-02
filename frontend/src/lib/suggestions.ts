/**
 * suggestions.ts
 * Dicionário de produtos comuns para sugestões de autocomplete no wizard de itens.
 * Usa distância de Levenshtein para tolerância a erros de digitação/ortografia.
 */

export const PRODUTOS_COMUNS = [
  // Cozinha
  "Geladeira",
  "Geladeira Frost Free",
  "Geladeira Duplex",
  "Geladeira Side by Side",
  "Fogão",
  "Fogão 4 bocas",
  "Fogão 5 bocas",
  "Fogão 6 bocas",
  "Fogão embutir",
  "Forno Elétrico",
  "Forno Micro-ondas",
  "Micro-ondas",
  "Forno de embutir",
  "Máquina de Lavar Louça",
  "Lava-Louças",
  "Liquidificador",
  "Batedeira",
  "Air Fryer",
  "Fritadeira Elétrica",
  "Máquina de Café",
  "Cafeteira",
  "Chaleira Elétrica",
  "Panela de Pressão",
  "Panela Elétrica",
  "Conjunto de Panelas",
  "Jogo de Copos",
  "Jogo de Pratos",
  "Talheres",
  "Conjunto de Xícaras",
  "Faca de Cozinha",
  "Tábua de Corte",
  "Escorredor de Louça",
  "Toasteira",
  "Sanduicheira",
  "Grill Elétrico",

  // Sala de Estar
  "Sofá",
  "Sofá 2 lugares",
  "Sofá 3 lugares",
  "Sofá 4 lugares",
  "Sofá Canto",
  "Poltrona",
  "Mesa de Centro",
  "Mesa Lateral",
  "Rack para TV",
  "Estante",
  "Televisão",
  "TV 4K",
  "TV 50 polegadas",
  "TV 55 polegadas",
  "TV 65 polegadas",
  "Home Theater",
  "Soundbar",
  "Caixa de Som",
  "Aparelho de Som",
  "Tapete Sala",
  "Luminária",
  "Abajur",
  "Lustre",

  // Quarto
  "Cama Casal",
  "Cama Queen",
  "Cama King",
  "Cama Solteiro",
  "Colchão Casal",
  "Colchão Queen",
  "Colchão King",
  "Colchão Solteiro",
  "Guarda-Roupa",
  "Guarda-Roupa 4 portas",
  "Guarda-Roupa 6 portas",
  "Cômoda",
  "Criado-Mudo",
  "Espelho",
  "Penteadeira",
  "Jogo de Cama",
  "Edredom",
  "Travesseiro",
  "Almofada",
  "Jogo de Lençóis",
  "Cobertor",
  "Manta",

  // Banheiro
  "Toalha de Banho",
  "Toalha de Rosto",
  "Jogo de Toalhas",
  "Tapete de Banheiro",
  "Suporte de Papel Higiênico",
  "Saboneteira",
  "Porta-Escova",
  "Espelho de Banheiro",
  "Organizador de Banheiro",

  // Lavanderia
  "Máquina de Lavar Roupa",
  "Lavadora de Roupas",
  "Máquina de Lavar 11kg",
  "Máquina de Lavar 12kg",
  "Máquina de Lavar 15kg",
  "Lava e Seca",
  "Secadora de Roupa",
  "Ferro de Passar",
  "Tábua de Passar Roupa",
  "Cesto de Roupa",
  "Varal",

  // Escritório / Home Office
  "Mesa de Escritório",
  "Cadeira de Escritório",
  "Cadeira Gamer",
  "Computador",
  "Notebook",
  "Monitor",
  "Teclado",
  "Mouse",
  "Impressora",
  "Scanner",
  "Webcam",
  "Fone de Ouvido",
  "Organizador de Mesa",
  "Luminária de Mesa",

  // Bebê
  "Berço",
  "Berço Grade",
  "Mini Berço",
  "Carrinho de Bebê",
  "Bebê Conforto",
  "Cadeirinha para Carro",
  "Banheira de Bebê",
  "Trocador",
  "Cômoda com Trocador",
  "Jogo de Berço",
  "Cobertor de Bebê",

  // Outros
  "Ar-Condicionado",
  "Ventilador",
  "Purificador de Ar",
  "Cortina",
  "Persiana",
  "Rodízio",
  "Cabide",
  "Vassoura",
  "Aspirador de Pó",
  "Robô Aspirador",
  "Caixa Organizadora",
  "Prateleira",
];

/** Distância de Levenshtein entre duas strings */
function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Retorna até `limit` sugestões ordenadas por relevância para a query digitada.
 * Prioriza: prefixo > contém a palavra > menor distância de edição.
 */
export function getSuggestions(query: string, limit = 6): string[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();

  const scored = PRODUTOS_COMUNS.map((p) => {
    const pl = p.toLowerCase();
    let score = 999;
    if (pl.startsWith(q)) score = 0;
    else if (pl.includes(q)) score = 1;
    else {
      // compara com cada palavra do produto
      const words = pl.split(/\s+/);
      const minDist = Math.min(...words.map((w) => levenshtein(q, w)));
      score = 2 + minDist;
    }
    return { label: p, score };
  });

  return scored
    .filter((s) => s.score <= 5) // cortes de relevância
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((s) => s.label);
}
