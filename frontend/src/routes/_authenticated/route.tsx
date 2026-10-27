import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/AppShell";
import { BrandLogoIcon } from "@/components/ui/BrandLogo";

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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex flex-col items-center gap-3.5"
        >
          <div className="relative flex items-center justify-center">
            <BrandLogoIcon size="sm" className="h-8 w-8" />
            <div className="absolute -inset-2.5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Carregando...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
