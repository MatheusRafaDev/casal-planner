import type { Achadinho } from "./catalogo/types";
import { COZINHA_ACHADINHOS } from "./catalogo/cozinha";
import { QUARTO_ACHADINHOS } from "./catalogo/quarto";
import { SALA_ACHADINHOS } from "./catalogo/sala";
import { LAVANDERIA_ACHADINHOS } from "./catalogo/lavanderia";
import { BANHEIRO_ACHADINHOS } from "./catalogo/banheiro";
import { ORGANIZACAO_ACHADINHOS } from "./catalogo/organizacao";

export * from "./catalogo/types";

/**
 * Catálogo completo com 504 produtos para enxoval e casa nova.
 * Distribuído equilibradamente entre todos os cômodos da casa.
 */
export const ACHADINHOS_CATALOGO: Achadinho[] = [
  ...COZINHA_ACHADINHOS,
  ...QUARTO_ACHADINHOS,
  ...SALA_ACHADINHOS,
  ...LAVANDERIA_ACHADINHOS,
  ...BANHEIRO_ACHADINHOS,
  ...ORGANIZACAO_ACHADINHOS,
];
