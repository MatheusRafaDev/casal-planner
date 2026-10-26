# CasalPlanner — Documentação Completa do Sistema

O **CasalPlanner** é uma plataforma moderna desenvolvida para simplificar e harmonizar o planejamento financeiro, montagem de enxoval e organização de cômodos para casais que estão montando seu novo lar — com suporte completo também para uso individual.

---

## 1. Visão Geral do Produto

### 1.1 Proposta de Valor
A montagem de uma nova casa envolve centenas de decisões, orçamentos fragmentados, divisão de custos sensível e prazos desafiadores. O CasalPlanner centraliza:
- O catálogo visual e checklist de compras por cômodo.
- A divisão transparente de quem paga cada item (Pessoa 1, Pessoa 2, Conjunto, Vale Refeição ou Presentes de Casamento/Lista).
- Metas orçamentárias globais e por cômodo com controle de saldo restante.
- Previsão financeira das faturas futuras de parcelamentos.
- Contagem regressiva e previsão climática em tempo real para o Dia da Mudança.

---

## 2. Identidade Visual & Design System

A aplicação foi projetada com base no conceito **"Lar Confortável"**, unindo a solidez do verde com o aconchego do coral e tons acolhedores:

### 2.1 Cores Oficiais
- **Verde Lar Principal**: `#1F5C43` (botões principais, destaques, marcas e acentos)
- **Verde Lar Floresta**: `#174a35` (fundo do cabeçalho da landing page, sidebar desktop e painel do login)
- **Verde Lar Escuro (Dark Mode)**: `#0F2B1F`
- **Coral Complementar**: `#EF6F6C` (identificação da Pessoa 2, badges afetivos e ponto de exclamação da marca)
- **Bege Suave (Fundo Geral)**: `#FAF6F1`
- **Borda Padrão**: `#EEE3D8` (2px de espessura no estilo sticker)
- **Texto Principal**: `#1B2438` (alto contraste e nitidez)
- **Texto em Superfícies Escuras**: `#FFFFFF` com acentos em `#6EE7B7` (Emerald 300) e `#A7F3D0`

### 2.2 Estética "Sticker" e Cartunesca
- Bordas arredondadas generosas (`rounded-xl` e `rounded-2xl`).
- Sombras sólidas estilizadas (`shadow-[2px_2px_0_var(--border)]` e `shadow-[3px_3px_0_rgba(19,60,43,0.5)]`).
- Ilustrações editoriais 2D exclusivas representando o casal no sofá, cômodos organizados e momentos de celebração.

### 2.3 Tipografia
- **Títulos e Marcas**: *Plus Jakarta Sans* / *Outfit* com peso extra-bold e tracking levemente condensado.
- **Corpo e Interface**: *Inter* para máxima legibilidade em números e interfaces densas.

### 2.4 Monograma & Logo Oficial (`BrandLogo`)
- **`BrandLogoIcon`**: Ícone monograma com dois papéis de checklist sobrepostos em verde e coral.
- **`BrandLogoText`**: Tipografia exclusiva com `prefix="casal"` e `suffix="planner."`. Suporta `variant="on-dark"` para aplicação sobre superfícies em verde escuro (ex: barra lateral, header e tela de login).

---

## 3. Arquitetura Técnica

### 3.1 Stack Tecnológica
- **Linguagem**: TypeScript (Strict Mode)
- **Frontend Framework**: [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev/)
- **Roteamento**: [TanStack Router](https://tanstack.com/router) (File-based Routing tipado)
- **Gerenciamento de Estado de Servidor**: [TanStack Query v5](https://tanstack.com/query)
- **Estilização**: Tailwind CSS v4 + Vanilla CSS Tokens
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Notificações**: [Sonner](https://sonner.emilkowal.ski/)
- **Exportação de Relatórios**: [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/)
- **Integração Meteorológica**: Open-Meteo REST API (sem chaves proprietárias, alta disponibilidade)

### 3.2 Estrutura de Diretórios
```
casal-planner/
├── docs/                                  # Documentações do projeto
│   └── DOCUMENTACAO.md
├── frontend/
│   ├── public/                            # Favicons, ilustrações e fotos de produtos
│   │   ├── illustrations/
│   │   └── images/products/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   └── AppShell.tsx           # Shell autenticado: sidebar verde, header mobile e bottom bar
│       │   ├── planejamento/              # Modais, wizards e widgets de planejamento
│       │   │   ├── AddItemWizard.tsx      # Wizard modal para adicionar/editar compras
│       │   │   └── WidgetDiaMudanca.tsx   # Contagem regressiva e clima em tempo real
│       │   └── ui/                        # Componentes primitivos (BrandLogo, Button, Dialog, etc.)
│       ├── lib/
│       │   ├── api.ts                     # Cliente HTTP e interceptors
│       │   ├── auth-context.tsx           # Provedor global de autenticação
│       │   └── utils.ts                   # Utilitários de formatação de moeda e datas
│       ├── routes/                        # Rotas TanStack Start
│       │   ├── index.tsx                  # Landing Page institucional pública
│       │   ├── login.tsx                  # Tela editorial de login e cadastro
│       │   └── _authenticated/            # Rotas protegidas
│       │       ├── inicio.tsx             # Dashboard principal de métricas e KPIs
│       │       ├── planejamento.tsx       # Gestão do enxoval e catálogo por cômodos
│       │       └── perfil.tsx             # Configurações do casal e orçamento
│       └── styles.css                     # Design tokens e variáveis globais CSS
```

---

## 4. Módulos e Funcionalidades

### 4.1 Landing Page Pública (`/`)
- **Header Sticky**: Fundo translúcido em **Verde Lar Floresta** (`#174a35/95`) com efeito de vidro fosco (`backdrop-blur-md`), logotipo com variante `on-dark`, links rápidos e botão "Entrar" em alto contraste.
- **Seção Hero**: Título editorial chamativo, botões de ação e ilustração do casal emoldurada por cards flutuantes interativos (Geladeira, Sofá, Air Fryer e saldo restante).
- **Os 4 Passos do CasalPlanner**:
  1. *Criem a conta*: Vinculação imediata do casal ou conta solo.
  2. *Montem os cômodos*: Criação de cozinha, sala, quarto com orçamentos dedicados.
  3. *Listem os itens*: Preço, parcelas, prioridade e fotos.
  4. *Acompanhem juntos*: Dashboard completo com faturas futuras e divisões financeiras.
- **Recursos para a Vida Real**: Gráficos explicativos sobre divisão proporcional, acompanhamento de parcelas do cartão e comparador de economia.
- **FAQ / Dúvidas Frequentes**: Respostas imediatas para as principais dúvidas do casal sobre o funcionamento da ferramenta.

### 4.2 Tela de Autenticação (`/login`)
- **Layout Split-Screen Editorial**:
  - **Lado Esquerdo (Desktop)**: Painel estilizado em Verde Lar Floresta (`bg-sidebar`), logotipo oficial, tipografia de alto contraste em branco e esmeralda e card com ilustração do casal com as chaves da casa nova.
  - **Lado Direito**: Formulário ágil e sem salto de layout (*zero layout shift*) para alternar instantaneamente entre **"Entrar"** e **"Cadastrar"**.
- Suporte a recuperação de senha e redirecionamento automático com `returnUrl`.

### 4.3 Dashboard Principal (`/inicio`)
- **4 Cards de Métricas Principais (KPIs)**:
  1. **Total Gasto (Card Verde de Destaque)**: Valor investido no enxoval com visual em gradiente Verde Lar, tipografia branca e esmeralda.
  2. **Disponível na Meta**: Saldo restante ou alerta visual caso o orçamento tenha sido ultrapassado.
  3. **Fatura do Mês**: Somatório das parcelas de cartão ativas que vencem no mês corrente.
  4. **Itens Comprados**: Percentual e contagem de itens já adquiridos em relação ao total do enxoval.
- **Divisão e Uso do Orçamento**:
  - Barra empilhada proporcional com cores dedicadas (Pessoa 1 em Verde Lar e Pessoa 2 em Coral).
  - Indicadores de economia gerada por presentes de padrinhos e convidados.
- **Widget do Dia da Mudança**:
  - Contagem regressiva em dias, semanas e meses até a data da mudança.
  - Previsão meteorológica ao vivo (temperatura atual, máxima, mínima e alertas de chuva) consumindo Open-Meteo.
- **Relatório Financeiro em PDF**:
  - Exportação de relatório completo com logomarca, tabelas de gastos e divisão financeira pronta para impressão ou compartilhamento.

### 4.4 Planejamento & Enxoval (`/planejamento`)
- **Hero Summary Card Verde Lar**:
  - Indicador do cômodo selecionado com contagem de itens comprados, pendentes e ganhos.
  - Barra de progresso visual percentual.
  - Box de divisão detalhada do casal: quanto cada pessoa pagou, compras conjuntas, valores em Vale Refeição (VR) e economia com presentes.
- **Filtros e Visualização**:
  - Navegação por cômodos via pills horizontais ou integrada à barra lateral desktop.
  - Filtro por status: *Todos*, *Comprados*, *Pendentes* e *Ganhos*.
  - Ordenação por maior preço, menor preço, ordem alfabética ou data.
  - Busca em tempo real por nome do item ou observações.
- **Card de Item**:
  - Foto do produto, valor em destaque, número de parcelas e responsável pelo pagamento.
  - Toggle de compra com um clique (`toggleComprado`).
  - Edição completa e exclusão segura com modal de confirmação.
- **Wizard Global de Adição (`AddItemWizard`)**:
  - Modal dinâmico para cadastrar novos itens com suporte a upload de fotos, busca de imagem por link, definição de prioridade, número de parcelas e repartição customizada entre os parceiros.

### 4.5 Configurações & Perfil (`/perfil`)
- Gestão dos nomes do casal e chave Pix de cada um para acertos de contas.
- Botão instantâneo de alternância: troca entre "Logado como Pessoa 1" e "Logado como Pessoa 2" sem necessidade de logout.
- Definição do orçamento global (meta financeira máxima).
- Configuração de data prevista da mudança e cidade com geocodificação integrada.

---

## 5. Shell da Aplicação (`AppShell`)

- **Sidebar Desktop Verde Lar**:
  - Fundo em Verde Floresta (`#174a35`) e bordas escuras harmonizadas (`#133c2b`).
  - Navegação com destaque em vidro translúcido (`bg-white/20`) no item ativo.
  - Portal dinâmico de cômodos: lista os cômodos cadastrados com suas cores originais direto na barra lateral.
  - Card de usuário no rodapé com avatar duplo do casal, status de conexão e atalho para alternar perfil ou encerrar sessão.
- **Navegação Mobile**:
  - Header compacto superior com logo e atalho ao perfil.
  - Barra inferior (*bottom navigation*) fixa com efeito blur, incluindo atalhos para Início, Planejamento, Perfil e **botão central destacado de adicionar novo item**.

---

## 6. Guia de Execução & Comandos Úteis

### Requisitos
- Node.js 18+ instalado
- Gerenciador de pacotes npm

### Desenvolvimento
```bash
# Entrar no diretório frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Vite)
npm run dev
```

### Validação de Tipos & Build de Produção
```bash
# Verificação de tipos TypeScript (deve sair com código 0)
npx tsc --noEmit

# Compilação do bundle de produção (TanStack Start + Nitro)
npm run build
```

---

*CasalPlanner — Construído com carinho para transformar o sonho da casa nova em uma experiência leve, transparente e inesquecível.*
