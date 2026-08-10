# Casal Planner

<div align="center">

> **Organize as compras da casa nova junto com quem você ama.**

App full-stack para planejamento de enxoval doméstico por cômodo, com divisão de pagamento entre o casal, pesquisa de preços com IA e PWA instalável.

[![Deploy Status](https://img.shields.io/badge/deploy-live-brightgreen?style=for-the-badge)](https://casalplanner.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

**?? Acesse agora: [casalplanner.vercel.app](https://casalplanner.vercel.app/)**

</div>

---

## ?? Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#?-tecnologias)
- [Arquitetura](#?-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Testes](#-testes)
- [Rodando Localmente](#-rodando-localmente)
- [Autor](#-autor)

---

## ?? Sobre o Projeto

O **Casal Planner** nasceu de uma necessidade real: organizar as compras de quem está montando a primeira casa. O app permite que duas pessoas (ou uma só) planejem, acompanhem e controlem gastos domésticos de forma colaborativa — com suporte a pagamento normal e VR/VA, divisão de valores entre o casal, e um painel de pesquisa de preços que usa IA para validar produtos e comparar lojas em tempo real.

**Público-alvo:**
- ?? Casais montando a primeira casa
- ?? Pessoas que querem organizar compras domésticas por ambiente
- ?? Quem precisa controlar orçamento com separação VR/VA e divisão de despesas

---

## ? Funcionalidades

### ?? Dashboard — Início

A página inicial é o painel central do app, mostrando uma visão geral de tudo que foi planejado:

- **Cards de resumo financeiro**: total gasto, total pendente, itens comprados e progresso da meta
- **Barra de progresso da meta**: comparação visual entre o total gasto e a meta de orçamento configurada
- **Resumo por tipo de pagamento**: gastos separados em Dinheiro vs. VR/VA, com cards individuais
- **Resumo por cômodo**: lista com valor total, itens comprados e alertas de orçamento estourado
- **Gráficos de gastos**: visualização do enxoval por cômodo com ApexCharts/Recharts

---

### ?? Planejamento — Controle do Enxoval

A página principal do app. Toda a gestão do enxoval acontece aqui:

#### ??? Cômodos (Categorias)
- Crie quantos cômodos quiser (Sala, Cozinha, Quarto, Banheiro, etc.)
- **Ícone personalizado** para cada cômodo (mais de 20 ícones disponíveis)
- **Cor personalizada** do cômodo
- **Meta de orçamento por cômodo**: defina um teto de gasto e acompanhe visualmente
- **Alerta de orçamento estourado**: ícone e destaque visual quando o gasto ultrapassa a meta
- Sidebar no desktop com totais por cômodo e barra de progresso inline
- Select dropdown elegante no mobile para trocar de cômodo

#### ?? Itens — Wizard em 3 etapas
Para adicionar itens de forma guiada e rápida:

1. **Etapa 1 — Identificação**: nome do item (com autocomplete de sugestões), cômodo e quantidade
2. **Etapa 2 — Pesquisa de preços**: resultados em tempo real de múltiplos e-commerces
3. **Etapa 3 — Confirmação**: resumo completo com foto, preço, parcelamento e divisão

Cada item possui:
- Nome, marca, loja
- Preço unitário e quantidade
- Parcelas (1x a 12x) com cálculo automático por parcela
- Forma de pagamento: **Dinheiro** ou **VR / VA**
- Prioridade: Alta, Média ou Baixa
- Origem: **Será comprado** ou **Ganho / Presente**
- Link do produto externo
- Foto do produto (upload manual ou captura por câmera)

#### ?? Filtros e Busca
- **Busca por texto**: filtra por nome do item ou marca em tempo real
- **Filtro por status**: Todos / Faltando / Comprados / Presentes
- **Filtro por pagamento**: Qualquer / Dinheiro / VR-VA
- **Filtro por responsável** *(conta casal)*: filtrar itens de uma pessoa específica

#### ?? Exportação
- **Exportar PDF**: relatório completo dos itens pendentes com tabela formatada
- **Compartilhar lista**: via Web Share API (WhatsApp, etc.) ou cópia para o clipboard

---

### ?? IA Integrada (Groq + Llama 3.1)

| Feature | Como funciona |
|---|---|
| **?? Identificação por foto** | Tire uma foto de um produto ou nota fiscal — a IA identifica nome, marca, loja e preço automaticamente |
| **?? Autocomplete inteligente** | Sugestões de itens comuns conforme você digita |
| **?? Detecção de duplicata** | Antes de cadastrar, a IA verifica se já existe um item similar no mesmo cômodo |
| **?? Sugestões por cômodo** | A IA sugere itens que podem estar faltando baseado no cômodo selecionado |
| **?? Pesquisa de preços** | Busca paralela em Google Shopping, Mercado Livre e Amazon com validação via IA |
| **??? Logo das lojas** | Descobre automaticamente o domínio e logo das marcas/lojas dos itens |

---

### ?? Divisão de Pagamento *(conta casal)*

Para contas casal, é possível em cada item:

- **Definir um responsável**: quem vai comprar (Pessoa 1 ou Pessoa 2)
- **Dividir o custo**: especificar quanto cada um vai pagar, com botões rápidos **50/50**, **100/0** e **0/100**
- Validação automática: a soma das partes deve ser igual ao total do item

---

### ?? Perfil e Conta

- Edição de nome, foto de perfil e informações do casal
- **Meta global do enxoval**: valor-alvo total para controle financeiro
- Alternar entre modo escuro e claro (persistido na conta)
- Troca de senha com verificação da senha atual
- Exclusão de conta
- **Convite de parceiro(a)**: envie um convite por e-mail para vincular duas contas em uma conta casal

---

### ?? Autenticação

- Registro como **conta individual** ou **conta casal**
- Login com e-mail e senha
- **Login social com Google** (OAuth 2.0)
- Recuperação de senha por código enviado ao e-mail (3 etapas: solicitar ? validar código ? redefinir)
- JWT Bearer com refresh de `LastLoginAt` a cada login
- Senhas com hashing BCrypt

---

### ?? Experiência de Uso

- **PWA instalável**: adicione ao celular como app nativo (manifest + service worker)
- **Modo escuro** completo com paleta calibrada em oklch
- **Design responsivo** mobile-first: bottom navigation bar no mobile, sidebar e header adaptado para tablet e desktop
- **Atualizações otimistas**: modais fecham imediatamente ao salvar, sem travar aguardando o servidor
- **Autofill respeitado**: campos preenchidos pelo navegador seguem o tema dark do app
- **Notificações Push** (Web Push / VAPID): suporte a notificações nativas no browser

---

## ??? Tecnologias

### Frontend

| Tecnologia | Uso |
|---|---|
| **React 19** | Biblioteca principal |
| **TanStack Router** | Roteamento file-based com type safety |
| **TanStack Query** | Cache, sincronização e optimistic updates |
| **TypeScript** | Tipagem estática em todo o projeto |
| **Tailwind CSS v4** | Estilização com design system próprio |
| **Radix UI / shadcn** | Componentes acessíveis e personalizáveis |
| **Framer Motion** | Animações com suporte a reduced motion |
| **ApexCharts + Recharts** | Gráficos de gastos |
| **jsPDF + jspdf-autotable** | Exportação de relatórios em PDF |
| **Sonner** | Toast notifications |
| **Zod** | Validação de esquemas |
| **Vite** | Build tool ultrarrápido |
| **Playwright** | Testes end-to-end |

### Backend

| Tecnologia | Uso |
|---|---|
| **ASP.NET Core 8** | API RESTful |
| **JWT Bearer** | Autenticação stateless |
| **BCrypt.Net** | Hashing seguro de senhas |
| **Google.Apis.Auth** | Validação de login social Google |
| **WebPush (VAPID)** | Notificações push nativas |
| **Serilog** | Logging estruturado |
| **AspNetCoreRateLimit** | Rate limiting por IP e por rota |
| **Swagger / OpenAPI** | Documentação interativa (dev) |

### Banco de Dados

| Tecnologia | Uso |
|---|---|
| **MongoDB 7.0** | Armazenamento NoSQL principal |
| **MongoDB Driver (.NET)** | Acesso ao banco via C# |

### Integrações Externas

| Serviço | Uso |
|---|---|
| **Groq API** (Llama 3.1 8B) | Identificação por foto, sugestões, detecção de duplicata |
| **SerpAPI / Google Shopping** | Pesquisa de preços |
| **Mercado Livre API** | Pesquisa de preços no ML |
| **Amazon** | Pesquisa de preços na Amazon |
| **Resend / SMTP** | E-mails transacionais (recuperação de senha, convite) |
| **Google OAuth** | Login social |

### Infraestrutura

| Tecnologia | Uso |
|---|---|
| **Docker** (multi-stage build) | Containerização do backend |
| **Vercel** | Deploy do frontend com CI/CD automático |

---

## ??? Arquitetura

O backend segue **Clean Architecture**, com 4 projetos e dependências sempre apontando para dentro:

```
CasalPlanner.API  --?  CasalPlanner.Infrastructure --+
       ¦                                              +--? CasalPlanner.Application --? CasalPlanner.Domain
       +---------------------------------------------+
```

- **Domain** — entidades puras (`Usuario`, `Item`, `Categoria`, `CasalInfo`) e exceções de domínio
- **Application** — DTOs e interfaces de serviço (`IAuthService`, `IItemService`, `IPesquisaPrecosService`)
- **Infrastructure** — implementações concretas, `MongoDbContext` e providers de preço
- **API** — composition root: Controllers, middlewares, `Program.cs`, JWT/CORS/rate limit

```
+----------------------------------------------------------+
¦              FRONTEND (React 19 + TanStack)               ¦
¦  +----------+  +----------------+  +------------------+  ¦
¦  ¦  Auth /  ¦  ¦ Planejamento   ¦  ¦ Pesquisa Preços  ¦  ¦
¦  ¦  Perfil  ¦  ¦ Itens + Cômodos¦  ¦ + IA (Groq)      ¦  ¦
¦  +----------+  +----------------+  +------------------+  ¦
+----------------------------------------------------------+
                         ¦ HTTP / REST + JWT Bearer
+------------------------?---------------------------------+
¦               BACKEND (ASP.NET Core 8)                    ¦
¦  +------------+  +-----------------+  +---------------+  ¦
¦  ¦ Auth /     ¦  ¦ Itens /         ¦  ¦ Pesquisa +    ¦  ¦
¦  ¦ Usuario    ¦  ¦ Categorias /    ¦  ¦ Groq (IA)     ¦  ¦
¦  +------------+  +-----------------+  +---------------+  ¦
+---------------------------+-------------------+----------+
                            ¦                   ¦
               +------------?----+   +----------?----------+
               ¦   MongoDB 7.0   ¦   ¦ Groq / SerpAPI /    ¦
               ¦ (Usuários,      ¦   ¦ Google Shopping /   ¦
               ¦  Itens, Cômodos)¦   ¦ Mercado Livre       ¦
               +-----------------+   +---------------------+
```

---

## ?? Estrutura do Projeto

```
casal-planner/
+-- backend/
¦   +-- CasalPlanner.Domain/          # Entidades e exceções de domínio
¦   +-- CasalPlanner.Application/     # DTOs e interfaces de serviço
¦   +-- CasalPlanner.Infrastructure/  # Implementações, MongoDB, providers de preço
¦   +-- CasalPlanner.API/             # Controllers, Program.cs, Dockerfile
¦   +-- CasalPlanner.Tests/           # Testes unitários (xUnit)
¦   +-- KeyGen/                       # CLI para gerar chaves VAPID
+-- frontend/
    +-- src/
    ¦   +-- routes/
    ¦   ¦   +-- index.tsx             # Landing page / Login
    ¦   ¦   +-- login.tsx             # Tela de login
    ¦   ¦   +-- convite.tsx           # Aceite de convite de casal
    ¦   ¦   +-- recuperar-senha.tsx   # Fluxo de recuperação de senha
    ¦   ¦   +-- _authenticated/
    ¦   ¦       +-- inicio.tsx        # Dashboard principal
    ¦   ¦       +-- planejamento.tsx  # Gestão do enxoval
    ¦   ¦       +-- perfil.tsx        # Configurações de conta
    ¦   +-- components/
    ¦   ¦   +-- planejamento/         # AddItemWizard, ItemFormModal, etc.
    ¦   ¦   +-- auth/                 # Forms de login e registro
    ¦   ¦   +-- layout/               # Sidebar, BottomNav, Header
    ¦   ¦   +-- ui/                   # Design system (Button, Input, Dialog...)
    ¦   +-- services/                 # Camada de chamadas à API REST
    ¦   +-- lib/                      # Cliente HTTP, auth-context, formatters
    ¦   +-- hooks/                    # usePWA, useMobile, useReducedMotion
    +-- public/                       # manifest.json, service worker, ícones
    +-- e2e/                          # Testes end-to-end (Playwright)
```

---

## ?? Endpoints da API

### Autenticação (`/api/auth`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/login` | Login local |
| POST | `/google` | Login/registro via Google OAuth |
| POST | `/logout` | Logout |
| GET | `/me` | Dados do usuário autenticado |

### Usuário (`/api/usuario`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/registrar` | Registro individual |
| POST | `/registrar-casal` | Registro como casal |
| PUT | `/perfil-casal/{id}` | Edição de perfil casal |
| PUT | `/perfil` | Edição de perfil individual |
| PUT | `/modo-escuro/{id}` | Alternar modo escuro |
| POST | `/alterar-senha` | Troca de senha |
| DELETE | `/usuario/{id}` | Excluir conta |
| POST | `/convite` | Convidar parceiro(a) por e-mail |
| POST | `/aceitar-convite` | Aceitar convite e virar conta casal |
| GET | `/push/vapidPublicKey` | Chave VAPID pública |
| POST | `/push/subscribe` | Inscrever em notificações push |

### Recuperação de Senha (`/api/recuperarsenha`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/esqueci-senha` | Solicitar código |
| POST | `/validar-codigo` | Validar código recebido |
| POST | `/redefinir-senha` | Definir nova senha |

### Categorias (`/api/categorias`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar categorias |
| POST | `/` | Criar categoria |
| PUT | `/{id}` | Editar categoria |
| DELETE | `/{id}` | Excluir categoria |
| PUT | `/reordenar` | Reordenar categorias |

### Itens (`/api/itens`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Listar todos os itens |
| GET | `/page` | Listar com paginação e filtros |
| POST | `/` | Criar item |
| PUT | `/{id}` | Editar item |
| PATCH | `/{id}/comprado` | Toggle status "comprado" |
| PUT | `/{id}/categoria` | Mover item entre cômodos |
| DELETE | `/{id}` | Excluir item |

### Resumo (`/api/resumo`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Totais, progresso, VR/VA e meta do enxoval |

### Pesquisa de Preços (`/api/pesquisaprecos`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Buscar preços em múltiplos provedores |

### IA / Groq (`/api/groq`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/sugestoes-comodo` | Sugerir itens faltantes por cômodo |
| POST | `/detectar-duplicata` | Detectar item redundante |
| GET | `/estimativa-comodo` | Estimar orçamento por cômodo/cidade |
| POST | `/dominios` | Descobrir domínio/logo de lojas |

> ?? Todos os endpoints (exceto login, registro, Google, recuperação de senha e health check) exigem **JWT Bearer**. Rate limiting aplicado por IP.

### Health Check
`GET /health` — status da API, ambiente e origens CORS permitidas.

---

## ?? Testes

- **Backend**: testes unitários em xUnit (`CasalPlanner.Tests`) cobrindo helpers de texto/preço e o serviço de pesquisa de preços.
- **Frontend**: testes end-to-end com Playwright (`frontend/e2e`).

---

## ?? Rodando Localmente

### Backend

```bash
cd backend/CasalPlanner.API
# Configure appsettings.Development.json com:
# - MongoDB connection string
# - Groq API key
# - SerpAPI key
# - Resend API key
# - Google OAuth credentials
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ?? Autor

Feito com ?? por **Matheus**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/matheus-rafael-50a676219)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MatheusRafaDev)

---

Se este projeto te ajudou ou te inspirou, deixa uma ? no repositório!
