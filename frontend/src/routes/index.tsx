import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMotionProps } from "@/hooks/use-reduced-motion";
import {
  ChefHat,
  Sofa,
  Bed,
  Bath,
  WashingMachine,
  Check,
  Circle,
  Clock,
  Gift,
  ScanSearch,
  Users,
  Wallet,
  Sparkles,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  Barcode,
  CloudSun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casal Planner — Uma casa nova começa com bons planos" },
      {
        name: "description",
        content:
          "Organizem o enxoval, planejem as compras e acompanhem os gastos juntos. Tudo em um só lugar, do primeiro item até a casa pronta.",
      },
    ],
  }),
  component: HomePage,
});

/* -------------------------------------------------------------------------- */
/* Helpers & Data                                                             */
/* -------------------------------------------------------------------------- */

const formatBRL = (val: number) =>
  val.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

interface RoomData {
  id: string;
  name: string;
  icon: typeof ChefHat;
  planned: number;
  spent: number;
  items: number;
  done: number;
}

const ROOMS_DATA: RoomData[] = [
  { id: "cozinha", name: "Cozinha", icon: ChefHat, planned: 9200, spent: 6100, items: 34, done: 22 },
  { id: "sala", name: "Sala", icon: Sofa, planned: 7800, spent: 4300, items: 18, done: 9 },
  { id: "quarto", name: "Quarto", icon: Bed, planned: 6400, spent: 4900, items: 21, done: 16 },
  { id: "banheiro", name: "Banheiro", icon: Bath, planned: 2100, spent: 1350, items: 15, done: 11 },
  { id: "lavanderia", name: "Lavanderia", icon: WashingMachine, planned: 2500, spent: 750, items: 9, done: 3 },
];

const TOTAL_PLANNED = ROOMS_DATA.reduce((acc, r) => acc + r.planned, 0);
const TOTAL_SPENT = ROOMS_DATA.reduce((acc, r) => acc + r.spent, 0);
const TOTAL_ITEMS = ROOMS_DATA.reduce((acc, r) => acc + r.items, 0);
const TOTAL_DONE = ROOMS_DATA.reduce((acc, r) => acc + r.done, 0);
const OVERALL_PERCENT = Math.round((TOTAL_DONE / TOTAL_ITEMS) * 100);

type ItemStatus = "comprado" | "pendente" | "presente" | "pesquisando";

interface RoomItem {
  name: string;
  qty: number;
  price: number;
  status: ItemStatus;
  who: string;
}

const ITEMS_BY_ROOM: Record<string, RoomItem[]> = {
  cozinha: [
    { name: "Jogo de panelas cerâmica", qty: 1, price: 789, status: "comprado", who: "Ana" },
    { name: "Air fryer 5L digital", qty: 1, price: 459, status: "pendente", who: "Lucas" },
    { name: "Copos de vidro temperado", qty: 12, price: 8, status: "comprado", who: "Lucas" },
    { name: "Liquidificador turbo", qty: 1, price: 0, status: "presente", who: "Tia Rosa" },
    { name: "Jogo de panos de prato", qty: 6, price: 12, status: "pendente", who: "Ana" },
    { name: "Micro-ondas 30L Inox", qty: 1, price: 699, status: "pesquisando", who: "Lucas" },
  ],
  sala: [
    { name: "Sofá retrátil 3 lugares", qty: 1, price: 2490, status: "comprado", who: "Ana & Lucas" },
    { name: "Tapete geométrico 2x2.5m", qty: 1, price: 640, status: "pendente", who: "Ana" },
    { name: "Rack com painel TV", qty: 1, price: 890, status: "comprado", who: "Lucas" },
    { name: "Almofadas decorativas", qty: 4, price: 0, status: "presente", who: "Amigos" },
    { name: "Cortina linho blecaute", qty: 1, price: 380, status: "pesquisando", who: "Ana" },
  ],
  quarto: [
    { name: "Colchão Queen Molas", qty: 1, price: 2890, status: "comprado", who: "Ana & Lucas" },
    { name: "Jogo de lençol 400 fios", qty: 2, price: 289, status: "comprado", who: "Ana" },
    { name: "Guarda-roupa casal 6 portas", qty: 1, price: 1990, status: "comprado", who: "Lucas" },
    { name: "Travesseiros viscoelásticos", qty: 2, price: 0, status: "presente", who: "Padrinhos" },
    { name: "Luminária de cabeceira", qty: 2, price: 95, status: "pendente", who: "Lucas" },
  ],
  banheiro: [
    { name: "Jogo de toalhas banhão", qty: 4, price: 80, status: "comprado", who: "Ana" },
    { name: "Espelheiro com LED", qty: 1, price: 450, status: "comprado", who: "Lucas" },
    { name: "Kit acessórios inox", qty: 1, price: 180, status: "pendente", who: "Ana" },
    { name: "Ducha higiênica", qty: 1, price: 160, status: "comprado", who: "Lucas" },
    { name: "Tapetes antiderrapantes", qty: 2, price: 45, status: "pendente", who: "Ana" },
  ],
  lavanderia: [
    { name: "Lava e Seca 11kg Inox", qty: 1, price: 3899, status: "pesquisando", who: "Ana & Lucas" },
    { name: "Varal de teto com manivela", qty: 1, price: 149, status: "comprado", who: "Lucas" },
    { name: "Cesto de roupas fibra", qty: 1, price: 119, status: "pendente", who: "Ana" },
    { name: "Tábua de passar dobrável", qty: 1, price: 189, status: "comprado", who: "Ana" },
  ],
};

const STATUS_CONFIG: Record<ItemStatus, { label: string; cls: string; icon: typeof Check }> = {
  comprado: {
    label: "Comprado",
    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Check,
  },
  pendente: {
    label: "Pendente",
    cls: "bg-muted text-muted-foreground border-border",
    icon: Circle,
  },
  presente: {
    label: "Presente",
    cls: "bg-primary/10 text-primary border-primary/20",
    icon: Gift,
  },
  pesquisando: {
    label: "Pesquisando",
    cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Clock,
  },
};

function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "warn" }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          tone === "brand" ? "bg-primary" : "bg-amber-500"
        }`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Main Home Page Component                                                   */
/* -------------------------------------------------------------------------- */

function HomePage() {
  const { theme, toggle } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string>("cozinha");

  const fadeUp = useMotionProps({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  });

  const activeRoom = ROOMS_DATA.find((r) => r.id === activeRoomId) || ROOMS_DATA[0];
  const activeItems = ITEMS_BY_ROOM[activeRoomId] || ITEMS_BY_ROOM.cozinha;
  const activePercent = Math.round((activeRoom.spent / activeRoom.planned) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 flex flex-col overflow-x-hidden">
      {/* -------------------------------------------------------------------- */}
      {/* 1. Header / Navbar                                                  */}
      {/* -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-foreground group">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
              </svg>
            </span>
            <span className="text-base font-bold font-display">Casal Planner</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Principal">
            <a href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </a>
            <a href="#planejador" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              O Planejador
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#lista-publica" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Lista Pública
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={toggle}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild variant="ghost" className="h-9 px-3.5 text-sm font-medium">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="h-9 px-4 text-sm font-semibold rounded-md shadow-sm">
              <Link to="/login" search={{ registrar: 1 }}>
                Começar gratuitamente
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={toggle}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground"
              title="Alternar tema"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-md hover:bg-muted"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <nav className="flex flex-col space-y-3">
              <a
                href="#beneficios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1.5 text-foreground hover:text-primary transition-colors"
              >
                Benefícios
              </a>
              <a
                href="#planejador"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1.5 text-foreground hover:text-primary transition-colors"
              >
                O Planejador
              </a>
              <a
                href="#como-funciona"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1.5 text-foreground hover:text-primary transition-colors"
              >
                Como funciona
              </a>
              <a
                href="#funcionalidades"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1.5 text-foreground hover:text-primary transition-colors"
              >
                Funcionalidades
              </a>
              <a
                href="#lista-publica"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1.5 text-foreground hover:text-primary transition-colors"
              >
                Buscar Lista de Presentes
              </a>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/login" search={{ registrar: 1 }}>
                    Criar conta
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ------------------------------------------------------------------ */}
        {/* 2. Hero Section                                                    */}
        {/* ------------------------------------------------------------------ */}
        <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-28 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
            {/* Left Column: Copy */}
            <motion.div
              {...useMotionProps({
                initial: { opacity: 0, y: 16 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
              })}
            >
    

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] font-display text-balance">
                Uma casa nova começa com bons planos.
              </h1>

              <p className="mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
                Organizem o enxoval, planejem as compras e acompanhem os gastos juntos. Tudo em um só lugar, do primeiro item até a casa pronta.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold rounded-md shadow-sm">
                  <Link to="/login" search={{ registrar: 1 }}>
                    Começar gratuitamente
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 text-sm font-medium rounded-md border-border">
                  <a href="#planejador">Conhecer o planejador</a>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> Sem cartão para começar
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> Sincronização a dois
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> Lista de presentes inclusa
                </span>
              </div>
            </motion.div>

            {/* Right Column: Hero Live Overview Card */}
            <motion.div
              {...useMotionProps({
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
              })}
              className="relative"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card" aria-label="Demonstração do painel">
                {/* Preview Topbar */}
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground font-mono">
                      Painel do Enxoval • Ana & Lucas
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Sincronizado
                  </span>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">
                  {/* Progress Header */}
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-semibold">Progresso do enxoval</p>
                      <p className="text-sm font-bold font-mono text-primary">{OVERALL_PERCENT}%</p>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={OVERALL_PERCENT} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {TOTAL_DONE} de {TOTAL_ITEMS} itens comprados
                    </p>
                  </div>

                  {/* 3 Stats Grid */}
                  <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-background/50">
                    <div className="min-w-0 p-3 text-center sm:text-left">
                      <p className="text-[11px] font-medium text-muted-foreground">Planejado</p>
                      <p className="mt-0.5 truncate text-sm font-bold font-mono sm:text-base">{formatBRL(TOTAL_PLANNED)}</p>
                    </div>
                    <div className="min-w-0 p-3 text-center sm:text-left">
                      <p className="text-[11px] font-medium text-muted-foreground">Gasto</p>
                      <p className="mt-0.5 truncate text-sm font-bold font-mono sm:text-base text-primary">{formatBRL(TOTAL_SPENT)}</p>
                    </div>
                    <div className="min-w-0 p-3 text-center sm:text-left">
                      <p className="text-[11px] font-medium text-muted-foreground">Pendente</p>
                      <p className="mt-0.5 truncate text-sm font-bold font-mono sm:text-base text-muted-foreground">
                        {formatBRL(TOTAL_PLANNED - TOTAL_SPENT)}
                      </p>
                    </div>
                  </div>

                  {/* Split Rooms & Next Purchases */}
                  <div className="grid gap-5 sm:grid-cols-[1.1fr_1fr]">
                    {/* Rooms progress mini list */}
                    <ul className="space-y-3">
                      {ROOMS_DATA.map((room) => {
                        const Icon = room.icon;
                        const pct = Math.round((room.done / room.items) * 100);
                        return (
                          <li key={room.id} className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold">{room.name}</span>
                                <span className="text-muted-foreground font-mono">
                                  {room.done}/{room.items}
                                </span>
                              </div>
                              <div className="mt-1">
                                <ProgressBar value={pct} />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Next Purchases Card */}
                    <div className="rounded-lg bg-muted/40 border border-border/70 p-3.5 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Próximas compras</p>
                        <ul className="mt-2.5 space-y-2 text-xs">
                          {[
                            { name: "Air fryer 5L", price: 459, who: "Lucas" },
                            { name: "Jogo de lençol queen", price: 289, who: "Ana" },
                            { name: "Tapete da sala", price: 640, who: "Ana" },
                          ].map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-center justify-between gap-2 rounded-md bg-card border border-border/60 px-2.5 py-2 shadow-xs"
                            >
                              <span className="min-w-0 truncate font-medium">{item.name}</span>
                              <span className="shrink-0 text-muted-foreground font-mono text-[11px]">
                                {formatBRL(item.price)} • {item.who}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Atualizado há 5 min</span>
                        <span className="text-primary font-medium">Sincronizado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 3. Benefícios (#beneficios)                                         */}
        {/* ------------------------------------------------------------------ */}
        <section id="beneficios" className="scroll-mt-20 border-b border-border bg-surface py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Benefícios</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                Menos planilhas soltas, mais clareza sobre a casa.
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Tudo o que você precisa para planejar o novo lar sem discussões, sem surpresas no fim do mês e com total transparência a dois.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-x-12 lg:gap-x-16">
              {/* Card 1: Tudo organizado por cômodo */}
              <motion.div {...fadeUp} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-bold font-display">Tudo organizado por cômodo</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Separem as compras da sala, cozinha, quarto, banheiro e demais ambientes. Nada fica esquecido.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {ROOMS_DATA.map((r) => {
                    const Icon = r.icon;
                    return (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium"
                      >
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        {r.name}
                      </span>
                    );
                  })}
                </div>
              </motion.div>

              {/* Card 2: Orçamento sob controle */}
              <motion.div {...fadeUp} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-bold font-display">Orçamento sob controle</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Saibam quanto já gastaram, quanto ainda falta e quais ambientes estão exigindo mais investimento.
                </p>
                <div className="mt-5 space-y-3">
                  {ROOMS_DATA.slice(0, 3).map((r) => (
                    <div key={r.id} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm">
                      <span className="font-medium text-xs">{r.name}</span>
                      <ProgressBar
                        value={Math.round((r.spent / r.planned) * 100)}
                        tone={r.spent / r.planned > 0.75 ? "warn" : "brand"}
                      />
                      <span className="text-xs text-muted-foreground font-mono">{formatBRL(r.spent)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Card 3: Compras mais inteligentes */}
              <motion.div {...fadeUp} className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-0.5">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display">Compras mais inteligentes</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Pesquisem preços, comparem opções e guardem links com logotipos automáticos de lojas. Suporte a leitor de código de barras físico (EAN) diretamente pelo celular.
                  </p>
                </div>
              </motion.div>

              {/* Card 4: Planejamento compartilhado */}
              <motion.div {...fadeUp} className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-0.5">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display">Planejamento compartilhado</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Organizem as responsabilidades e dividam os custos de acordo com a realidade de vocês. Separação automática entre dinheiro e VR/VA.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 4. O Planejador Interativo (#planejador)                           */}
        {/* ------------------------------------------------------------------ */}
        <section id="planejador" className="scroll-mt-20 py-20 md:py-28 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            {/* Left: Section Pitch */}
            <motion.div {...fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">O planejador</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                Cada item no seu lugar.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Naveguem pelos cômodos e vejam quantidade, valor, status e quem ficou responsável por cada compra. Clique nos botões ao lado para experimentar a tabela ao vivo.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Comprado:</strong> Itens garantidos com valor real registrado
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Presente:</strong> Ganho no chá de panela ou casamento (custo zero!)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Pesquisando:</strong> Monitorando links e comparando ofertas
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: Interactive Planner Demo */}
            <motion.div {...fadeUp}>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                {/* Header with Title and Room Selector Tabs */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                  <span className="text-sm font-bold font-display">Cômodos da Casa</span>
                  <span className="text-xs text-muted-foreground font-mono">Prévia interativa</span>
                </div>

                {/* Room Tabs Bar (Interactive!) */}
                <div className="flex gap-1.5 overflow-x-auto border-b border-border p-2 bg-background/50">
                  {ROOMS_DATA.map((room) => {
                    const Icon = room.icon;
                    const isActive = room.id === activeRoomId;
                    return (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoomId(room.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {room.name}
                      </button>
                    );
                  })}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] text-left text-sm">
                    <thead className="text-xs text-muted-foreground bg-muted/20">
                      <tr className="border-b border-border">
                        <th className="px-4 py-2.5 font-medium">Item</th>
                        <th className="px-2 py-2.5 font-medium">Qtd.</th>
                        <th className="px-2 py-2.5 font-medium">Valor</th>
                        <th className="px-2 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">Responsável</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {activeItems.map((item, idx) => {
                        const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.pendente;
                        const StatusIcon = statusMeta.icon;
                        return (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                            <td className="px-2 py-3 text-muted-foreground font-mono">{item.qty}</td>
                            <td className="px-2 py-3 font-mono">
                              {item.price > 0 ? formatBRL(item.price * item.qty) : <span className="text-muted-foreground">—</span>}
                            </td>
                            <td className="px-2 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${statusMeta.cls}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{item.who}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Room Budget Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/30 px-4 py-3 text-xs">
                  <span className="font-semibold text-foreground">Orçamento de {activeRoom.name}:</span>
                  <div className="min-w-[120px] max-w-[200px] flex-1">
                    <ProgressBar value={activePercent} tone={activePercent > 75 ? "warn" : "brand"} />
                  </div>
                  <span className="text-muted-foreground font-mono">
                    {formatBRL(activeRoom.spent)} de {formatBRL(activeRoom.planned)} ({activePercent}%)
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 5. Como Funciona (Do planejamento à casa pronta - #como-funciona)  */}
        {/* ------------------------------------------------------------------ */}
        <section id="como-funciona" className="scroll-mt-20 py-20 md:py-28 border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div {...fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Passo a passo</p>
              <h2 className="mt-3 max-w-xl text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                Do planejamento à casa pronta.
              </h2>
            </motion.div>

            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Organizem os ambientes",
                  desc: "Criem os cômodos da casa nova e adicionem os itens necessários com estimativas de custos.",
                },
                {
                  step: "02",
                  title: "Planejem cada compra",
                  desc: "Definam valores, prioridades e formas de pagamento (dinheiro vs benefício VR/VA) para cada produto.",
                },
                {
                  step: "03",
                  title: "Acompanhem juntos",
                  desc: "Atualizem o progresso em tempo real, celebrem cada conquista e controlem os gastos até o dia da mudança.",
                },
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  {...fadeUp}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-5xl font-extrabold text-primary font-display">{item.step}</span>
                    <h3 className="mt-4 text-xl font-bold font-display">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-1.5 text-xs text-primary font-semibold">
                    <span>Etapa essencial</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 6. Planejamento Financeiro / Divisão das Despesas                  */}
        {/* ------------------------------------------------------------------ */}
        <section className="py-20 md:py-28 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Financial Features Checklist */}
            <motion.div {...fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Planejamento financeiro</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                As contas da casa, sem surpresas.
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Mais do que uma lista de compras: uma plataforma desenhada para garantir equilíbrio financeiro entre o casal.
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Orçamento total da casa",
                  "Gastos separados por cômodo",
                  "Compras ainda pendentes",
                  "Dinheiro e VR/VA separados",
                  "Divisão justa entre duas pessoas",
                  "Itens recebidos como presente",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm font-medium">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right: Divisão das Despesas Card */}
            <motion.div {...fadeUp}>
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <p className="text-base font-bold font-display">Divisão das despesas</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">Exemplo real</span>
                </div>

                {/* 2 Persons Split Cards */}
                <div className="mt-5 grid grid-cols-2 gap-3.5">
                  {[
                    { name: "Ana", val: 9150, pct: 55 },
                    { name: "Lucas", val: 7400, pct: 45 },
                  ].map((p, idx) => (
                    <div key={idx} className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">{p.name}</p>
                      <p className="mt-1 text-2xl font-extrabold font-mono text-foreground">{formatBRL(p.val)}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.pct}% do total</p>
                    </div>
                  ))}
                </div>

                {/* Payment Breakdown Rows */}
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4 text-primary" /> Dinheiro / Cartão
                    </span>
                    <span className="font-semibold font-mono text-foreground">{formatBRL(14250)}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4 text-emerald-500" /> Benefícios VR / VA
                    </span>
                    <span className="font-semibold font-mono text-foreground">{formatBRL(2300)}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Gift className="h-4 w-4 text-amber-500" /> Presentes recebidos
                    </span>
                    <span className="font-semibold text-foreground">7 itens (R$ 0 custo)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 7. Funcionalidades & Inteligência (#funcionalidades)               */}
        {/* ------------------------------------------------------------------ */}
        <section id="funcionalidades" className="scroll-mt-20 py-20 md:py-28 border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Tecnologia prática</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                  Menos digitação, mais decisão.
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
                  <p>
                    A <strong className="text-foreground">pesquisa de preços</strong> reúne opções de um mesmo produto para vocês compararem antes de comprar e guardarem o link e o valor escolhido no item.
                  </p>
                  <p>
                    O <strong className="text-foreground">preenchimento inteligente de links</strong> busca automaticamente nome, marca, foto e especificações de qualquer loja apenas colando a URL.
                  </p>
                  <p>
                    Use o <strong className="text-foreground">scanner de código de barras (EAN)</strong> na câmera do seu celular para registrar itens instantaneamente enquanto caminha por lojas físicas.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild className="rounded-md">
                    <Link to="/login" search={{ registrar: 1 }}>
                      Criar conta e testar
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 4 Feature highlight pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <Barcode className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base font-display">Scanner EAN com Câmera</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Aponte para o código de barras de qualquer produto na loja e obtenha dados automáticos.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <CloudSun className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base font-display">Previsão do Dia da Mudança</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Contagem regressiva e previsão do tempo inteligente em tempo real para o grande dia.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base font-display">Extração Automática de Dados</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Identificação rápida de marcas, lojas e especificações técnicas sem digitação manual.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <Gift className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base font-display">Lista de Presentes Pública</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Link personalizado para compartilhar com amigos e padrinhos no chá de panela.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 8. Lista de Presentes Pública (#lista-publica)                     */}
        {/* ------------------------------------------------------------------ */}
        <section id="lista-publica" className="scroll-mt-20 py-20 md:py-24 border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-5">
              <Gift className="h-6 w-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Procurando uma lista de presentes?
            </h2>

            <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Foi convidado para um chá de casa nova ou casamento? Digite o código ou slug fornecido pelos anfitriões para acessar a lista.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const codigo = formData.get("codigo")?.toString().trim();
                if (codigo) {
                  const slug = codigo.split("/").filter(Boolean).pop() || codigo;
                  window.location.href = `/lista/${slug}`;
                }
              }}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="codigo"
                  placeholder="Ex: marcos-e-ana"
                  className="pl-10 h-11 bg-card border-border rounded-md text-sm"
                  required
                />
              </div>
              <Button type="submit" className="h-11 px-6 text-sm font-semibold rounded-md">
                Buscar Lista
              </Button>
            </form>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 9. Final Call to Action                                            */}
        {/* ------------------------------------------------------------------ */}
        <section className="py-20 md:py-28 border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-[1.1]">
                Cada detalhe da casa nova começa com um plano.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Reúnam as ideias, organizem as compras e acompanhem cada conquista juntos.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold rounded-md shadow-sm">
                  <Link to="/login" search={{ registrar: 1 }}>
                    Criar minha conta
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6 text-sm font-medium rounded-md border-border">
                  <Link to="/login">Já tenho uma conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* 10. Footer                                                           */}
      {/* -------------------------------------------------------------------- */}
      <footer className="border-t border-border bg-background py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
            {/* Brand column */}
            <div className="max-w-sm">
              <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground text-xs">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                  </svg>
                </span>
                <span className="text-base font-display">Casal Planner</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Planejamento do enxoval, das compras e dos gastos da casa nova — para uma pessoa ou para o casal.
              </p>
            </div>

            {/* Product links */}
            <div>
              <p className="text-sm font-semibold text-foreground">Produto</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#beneficios" className="hover:text-foreground transition-colors">
                    Benefícios
                  </a>
                </li>
                <li>
                  <a href="#planejador" className="hover:text-foreground transition-colors">
                    O Planejador
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-foreground transition-colors">
                    Como funciona
                  </a>
                </li>
                <li>
                  <a href="#funcionalidades" className="hover:text-foreground transition-colors">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#lista-publica" className="hover:text-foreground transition-colors">
                    Lista Pública
                  </a>
                </li>
              </ul>
            </div>

            {/* Account links */}
            <div>
              <p className="text-sm font-semibold text-foreground">Conta</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/login" className="hover:text-foreground transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link to="/login" search={{ registrar: 1 }} className="hover:text-foreground transition-colors">
                    Criar conta gratuita
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Casal Planner. Todos os direitos reservados.</p>
            <p className="text-xs">Projetado com precisão para uma vida a dois.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
