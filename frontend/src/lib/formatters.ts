export const brl = (n: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n ?? 0));

export const percent = (n: number, digits = 0) =>
  `${(n * 100).toFixed(digits).replace(".", ",")}%`;



export const maskDate = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");

export const formatDate = (iso: string | Date | null | undefined) => {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("pt-BR").format(d);
};



export const brToIsoDate = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  return `${yyyy}-${mm}-${dd}`;
};
