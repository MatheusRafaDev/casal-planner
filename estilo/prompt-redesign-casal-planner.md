# Prompt: redesign completo do CasalPlanner

> **Antes de enviar:** (1) preencha a resposta da pergunta "Preciso pagar para usar?" no Anexo A (hoje está como `[Preencher: modelo de cobrança do sistema]`); (2) se quiser, anexe este arquivo inteiro à ferramenta. O Anexo A tem o código de referência da tela de visitantes.

---

## 1. Objetivo

Aplicar um novo visual em **todo** o frontend do projeto `casal-planner` (pasta `frontend/`: React 19, TanStack Start/Router, Tailwind v4, Radix/shadcn, framer-motion, recharts). É uma mudança **visual e de layout**. Nada de lógica.

Resultado esperado: um sistema com cara de produto feito à mão, com personalidade, e não de template genérico. Estilo "adesivo": contornos escuros de 2px, sombras duras deslocadas, tipografia arredondada e cores quentes.

## 2. Regras que não podem ser quebradas

1. **Tela de visitantes (rota `/`) = EXATAMENTE igual ao Anexo A.** Mesma estrutura, mesma ordem das seções, mesmos textos, mesma tipografia, tamanhos, cores, contornos, sombras, rotações e responsividade. Não "melhore", não resuma, não troque textos. Converta o HTML do Anexo A para TSX/Tailwind fielmente (valores arbitrários do Tailwind são permitidos). Use apenas as adaptações abaixo:
   - `<a href="#">` vira `Link` do TanStack Router para as rotas reais (`/login`, `/login` com `registrar: 1` para "Criar conta", etc.).
   - Mantenha toda a lógica que já existe em `routes/index.tsx` (redirecionamento de usuário autenticado, meta tags, SEO, carregamento). Troque só a parte visual.
   - Os valores em R$ e nomes da tela são exemplos de marketing e devem permanecer como estão.
   - Os textos de "Dia da mudança" e "Lista por link" devem ser conferidos contra o código (`WidgetDiaMudanca`, `lista/$slug`, `lista-publica`). Se a descrição não bater com o que o recurso faz, ajuste a frase e me avise.
2. **Todas as outras telas devem se adequar ao que já existe.** Não remova, não esconda e não renomeie nenhum campo, botão, filtro, coluna, ação de menu, aba, modal, etapa de wizard, validação ou fluxo. Se algo não couber no layout novo, reposicione. Só mude a estrutura do layout quando for necessário para o novo visual.
3. **Não mexa em:** `backend/`, `services/`, `lib/api.ts`, `lib/auth-context.tsx`, tipos, nomes de props, queries do react-query, rotas e `routeTree.gen.ts`.
4. Funciona em **mobile e desktop**, mantém o PWA e tem **modo claro e escuro**. Contraste mínimo AA em texto.
5. Dependências novas: só fontes do Google Fonts. Nada além disso.

## 3. Fundamentos de design

### Fontes
- **Fredoka** (600/700): títulos, números grandes, nomes de seção, logo.
- **Nunito** (400–800): todo o resto.
- Carregue em `routes/__root.tsx` no lugar de Inter e JetBrains Mono:
  `https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap`
- `font-display` = Fredoka, `font-sans` = Nunito. Pare de usar `font-mono` em rótulos, menu e avatares (use Nunito bold). Valores em R$ usam `tabular-nums`.
- Remova o `fontFamily: "Inter"` fixo do `LoginForm.tsx`.

### Cores (o projeto não tem tokens: o `styles.css` só tem `@import "tailwindcss"`; crie tudo em `@theme` e variáveis CSS)

| Token | Claro | Uso |
|---|---|---|
| `background` | `#F6F1E9` (bege) | fundo das páginas |
| `card` | `#FFFFFF` | cards, modais, campos |
| `sidebar` | `#FBF9F5` | sidebar |
| `foreground` / `border` | `#24302A` | texto e contornos de 2px |
| `muted-foreground` | `#66685C` | texto secundário (use `#4A4F45` em parágrafos longos) |
| `muted` | `#EEE8DD` | trilhas de barras, fundos suaves |
| `primary` | `#2F7D5B` (verde-floresta) | ações, item ativo, barras |
| `primary-foreground` | `#FFFFFF` | texto sobre o primary |
| `primary-tint` / texto | `#E8F3EC` / `#1F5A41` | selecionado, selos |
| `gold` (secundária) | `#E8B63C` | destaques, marca-texto, Pessoa 2 |
| `gold-tint` / texto | `#FBEFD2` / `#6B4A06` | selo "Presente", avisos suaves |
| `success-tint` / texto | `#E3F3EA` / `#16623A` | selo "Comprado" |
| `destructive` | `#C2410C` | estourou orçamento, excluir (tint `#FDE3D8`, texto `#8A2E08`) |

- **Modo escuro:** crie a versão escura mantendo o mesmo caráter: fundo verde-carvão (por exemplo `#141A17`), cards `#1D2621`, texto `#F3EFE6`, primary mais claro (por exemplo `#4FB387`), dourado mantido, contornos e sombras ajustados para continuar visíveis. Garanta contraste AA.
- **Cores por pessoa, em todo o sistema:** Pessoa 1 = `primary` (verde), Pessoa 2 = `gold` (dourado). Use em avatares, bolinhas de "quem paga", barra de divisão de gastos e gráficos.
- **Gráficos:** troque o array `FALLBACK_COLORS` (hoje roxo, rosa etc.) por uma paleta nova: verde `#2F7D5B`, dourado `#E8B63C`, coral `#E2725B`, azul-petróleo `#2A7F8E`, oliva `#8A9A3B`, argila `#B4532E`, grafite `#24302A`. Cores de categoria definidas pelo usuário continuam valendo.

### Forma
- Raio: 12px em cards, botões, inputs e modais; selos e barras em pílula.
- Contorno: `2px solid var(--border)` em cards, botões, inputs, selects, modais e selos.
- Sombra "adesivo": `3px 3px 0 var(--border)` em cards e botões; `5px 5px 0` em cards de destaque; `6px 6px 0` em modais. No hover de botões, deslocar 1px e reduzir a sombra. No clique, `translate(2px, 2px)` e sombra zerada.
- Barras de progresso: 12px de altura, contorno de 2px, fundo branco, preenchimento `primary`; acima do orçamento, `destructive`.
- Foco visível: anel verde de 3px.
- Respeite `prefers-reduced-motion` (já existe o hook `use-reduced-motion`).

Atualize os componentes em `components/ui/*` (button, input, select, tabs, dialog, alert-dialog, dropdown-menu, badge, progress, checkbox, switch, alert, sonner, chart) para esse padrão. As telas herdam o visual por eles.

## 4. Telas (manter tudo o que existe, só reorganizar quando preciso)

- **`/` Visitantes:** conforme regra 1 e Anexo A.
- **`/login`, `/recuperar-senha`, `/trocar-senha`** (`LoginForm`, `RegistroIndividual`, `RegistroCasal`, `WizardRecuperarSenha`, `input-otp`): novo visual, mesmos campos, mesmas validações e mesmas etapas. No painel lateral do login, reaproveite a linguagem da tela de visitantes (cartão de lista levemente torto e selo dourado).
- **`AppShell`:** sidebar `#FBF9F5` com borda direita de 2px; item ativo preenchido de verde, texto branco, raio 12. Mantenha o portal `#sidebar-categories-portal`, o botão de tema, o de instalar PWA e o de sair. Mobile: cabeçalho enxuto (logo + avatar) e barra inferior; é aceitável mover tema, instalar e sair para um menu do avatar, desde que continuem acessíveis.
- **`/inicio` (Dashboard):** cabeçalho com mês e título; card grande de orçamento (valor restante em Fredoka, barra empilhada com as cores das pessoas); cards menores de parcelas do mês e itens comprados; grade de cômodos com barra de progresso e estado "estourou"; gráfico de faturas mensais em largura total. Mantenha **todos** os widgets e gráficos que já existem (`WidgetDiaMudanca`, pizza, barras, resumo/IA, presentes, relatórios, etc.): só reposicione.
- **`/planejamento`:** lista de cômodos à esquerda com cômodo selecionado em destaque (`primary-tint` e contorno verde) e cômodo estourado em alerta; no painel do cômodo, cabeçalho com Gasto, Previsto e Restante; filtros em botões; itens em cards com selo de status (Comprado, Pendente, Presente, Prometido) e bolinha de quem paga; ação principal única "Adicionar item", e "Novo cômodo" como secundária. Mantenha menus de editar/remover cômodo, `AddItemWizard`, `ItemFormModal`, `CategoriaFormModal`, leitor de código de barras, pesquisa de preços (texto e foto), filtros e ordenação.
- **`/perfil` (Minha conta):** cards separados (perfil, nosso casal, segurança, aparência, sessão e dados). Se hoje existirem outros blocos (convite, dados do casal, etc.), mantenha todos.
- **Modais e wizards:** mesmo estilo; no mobile, botões de ação fixos no rodapé e indicador de etapas.
- **`/lista/$slug` (lista pública), 404 e página de erro:** mesmo visual da tela de visitantes.

## 5. Logo novo

**Gere um logo novo com as cores novas** e aplique em todo o sistema.
- Símbolo: casa simples (telhado e paredes) preenchida com `#E8B63C`, contorno `#24302A` de 2.2px, com um pequeno coração ou porta em verde `#2F7D5B`. Palavra "CasalPlanner" em Fredoka 700, `#24302A`.
- Entregue: `public/logo.svg` (símbolo + versão com nome), `favicon.ico`, `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png` (fundo `#2F7D5B`, símbolo dentro da área segura) e o ícone do iOS.
- Atualize `manifest.json` (`theme_color` `#2F7D5B`, `background_color` `#F6F1E9`), a meta `theme-color`, `components/ui/LogoBadge.tsx` e todos os lugares que desenham a casinha em SVG (sidebar, cabeçalho mobile, login, visitantes, 404).
- Se você não conseguir gerar imagens PNG, entregue o SVG e o comando exato para exportar os tamanhos.

## 6. Como trabalhar

1. Crie os tokens e as fontes (`styles.css`, `__root.tsx`) e atualize `components/ui/*`.
2. Faça a tela de visitantes (Anexo A).
3. `AppShell`, depois login/cadastro/recuperação, depois dashboard, planejamento, perfil e o resto.
4. Logo e ícones do PWA.
5. Rode `npm run lint` e `npm run build` e corrija o que quebrar.

**Ao terminar, me entregue:** a lista de arquivos alterados; qualquer ponto em que o layout teve que mudar para caber o novo visual (e onde cada campo/ação foi parar); e os textos da tela de visitantes que você ajustou por não baterem com o código. Não deve haver nenhum campo, ação ou fluxo a menos que antes.

---

## Anexo A: código de referência da tela de visitantes

Reproduza este HTML/CSS fielmente. Breakpoint de responsividade: 700px (`.hide-s` e fontes menores). O fundo da página é `#F6F1E9`.

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CasalPlanner</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap">
<style>
body{margin:0}
.pg{background:#F6F1E9;color:#24302A;font-family:'Nunito',system-ui,sans-serif;min-height:3900px}
.wrap{max-width:1120px;margin:0 auto;padding:0 32px;box-sizing:border-box}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 26px;border-radius:12px;border:2px solid #24302A;box-shadow:4px 4px 0 #24302A;font:700 16px 'Nunito',sans-serif;text-decoration:none;box-sizing:border-box}
.h2{margin:0;font:600 42px/1.1 'Fredoka',sans-serif}
.p{margin:14px 0 0;font-size:18px;line-height:1.6;color:#4A4F45}
.blk{display:flex;gap:56px;align-items:center;flex-wrap:wrap;padding:60px 0;border-top:2px solid #24302A}
.tx{flex:1 1 380px}.mk{flex:1 1 380px;display:flex;justify-content:center}
.k{font:600 18px 'Fredoka',sans-serif;color:#2F7D5B;margin-bottom:8px}
.st{background:#fff;border:2px solid #24302A;border-radius:12px;box-shadow:5px 5px 0 #24302A;padding:22px 24px;width:100%;max-width:400px;box-sizing:border-box}
.rw{display:flex;align-items:center;gap:12px;font-weight:700;font-size:16px;margin-top:14px}
.bar{height:12px;border:2px solid #24302A;border-radius:99px;background:#fff;overflow:hidden;flex:1}
.bar i{display:block;height:100%}
.tag{padding:3px 10px;border:2px solid #24302A;border-radius:99px;font-size:12px;font-weight:800;white-space:nowrap}
.ls{margin:18px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;font-size:17px;line-height:1.5}
.ls li{padding-left:28px;position:relative}
.ls li:before{content:"";position:absolute;left:0;top:7px;width:14px;height:14px;border:2px solid #24302A;border-radius:4px;background:#E8B63C}
.tl{background:#fff;border:2px solid #24302A;border-radius:12px;box-shadow:4px 4px 0 #24302A;padding:22px 24px;flex:1 1 300px;box-sizing:border-box}
.tl b{font:600 22px 'Fredoka',sans-serif;display:block;margin-bottom:6px}
.tl span{font-size:16px;line-height:1.55;color:#4A4F45}
.row{display:flex;gap:28px;align-items:baseline;padding:26px 0;border-top:2px solid #24302A;flex-wrap:wrap}
.n{font:600 44px 'Fredoka',sans-serif;width:90px;flex-shrink:0;color:#2F7D5B}
.t{font:600 26px 'Fredoka',sans-serif;width:300px;flex-shrink:0}
.d{flex:1 1 300px;font-size:18px;line-height:1.55;color:#4A4F45;margin:0}
.num{font-variant-numeric:tabular-nums}
@media(max-width:700px){.h1{font-size:40px!important}.h2{font-size:32px}.hide-s{display:none}}
</style>
</head>
<body>
<div class="pg">
<div class="wrap">
<header style="display:flex;align-items:center;justify-content:space-between;height:84px">
<div style="font:700 24px 'Fredoka',sans-serif;display:flex;align-items:center;gap:10px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#24302A" stroke-width="2.2" aria-hidden="true"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="#E8B63C"/></svg>CasalPlanner</div>
<nav style="display:flex;align-items:center;gap:22px" aria-label="Conta"><a class="hide-s" href="#recursos" style="font-weight:700;color:#24302A">Recursos</a><a class="hide-s" href="#duvidas" style="font-weight:700;color:#24302A">Dúvidas</a><a href="#" style="font-weight:700;color:#24302A">Entrar</a><a class="btn" href="#" style="background:#2F7D5B;color:#fff;min-height:44px">Criar conta</a></nav>
</header>

<section style="display:flex;gap:64px;align-items:center;flex-wrap:wrap;padding:64px 0 96px">
<div style="flex:1 1 460px">
<h1 class="h1" style="margin:0;font:600 64px/1.04 'Fredoka',sans-serif">Planejar a dois é começar a casa com o <span style="background:linear-gradient(transparent 62%,#E8B63C 62%,#E8B63C 92%,transparent 92%)">pé direito.</span></h1>
<p class="p" style="font-size:20px;max-width:500px;margin-top:24px">Cada cômodo, cada compra e o orçamento da casa nova num lugar só.</p>
<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:36px"><a class="btn" href="#" style="background:#2F7D5B;color:#fff">Criar conta de casal</a><a class="btn" href="#" style="background:#fff;color:#24302A">Já tenho conta</a></div>
<p style="margin:20px 0 0;font-size:15px;color:#66685C">Sozinho também funciona: tem conta individual.</p>
</div>
<div style="flex:1 1 400px;position:relative;min-height:400px;display:flex;align-items:center;justify-content:center">
<div class="st" style="box-shadow:6px 6px 0 #24302A;padding:26px 28px;transform:rotate(-2.5deg)">
<div style="font:600 26px 'Fredoka',sans-serif;border-bottom:2px dashed #24302A;padding-bottom:12px">Cozinha</div>
<div class="rw" style="font-size:18px"><span style="width:22px;height:22px;border:2px solid #24302A;border-radius:5px;background:#2F7D5B;flex-shrink:0"></span><span style="flex:1;text-decoration:line-through;color:#66685C">Geladeira</span><span class="num">R$ 3.200</span></div>
<div class="rw" style="font-size:18px"><span style="width:22px;height:22px;border:2px solid #24302A;border-radius:5px;background:#2F7D5B;flex-shrink:0"></span><span style="flex:1;text-decoration:line-through;color:#66685C">Fogão</span><span class="num">R$ 1.450</span></div>
<div class="rw" style="font-size:18px"><span style="width:22px;height:22px;border:2px solid #24302A;border-radius:5px;flex-shrink:0"></span><span style="flex:1">Micro-ondas</span><span class="num">R$ 690</span></div>
<div class="rw" style="font-size:18px"><span style="width:22px;height:22px;border:2px solid #24302A;border-radius:5px;flex-shrink:0"></span><span style="flex:1">Air fryer</span><span class="num">R$ 520</span></div>
</div>
<div style="position:absolute;right:-4px;bottom:14px;width:128px;height:128px;border-radius:50%;background:#E8B63C;border:2px solid #24302A;box-shadow:4px 4px 0 #24302A;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(9deg);text-align:center;font:600 15px/1.2 'Fredoka',sans-serif">sobram<span class="num" style="font-size:22px;font-weight:700">R$ 26.650</span></div>
</div>
</section>

<section style="padding-bottom:72px">
<h2 class="h2" style="max-width:640px">Do primeiro cadastro à última compra</h2>
<p class="p" style="max-width:640px">O CasalPlanner organiza a montagem da casa em quatro passos simples.</p>
<div style="margin-top:36px">
<div class="row"><div class="n">01</div><div class="t">Criem a conta</div><p class="d">Um cadastro para o casal, que já deixa as duas pessoas vinculadas. Se preferir, comece sozinho com uma conta individual.</p></div>
<div class="row"><div class="n">02</div><div class="t">Montem os cômodos</div><p class="d">Cozinha, sala, quarto, lavanderia, ou o que fizer sentido para a casa de vocês. Cada cômodo recebe o seu orçamento.</p></div>
<div class="row"><div class="n">03</div><div class="t">Listem os itens</div><p class="d">Cada item tem preço, quantidade, forma de pagamento e status. Vocês veem o que falta e quanto custa.</p></div>
<div class="row" style="border-bottom:2px solid #24302A"><div class="n">04</div><div class="t">Acompanhem juntos</div><p class="d">O dashboard mostra quanto foi gasto, quanto sobra e as parcelas que vão chegar nos próximos meses.</p></div>
</div>
</section>
</div>

<div id="recursos" style="background:#fff;border-top:2px solid #24302A;border-bottom:2px solid #24302A"><div class="wrap">
<div style="padding:72px 0 8px"><h2 class="h2" style="max-width:640px">O que tem por dentro</h2><p class="p" style="max-width:640px">Os recursos principais, um por um.</p></div>

<div class="blk" style="border-top:0"><div class="tx"><div class="k">Cômodos e orçamento</div><h3 class="h2" style="font-size:34px">Um limite para cada ambiente</h3><p class="p">Defina quanto pretende gastar em cada cômodo e acompanhe a barra encher conforme as compras entram. Quando um cômodo passa do orçamento, ele aparece em alerta.</p><ul class="ls"><li>Orçamento por cômodo e total da casa</li><li>Valor gasto, previsto e restante à vista</li><li>Ícones e nomes que vocês escolhem</li></ul></div>
<div class="mk"><div class="st" style="transform:rotate(1.5deg)"><div style="font:600 22px 'Fredoka',sans-serif">Seus cômodos</div>
<div class="rw"><span style="width:92px">Cozinha</span><div class="bar"><i style="width:78%;background:#2F7D5B"></i></div></div>
<div class="rw"><span style="width:92px">Sala</span><div class="bar"><i style="width:41%;background:#2F7D5B"></i></div></div>
<div class="rw"><span style="width:92px">Quarto</span><div class="bar"><i style="width:43%;background:#2F7D5B"></i></div></div>
<div class="rw"><span style="width:92px">Lavanderia</span><div class="bar"><i style="width:100%;background:#C2410C"></i></div></div>
<div style="margin-top:16px"><span class="tag" style="background:#FDE3D8;color:#8A2E08">Lavanderia estourou o orçamento</span></div></div></div></div>

<div class="blk" style="flex-direction:row-reverse"><div class="tx"><div class="k">Itens</div><h3 class="h2" style="font-size:34px">Cada compra com seu status</h3><p class="p">Adicione um item com preço, quantidade e data prevista de compra. Marque como comprado quando chegar em casa. Presentes e itens prometidos por alguém ficam separados, para não entrarem na conta como gasto.</p><ul class="ls"><li>Itens comprados, pendentes, presentes e prometidos</li><li>Adição guiada, passo a passo, também no celular</li><li>Filtro por cômodo e por status</li></ul></div>
<div class="mk"><div class="st" style="transform:rotate(-1.5deg)">
<div class="rw" style="margin-top:0"><span style="flex:1">Geladeira</span><span class="tag" style="background:#E3F3EA;color:#16623A">Comprado</span></div>
<div class="rw"><span style="flex:1">Micro-ondas</span><span class="tag" style="background:#EFEAE0">Pendente</span></div>
<div class="rw"><span style="flex:1">Jogo de panelas</span><span class="tag" style="background:#FBEFD2;color:#6B4A06">Presente</span></div>
<div class="rw"><span style="flex:1">Sofá</span><span class="tag" style="background:#E8F3EC;color:#1F5A41">Prometido</span></div>
<div class="rw"><span style="flex:1">Cortina da sala</span><span class="tag" style="background:#EFEAE0">Pendente</span></div></div></div></div>

<div class="blk"><div class="tx"><div class="k">Divisão entre os dois</div><h3 class="h2" style="font-size:34px">Quem pagou o quê, sem discussão</h3><p class="p">Cada pessoa tem sua cor no sistema. Vocês enxergam quanto cada um colocou na casa, e podem separar o que foi pago em dinheiro do que foi pago com vale-refeição ou vale-alimentação (VR/VA).</p><ul class="ls"><li>Gasto de cada pessoa e do casal juntos</li><li>Pagamento em dinheiro separado de VR/VA</li><li>Funciona também para conta individual</li></ul></div>
<div class="mk"><div class="st" style="transform:rotate(1deg)"><div style="font:600 22px 'Fredoka',sans-serif">Gastos até agora</div>
<div style="display:flex;height:26px;border:2px solid #24302A;border-radius:99px;overflow:hidden;margin-top:16px"><div style="width:67%;background:#2F7D5B"></div><div style="width:33%;background:#E8B63C"></div></div>
<div class="rw"><i style="width:14px;height:14px;border:2px solid #24302A;background:#2F7D5B"></i><span style="flex:1">Pessoa 1</span><span class="num">R$ 14.400</span></div>
<div class="rw"><i style="width:14px;height:14px;border:2px solid #24302A;background:#E8B63C"></i><span style="flex:1">Pessoa 2</span><span class="num">R$ 6.950</span></div>
<div class="rw" style="border-top:2px dashed #24302A;padding-top:14px"><span style="flex:1;color:#66685C">Pago com VR/VA</span><span class="num">R$ 1.200</span></div></div></div></div>

<div class="blk" style="flex-direction:row-reverse"><div class="tx"><div class="k">Parcelas e faturas</div><h3 class="h2" style="font-size:34px">Saiba o que vem pela frente</h3><p class="p">Compras parceladas viram uma projeção mês a mês. Antes de fechar mais uma compra, vocês veem quanto já está comprometido nos próximos meses.</p><ul class="ls"><li>Valor de cada parcela distribuído por mês</li><li>Gráfico de faturas no dashboard</li><li>Resumo por cômodo e por categoria</li></ul></div>
<div class="mk"><div class="st" style="transform:rotate(-1deg)"><div style="font:600 22px 'Fredoka',sans-serif">Faturas dos próximos meses</div>
<div style="display:flex;align-items:flex-end;gap:12px;height:150px;margin-top:18px">
<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:12px;font-weight:700;gap:6px"><div style="width:100%;height:110px;background:#2F7D5B;border:2px solid #24302A"></div>Out</div>
<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:12px;font-weight:700;gap:6px"><div style="width:100%;height:90px;background:#2F7D5B;border:2px solid #24302A"></div>Nov</div>
<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:12px;font-weight:700;gap:6px"><div style="width:100%;height:100px;background:#2F7D5B;border:2px solid #24302A"></div>Dez</div>
<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:12px;font-weight:700;gap:6px"><div style="width:100%;height:60px;background:#E8B63C;border:2px solid #24302A"></div>Jan</div>
<div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;font-size:12px;font-weight:700;gap:6px"><div style="width:100%;height:40px;background:#E8B63C;border:2px solid #24302A"></div>Fev</div></div></div></div></div>

<div class="blk"><div class="tx"><div class="k">Pesquisa de preços</div><h3 class="h2" style="font-size:34px">Compare antes de comprar</h3><p class="p">Na loja, leia o código de barras do produto com a câmera do celular, ou tire uma foto dele. O sistema ajuda a encontrar o produto e registrar o preço que vocês viram.</p><ul class="ls"><li>Leitor de código de barras pela câmera</li><li>Pesquisa por foto do produto</li><li>Registro do preço encontrado no item</li></ul></div>
<div class="mk"><div class="st" style="transform:rotate(1.5deg)"><div style="height:60px;border:2px solid #24302A;border-radius:8px;background:repeating-linear-gradient(90deg,#24302A 0 3px,#fff 3px 5px,#24302A 5px 6px,#fff 6px 9px)"></div>
<div class="rw"><span style="flex:1">Loja A</span><span class="num">R$ 749</span></div>
<div class="rw"><span style="flex:1">Loja B</span><span class="num">R$ 699</span><span class="tag" style="background:#E8B63C">Menor</span></div>
<div class="rw"><span style="flex:1">Loja C</span><span class="num">R$ 729</span></div></div></div></div>
</div></div>

<div class="wrap">
<section style="padding:72px 0 24px"><h2 class="h2">E tem mais</h2>
<div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:28px">
<div class="tl"><b>Dia da mudança</b><span>Um painel no dashboard para acompanhar a data da mudança e o clima do dia.</span></div>
<div class="tl"><b>Lista por link</b><span>Compartilhe a lista de itens com a família e os amigos por um endereço público.</span></div>
<div class="tl"><b>Instale no celular</b><span>Adicione à tela inicial e abra como um aplicativo, sem baixar nada pela loja.</span></div>
</div>
<div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:20px">
<div class="tl"><b>Claro e escuro</b><span>Escolha o tema do sistema ou deixe seguir o do aparelho.</span></div>
<div class="tl"><b>Recuperação de senha</b><span>Esqueceu a senha? Recupere o acesso por e-mail em poucos passos.</span></div>
<div class="tl"><b>Para o casal ou só você</b><span>A mesma ferramenta funciona com conta individual ou conta de casal.</span></div>
</div></section>

<section style="padding:72px 0 24px"><h2 class="h2">Casal ou individual?</h2>
<div style="display:flex;gap:24px;flex-wrap:wrap;margin-top:28px">
<div class="st" style="max-width:none;flex:1 1 380px;background:#E8F3EC"><div style="font:600 28px 'Fredoka',sans-serif">Conta de casal</div><ul class="ls"><li>Duas pessoas vinculadas à mesma casa</li><li>Gastos separados por cor de cada um</li><li>Orçamento, cômodos e itens compartilhados</li></ul><a class="btn" href="#" style="background:#2F7D5B;color:#fff;margin-top:24px">Criar conta de casal</a></div>
<div class="st" style="max-width:none;flex:1 1 380px"><div style="font:600 28px 'Fredoka',sans-serif">Conta individual</div><ul class="ls"><li>Para quem está montando a casa sozinho</li><li>Mesmos cômodos, itens e orçamento</li><li>Pode virar casal depois</li></ul><a class="btn" href="#" style="background:#fff;color:#24302A;margin-top:24px">Criar conta individual</a></div>
</div></section>

<section id="duvidas" style="padding:72px 0 72px"><h2 class="h2">Dúvidas comuns</h2>
<div style="margin-top:28px">
<div class="row"><div class="t" style="width:380px;font-size:22px">Preciso pagar para usar?</div><p class="d">[Preencher: modelo de cobrança do sistema]</p></div>
<div class="row"><div class="t" style="width:380px;font-size:22px">Funciona no celular?</div><p class="d">Sim. Dá para usar no navegador e instalar na tela inicial como aplicativo.</p></div>
<div class="row"><div class="t" style="width:380px;font-size:22px">Nós dois vemos as mesmas informações?</div><p class="d">Na conta de casal, sim: os cômodos, itens e orçamento são os mesmos para as duas pessoas.</p></div>
<div class="row"><div class="t" style="width:380px;font-size:22px">Posso usar sem a outra pessoa?</div><p class="d">Pode. A conta individual tem os mesmos recursos de planejamento.</p></div>
<div class="row" style="border-bottom:2px solid #24302A"><div class="t" style="width:380px;font-size:22px">E se eu esquecer a senha?</div><p class="d">Use a opção de recuperar senha na tela de entrada e siga os passos.</p></div>
</div></section>

<section style="padding-bottom:72px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap">
<h2 class="h2" style="font-size:46px;max-width:600px">Criem a conta e montem o primeiro cômodo.</h2>
<a class="btn" href="#" style="background:#2F7D5B;color:#fff">Criar conta de casal</a>
</section>
<footer style="padding-bottom:36px;font-size:14px;color:#66685C;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><span>CasalPlanner</span><span>Valores mostrados são exemplos.</span></footer>
</div>
</div>
</body>
</html>
```
