import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Shimmer({ className, rounded = "md" }: ShimmerProps) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded];

  return <div className={cn("skeleton-shimmer", roundedClass, className)} />;
}

export function InicioSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full space-y-6 md:space-y-8 font-sans"
    >
      {/* ─── Topo: Cabeçalho & Botão ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-8 w-64 md:w-80" rounded="lg" />
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="h-10 w-28 md:w-36" rounded="lg" />
          <Shimmer className="h-10 w-36 md:w-44" rounded="lg" />
        </div>
      </div>

      {/* ─── Cards Métricas Principais (3 colunas) ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-9 w-9" rounded="lg" />
            </div>
            <div className="space-y-1.5">
              <Shimmer className="h-8 w-40" rounded="md" />
              <Shimmer className="h-3 w-24" />
            </div>
            <div className="pt-2 border-t-2 border-border/10 flex items-center justify-between">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Widget Dia da Mudança ──────────────────────────────── */}
      <div className="skeleton-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shimmer className="h-10 w-10" rounded="lg" />
            <div className="space-y-1">
              <Shimmer className="h-5 w-44" />
              <Shimmer className="h-3 w-28" />
            </div>
          </div>
          <Shimmer className="h-8 w-24" rounded="full" />
        </div>
        <Shimmer className="h-4 w-full" rounded="full" />
      </div>

      {/* ─── Seção Cômodos ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Shimmer className="h-6 w-32" />
          <Shimmer className="h-4 w-20" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <Shimmer className="h-8 w-8" rounded="lg" />
                <Shimmer className="h-5 w-24" />
              </div>
              <div className="space-y-1 pt-1">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-2.5 w-full" rounded="full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Gráfico: Projeção dos Próximos Meses ─────────────────── */}
      <div className="skeleton-card p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <Shimmer className="h-6 w-56" />
          <Shimmer className="h-4 w-40" />
        </div>

        <div className="h-48 md:h-64 flex items-end justify-between gap-3 pt-6 px-4">
          {[40, 75, 55, 90, 65, 30].map((h, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full max-w-[48px] bg-muted/70 skeleton-shimmer"
                style={{ height: `${h}%` }}
              />
              <Shimmer className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="card-sticker p-3 sm:p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0_var(--border)]">
      {/* Esquerda: Checkbox + Imagem/Ícone + Informações */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
        {/* Checkbox Placeholder */}
        <Shimmer className="h-5 w-5 shrink-0 border-2 border-border/40" rounded="md" />

        {/* Thumbnail / Ícone Placeholder */}
        <Shimmer className="h-12 w-12 shrink-0 border-2 border-border/40" rounded="xl" />

        {/* Título & Detalhes */}
        <div className="flex-1 min-w-0 py-0.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <Shimmer className="h-5 w-36 sm:w-52" rounded="md" />
            <Shimmer className="h-4 w-14 hidden sm:block" rounded="full" />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Shimmer className="h-3.5 w-16" rounded="sm" />
            <span className="text-border/40">•</span>
            <Shimmer className="h-3.5 w-14" rounded="sm" />
            <span className="text-border/40">•</span>
            <Shimmer className="h-3.5 w-24" rounded="sm" />
          </div>
        </div>
      </div>

      {/* Direita: Preço + Parcelas + Ações */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 sm:pl-3 sm:border-l sm:border-border/30">
        <div className="text-left sm:text-right space-y-1">
          <Shimmer className="h-5 w-20 sm:ml-auto" rounded="md" />
          <Shimmer className="h-3 w-14 sm:ml-auto" rounded="sm" />
        </div>
        <Shimmer className="h-8 w-8 shrink-0" rounded="lg" />
      </div>
    </div>
  );
}

export function PlanejamentoSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full space-y-6 pb-20 font-sans"
    >
      {/* ─── Topo: Título & Botões ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Shimmer className="h-8 w-44 sm:w-56" rounded="lg" />
          <Shimmer className="h-4 w-64 sm:w-80" rounded="md" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Shimmer className="h-9 w-28 sm:w-32" rounded="xl" />
          <Shimmer className="h-9 w-32 sm:w-36" rounded="xl" />
        </div>
      </div>

      {/* ─── Seletor de Cômodos Mobile (md:hidden) ───────────────── */}
      <div className="md:hidden">
        <Shimmer className="h-10 w-full" rounded="xl" />
      </div>

      {/* ─── Card de Resumo (Summary Card) ─────────────────────── */}
      <div className="card-sticker p-4 sm:p-5 bg-card flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-[3px_3px_0_var(--border)]">
        {/* Esquerda: Ícone do cômodo & Título */}
        <div className="flex items-center gap-3.5">
          <Shimmer className="h-12 w-12 shrink-0 border-2 border-border/20" rounded="xl" />
          <div className="space-y-1.5">
            <Shimmer className="h-6 w-40" rounded="md" />
            <Shimmer className="h-3.5 w-32" rounded="sm" />
          </div>
        </div>

        {/* Direita: Total Gasto, Dinheiro, Casal */}
        <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
          <div className="space-y-1">
            <Shimmer className="h-3.5 w-16" rounded="sm" />
            <Shimmer className="h-6 w-28" rounded="md" />
          </div>
          <div className="h-8 w-px bg-border/60 hidden sm:block" />
          <div className="space-y-1">
            <Shimmer className="h-3.5 w-14" rounded="sm" />
            <Shimmer className="h-5 w-20" rounded="md" />
          </div>
        </div>
      </div>

      {/* ─── Barra de Filtros & Busca ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <Shimmer className="h-10 w-full sm:flex-1" rounded="xl" />
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Shimmer className="h-10 w-28 sm:w-32" rounded="xl" />
          <Shimmer className="h-10 w-32 sm:w-36" rounded="xl" />
        </div>
      </div>

      {/* ─── Lista de Itens Placeholder ─────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  );
}

export function PerfilSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full space-y-6 pb-12 font-sans"
    >
      {/* ─── Topo: Cabeçalho & Botão ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-9 w-48 sm:w-64" rounded="lg" />
        </div>
        <Shimmer className="h-9 w-32" rounded="lg" />
      </div>

      {/* ─── Grid Principal: 2 Colunas ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Perfil, Segurança, Meta */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Perfil */}
          <div className="skeleton-card p-5 md:p-6 space-y-5">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Shimmer className="h-10 w-full" rounded="lg" />
              <Shimmer className="h-10 w-full" rounded="lg" />
            </div>

            <div className="flex items-center gap-3.5 pb-2">
              <Shimmer className="h-12 w-12" rounded="full" />
              <div className="space-y-1.5 flex-1">
                <Shimmer className="h-5 w-40" />
                <Shimmer className="h-3.5 w-56" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Shimmer className="h-3.5 w-24" />
                <Shimmer className="h-10 w-full" rounded="lg" />
              </div>
              <div className="space-y-1">
                <Shimmer className="h-3.5 w-16" />
                <Shimmer className="h-10 w-full" rounded="lg" />
              </div>
              <div className="space-y-1">
                <Shimmer className="h-3.5 w-32" />
                <Shimmer className="h-10 w-full" rounded="lg" />
              </div>
            </div>

            <div className="pt-2">
              <Shimmer className="h-10 w-36" rounded="lg" />
            </div>
          </div>

          {/* Card: Segurança */}
          <div className="skeleton-card p-5 md:p-6 space-y-4">
            <Shimmer className="h-6 w-28" />
            <Shimmer className="h-4 w-64" />
            <Shimmer className="h-10 w-36" rounded="lg" />
          </div>

          {/* Card: Meta Financeira */}
          <div className="skeleton-card p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shimmer className="h-5 w-5" rounded="md" />
              <Shimmer className="h-6 w-52" />
            </div>
            <Shimmer className="h-4 w-72" />
            <div className="flex gap-2">
              <Shimmer className="h-10 w-full flex-1" rounded="lg" />
              <Shimmer className="h-10 w-24 shrink-0" rounded="lg" />
            </div>
          </div>
        </div>

        {/* Coluna Direita: Dia da Mudança, Lista, Exportar, Sessão */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Dia da Mudança */}
          <div className="skeleton-card p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Shimmer className="h-6 w-36" rounded="full" />
              <Shimmer className="h-8 w-24" rounded="lg" />
            </div>
            <Shimmer className="h-10 w-48" />
            <Shimmer className="h-4 w-full" rounded="full" />
          </div>

          {/* Card: Lista Pública */}
          <div className="skeleton-card p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shimmer className="h-5 w-5" rounded="md" />
                <Shimmer className="h-6 w-32" />
              </div>
              <Shimmer className="h-6 w-11" rounded="full" />
            </div>
            <Shimmer className="h-4 w-full" />
          </div>

          {/* Card: Exportar Dados */}
          <div className="skeleton-card p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shimmer className="h-5 w-5" rounded="md" />
              <Shimmer className="h-6 w-36" />
            </div>
            <Shimmer className="h-4 w-60" />
            <div className="grid grid-cols-2 gap-2">
              <Shimmer className="h-10 w-full" rounded="lg" />
              <Shimmer className="h-10 w-full" rounded="lg" />
            </div>
          </div>

          {/* Card: Sessão e Dados */}
          <div className="skeleton-card p-5 md:p-6 space-y-4">
            <Shimmer className="h-6 w-36" />
            <Shimmer className="h-4 w-64" />
            <div className="flex gap-3">
              <Shimmer className="h-10 w-24" rounded="lg" />
              <Shimmer className="h-10 w-36" rounded="lg" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
