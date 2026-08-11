export type TipoConta = "Individual" | "Casal";

export interface Pessoa {
  nome: string;
  email: string;
  dataNascimento?: string | null;
  avatar?: string | null;
}

export interface Usuario {
  id: string;
  tipoConta: TipoConta;
  nomeCompleto?: string | null;
  email?: string | null;
  dataNascimento?: string | null;
  isCasal: boolean;
  modoEscuro: boolean;
  metaGlobalEnxoval?: number | null;
  casalInfo?: {
    pessoa1: Pessoa;
    pessoa2: Pessoa;
  } | null;
  pessoaLogada?: 1 | 2;
}

export interface LoginResponse {
  usuario: Usuario;
}

export interface Categoria {
  id: string;
  nome: string;
  icon: string;
  bg: string;
  isPadrao: boolean;
  ordem: number;
  metaOrcamento?: number | null;
  usuarioId?: string | null;
}

export interface ItemVariante {
  id: string;
  nome: string;
  preco: number;
  loja?: string | null;
  fotoUrl?: string | null;
  linkProduto?: string | null;
  observacao?: string | null;
  criadaEm?: string;
}

export interface Item {
  id: string;
  nome: string;
  marca?: string | null;
  preco: number;
  quantidade: number;
  categoriaId: string;
  usuarioId?: string;
  comprado: boolean;
  pagamento: "normal" | "vr";
  prioridade?: string | null;
  loja?: string | null;
  linkProduto?: string | null;
  fotoUrl?: string | null;
  parcelas?: number | null;
  variantes?: ItemVariante[];
  varianteSelecionadaId?: string | null;
  origem?: string | null;
  origemDescricao?: string | null;
  responsavelId?: 1 | 2 | null;
  divisaoPagamento?: {
    valorPessoa1: number;
    valorPessoa2: number;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumoCategoria {
  categoriaId: string;
  categoriaNome: string;
  totalGasto: number;
  totalItens: number;
  itensComprados: number;
  metaOrcamento?: number | null;
  cor?: string | null;
  icon?: string | null;
}

export interface Resumo {
  totalGeral: number;
  totalNormal: number;
  totalVr: number;
  totalItens: number;
  itensComprados: number;
  totalPessoa1: number;
  totalPessoa2: number;
  metaGlobal?: number | null;
  percentualMeta?: number | null;
  mesAtual: number;
  mesPassado: number;
  mesRetrasado: number;
  variacaoMensal?: number | null;
  porCategoria: ResumoCategoria[];
}

export interface PesquisaPrecoResultado {
  titulo: string;
  loja: string;
  preco: number;
  precoFormatado: string;
  link: string;
  thumbnail?: string;
  parcelamento?: string;
  isTrusted: boolean;
  isMarketplace: boolean;
  isUsed: boolean;
  lojaLogo?: string;
  marcaLogo?: string;
  marca?: string;
}

export interface PesquisaPrecoResposta {
  query: string;
  marcaDetectada?: string;
  nomeCorrigido?: string;
  resultados: PesquisaPrecoResultado[];
}
