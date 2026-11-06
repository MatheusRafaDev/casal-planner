import { ACHADINHOS_CATALOGO, type Achadinho, criarLinkPesquisa } from "./indicacoes-catalogo";

export type { Achadinho };
export { criarLinkPesquisa };

/**
 * Catálogo completo com 504 produtos para enxoval e casa nova.
 * Alimentado pela curadoria modular em ./catalogo.
 */
export const ACHADINHOS_DATA: Achadinho[] = ACHADINHOS_CATALOGO;
