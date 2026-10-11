import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { clearAppData } from "@/lib/clear-app-data";
import { api } from "@/lib/api";
import { BrandLogoBadge } from "@/components/ui/BrandLogo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <div className="card-sticker-lg max-w-md w-full text-center p-8 bg-card shadow-[5px_5px_0_var(--border)]">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <BrandLogoBadge size="lg" />
          <span className="font-display text-xl font-bold">CasalPlanner</span>
        </div>
        <h1 className="text-7xl font-display font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-display font-bold text-foreground">
          Página não encontrada
        </h2>
        <p className="mt-2 text-base text-muted-foreground font-medium">
          O endereço acessado não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="btn-sticker inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-2.5 text-base font-bold"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <div className="card-sticker-lg max-w-md w-full text-center p-8 bg-card shadow-[5px_5px_0_var(--border)]">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-base text-muted-foreground font-medium">
          Algo deu errado. Tente novamente ou volte para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="btn-sticker inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold cursor-pointer"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="btn-sticker inline-flex items-center justify-center bg-card text-foreground px-5 py-2.5 text-sm font-bold"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "CasalPlanner - Organize seu enxoval com o seu par" },
      {
        name: "description",
        content:
          "Planeje a compra dos itens da casa nova por cômodo, controle orçamento em VR e dinheiro, e pesquise preços com IA. Feito para casais e para você.",
      },
      { name: "author", content: "CasalPlanner" },
      { property: "og:title", content: "CasalPlanner - Enxoval, orçamento e preços com IA" },
      {
        property: "og:description",
        content:
          "Organize por cômodo, acompanhe o gasto e encontre os melhores preços — juntos ou sozinho.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // PWA
      { name: "theme-color", content: "#2F7D5B" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "CasalPlanner" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Fredoka:wght@500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        src: "https://accounts.google.com/gsi/client",
        async: true,
        defer: true,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.removeItem('cp_theme');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Keep-alive: ping no backend a cada 14 minutos para evitar cold starts (ex: Render) enquanto a aba estiver aberta
    const keepAliveInterval = setInterval(
      () => {
        api("/api/health").catch(() => { });
      },
      14 * 60 * 1000,
    );

    return () => clearInterval(keepAliveInterval);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      if (!sessionStorage.getItem("app_initialized")) {
        clearAppData();
        sessionStorage.setItem("app_initialized", "true");
      }
    }

    // Capturar erro de lazy loading do Vite (ex: Vercel deployou novos chunks e o PWA tentou buscar os antigos)
    const handlePreloadError = (e: Event) => {
      e.preventDefault();
      window.location.reload();
    };
    window.addEventListener("vite:preloadError", handlePreloadError);

    return () => {
      window.removeEventListener("vite:preloadError", handlePreloadError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Outlet />
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
