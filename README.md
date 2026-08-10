# 🏠 Casal Planner

<div align="center">

### Organize as compras da sua casa nova junto com quem você ama. ❤️

Aplicação full-stack para **planejamento de enxoval doméstico**, organização de compras por cômodo, controle de orçamento, divisão de despesas entre o casal e pesquisa inteligente de produtos utilizando IA.

[![Deploy](https://img.shields.io/badge/Deploy-Live-brightgreen?style=for-the-badge)](https://casalplanner.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-8-512BD4?style=for-the-badge\&logo=dotnet)](https://dotnet.microsoft.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge\&logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)

**🌐 [Acessar o Casal Planner](https://casalplanner.vercel.app/)**

</div>

---

## 📌 Sobre o projeto

O **Casal Planner** foi desenvolvido para facilitar a organização de pessoas que estão montando uma casa, permitindo transformar uma grande lista de compras em um planejamento estruturado por ambientes.

A aplicação centraliza:

* 🛋️ Organização por cômodos
* 🛒 Controle de itens e compras
* 💰 Controle de orçamento
* 💳 Separação entre dinheiro e VR/VA
* 🤝 Divisão de despesas entre duas pessoas
* 🔎 Pesquisa de preços
* 🤖 Recursos de inteligência artificial
* 📷 Identificação de produtos por imagem
* 📄 Exportação de listas em PDF
* 📱 Experiência PWA para dispositivos móveis

O projeto foi pensado para funcionar tanto para **uma pessoa** quanto para **contas compartilhadas entre um casal**.

---

## ✨ Principais funcionalidades

### 📊 Dashboard

O dashboard apresenta uma visão geral do planejamento financeiro e do progresso do enxoval.

* Total gasto
* Total pendente
* Quantidade de itens comprados
* Progresso da meta
* Gastos em dinheiro
* Gastos em VR/VA
* Resumo financeiro por cômodo
* Alertas de orçamento excedido
* Gráficos de gastos

---

### 🏠 Planejamento por cômodos

Os itens são organizados por ambientes da casa.

É possível:

* Criar cômodos personalizados
* Escolher ícones
* Definir cores
* Definir orçamento individual
* Acompanhar o progresso de cada ambiente
* Identificar cômodos que ultrapassaram o orçamento
* Alternar entre cômodos de forma otimizada para desktop e mobile

Exemplos:

```text
🏠 Sala
🍳 Cozinha
🛏️ Quarto
🚿 Banheiro
🧺 Lavanderia
```

---

### 🛒 Cadastro de itens

O cadastro utiliza um fluxo guiado em três etapas:

**1. Identificação**

* Nome do produto
* Autocomplete
* Cômodo
* Quantidade

**2. Pesquisa**

* Pesquisa de preços
* Comparação entre lojas
* Informações do produto
* Foto
* Parcelamento

**3. Confirmação**

* Revisão dos dados
* Forma de pagamento
* Responsável pela compra
* Divisão do valor

Cada item pode armazenar:

* Nome
* Marca
* Loja
* Preço
* Quantidade
* Parcelamento
* Forma de pagamento
* Prioridade
* Origem
* Link externo
* Imagem

---

### 🔎 Busca e filtros

A lista de compras possui filtros para facilitar o gerenciamento do enxoval:

* Busca por nome
* Busca por marca
* Todos os itens
* Itens faltantes
* Itens comprados
* Itens recebidos como presente
* Dinheiro
* VR/VA
* Responsável pela compra

---

## 🤖 Inteligência Artificial

O Casal Planner utiliza **Groq + Llama 3.1** para automatizar tarefas relacionadas ao planejamento das compras.

| Recurso                     | Descrição                                           |
| --------------------------- | --------------------------------------------------- |
| 📷 Identificação por imagem | Identifica produtos e informações a partir de fotos |
| ✨ Autocomplete              | Sugere produtos durante o cadastro                  |
| 🔍 Detecção de duplicidade  | Identifica itens semelhantes já cadastrados         |
| 🏠 Sugestões por cômodo     | Sugere itens que podem estar faltando               |
| 💰 Pesquisa de preços       | Auxilia na comparação de preços                     |
| 🏪 Identificação de lojas   | Descobre domínio e logo de lojas                    |

A IA também é integrada ao fluxo de cadastro para reduzir o trabalho manual e tornar a criação da lista mais rápida.

---

## 💰 Divisão de despesas

Em uma conta compartilhada, cada item pode possuir uma divisão personalizada de pagamento.

Exemplos:

```text
Pessoa 1: R$ 500,00
Pessoa 2: R$ 500,00
-------------------
Total:    R$ 1.000,00
```

Também existem divisões rápidas:

* **50 / 50**
* **100 / 0**
* **0 / 100**

O sistema valida automaticamente se a soma das partes corresponde ao valor total do item.

---

## 💳 Formas de pagamento

Cada compra pode ser classificada como:

* 💵 Dinheiro
* 🟢 VR / VA

O dashboard apresenta os valores separados para facilitar o acompanhamento do orçamento.

---

## 🎁 Presentes

Itens que serão recebidos como presente podem ser diferenciados das compras normais.

Isso permite acompanhar:

* Itens que ainda precisam ser comprados
* Itens já comprados
* Itens recebidos como presente

Dessa forma, o orçamento considera apenas o que realmente representa uma despesa.

---

## 👤 Conta e perfil

O sistema oferece suporte a contas individuais e contas compartilhadas.

### Conta individual

* Nome
* Foto
* Meta global
* Preferência de tema
* Alteração de senha
* Exclusão da conta

### Conta casal

* Vinculação entre usuários
* Convite por e-mail
* Perfil compartilhado
* Responsável por cada compra
* Divisão de despesas

---

## 🔐 Autenticação

O sistema possui autenticação baseada em JWT e suporte a login social.

### Recursos

* Cadastro individual
* Cadastro como casal
* Login com e-mail e senha
* Login com Google OAuth 2.0
* Recuperação de senha
* Código de recuperação enviado por e-mail
* JWT Bearer
* Refresh de `LastLoginAt`
* Hash de senhas utilizando BCrypt
* Rate limiting

---

## 📱 Experiência e PWA

O Casal Planner foi desenvolvido com abordagem **mobile-first**.

### PWA

A aplicação pode ser instalada como aplicativo diretamente pelo navegador.

Inclui:

* Web App Manifest
* Service Worker
* Ícones para instalação
* Experiência otimizada para dispositivos móveis
* Notificações Push

### Responsividade

A interface se adapta a:

* 📱 Smartphones
* 📲 Tablets
* 💻 Notebooks
* 🖥️ Desktops

No mobile, a aplicação utiliza navegação inferior, enquanto desktop e telas maiores utilizam sidebar e header adaptados.

---

## 🔔 Notificações

O projeto possui suporte a notificações push utilizando:

* Web Push
* VAPID
* Service Worker

Isso permite que eventos importantes sejam comunicados ao usuário diretamente pelo navegador.

---

## 📄 Exportação e compartilhamento

As listas podem ser exportadas e compartilhadas.

### PDF

Geração de relatório contendo:

* Itens
* Quantidades
* Valores
* Status
* Informações da compra

### Compartilhamento

Utiliza a **Web Share API** quando disponível, permitindo compartilhar a lista através de aplicativos como WhatsApp.

Também existe suporte a cópia para o clipboard.

---

# 🧰 Tecnologias

## Frontend

| Tecnologia            | Utilização                     |
| --------------------- | ------------------------------ |
| **React 19**          | Interface da aplicação         |
| **TypeScript**        | Tipagem estática               |
| **TanStack Router**   | Roteamento type-safe           |
| **TanStack Query**    | Cache e sincronização de dados |
| **Tailwind CSS 4**    | Estilização                    |
| **Radix UI / shadcn** | Componentes acessíveis         |
| **Framer Motion**     | Animações                      |
| **ApexCharts**        | Visualização de dados          |
| **Recharts**          | Gráficos                       |
| **Zod**               | Validação de dados             |
| **Sonner**            | Notificações                   |
| **jsPDF**             | Exportação PDF                 |
| **Vite**              | Build e desenvolvimento        |
| **Playwright**        | Testes E2E                     |

---

## Backend

| Tecnologia              | Utilização          |
| ----------------------- | ------------------- |
| **ASP.NET Core 8**      | API REST            |
| **C#**                  | Linguagem principal |
| **JWT Bearer**          | Autenticação        |
| **BCrypt.Net**          | Hash de senhas      |
| **Google.Apis.Auth**    | Google OAuth        |
| **WebPush**             | Notificações        |
| **Serilog**             | Logging estruturado |
| **AspNetCoreRateLimit** | Rate limiting       |
| **Swagger / OpenAPI**   | Documentação da API |

---

## Banco de dados

| Tecnologia                  | Utilização               |
| --------------------------- | ------------------------ |
| **MongoDB 7**               | Banco de dados principal |
| **MongoDB Driver for .NET** | Comunicação com o banco  |

O banco possui índices para otimizar consultas relacionadas a:

* Usuários
* Categorias
* Itens
* Datas
* E-mails
* Convites
* Tokens de recuperação

---

## 🔌 Integrações

| Serviço                       | Utilização                           |
| ----------------------------- | ------------------------------------ |
| **Groq API**                  | Inteligência artificial              |
| **Llama 3.1**                 | Processamento de linguagem e análise |
| **SerpAPI / Google Shopping** | Pesquisa de preços                   |
| **Mercado Livre API**         | Pesquisa de produtos                 |
| **Amazon**                    | Pesquisa de produtos                 |
| **Resend / SMTP**             | E-mails transacionais                |
| **Google OAuth**              | Autenticação social                  |

---

## ☁️ Infraestrutura

| Tecnologia                   | Utilização                      |
| ---------------------------- | ------------------------------- |
| **Docker**                   | Containerização do backend      |
| **Docker Multi-stage Build** | Otimização das imagens          |
| **Vercel**                   | Hospedagem e deploy do frontend |
| **CI/CD**                    | Automatização do deploy         |

---

# 🏗️ Arquitetura

O backend utiliza **Clean Architecture**, mantendo a separação entre regras de negócio, aplicação, infraestrutura e apresentação.

```text
                    ┌──────────────────────────┐
                    │      React 19 + TS       │
                    │   TanStack + Tailwind    │
                    └────────────┬─────────────┘
                                 │
                            HTTP / REST
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │     ASP.NET Core 8       │
                    │          API             │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Application  │ │ Infrastructure│ │   Domain     │
        │ DTOs/Services│ │ MongoDB/IA    │ │   Entidades  │
        └──────────────┘ └───────┬──────┘ └──────────────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │   MongoDB    │
                         └──────────────┘
```

### Camadas

#### Domain

Responsável pelas regras e entidades centrais do negócio.

Exemplos:

* Usuário
* Item
* Categoria
* Informações do casal
* Exceções de domínio

#### Application

Contém os contratos e regras de aplicação:

* DTOs
* Interfaces
* Serviços
* Casos de uso

#### Infrastructure

Responsável pelas implementações externas:

* MongoDB
* Repositórios
* Integrações
* Pesquisa de preços
* Serviços de IA
* E-mail

#### API

Camada de entrada da aplicação:

* Controllers
* Middlewares
* Autenticação
* CORS
* Rate limiting
* Configuração da aplicação

---

# 📁 Estrutura do projeto

```text
casal-planner/
│
├── backend/
│   ├── CasalPlanner.Domain/
│   │   └── Entidades e regras de domínio
│   │
│   ├── CasalPlanner.Application/
│   │   └── DTOs e interfaces
│   │
│   ├── CasalPlanner.Infrastructure/
│   │   └── MongoDB, integrações e serviços
│   │
│   ├── CasalPlanner.API/
│   │   └── Controllers, configuração e Dockerfile
│   │
│   ├── CasalPlanner.Tests/
│   │   └── Testes unitários
│   │
│   └── KeyGen/
│       └── Geração de chaves VAPID
│
└── frontend/
    ├── src/
    │   ├── routes/
    │   │   ├── index.tsx
    │   │   ├── login.tsx
    │   │   ├── convite.tsx
    │   │   ├── recuperar-senha.tsx
    │   │   └── _authenticated/
    │   │       ├── inicio.tsx
    │   │       ├── planejamento.tsx
    │   │       └── perfil.tsx
    │   │
    │   ├── components/
    │   │   ├── planejamento/
    │   │   ├── auth/
    │   │   ├── layout/
    │   │   └── ui/
    │   │
    │   ├── services/
    │   │   └── Comunicação com a API
    │   │
    │   ├── lib/
    │   │   └── HTTP, autenticação e utilitários
    │   │
    │   └── hooks/
    │       └── Hooks customizados
    │
    ├── public/
    │   └── Manifest, Service Worker e ícones
    │
    └── e2e/
        └── Testes Playwright
```

---

# 🔗 API

A API é organizada por recursos e utiliza REST + JWT Bearer.

## 🔐 Autenticação

| Método | Endpoint           | Descrição           |
| ------ | ------------------ | ------------------- |
| `POST` | `/api/auth/login`  | Login               |
| `POST` | `/api/auth/google` | Login com Google    |
| `POST` | `/api/auth/logout` | Logout              |
| `GET`  | `/api/auth/me`     | Usuário autenticado |

---

## 👤 Usuário

| Método   | Endpoint                         | Descrição                      |
| -------- | -------------------------------- | ------------------------------ |
| `POST`   | `/api/usuario/registrar`         | Cadastro individual            |
| `POST`   | `/api/usuario/registrar-casal`   | Cadastro de casal              |
| `PUT`    | `/api/usuario/perfil`            | Atualização do perfil          |
| `PUT`    | `/api/usuario/perfil-casal/{id}` | Atualização do perfil do casal |
| `PUT`    | `/api/usuario/modo-escuro/{id}`  | Alteração do tema              |
| `POST`   | `/api/usuario/alterar-senha`     | Alteração de senha             |
| `DELETE` | `/api/usuario/usuario/{id}`      | Exclusão da conta              |
| `POST`   | `/api/usuario/convite`           | Convite para parceiro          |
| `POST`   | `/api/usuario/aceitar-convite`   | Aceitar convite                |

---

## 🔑 Recuperação de senha

| Método | Endpoint                              | Descrição             |
| ------ | ------------------------------------- | --------------------- |
| `POST` | `/api/recuperarsenha/esqueci-senha`   | Solicitar recuperação |
| `POST` | `/api/recuperarsenha/validar-codigo`  | Validar código        |
| `POST` | `/api/recuperarsenha/redefinir-senha` | Definir nova senha    |

---

## 🏠 Categorias

| Método   | Endpoint                    | Descrição            |
| -------- | --------------------------- | -------------------- |
| `GET`    | `/api/categorias`           | Listar categorias    |
| `POST`   | `/api/categorias`           | Criar categoria      |
| `PUT`    | `/api/categorias/{id}`      | Editar categoria     |
| `DELETE` | `/api/categorias/{id}`      | Excluir categoria    |
| `PUT`    | `/api/categorias/reordenar` | Reordenar categorias |

---

## 🛒 Itens

| Método   | Endpoint                    | Descrição         |
| -------- | --------------------------- | ----------------- |
| `GET`    | `/api/itens`                | Listar itens      |
| `GET`    | `/api/itens/page`           | Listagem paginada |
| `POST`   | `/api/itens`                | Criar item        |
| `PUT`    | `/api/itens/{id}`           | Editar item       |
| `PATCH`  | `/api/itens/{id}/comprado`  | Alterar status    |
| `PUT`    | `/api/itens/{id}/categoria` | Alterar cômodo    |
| `DELETE` | `/api/itens/{id}`           | Excluir item      |

---

## 📊 Resumo

| Método | Endpoint      | Descrição                     |
| ------ | ------------- | ----------------------------- |
| `GET`  | `/api/resumo` | Totais e progresso do enxoval |

---

## 💰 Pesquisa de preços

| Método | Endpoint              | Descrição                        |
| ------ | --------------------- | -------------------------------- |
| `GET`  | `/api/pesquisaprecos` | Pesquisa em múltiplos provedores |

---

## 🤖 IA / Groq

| Método | Endpoint                       | Descrição                     |
| ------ | ------------------------------ | ----------------------------- |
| `GET`  | `/api/groq/sugestoes-comodo`   | Sugestões por cômodo          |
| `POST` | `/api/groq/detectar-duplicata` | Detecção de duplicidade       |
| `GET`  | `/api/groq/estimativa-comodo`  | Estimativa de orçamento       |
| `POST` | `/api/groq/dominios`           | Identificação de domínio/logo |

---

## ❤️ Health Check

```http
GET /health
```

Retorna informações sobre o estado da API, ambiente e configurações de origem permitidas.

> Com exceção dos endpoints públicos de autenticação, registro, recuperação de senha e health check, os demais endpoints utilizam **JWT Bearer**.

---

# 🧪 Testes

O projeto possui diferentes níveis de testes.

### Backend

Testes unitários utilizando **xUnit**, cobrindo principalmente:

* Helpers
* Tratamento de texto
* Processamento de preços
* Serviço de pesquisa de preços

### Frontend

Testes **End-to-End** utilizando **Playwright**, permitindo validar fluxos completos da aplicação através da interface.

---

# 🚀 Deploy

A aplicação possui frontend publicado na Vercel:

### 🌐 Aplicação

**[casalplanner.vercel.app](https://casalplanner.vercel.app/)**

A infraestrutura utiliza Docker para a containerização do backend e Vercel para hospedagem e entrega do frontend.

---

# 🔒 Segurança

O projeto possui algumas medidas voltadas à proteção da aplicação:

* JWT Bearer
* BCrypt para armazenamento de senhas
* Google OAuth 2.0
* Rate limiting
* Validação de dados com Zod
* Separação de responsabilidades via Clean Architecture
* Controle de autenticação nos endpoints
* Tokens para recuperação de senha
* Tokens de convite
* Variáveis sensíveis mantidas fora do código-fonte

---

# 💡 Destaques técnicos

O Casal Planner combina diferentes tecnologias e conceitos modernos de desenvolvimento:

* **Clean Architecture**
* **REST API**
* **JWT Authentication**
* **OAuth 2.0**
* **MongoDB**
* **React + TypeScript**
* **TanStack Query**
* **PWA**
* **Web Push**
* **Docker**
* **CI/CD**
* **Integração com APIs externas**
* **Inteligência Artificial**
* **Pesquisa de preços**
* **Testes automatizados**
* **Design responsivo**
* **Optimistic Updates**

O projeto também utiliza integração entre múltiplos provedores para transformar uma simples lista de compras em uma ferramenta de planejamento financeiro e doméstico.

---

# 👨‍💻 Autor

Desenvolvido por **Matheus Rafael**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge\&logo=linkedin\&logoColor=white)](https://linkedin.com/in/matheus-rafael-50a676219)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/MatheusRafaDev)

---

<div align="center">

### ⭐ Gostou do projeto?

Se o Casal Planner foi útil ou interessante, considere deixar uma estrela no repositório.

**Feito com ❤️ e código.**

</div>
