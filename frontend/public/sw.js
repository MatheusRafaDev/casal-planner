/**
 * CasalPlanner — Service Worker
 *
 * Estratégia:
 *  - Cache-first  → assets estáticos (JS, CSS, fontes, imagens)
 *  - Network-first → chamadas de API (/api/**)
 *  - Offline fallback → página HTML simples para navegação sem rede
 */

const CACHE_NAME = "casal-planner-v7";
const OFFLINE_URL = "/__offline";

// Assets que queremos pré-cachear na instalação
const PRECACHE_URLS = [
  "/",
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
          // Falha silenciosa: o SW instala mesmo que algum precache falhe
        }),
    ),
  );
  // Ativar imediatamente sem aguardar reload
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-http (chrome-extension, etc.)
  if (!url.protocol.startsWith("http")) return;

  // Ignorar requests de outros origins
  if (url.origin !== self.location.origin) return;

  // Em localhost ou requisições de desenvolvimento do Vite (HMR), repassar direto para a rede nativa
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.pathname.includes("@vite") ||
    url.pathname.includes("@fs") ||
    url.pathname.includes("node_modules")
  ) {
    return;
  }

  // API → Não interceptar, deixar o navegador tratar autenticação e streaming diretamente
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navegação (HTML) → Network-first com fallback offline
  if (request.mode === "navigate") {
    event.respondWith(navigateFetch(request));
    return;
  }

  // Assets estáticos → Cache-first
  event.respondWith(cacheFirst(request));
});

// ─── Estratégias ──────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Recurso não disponível offline.", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Sem conexão com a internet." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function navigateFetch(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    // Tentar cache primeiro
    const cached = await caches.match(request);
    if (cached) return cached;

    // Tentar a raiz cacheada
    const root = await caches.match("/");
    if (root) return root;

    // Fallback offline HTML
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
      background: #FAF6F1;
      color: #1B2438;
      text-align: center;
    }
    .icon { font-size: 3rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #1B2438; }
    p { font-size: 0.95rem; color: #5B6470; max-width: 32ch; line-height: 1.5; }
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
      transition: background 0.15s ease;
    }
    button:hover { background: #2F8A63; border-color: #2F8A63; }
    @media (prefers-color-scheme: dark) {
      body { background: #16382A; color: #FAF6F1; }
      h1 { color: #FAF6F1; }
      p { color: #A4B2AA; }
      button { background: #2F8A63; border-color: #2F8A63; }
    }
  </style>
</head>
<body>
  <div class="icon">📶</div>
  <h1>Sem conexão</h1>
  <p>Você está offline. Verifique sua conexão e tente novamente.</p>
  <button onclick="window.location.reload()">Tentar novamente</button>
</body>
</html>`;
}
