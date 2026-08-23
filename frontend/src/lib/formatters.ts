export const brl = (n: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n ?? 0));

/** Transforma a string bruta do input em máscara R$ 1.234,56 */
export const maskBRL = (raw: string): string => {
  // Mantém só dígitos
  const digits = raw.replace(/\D/g, "").slice(0, 13); // max 99.999.999.999,99
  if (!digits) return "";
  const cents = parseInt(digits, 10); // em centavos
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

/** Extrai o valor numérico (float) de uma string mascarada com maskBRL */
export const parseBRL = (masked: string): number => {
  // "R$ 1.234,56" → 1234.56
  const cleaned = masked
    .replace(/[R$\s]/g, "") // remove R$
    .replace(/\./g, "") // remove separadores de milhar
    .replace(",", "."); // virgem → ponto decimal
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

export const percent = (n: number, digits = 0) => `${(n * 100).toFixed(digits).replace(".", ",")}%`;

export const maskDate = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");

export const formatDate = (iso: string | Date | null | undefined) => {
  if (!iso) return "";
  
  if (typeof iso === "string") {
    const parts = iso.substring(0, 10).split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
  }

  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("pt-BR").format(d);
};

export const brToIsoDate = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const dd = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10);
  const yyyy = parseInt(digits.slice(4, 8), 10);

  // Validação básica de limites
  if (yyyy < 1900 || yyyy > new Date().getFullYear()) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  // Validação de data real (anos bissextos, meses com 30/31 dias)
  const dateObj = new Date(yyyy, mm - 1, dd);
  if (
    dateObj.getFullYear() !== yyyy ||
    dateObj.getMonth() + 1 !== mm ||
    dateObj.getDate() !== dd
  ) {
    return null;
  }

  return `${yyyy.toString().padStart(4, "0")}-${mm.toString().padStart(2, "0")}-${dd.toString().padStart(2, "0")}`;
};

/**
 * Converte qualquer string (TUDO MAIÚSCULO, tudo minúsculo, ou mista)
 * para Title Case (primeira letra de cada palavra em maiúscula).
 * Ex.: "GELADEIRA BRASTEMP" → "Geladeira Brastemp"
 */
export const toTitleCase = (str: string | null | undefined): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
