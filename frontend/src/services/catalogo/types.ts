export interface Achadinho {
  id: string;
  nome: string;
  comodo: "cozinha" | "quarto" | "sala" | "lavanderia" | "banheiro" | "organizacao";
  comodoNome: string;
  precoEstimado: number;
  precoFaixa: string;
  dica: string;
  porQueValeAPena: string;
  fotoUrl: string;
  videoUrl?: string;
  linkLoja?: string;
  lojaNome?: string;
  selos: Array<"tiktok" | "custo-beneficio" | "indispensavel" | "presente">;
  marcaSugerida?: string;
}

export function criarLinkPesquisa(nome: string, marca?: string): string {
  const busca = marca && !nome.toLowerCase().includes(marca.toLowerCase())
    ? `${nome} ${marca}`
    : nome;
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(busca)}`;
}
