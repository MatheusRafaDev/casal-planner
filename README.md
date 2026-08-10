# Casal Planner

<div align="center">

> **Organize as compras da casa nova junto com quem voce ama.**

App full-stack para planejamento de enxoval domestico por comodo, com divisao de pagamento entre o casal, pesquisa de precos com IA e PWA instalavel.

[![Deploy Status](https://img.shields.io/badge/deploy-live-brightgreen?style=for-the-badge)](https://casalplanner.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Acesse agora: [casalplanner.vercel.app](https://casalplanner.vercel.app/)**

</div>

---

## Indice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Rodando Localmente](#rodando-localmente)
- [Autor](#autor)

---

## Sobre o Projeto

O **Casal Planner** nasceu de uma necessidade real: organizar as compras de quem esta montando a primeira casa. O app permite que duas pessoas (ou uma so) planejem, acompanhem e controlem gastos domesticos de forma colaborativa, com suporte a pagamento normal e VR/VA, divisao de valores entre o casal, e um painel de pesquisa de precos que usa IA para validar produtos e comparar lojas em tempo real.

**Publico-alvo:**
- Casais montando a primeira casa
- Pessoas que querem organizar compras domesticas por ambiente
- Quem precisa controlar orcamento com separacao VR/VA e divisao de despesas

---

## Funcionalidades

### Dashboard — Inicio

A pagina inicial e o painel central do app, mostrando uma visao geral de tudo que foi planejado:

- **Cards de resumo financeiro**: total gasto, total pendente, itens comprados e progresso da meta
- **Barra de progresso da meta**: comparacao visual entre o total gasto e a meta de orcamento configurada
- **Resumo por tipo de pagamento**: gastos separados em Dinheiro vs. VR/VA com cards individuais
- **Resumo por comodo**: lista com valor total, itens comprados e alertas de orcamento estourado
- **Graficos de gastos**: visualizacao do enxoval por comodo com ApexCharts/Recharts

---

### Planejamento — Controle do Enxoval

A pagina principal do app. Toda a gestao do enxoval acontece aqui.

#### Comodos (Categorias)

- Crie quantos comodos quiser (Sala, Cozinha, Quarto, Banheiro, etc.)
- **Icone personalizado** para cada comodo (mais de 20 icones disponiveis)
- **Cor personalizada** do comodo
- **Meta de orcamento por comodo**: defina um teto de gasto e acompanhe visualmente
- **Alerta de orcamento estourado**: icone e destaque visual quando o gasto ultrapassa a meta
- Sidebar no desktop com totais por comodo e barra de progresso inline
- Select dropdown no mobile para trocar de comodo

#### Itens — Wizard em 3 etapas

Para adicionar itens de forma guiada e rapida:

1. **Etapa 1 — Identificacao**: nome do item com autocomplete de sugestoes, comodo e quantidade
2. **Etapa 2 — Pesquisa de precos**: resultados em tempo real de multiplos e-commerces
3. **Etapa 3 — Confirmacao**: resumo completo com foto, preco, parcelamento e divisao

Cada item possui:
- Nome, marca e loja
- Preco unitario e quantidade
- Parcelas (1x a 12x) com calculo automatico por parcela
- Forma de pagamento: **Dinheiro** ou **VR / VA**
- Prioridade: Alta, Media ou Baixa
- Origem: **Sera comprado** ou **Ganho / Presente**
- Link do produto externo
- Foto do produto (upload manual ou captura por camera)

#### Filtros e Busca

- **Busca por texto**: filtra por nome do item ou marca em tempo real
- **Filtro por status**: Todos / Faltando / Comprados / Presentes
- **Filtro por pagamento**: Qualquer / Dinheiro / VR-VA
- **Filtro por responsavel** (conta casal): filtrar itens de uma pessoa especifica

#### Exportacao

- **Exportar PDF**: relatorio completo dos itens pendentes com tabela formatada
- **Compartilhar lista**: via Web Share API (WhatsApp, etc.) ou copia para o clipboard

---

### IA Integrada (Groq + Llama 3.1)

| Feature | Como funciona |
|---|---|
| **Identificacao por foto** | Tire uma foto de um produto ou nota fiscal — a IA identifica nome, marca, loja e preco automaticamente |
| **Autocomplete inteligente** | Sugestoes de itens comuns conforme voce digita |
| **Deteccao de duplicata** | Antes de cadastrar, a IA verifica se ja existe um item similar no mesmo comodo |
| **Sugestoes por comodo** | A IA sugere itens que podem estar faltando baseado no comodo selecionado |
| **Pesquisa de precos** | Busca paralela em Google Shopping, Mercado Livre e Amazon com validacao via IA |
| **Logo das lojas** | Descobre automaticamente o dominio e logo das marcas/lojas dos itens |

---

### Divisao de Pagamento (conta casal)

Para contas casal, e possivel em cada item:

- **Definir um responsavel**: quem vai comprar (Pessoa 1 ou Pessoa 2)
- **Dividir o custo**: especificar quanto cada um vai pagar, com botoes rapidos **50/50**, **100/0** e **0/100**
- Validacao automatica: a soma das partes deve ser igual ao total do item

---

### Perfil e Conta

- Edicao de nome, foto de perfil e informacoes do casal
- **Meta global do enxoval**: valor-alvo total para controle financeiro
- Alternar entre modo escuro e claro (persistido na conta)
- Troca de senha com verificacao da senha atual
- Exclusao de conta
- **Convite de parceiro(a)**: envie um convite por e-mail para vincular duas contas em uma conta casal

---

### Autenticacao

- Registro como **conta individual** ou **conta casal**
- Login com e-mail e senha
- **Login social com Google** (OAuth 2.0)
- Recuperacao de senha por codigo enviado ao e-mail (3 etapas: solicitar, validar codigo, redefinir)
- JWT Bearer com refresh de LastLoginAt a cada login
- Senhas com hashing BCrypt

---

### Experiencia de Uso

- **PWA instalavel**: adicione ao celular como app nativo (manifest + service worker)
- **Modo escuro** completo com paleta calibrada em oklch
- **Design responsivo** mobile-first: bottom navigation bar no mobile, sidebar e header adaptados para tablet e desktop
- **Atualizacoes otimistas**: modais fecham imediatamente ao salvar, sem travar aguardando o servidor
- **Autofill respeitado**: campos preenchidos pelo navegador seguem o tema dark do app
- **Notificacoes Push** (Web Push / VAPID): suporte a notificacoes nativas no browser

---

## Tecnologias

### Frontend

| Tecnologia | Uso |
|---|---|
| **React 19** | Biblioteca principal |
| **TanStack Router** | Roteamento file-based com type safety |
| **TanStack Query** | Cache, sincronizacao e optimistic updates |
| **TypeScript** | Tipagem estatica em todo o projeto |
| **Tailwind CSS v4** | Estilizacao com design system proprio |
| **Radix UI / shadcn** | Componentes acessiveis e personalizaveis |
| **Framer Motion** | Animacoes com suporte a reduced motion |
| **ApexCharts + Recharts** | Graficos de gastos |
| **jsPDF + jspdf-autotable** | Exportacao de relatorios em PDF |
| **Sonner** | Toast notifications |
| **Zod** | Validacao de esquemas |
| **Vite** | Build tool ultrarapido |
| **Playwright** | Testes end-to-end |

### Backend

| Tecnologia | Uso |
|---|---|
| **ASP.NET Core 8** | API RESTful |
| **JWT Bearer** | Autenticacao stateless |
| **BCrypt.Net** | Hashing seguro de senhas |
| **Google.Apis.Auth** | Validacao de login social Google |
| **WebPush (VAPID)** | Notificacoes push nativas |
| **Serilog** | Logging estruturado |
| **AspNetCoreRateLimit** | Rate limiting por IP e por rota |
| **Swagger / OpenAPI** | Documentacao interativa (dev) |

### Banco de Dados

| Tecnologia | Uso |
|---|---|
| **MongoDB 7.0** | Armazenamento NoSQL principal |
| **MongoDB Driver (.NET)** | Acesso ao banco via C# |

Indices otimizados para consultas por usuario, categoria, data de criacao, e-mails de conta casal, tokens de reset e convite.

### Integracoes Externas

| Servico | Uso |
|---|---|
| **Groq API** (Llama 3.1 8B) | Identificacao por foto, sugestoes, deteccao de duplicata |
| **SerpAPI / Google Shopping** | Pesquisa de precos |
| **Mercado Livre API** | Pesquisa de precos no ML |
| **Amazon** | Pesquisa de precos na Amazon |
| **Resend / SMTP** | E-mails transacionais (recuperacao de senha, convite) |
| **Google OAuth** | Login social |

### Infraestrutura

| Tecnologia | Uso |
|---|---|
| **Docker** (multi-stage build) | Containerizacao do backend |
| **Vercel** | Deploy do frontend com CI/CD automatico |

---

## Arquitetura

O backend segue **Clean Architecture**, com 4 projetos e dependencias sempre apontando para dentro:

`
CasalPlanner.API  -->  CasalPlanner.Infrastructure --> CasalPlanner.Application --> CasalPlanner.Domain
`

- **Domain** — entidades puras (Usuario, Item, Categoria, CasalInfo) e excecoes de dominio
- **Application** — DTOs e interfaces de servico (IAuthService, IItemService, IPesquisaPrecosService)
- **Infrastructure** — implementacoes concretas, MongoDbContext e providers de preco
- **API** — composition root: Controllers, middlewares, Program.cs, JWT/CORS/rate limit

`
+----------------------------------------------------------+
|              FRONTEND (React 19 + TanStack)              |
|  +----------+  +----------------+  +------------------+  |
|  |  Auth /  |  | Planejamento   |  | Pesquisa Precos  |  |
|  |  Perfil  |  | Itens + Comodos|  | + IA (Groq)      |  |
|  +----------+  +----------------+  +------------------+  |
+------------------------+---------------------------------+
                         | HTTP / REST + JWT Bearer
+------------------------v---------------------------------+
|               BACKEND (ASP.NET Core 8)                   |
|  +------------+  +-----------------+  +---------------+  |
|  | Auth /     |  | Itens /         |  | Pesquisa +    |  |
|  | Usuario    |  | Categorias /    |  | Groq (IA)     |  |
|  +------------+  +--------+--------+  +-------+-------+  |
+---------------------------+-------------------+----------+
                            |                   |
               +------------+----+   +----------+-----------+
               |   MongoDB 7.0   |   | Groq / SerpAPI /     |
               | (Usuarios,      |   | Google Shopping /    |
               |  Itens, Comodos)|   | Mercado Livre        |
               +-----------------+   +----------------------+
`

---

## Estrutura do Projeto

`
casal-planner/
+-- backend/
|   +-- CasalPlanner.Domain/          # Entidades e excecoes de dominio
|   +-- CasalPlanner.Application/     # DTOs e interfaces de servico
|   +-- CasalPlanner.Infrastructure/  # Implementacoes, MongoDB, providers de preco
|   +-- CasalPlanner.API/             # Controllers, Program.cs, Dockerfile
|   +-- CasalPlanner.Tests/           # Testes unitarios (xUnit)
|   +-- KeyGen/                       # CLI para gerar chaves VAPID
+-- frontend/
    +-- src/
    |   +-- routes/
    |   |   +-- index.tsx             # Landing page / Login
    |   |   +-- login.tsx             # Tela de login
    |   |   +-- convite.tsx           # Aceite de convite de casal
    |   |   +-- recuperar-senha.tsx   # Fluxo de recuperacao de senha
    |   |   +-- _authenticated/
    |   |       +-- inicio.tsx        # Dashboard principal
    |   |       +-- planejamento.tsx  # Gestao do enxoval
    |   |       +-- perfil.tsx        # Configuracoes de conta
    |   +-- components/
    |   |   +-- planejamento/         # AddItemWizard, ItemFormModal, etc.
    |   |   +-- auth/                 # Forms de login e registro
    |   |   +-- layout/               # Sidebar, BottomNav, Header
    |   |   +-- ui/                   # Design system (Button, Input, Dialog...)
    |   +-- services/                 # Camada de chamadas a API REST
    |   +-- lib/                      # Cliente HTTP, auth-context, formatters
    |   +-- hooks/                    # usePWA, useMobile, useReducedMotion
    +-- public/                       # manifest.json, service worker, icones
    +-- e2e/                          # Testes end-to-end (Playwright)
`

---

## Endpoints da API

### Autenticacao (/api/auth)
| Metodo | Rota | Descricao |
|---|---|---|
| POST | /login | Login local |
| POST | /google | Login/registro via Google OAuth |
| POST | /logout | Logout |
| GET | /me | Dados do usuario autenticado |

### Usuario (/api/usuario)
| Metodo | Rota | Descricao |
|---|---|---|
| POST | /registrar | Registro individual |
| POST | /registrar-casal | Registro como casal |
| PUT | /perfil-casal/{id} | Edicao de perfil casal |
| PUT | /perfil | Edicao de perfil individual |
| PUT | /modo-escuro/{id} | Alternar modo escuro |
| POST | /alterar-senha | Troca de senha |
| DELETE | /usuario/{id} | Excluir conta |
| POST | /convite | Convidar parceiro(a) por e-mail |
| POST | /aceitar-convite | Aceitar convite e virar conta casal |
| GET | /push/vapidPublicKey | Chave VAPID publica |
| POST | /push/subscribe | Inscrever em notificacoes push |

### Recuperacao de Senha (/api/recuperarsenha)
| Metodo | Rota | Descricao |
|---|---|---|
| POST | /esqueci-senha | Solicitar codigo |
| POST | /validar-codigo | Validar codigo recebido |
| POST | /redefinir-senha | Definir nova senha |

### Categorias (/api/categorias)
| Metodo | Rota | Descricao |
|---|---|---|
| GET | / | Listar categorias |
| POST | / | Criar categoria |
| PUT | /{id} | Editar categoria |
| DELETE | /{id} | Excluir categoria |
| PUT | /reordenar | Reordenar categorias |

### Itens (/api/itens)
| Metodo | Rota | Descricao |
|---|---|---|
| GET | / | Listar todos os itens |
| GET | /page | Listar com paginacao e filtros |
| POST | / | Criar item |
| PUT | /{id} | Editar item |
| PATCH | /{id}/comprado | Toggle status comprado |
| PUT | /{id}/categoria | Mover item entre comodos |
| DELETE | /{id} | Excluir item |

### Resumo (/api/resumo)
| Metodo | Rota | Descricao |
|---|---|---|
| GET | / | Totais, progresso, VR/VA e meta do enxoval |

### Pesquisa de Precos (/api/pesquisaprecos)
| Metodo | Rota | Descricao |
|---|---|---|
| GET | / | Buscar precos em multiplos provedores |

### IA / Groq (/api/groq)
| Metodo | Rota | Descricao |
|---|---|---|
| GET | /sugestoes-comodo | Sugerir itens faltantes por comodo |
| POST | /detectar-duplicata | Detectar item redundante |
| GET | /estimativa-comodo | Estimar orcamento por comodo/cidade |
| POST | /dominios | Descobrir dominio/logo de lojas |

> Todos os endpoints (exceto login, registro, Google, recuperacao de senha e health check) exigem **JWT Bearer**. Rate limiting aplicado por IP.

### Health Check
GET /health — status da API, ambiente e origens CORS permitidas.

---

## Testes

- **Backend**: testes unitarios em xUnit (CasalPlanner.Tests) cobrindo helpers de texto/preco e o servico de pesquisa de precos.
- **Frontend**: testes end-to-end com Playwright (frontend/e2e).

---

## Rodando Localmente

### Backend

`ash
cd backend/CasalPlanner.API
dotnet run
`

> Configure appsettings.Development.json com: MongoDB connection string, Groq API key, SerpAPI key, Resend API key e credenciais Google OAuth.

### Frontend

`ash
cd frontend
npm install
npm run dev
`

---

## Autor

Feito com muito cuidado por **Matheus**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/matheus-rafael-50a676219)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MatheusRafaDev)

---

Se este projeto te ajudou ou te inspirou, deixa uma estrela no repositorio!