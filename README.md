# 🏠 Casal Planner

> **Organize as compras da casa nova junto com quem você ama.**
> App full-stack para controle de orçamento doméstico por cômodo, com divisão de pagamento entre o casal, pesquisa de preços com IA e PWA instalável.

👉 **Acesse:** https://casalplanner.vercel.app/

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#️-tecnologias)
- [Arquitetura](#️-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Testes](#-testes)
- [Autor](#-autor)

---

## 🎯 Sobre o Projeto

O **Casal Planner** nasceu de uma necessidade real: organizar as compras de quem está montando a primeira casa. O app permite que duas pessoas (ou uma só) planejem, acompanhem e controlem gastos domésticos de forma colaborativa — com suporte a pagamento normal e VR/VA, divisão de valores entre o casal, e um painel de pesquisa de preços que usa IA para validar produtos e comparar lojas em tempo real.

**Público-alvo:**
- Casais montando a primeira casa
- Pessoas que querem organizar compras domésticas por ambiente
- Quem precisa controlar orçamento familiar com separação VR/VA e divisão de despesas

---

## ✨ Funcionalidades

### 👥 Gestão de Usuários
- Conta individual ou conta casal (dois e-mails vinculados a uma única conta)
- Login local (e-mail/senha) e **login social com Google**
- Convite de parceiro(a) por e-mail para virar conta casal
- Autenticação via **JWT**, com renovação de `LastLoginAt` a cada login
- Senhas com hashing **BCrypt**
- Recuperação de senha por código/token, com e-mail transacional
- Edição de perfil individual e de perfil casal
- Alternância de modo escuro/claro persistida no perfil
- Exclusão de conta

### 🏷️ Categorias (Cômodos)
- CRUD completo de categorias personalizadas
- Categorias padrão protegidas contra edição/exclusão
- Personalização de nome, ícone e cor
- Reordenação de categorias (endpoint dedicado `PUT /reordenar`)

### 📦 Itens
- CRUD completo de itens dentro de cada categoria, com paginação (`GET /api/itens/page`)
- Campos: nome, marca, preço, quantidade, parcelas, loja, link do produto, foto
- Pagamento **Normal** ou **VR/VA**
- Prioridade do item
- **Variantes de produto** (ex.: cor/tamanho) com variante selecionada
- **Divisão de pagamento entre o casal** (valor por pessoa)
- Toggle rápido de "comprado"
- Mover item entre categorias sem recriar o registro
- Rastreio de origem do item (comprado manualmente vs. sugerido pela IA)

### 💰 Resumo Financeiro
- Totais gerais, por tipo de pagamento (Normal/VR-VA) e por categoria
- Progresso de itens comprados vs. pendentes
- Acompanhamento de meta de orçamento do enxoval

### 🔍 Pesquisa de Preços com IA
- Busca paralela em múltiplos provedores (Google Shopping, Mercado Livre, Amazon — habilitáveis via configuração)
- **Validação inteligente do produto** via Groq (Llama 3.1): identifica marca e normaliza o nome buscado
- Deduplicação de resultados por similaridade de texto, mantendo o menor preço
- Pontuação (score) por confiabilidade da loja, avaliação, uso do produto etc.
- **Cache em memória** da pesquisa (chave bruta + normalizada) para reduzir custo de chamadas pagas (Groq/SerpAPI)
- Descoberta automática de domínio/logo das lojas

### 🤖 Outras Features de IA (Groq)
- Sugestão de itens faltantes por cômodo
- Detecção de item duplicado/redundante antes de cadastrar
- Estimativa de orçamento por cômodo e cidade
- Geração de um resumo textual do progresso do enxoval do casal

### 🔔 Notificações Push (Web Push / VAPID)
- Inscrição do navegador para push notifications
- Chaves VAPID geradas por uma ferramenta de linha de comando própria (`KeyGen`)

### 🎨 Experiência de Uso
- **PWA instalável** (manifest + service worker), com hook próprio de detecção de instalação
- Modo escuro / claro
- Interface responsiva mobile-first, com navegação por bottom bar
- Exportação de relatórios em **PDF** (jsPDF)
- Gráficos de gastos (ApexCharts / Recharts)
- Animações com Framer Motion, com suporte a "reduced motion"

---

## 🛠️ Tecnologias

### Frontend

| Tecnologia | Uso |
| --- | --- |
| React 19 | Biblioteca principal |
| TanStack Start + TanStack Router | Framework full-stack e roteamento file-based |
| TanStack Query | Cache e sincronização de dados assíncronos |
| TypeScript | Tipagem estática |
| Tailwind CSS v4 | Estilização utilitária |
| Radix UI / shadcn-style components | Componentes acessíveis |
| Framer Motion | Animações |
| ApexCharts + Recharts | Gráficos |
| jsPDF + jspdf-autotable | Exportação de relatórios em PDF |
| Zod | Validação de esquemas |
| Vite | Build tool |
| Playwright | Testes end-to-end |

### Backend

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| ASP.NET Core | 8.0 (runtime .NET 9 na imagem Docker) | API RESTful |
| JWT Bearer | — | Autenticação |
| BCrypt.Net | — | Hashing de senhas |
| Google.Apis.Auth | — | Validação de login social Google |
| WebPush (VAPID) | — | Notificações push |
| Serilog | — | Logging estruturado |
| AspNetCoreRateLimit | — | Rate limiting por IP e por rota |
| Swagger / OpenAPI | — | Documentação da API (ambiente de desenvolvimento) |

### Banco de Dados

| Tecnologia | Uso |
| --- | --- |
| MongoDB 7.0 | Armazenamento NoSQL principal |
| MongoDB Driver (.NET) | Acesso ao banco via C# |

Índices dedicados para consultas por usuário, categoria, data de criação, e-mails de conta casal, tokens de reset de senha e convite de parceiro.

### Integrações Externas

| Serviço | Uso |
| --- | --- |
| **Groq API** (Llama 3.1 8B) | Validação de produtos, sugestões, detecção de duplicata, estimativas e resumo do enxoval |
| **SerpAPI / Google Shopping / Mercado Livre / Amazon** | Pesquisa de preços em e-commerces |
| **Resend / SMTP** | Envio de e-mails transacionais (recuperação de senha, convite) |
| **Google OAuth** | Login social |

### Infraestrutura

| Tecnologia | Uso |
| --- | --- |
| Docker (multi-stage build) | Containerização do backend |
| Vercel | Deploy do frontend |

---

## 🏗️ Arquitetura

O backend segue **Clean Architecture**, com 4 projetos e dependências apontando sempre para dentro:

```
CasalPlanner.API  ──depends on──▶  CasalPlanner.Infrastructure ──┐
        │                                                        ├──▶ CasalPlanner.Application ──▶ CasalPlanner.Domain
        └──────────────────depends on───────────────────────────┘
```

- **Domain** — entidades puras (`Usuario`, `Item`, `Categoria`, `ItemVariante`, `CasalInfo`) e exceções de domínio. Sem dependência de framework, exceto atributos de serialização Bson.
- **Application** — DTOs e interfaces de serviço (`IAuthService`, `IItemService`, `IResumoService`, `IEmailService`, `IRecuperarSenhaService`, `IPesquisaPrecosService`, `IPriceProvider`). É o contrato que os Controllers deveriam enxergar.
- **Infrastructure** — implementações concretas (`AuthService`, `ItemService`, `ResumoService`, `EmailService`, `RecuperarSenhaService`, `GroqService`, `PesquisaPrecosService`, providers de preço) e o `MongoDbContext`.
- **API** — composition root: Controllers, middlewares, `Program.cs`, configuração de JWT/CORS/rate limit/segurança.

> ⚠️ Alguns Controllers (`AuthController`, `CategoriasController`, `GroqController`, `RecuperarSenhaController`, `UsuarioController`) ainda acessam o `MongoDbContext` diretamente para consultas ad-hoc, além dos Services — um ponto de melhoria conhecido para se aproximar de uma Clean Architecture mais estrita.

```
┌───────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + TanStack Start)            │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────────┐  │
│  │  Auth /  │  │  Planejamento │  │  Pesquisa de Preços +       │  │
│  │  Perfil  │  │  (Itens +     │  │  Sugestões de IA (Groq)     │  │
│  │          │  │   Categorias) │  │                             │  │
│  └──────────┘  └──────────────┘  └─────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                                │ HTTP / REST + JWT Bearer
┌──────────────────────────────▼──────────────────────────────────┐
│                     BACKEND (ASP.NET Core 8)                     │
│  ┌────────────┐  ┌───────────────┐  ┌──────────────────────────┐│
│  │   Auth /   │  │   Itens /     │  │   Pesquisa de Preços +   ││
│  │  Usuario   │  │  Categorias / │  │   Groq (IA)              ││
│  │ Controller │  │   Resumo      │  │                          ││
│  └────────────┘  └───────┬───────┘  └────────────┬─────────────┘│
└──────────────────────────┼───────────────────────┼───────────────┘
                           │                       │
                ┌──────────▼──────────┐   ┌────────▼─────────┐
                │     MongoDB 7.0     │   │  Groq / SerpAPI / │
                │ (Usuários, Itens,   │   │  Google Shopping /│
                │  Categorias)        │   │  Mercado Livre    │
                └─────────────────────┘   └───────────────────┘
```

---

## 📁 Estrutura do Projeto

```
casal-planner/
├── backend/
│   ├── CasalPlanner.Domain/          # Entidades e exceções
│   ├── CasalPlanner.Application/     # DTOs e interfaces
│   ├── CasalPlanner.Infrastructure/  # Implementações, MongoDB, providers de preço
│   ├── CasalPlanner.API/             # Controllers, Program.cs, Dockerfile
│   ├── CasalPlanner.Tests/           # Testes unitários (xUnit)
│   └── KeyGen/                       # Utilitário CLI para gerar chaves VAPID
└── frontend/
    ├── src/
    │   ├── routes/                   # Rotas file-based (TanStack Router)
    │   ├── components/                # Componentes de auth, layout, planejamento e UI
    │   ├── services/                  # Camada de chamadas à API
    │   ├── lib/                       # Cliente HTTP, contexto de auth/tema, formatters
    │   └── hooks/                     # Hooks (PWA, mobile, reduced motion)
    ├── public/                        # manifest.json, service worker
    └── e2e/                           # Testes end-to-end (Playwright)
```

---

## 📡 Endpoints da API

### Autenticação (`/api/auth`)
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/login` | Login local (individual ou casal) |
| POST | `/google` | Login/registro via Google OAuth |
| POST | `/logout` | Logout |
| GET | `/me` | Dados do usuário autenticado |

### Usuário (`/api/usuario`)
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/registrar` | Registro individual |
| POST | `/registrar-casal` | Registro como casal |
| GET | `/me` | Perfil do usuário logado |
| PUT | `/perfil-casal/{id}` | Edição de perfil casal |
| PUT | `/perfil` | Edição de perfil individual |
| PUT | `/modo-escuro/{id}` | Alternar modo escuro |
| POST | `/alterar-senha` | Troca de senha (com verificação da atual) |
| DELETE | `/usuario/{id}` | Excluir conta |
| POST | `/convite` | Convidar parceiro(a) |
| POST | `/aceitar-convite` | Aceitar convite e virar conta casal |
| GET | `/push/vapidPublicKey` | Chave pública VAPID para push |
| POST | `/push/subscribe` | Inscrever navegador em notificações push |

### Recuperação de Senha (`/api/recuperarsenha`)
| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/esqueci-senha` | Solicitar código de recuperação |
| POST | `/validar-codigo` | Validar código recebido |
| POST | `/redefinir-senha` | Definir nova senha |

### Categorias (`/api/categorias`)
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/` | Listar categorias |
| GET | `/{id}` | Detalhe de uma categoria |
| POST | `/` | Criar categoria |
| PUT | `/{id}` | Editar categoria |
| DELETE | `/{id}` | Excluir categoria |
| GET | `/usuario` | Categorias do usuário logado |
| PUT | `/reordenar` | Reordenar categorias |

### Itens (`/api/itens`)
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/` | Listar itens |
| GET | `/page` | Listar itens paginados |
| GET | `/{id}` | Detalhe de um item |
| POST | `/` | Criar item |
| PUT | `/{id}` | Editar item |
| PATCH | `/{id}/comprado` | Alternar status "comprado" |
| PUT | `/{id}/categoria` | Mover item entre categorias |
| DELETE | `/{id}` | Excluir item |
| GET | `/categoria/{categoriaId}` | Itens de uma categoria |

### Resumo (`/api/resumo`)
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/` | Resumo financeiro (totais, VR/VA, progresso, meta do enxoval) |

### Pesquisa de Preços (`/api/pesquisaprecos`)
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/` | Buscar preços de um produto em múltiplos provedores |

### IA / Groq (`/api/groq`)
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/sugestoes-comodo` | Sugerir itens faltantes por cômodo |
| POST | `/detectar-duplicata` | Detectar item redundante antes de cadastrar |
| GET | `/estimativa-comodo` | Estimar orçamento por cômodo/cidade |
| GET | `/resumo-enxoval` | Gerar resumo textual do progresso do enxoval |
| POST | `/dominios` | Descobrir domínio/logo de lojas |

> Todos os endpoints (exceto login, registro, Google, recuperação de senha e health check) exigem JWT Bearer. Rate limiting aplicado por IP: rotas de autenticação e pesquisa de preços têm limites mais restritos por consumirem serviços pagos externos.

### Health Check
`GET /health` — status da API, ambiente e origens CORS permitidas.

---

## 🧪 Testes

- **Backend**: testes unitários em xUnit (`CasalPlanner.Tests`) cobrindo helpers de texto/preço e o serviço de pesquisa de preços.
- **Frontend**: testes end-to-end com Playwright (`frontend/e2e`).

> Cobertura de testes ainda é enxuta perto do tamanho do domínio (autenticação, cálculo de resumo financeiro e divisão de pagamento não têm testes dedicados hoje) — é a principal frente aberta para reforçar antes de novas features.


---

## 👤 Autor

Feito com ❤️ por **Matheus**

[LinkedIn](https://linkedin.com/in/matheus-rafael-50a676219) · [GitHub](https://github.com/MatheusRafaDev)

---

Se este projeto te ajudou ou te inspirou, deixa uma ⭐ no repositório!
