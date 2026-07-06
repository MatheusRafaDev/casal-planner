import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { tokenStorage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  // Cheap synchronous check on client; deep check happens via AuthContext.
  beforeLoad: () => {
    if (typeof window !== "undefined" && !tokenStorage.exists()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { estaAutenticado, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !estaAutenticado) {
      void navigate({ to: "/login" });
    }
  }, [loading, estaAutenticado, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!estaAutenticado) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
