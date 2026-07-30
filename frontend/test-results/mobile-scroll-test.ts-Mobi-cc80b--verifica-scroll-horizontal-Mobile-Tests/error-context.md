# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-scroll-test.ts >> Mobile Scroll Test - Início >> viewport 320px - verifica scroll horizontal
- Location: e2e\mobile-scroll-test.ts:52:5

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/inicio" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - img "Casal Planner" [ref=f1e6]
      - generic [ref=f1e7]: Casal Planner
    - generic [ref=f1e8]:
      - heading "Bem-vindo(a) de volta" [level=1] [ref=f1e9]
      - paragraph [ref=f1e10]: Entre com seu e-mail e senha.
    - generic [ref=f1e11]:
      - generic [ref=f1e12]:
        - text: E-mail
        - textbox "E-mail" [ref=f1e13]:
          - /placeholder: voce@exemplo.com
          - text: teste@teste.com
      - generic [ref=f1e14]:
        - generic [ref=f1e15]:
          - generic [ref=f1e16]: Senha
          - link "Esqueci minha senha" [ref=f1e17]:
            - /url: /recuperar-senha
        - textbox "Senha" [ref=f1e18]: "123456"
      - button "Entrar" [ref=f1e19] [cursor=pointer]
    - paragraph [ref=f1e20]:
      - text: Ainda não tem conta?
      - button "Cadastre-se" [ref=f1e21]
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | // Viewports mobile a serem testados
  4   | const MOBILE_VIEWPORTS = [
  5   |   { name: '320px', width: 320, height: 568 },
  6   |   { name: '360px', width: 360, height: 640 },
  7   |   { name: '375px', width: 375, height: 667 },
  8   |   { name: '414px', width: 414, height: 736 },
  9   | ];
  10  | 
  11  | // Helper para medir scroll horizontal
  12  | async function checkHorizontalScroll(page: Page, viewportName: string) {
  13  |   const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  14  |   const windowWidth = await page.evaluate(() => window.innerWidth);
  15  |   const scrollWidth = documentWidth - windowWidth;
  16  |   
  17  |   console.log(`[${viewportName}] document.scrollWidth: ${documentWidth}, window.innerWidth: ${windowWidth}, overflow: ${scrollWidth}px`);
  18  |   
  19  |   if (scrollWidth > 0) {
  20  |     // Encontrar elementos causando overflow
  21  |     const overflowElements = await page.evaluate(() => {
  22  |       const allElements = Array.from(document.querySelectorAll('*'));
  23  |       const results: { selector: string; width: number; right: number }[] = [];
  24  |       
  25  |       for (const el of allElements) {
  26  |         const rect = el.getBoundingClientRect();
  27  |         if (rect.width > 0 && rect.right > window.innerWidth) {
  28  |           const selector = el.tagName.toLowerCase() + 
  29  |             (el.id ? `#${el.id}` : '') + 
  30  |             (el.className ? `.${el.className.split(' ').filter(c => c).join('.')}` : '');
  31  |           results.push({
  32  |             selector: selector.substring(0, 150),
  33  |             width: Math.round(rect.width),
  34  |             right: Math.round(rect.right)
  35  |           });
  36  |         }
  37  |       }
  38  |       
  39  |       return results.slice(0, 15); // Top 15 elementos
  40  |     });
  41  |     
  42  |     
  43  |     console.log(`[${viewportName}] Elementos com overflow:`, JSON.stringify(overflowElements, null, 2));
  44  |   }
  45  |   
  46  |   return { documentWidth, windowWidth, scrollWidth, hasOverflow: scrollWidth > 0 };
  47  | }
  48  | 
  49  | // Teste para página Início
  50  | test.describe('Mobile Scroll Test - Início', () => {
  51  |   for (const vp of MOBILE_VIEWPORTS) {
  52  |     test(`viewport ${vp.name} - verifica scroll horizontal`, async ({ page }) => {
  53  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  54  |       
  55  |       // Navegar para a página de login primeiro (necessário autenticação)
  56  |       await page.goto('/login');
  57  |       await page.waitForLoadState('networkidle');
  58  |       
  59  |       // Preencher credenciais de teste
  60  |       await page.fill('input[type="email"]', 'teste@teste.com');
  61  |       await page.fill('input[type="password"]', '123456');
  62  |       await page.click('button[type="submit"]');
  63  |       
  64  |       // Aguardar redirecionamento para /inicio
> 65  |       await page.waitForURL('**/inicio', { timeout: 10000 });
      |                  ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  66  |       await page.waitForLoadState('networkidle');
  67  |       
  68  |       const result = await checkHorizontalScroll(page, `Início ${vp.name}`);
  69  |       
  70  |       // Se houver overflow, falhar o teste para identificar o problema
  71  |       if (result.hasOverflow) {
  72  |         console.log(`\n❌ OVERFLOW DETECTADO em Início ${vp.name}: ${result.scrollWidth}px\n`);
  73  |       }
  74  |       
  75  |       expect(result.hasOverflow).toBe(false);
  76  |     });
  77  |   }
  78  | });
  79  | 
  80  | // Teste para página Planejamento
  81  | test.describe('Mobile Scroll Test - Planejamento', () => {
  82  |   for (const vp of MOBILE_VIEWPORTS) {
  83  |     test(`viewport ${vp.name} - verifica scroll horizontal`, async ({ page }) => {
  84  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  85  |       
  86  |       // Navegar para a página de login
  87  |       await page.goto('/login');
  88  |       await page.waitForLoadState('networkidle');
  89  |       
  90  |       // Preencher credenciais de teste
  91  |       await page.fill('input[type="email"]', 'teste@teste.com');
  92  |       await page.fill('input[type="password"]', '123456');
  93  |       await page.click('button[type="submit"]');
  94  |       
  95  |       // Aguardar redirecionamento e navegar para planejamento
  96  |       await page.waitForURL('**/inicio', { timeout: 10000 });
  97  |       await page.waitForLoadState('networkidle');
  98  |       
  99  |       // Navegar para planejamento
  100 |       await page.click('a[href="/planejamento"]');
  101 |       await page.waitForURL('**/planejamento', { timeout: 5000 });
  102 |       await page.waitForLoadState('networkidle');
  103 |       
  104 |       const result = await checkHorizontalScroll(page, `Planejamento ${vp.name}`);
  105 |       
  106 |       if (result.hasOverflow) {
  107 |         console.log(`\n❌ OVERFLOW DETECTADO em Planejamento ${vp.name}: ${result.scrollWidth}px\n`);
  108 |       }
  109 |       
  110 |       expect(result.hasOverflow).toBe(false);
  111 |     });
  112 |   }
  113 | });
```