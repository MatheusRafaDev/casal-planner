# 🏠 Casal Planner

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/.NET-8.0-512bd4?style=for-the-badge&logo=dotnet" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47a248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker" />
</p>

> **Organize as compras da sua nova casa junto com quem você ama.**  
> Aplicação full-stack para controle de orçamento doméstico por cômodo, com separação de pagamentos e pesquisa inteligente de preços com IA.

## 🔗 Acesse o projeto

👉 https://casalplanner.vercel.app/

---

## 🔐 Variáveis de Ambiente

| Categoria | Variáveis |
|----------|----------|
| **Ambiente** | ASPNETCORE_ENVIRONMENT |
| **Autenticação (JWT)** | JWT_SECRET_KEY, JWT_ISSUER, JWT_AUDIENCE, JWT_EXPIRES_IN |
| **APIs externas** | GROQ_API_KEY, SERPAPI_KEY |
| **IA config** | IA_CALL_DELAY_MS, MAX_PRODUCTS_TO_PROCESS |
| **Banco de Dados** | MONGODB_CONNECTION_STRING, MONGODB_DATABASE |
| **CORS** | MEU_FRONTEND_URL |
| **SMTP (opcional)** | SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS |

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Autor](#-autor)

---

## 🎯 Sobre o Projeto

O **Casal Planner** nasceu de uma necessidade real: organizar as compras de quem está montando a primeira casa. O app permite que duas pessoas (ou uma só) planejem, acompanhem e controlem gastos domésticos de forma colaborativa, com suporte a dois tipos de pagamento dinheiro normal e VR/VA e um painel de pesquisa de preços que usa IA para validar produtos e lojas em tempo real.

**Público-alvo:**
- Casais montando a primeira casa
- Pessoas que querem organizar compras domésticas por ambiente
- Quem precisa controlar orçamento familiar com separação VR/VA

---

## ✨ Funcionalidades

### 👥 Gestão de Usuários
- Conta individual ou conta casal (dois logins separados, um casal)
- Autenticação via **JWT** com cookies `HttpOnly` e `SameSite=Strict`
- Senhas criptografadas com **BCrypt**
- Edição de perfil: nome, CPF, data de nascimento, renda mensal
- Troca de senha com verificação da senha atual
- Exclusão de conta

### 🏷️ Categorias (Cômodos)
- CRUD completo de categorias personalizadas
- 5 categorias padrão criadas automaticamente: **Cozinha, Sala, Quarto, Banheiro, Lavanderia**
- Personalize nome, ícone emoji e cor de fundo
- Reordenação por **drag-and-drop**
- Categorias padrão protegidas contra edição/exclusão

### 📦 Itens
- CRUD completo de itens dentro de cada categoria
- Campos: nome, marca, preço, quantidade, tipo de pagamento
- Tipos de pagamento: **Normal** ou **VR/VA**
- Marque itens como comprados com toggle rápido
- Mova itens entre categorias via **drag-and-drop**
- Filtro por tipo de pagamento

### 💰 Resumo Financeiro
- Total geral de todos os itens
- Total VR/VA (itens elegíveis a vale)
- Total Normal (pagamento convencional)
- Contagem de itens comprados vs. pendentes

### 🔍 Pesquisa de Preços com IA
- Busca de preços em lojas online via **SerpAPI**
- **Validação inteligente de produtos e lojas** com LLM (Groq / Llama 3.1)
- Identificação automática de marca
- Filtragem de produtos usados/recondicionados
- Classificação de lojas confiáveis vs. marketplaces
- Exibição de logos das lojas

### 🎨 Experiência de Uso
- Modo escuro / claro
- Interface responsiva (mobile-first)
- Navegação por bottom bar no mobile
- Animações e transições suaves com Styled Components

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | Biblioteca principal |
| React Router | v6 | Navegação SPA |
| Styled Components | — | Estilização CSS-in-JS |
| React DnD / dnd-kit | — | Drag-and-drop |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| ASP.NET Core | 8.0 | API RESTful |
| JWT Bearer | — | Autenticação |
| BCrypt.Net | — | Hashing de senhas |
| HttpClient | — | Integração com APIs externas |

### Banco de Dados
| Tecnologia | Uso |
|---|---|
| MongoDB 7.0 | Armazenamento NoSQL principal |
| MongoDB Driver (.NET) | Acesso ao banco via C# |

### Integrações Externas
| Serviço | Uso |
|---|---|
| **Groq API** (Llama 3.1 8B) | Validação inteligente de produtos e lojas |
| **SerpAPI** | Pesquisa de preços em e-commerces |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| Docker | Containerização do backend |
| Docker Compose | Orquestração local |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  Auth /  │  │ Planner  │  │  Pesquisa de Preços    │ │
│  │  Perfil  │  │ (Itens + │  │  (SerpAPI + IA Groq)   │ │
│  │          │  │  Categ.) │  │                        │ │
│  └──────────┘  └──────────┘  └────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / REST + JWT Cookie
┌───────────────────────▼─────────────────────────────────┐
│                 BACKEND (ASP.NET Core 8)                 │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐ │
│  │   Auth     │  │  Business  │  │   PesquisaPreços    │ │
│  │ Controller │  │  Services  │  │   Controller + Groq │ │
│  └────────────┘  └─────┬──────┘  └─────────────────────┘ │
└────────────────────────┼────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │     MongoDB 7.0     │
              │  (Usuários, Itens,  │
              │   Categorias,       │
              │   Histórico Mensal) │
              └─────────────────────┘
```

## 👤 Autor

Feito com ❤️ por **Matheus**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/matheus-rafael-50a676219)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MatheusRafaDev)

---

<p align="center">
  Se este projeto te ajudou ou te inspirou, deixa uma ⭐ no repositório!
</p>
