import { test, expect, Page } from "@playwright/test";

// Viewports mobile a serem testados
const MOBILE_VIEWPORTS = [
  { name: "320px", width: 320, height: 568 },
  { name: "360px", width: 360, height: 640 },
  { name: "375px", width: 375, height: 667 },
  { name: "414px", width: 414, height: 736 },
];

// Helper para medir scroll horizontal
async function checkHorizontalScroll(page: Page, viewportName: string) {
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const windowWidth = await page.evaluate(() => window.innerWidth);
  const scrollWidth = documentWidth - windowWidth;

  console.log(
    `[${viewportName}] document.scrollWidth: ${documentWidth}, window.innerWidth: ${windowWidth}, overflow: ${scrollWidth}px`,
  );

  if (scrollWidth > 0) {
    // Encontrar elementos causando overflow
    const overflowElements = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll("*"));
      const results: { selector: string; width: number; right: number }[] = [];

      for (const el of allElements) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > window.innerWidth) {
          const selector =
            el.tagName.toLowerCase() +
            (el.id ? `#${el.id}` : "") +
            (el.className
              ? `.${el.className
                  .split(" ")
                  .filter((c) => c)
                  .join(".")}`
              : "");
          results.push({
            selector: selector.substring(0, 150),
            width: Math.round(rect.width),
            right: Math.round(rect.right),
          });
        }
      }

      return results.slice(0, 15); // Top 15 elementos
    });

    console.log(
      `[${viewportName}] Elementos com overflow:`,
      JSON.stringify(overflowElements, null, 2),
    );
  }

  return { documentWidth, windowWidth, scrollWidth, hasOverflow: scrollWidth > 0 };
}

// Teste para página Início
test.describe("Mobile Scroll Test - Início", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`viewport ${vp.name} - verifica scroll horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Navegar para a página de login primeiro (necessário autenticação)
      await page.goto("/login");
      await page.waitForLoadState("networkidle");

      // Preencher credenciais de teste
      await page.fill('input[type="email"]', "teste@teste.com");
      await page.fill('input[type="password"]', "123456");
      await page.click('button[type="submit"]');

      // Aguardar redirecionamento para /inicio
      await page.waitForURL("**/inicio", { timeout: 10000 });
      await page.waitForLoadState("networkidle");

      const result = await checkHorizontalScroll(page, `Início ${vp.name}`);

      // Se houver overflow, falhar o teste para identificar o problema
      if (result.hasOverflow) {
        console.log(`\n❌ OVERFLOW DETECTADO em Início ${vp.name}: ${result.scrollWidth}px\n`);
      }

      expect(result.hasOverflow).toBe(false);
    });
  }
});

// Teste para página Planejamento
test.describe("Mobile Scroll Test - Planejamento", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`viewport ${vp.name} - verifica scroll horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Navegar para a página de login
      await page.goto("/login");
      await page.waitForLoadState("networkidle");

      // Preencher credenciais de teste
      await page.fill('input[type="email"]', "teste@teste.com");
      await page.fill('input[type="password"]', "123456");
      await page.click('button[type="submit"]');

      // Aguardar redirecionamento e navegar para planejamento
      await page.waitForURL("**/inicio", { timeout: 10000 });
      await page.waitForLoadState("networkidle");

      // Navegar para planejamento
      await page.click('a[href="/planejamento"]');
      await page.waitForURL("**/planejamento", { timeout: 5000 });
      await page.waitForLoadState("networkidle");

      const result = await checkHorizontalScroll(page, `Planejamento ${vp.name}`);

      if (result.hasOverflow) {
        console.log(
          `\n❌ OVERFLOW DETECTADO em Planejamento ${vp.name}: ${result.scrollWidth}px\n`,
        );
      }

      expect(result.hasOverflow).toBe(false);
    });
  }
});
