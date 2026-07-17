# CasalPlanner — Clean Architecture

O projeto foi separado em 4 projetos, cada um em `src/`, seguindo a regra de dependência
da Clean Architecture (as setas sempre apontam para dentro):

```
API  ──depends on──▶  Infrastructure ──┐
 │                                     ├──▶ Application ──▶ Domain
 └─────────depends on──────────────────┘
```

```
backend/
├── CasalPlanner.sln
└── src/
    ├── CasalPlanner.Domain/            (núcleo — zero dependências externas de framework)
    │   ├── Entities/                   Usuario, CasalInfo, TipoConta, Item, Categoria, ItemVariante
    │   └── Exceptions/                 EmailsIguaisException
    │
    ├── CasalPlanner.Application/       (regras de orquestração / contratos — só depende do Domain)
    │   ├── DTOs/                       todos os DTOs (Auth, Categoria, Groq, Item, RecuperarSenha, Resumo, Usuario)
    │   └── Interfaces/                 IAuthService, IItemService, IResumoService, IEmailService, IRecuperarSenhaService
    │
    ├── CasalPlanner.Infrastructure/    (detalhes técnicos — implementa os contratos da Application)
    │   ├── Persistence/                MongoDbContext, MongoDBSettings
    │   └── Services/                   AuthService, ItemService, ResumoService, EmailService,
    │                                    RecuperarSenhaService, GroqService (implementações concretas)
    │
    └── CasalPlanner.API/               (camada de apresentação / composition root)
        ├── Controllers/
        ├── Middlewares/
        ├── Helpers/
        ├── Program.cs
        ├── appsettings*.json
        └── Dockerfile
```

## O que mudou

- **Entidades de domínio** (`Usuario`, `Item`, `Categoria`, `ItemVariante`, `CasalInfo`, `TipoConta`) foram
  movidas para `CasalPlanner.Domain.Entities`, sem depender de Mongo/ASP.NET além dos atributos de
  serialização Bson usados para mapear os documentos.
- **DTOs** foram movidos para `CasalPlanner.Application.DTOs`.
- As **interfaces de serviço** (`IAuthService`, `IItemService`, `IResumoService`, `IEmailService`,
  `IRecuperarSenhaService`) — antes misturadas no mesmo arquivo da implementação — agora vivem
  isoladas em `CasalPlanner.Application.Interfaces`. É esse contrato que os Controllers deveriam
  enxergar.
- As **implementações concretas** (`AuthService`, `ItemService`, `ResumoService`, `EmailService`,
  `RecuperarSenhaService`, `GroqService`) e o `MongoDbContext` foram movidos para
  `CasalPlanner.Infrastructure`, pois são detalhes técnicos (MongoDB, SMTP, chamada HTTP à API da Groq).
- `Program.cs` continua no projeto `API` — ele é o *composition root* e é o único lugar onde faz
  sentido conhecer tanto `Application` quanto `Infrastructure` para registrar o DI.
- Cada camada agora tem seu próprio `.csproj` com só os pacotes NuGet que realmente usa
  (ex.: `BCrypt.Net-Next` e `MongoDB.Driver` saíram do projeto de API e foram para o de Infrastructure).

## Ponto de atenção (não resolvido automaticamente)

Alguns Controllers (`AuthController`, `CategoriasController`, `GroqController`,
`RecuperarSenhaController`, `UsuarioController`) já **acessavam o `MongoDbContext`/`MongoDB.Driver`
diretamente**, mesmo antes dessa reorganização, além de usarem os Services. Isso significa que, na
prática, hoje a camada `API` ainda referencia `Infrastructure` diretamente para essas consultas ad-hoc
— o que é aceitável no "composition root", mas não é Clean Architecture no sentido mais estrito, onde
os Controllers só deveriam falar com interfaces do `Application`.

Não reescrevi essa lógica de negócio para não arriscar mudar comportamento sem poder rodar os testes
(o sandbox aqui não tem acesso ao NuGet para compilar). Se quiser, no próximo passo eu:
1. Extraio essas queries diretas para métodos novos nos Services (ex.: `IAuthService.ObterXyz(...)`), e
2. Os Controllers passam a depender só de `CasalPlanner.Application.Interfaces`, nunca mais de Mongo.

## Build

```bash
cd backend
dotnet restore
dotnet build
```

Docker (o contexto de build agora é a pasta `src/`):

```bash
cd backend/src
docker build -f CasalPlanner.API/Dockerfile -t casalplanner-api .
```

> Este ambiente não tem acesso ao NuGet, então a reorganização foi validada estaticamente
> (namespaces, usings, contagem de chaves) mas não foi compilada aqui. Rode `dotnet build`
> localmente para confirmar.
