# 🏠 Casal Planner

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![.NET](https://img.shields.io/badge/.NET-8.0-512bd4)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47a248)

## 📋 Sobre o Projeto

**Casal Planner** é um organizador de lista de compras desenvolvido especialmente para casais que estão montando o lar. Com ele, você pode planejar compras por cômodo, controlar gastos separando pagamentos normais de VR/VA (Vale Refeição/Alimentação), e acompanhar evolução financeira mês a mês.

### 🎯 Público-alvo
- Casais que estão montando a primeira casa
- Pessoas que querem organizar compras domésticas
- Quem precisa controlar orçamento familiar

## ✨ Funcionalidades

### 👥 Gestão de Usuários
- **Conta Individual** – para uma pessoa organizar suas compras
- **Conta Casal** – duas pessoas com logins e senhas separados
- Autenticação JWT com cookies seguros
- Senhas hasheadas com BCrypt

### 🏷️ Categorias (Cômodos)
- CRUD completo de categorias
- 5 categorias padrão criadas automaticamente: Cozinha, Sala, Quarto, Banheiro, Lavanderia
- Personalize nome, ícone emoji e cor de fundo
- Reordenação por **drag-and-drop**
- Categorias padrão são protegidas contra edição/exclusão

### 📦 Itens
- CRUD completo dentro de cada categoria
- Campos: nome, marca, preço, quantidade, tipo de pagamento
- **Tipos de pagamento**: Normal ou VR/VA
- Marque itens como comprados com toggle rápido
- Mova itens entre categorias via drag-and-drop
- Filtro por tipo de pagamento

### 💰 Resumo Financeiro
- **Total geral** de todos os itens
- **Total VR/VA** – itens que podem ser pagos com vale
- **Total Normal** – itens de pagamento convencional
- **Itens comprados** – contagem do que já foi adquirido
- Cada card mostra variação percentual em relação ao mês anterior
- Indicador de tendência (↑ subiu / ↓ desceu / → estável)
- Janela deslizante de 3 meses para comparativos

### 👤 Perfil
- Edição de dados pessoais (nome, CPF, data de nascimento, renda mensal)
- Para casais: cada pessoa edita seus próprios dados
- Troca de senha
- Modo escuro/claro
- Exclusão de conta

## 🛠️ Tecnologias

### Frontend
- **React 18** – biblioteca principal
- **React Router** – navegação entre páginas
- **Styled Components** – estilização CSS-in-JS
- **Drag-and-Drop** – reordenação de categorias e itens

### Backend
- **ASP.NET Core 8** – API RESTful
- **JWT** – autenticação via cookies
- **BCrypt** – hashing de senhas

### Banco de Dados
- **MongoDB** – armazenamento NoSQL

## 📁 Estrutura do Projeto
