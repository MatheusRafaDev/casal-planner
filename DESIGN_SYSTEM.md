# 🎨 CasalPlanner — Design System & Guia de Tokens

O **CasalPlanner** utiliza uma arquitetura de **Design Tokens** centralizada e desacoplada.  
Qualquer mudança de identidade visual, nome da marca, cores, logotipos ou paleta de cômodos é feita em pontos únicos de configuração.

---

## 📂 Estrutura de Arquivos

| Arquivo | Finalidade |
| :--- | :--- |
| **`frontend/src/design-system/brand.ts`** | Nomes da marca, slogans, caminhos dos logos (`logo.png`, `logo.svg`, favicons) e cores para PWA. |
| **`frontend/src/design-system/tokens.ts`** | Paletas de cores (primária, acento, casal, cômodos, gráficos), tipografia, sombras e raios de borda. |
| **`frontend/src/design-system/index.ts`** | Ponto de exportação unificado e utilitários (`getRoomDefaultColor`, etc.). |
| **`frontend/src/styles.css`** | Variáveis CSS (`:root`, `.dark`, `@theme`) sincronizadas com o Tailwind CSS 4. |
| **`frontend/src/components/ui/BrandLogo.tsx`** | Componente oficial de logotipo (ícone + texto) 100% tokenizado. |

---

## 🚀 Como Alterar a Identidade Visual

### 1. Alterar o Nome e os Logotipos da Marca
Edite **`frontend/src/design-system/brand.ts`**:

```typescript
export const BRAND_CONFIG = {
  name: "CasalPlanner",
  nameParts: {
    prefix: "casal",    // Peso 800 em Verde Lar
    suffix: "planner",  // Peso 300 em Tinta
  },
  tagline: "organizador de compras do casal",
  slogan: "Organizador de compras do casal",
  
  // Caminhos das imagens em /public
  assets: {
    logoPng: "/logo.png",
    logoSvg: "/logo.svg",
    faviconSvg: "/favicon.svg",
    appleTouchIcon: "/apple-touch-icon.png",
  },
  
  themeColor: "#1F5C43", // Verde Lar
  themeColorDark: "#16382A", // Verde Floresta
  backgroundColor: "#FAF6F1", // Creme
};
```
> **Nota:** Todos os componentes (`BrandLogo`, `Header`, `AppShell`, meta tags de PWA, SEO e telas de autenticação) atualizam automaticamente quando você altera esse arquivo.

---

### 2. Alterar as Cores Principais do Sistema
Edite as variáveis em **`frontend/src/styles.css`**:

```css
:root {
  /* Cor Primária do Sistema (Verde Lar) */
  --primary: #1f5c43;
  --primary-hover: #2f8a63;
  --primary-foreground: #ffffff;

  /* Cor de Acento / Secundária (Coral) */
  --gold: #ef6f6c;
  --gold-hover: #e05a57;

  /* Cores Individuais do Casal (Duas folhas da lista: Coral e Verde) */
  --p1-color: #ef6f6c; /* Pessoa 1: Coral */
  --p2-color: #1f5c43; /* Pessoa 2: Verde Lar */
  --joint-color: #2f8a63; /* Despesas conjuntas: Verde Folha */

  /* Neutros e Superfícies */
  --background: #faf6f1; /* Fundo geral (Creme) */
  --foreground: #1b2438; /* Texto principal (Tinta) */
  --card: #ffffff;       /* Fundo dos cards e modais */
  --border: #eee3d8;     /* Bordas de 2px */
  --muted: #e7ece9;      /* Névoa */
  --muted-foreground: #5b6470; /* Cinza */
}
```

E para o modo escuro, edite o bloco `.dark` correspondente no mesmo arquivo.

---

### 3. Tokens Disponíveis no Tailwind CSS

O sistema disponibiliza classes utilitárias semânticas prontas para uso:

| Classe Tailwind | Token Associado |
| :--- | :--- |
| `bg-primary`, `text-primary`, `border-primary` | Cor primária da marca |
| `bg-brand-dot`, `text-brand-accent` | Destaque e ponto de acento da marca |
| `bg-p1`, `text-p1`, `text-p1-foreground` | Cor da Pessoa 1 do casal (Verde padrão) |
| `bg-p2`, `text-p2`, `text-p2-foreground` | Cor da Pessoa 2 do casal (Dourado padrão) |
| `bg-joint`, `text-joint` | Despesas divididas conjuntamente |
| `bg-card`, `text-card-foreground` | Superfície de cartões e modais |
| `border-border` | Borda padrão e consistente |
| `rounded-lg`, `rounded-xl`, `rounded-2xl` | Escala de arredondamento |

---

### 4. Cores dos Cômodos e Gráficos
Em **`frontend/src/design-system/tokens.ts`**:
- `DESIGN_TOKENS.colors.rooms`: Paleta de cada ambiente (sala, cozinha, quarto, banheiro, lavanderia, etc.).
- `DESIGN_TOKENS.colors.chartPalette`: Sequência de cores harmonizadas utilizadas nos gráficos do Dashboard (`inicio.tsx`).
