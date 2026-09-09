const maskBRL = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

const parseBRL = (masked) => {
  const cleaned = masked
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

let raw = "R$ 1.234,560";
let masked = maskBRL(raw);
let parsed = parseBRL(masked);
console.log({ raw, masked, parsed });
