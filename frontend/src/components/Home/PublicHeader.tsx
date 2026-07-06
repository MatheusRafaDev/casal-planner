import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function PublicHeader() {
  const { isDarkMode, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/">
          <BrandMark size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Alternar tema"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-gradient-brand text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
          >
            <Link to="/login">Começar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
