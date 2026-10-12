import { expect, test } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { name: "320px", width: 320, height: 568 },
  { name: "360px", width: 360, height: 640 },
  { name: "375px", width: 375, height: 667 },
  { name: "414px", width: 414, height: 736 },
];

const PUBLIC_ROUTES = [
  { path: "/", heading: "Planejar a dois é começar a casa com o pé direito." },
  { path: "/login", heading: "Acesse sua conta" },
  { path: "/recuperar-senha", heading: "Recuperar senha" },
];

test.describe("Navegação pública em telas pequenas", () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`viewport ${vp.name} - rotas públicas sem overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of PUBLIC_ROUTES) {
        await page.goto(route.path);
        await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
        await page.waitForTimeout(550);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `${route.path} overflows at ${vp.name}`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test("respeita a preferência por movimento reduzido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#duvidas");

  const motionStyles = await page.evaluate(() => {
    const target = document.querySelector("#duvidas");
    if (!target) throw new Error("A seção de dúvidas não foi renderizada.");

    return {
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      targetAnimation: getComputedStyle(target).animationName,
    };
  });

  expect(motionStyles.scrollBehavior).toBe("auto");
  expect(motionStyles.targetAnimation).toBe("none");
});

test("usa a API na mesma origem durante o desenvolvimento local", async ({ page }) => {
  const authRequest = page.waitForRequest(
    (request) => new URL(request.url()).pathname === "/api/auth/me",
  );
  await page.goto("/login");

  const request = await authRequest;
  expect(new URL(request.url()).origin).toBe(new URL(page.url()).origin);
});

test("exibe a marca como texto com ponto amarelo, sem imagem", async ({ page }) => {
  await page.goto("/");

  const brand = page.getByRole("link", { name: "CasalPlanner" });
  await expect(brand).toContainText("CasalPlanner");
  await expect(brand.locator("img")).toHaveCount(0);
  await expect(brand.locator('[aria-hidden="true"]')).toHaveCSS(
    "background-color",
    "rgb(245, 158, 11)",
  );
});
