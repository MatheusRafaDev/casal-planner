import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";

import { BrandLogoIcon, BrandLogoText } from "@/components/ui/BrandLogo";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthGate,
});

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4 font-sans select-none">
        <div className="flex flex-col items-center gap-3">
          <BrandLogoIcon size="xl" className="h-16 w-16 animate-pulse" />
          <BrandLogoText size="lg" />
          <div className="text-xs text-muted-foreground font-medium animate-pulse mt-1">
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
