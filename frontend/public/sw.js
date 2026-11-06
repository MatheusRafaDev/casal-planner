/**
 * CasalPlanner — Service Worker (v10)
 *
 * Estratégia:
 *  - Navegação (HTML) → Network-first com fallback para cache da rota exata ou página offline amigável.
 *    (Nunca devolve o HTML de uma rota para outra para evitar React Hydration Mismatch #418).
 *  - Assets estáticos (JS, CSS, fontes, imagens) → Cache-first com revalidação.
 *  - Chamadas de API (/api/**) → Ignoradas pelo SW (rede nativa com credenciais HttpOnly).
 */

const CACHE_NAME = "casal-planner-v11";

// Assets estáticos imutáveis que são pré-cacheados na instalação
const PRECACHE_URLS = [
  "/manifest.json",
  "/favicon.ico",
  "/favicon.png",
  "/favicon.svg",
  "/logo-icon.svg",
  "/logo.svg",
  "/logo.png",
  "/logo_casalplanner.png",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache
        .addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })).filter(Boolean))
        .catch(() => {
          // Falha silenciosa: o SW instala mesmo que algum asset secundário falhe
        }),
    ),
  );
  // Ativar imediatamente a nova versão do Service Worker
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Deletar caches de versões anteriores (v8, v9, v10, etc.) para garantir frescor dos bundles
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));

      // Desabilitar navigationPreload caso esteja habilitado para evitar o aviso do Chromium:
      // "The service worker navigation preload request was cancelled before 'preloadResponse' settled."
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.disable().catch(() => {});
      }
    })(),
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-http (chrome-extension, schemes desconhecidos, etc.)
  if (!url.protocol.startsWith("http")) return;

  // Fontes externas do Google Fonts → Cache-First
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Ignorar requests de outros domínios
  if (url.origin !== self.location.origin) return;

  // Em localhost ou desenvolvimento Vite (HMR), repassar direto para a rede nativa
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.pathname.includes("@vite") ||
    url.pathname.includes("@fs") ||
    url.pathname.includes("node_modules")
  ) {
    return;
  }

  // API → Não interceptar, deixar o navegador tratar cookies e requisições diretamente
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navegação do usuário (HTML de páginas) → Network-First
  if (request.mode === "navigate") {
    event.respondWith(navigateFetch(request));
    return;
  }

  // Verificar se é de fato um asset estático (JS, CSS, imagens, fontes, etc.)
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    /\.(js|mjs|css|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|json)$/i.test(url.pathname);

  if (!isStaticAsset) {
    // É uma rota interna da SPA ou prefetch do roteador sem ser navegação de página cheia:
    // Não interceptar para nunca gerar 503 falsos
    return;
  }

  // Assets estáticos reais → Cache-first
  event.respondWith(cacheFirst(request));
});

// ─── Estratégias ──────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === "opaque")) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Não sintetizar 503 para evitar poluir o roteador em caso de cancelamento de requisição
    throw err;
  }
}

async function navigateFetch(request) {
  const cache = await caches.open(CACHE_NAME);

  // 1. Prioriza a rede (Network-First) para que cada rota receba seu HTML exato e atualizado
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // 2. Se offline, tenta a cópia exata previamente salva para ESTA rota específica
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    // 3. Fallback se não houver conexão nem cache prévio da rota
    return new Response(offlinePage(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

function offlinePage() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>CasalPlanner - Sem conexão</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    body {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      background: #FAF7F2;
      color: #18201E;
      text-align: center;
    }
    .icon { font-size: 3rem; }
    h1 { font-size: 1.5rem; font-weight: 800; color: #18201E; }
    p { font-size: 0.95rem; color: #5B6470; max-width: 34ch; line-height: 1.5; font-weight: 500; }
    button {
      margin-top: 1rem;
      padding: 0.75rem 1.6rem;
      border-radius: 14px;
      border: 2px solid #1F5C43;
      background: #1F5C43;
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 2px 2px 0 #18201E;
      transition: all 0.15s ease;
    }
    button:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 #18201E; }
  </style>
</head>
<body>
  <div class="icon">📶</div>
  <h1>Sem conexão com a internet</h1>
  <p>Você está offline no momento. Conecte-se à internet para continuar planejando suas compras.</p>
  <button onclick="window.location.reload()">Tentar novamente</button>
</body>
</html>`;
}
