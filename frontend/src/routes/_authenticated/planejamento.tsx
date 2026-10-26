import { lazy, Suspense, useState, useMemo, useDeferredValue, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  Check,
  ExternalLink,
  Loader2,
  Package,
  Users,
  Wallet,
  AlertTriangle,
  Gift,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { getLogoUrls } from "@/lib/logos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { categoriasService } from "@/services/categorias";
import { itensService } from "@/services/itens";
import type { Categoria, Item } from "@/services/types";
import { brl, toTitleCase, formatDate } from "@/lib/formatters";
import { valorParcela, calcularStatusParcelas } from "@/lib/parcelas";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

import { iconFor, comodoColor } from "@/components/planejamento/icon-map";
import { CategoriaFormModal } from "@/components/planejamento/CategoriaFormModal";
import { ItemFormModal } from "@/components/planejamento/ItemFormModal";
import { PlanejamentoSkeleton, ItemCardSkeleton } from "@/components/ui/LoadingSkeletons";

const AddItemWizard = lazy(() =>
  import("@/components/planejamento/AddItemWizard").then(({ AddItemWizard }) => ({
    default: AddItemWizard,
  })),
);

export const Route = createFileRoute("/_authenticated/planejamento")({
  validateSearch: (search: Record<string, unknown>): { comodo?: string } => ({
    comodo: typeof search.comodo === "string" ? search.comodo : undefined,
  }),
  head: () => ({
    meta: [{ title: "CasalPlanner - Planejamento" }, { name: "robots", content: "noindex" }],
  }),
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  const qc = useQueryClient();
  const { comodo } = Route.useSearch();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>(() => comodo ?? "tudo");

  useEffect(() => {
    if (comodo) {
      setCategoriaSelecionada(comodo);
    }
  }, [comodo]);

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDeferredValue(busca);
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "comprados" | "faltando" | "presentes"
  >("todos");
  const [filtroPagamento, setFiltroPagamento] = useState<"todos" | "normal" | "vr">("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState<"todos" | "1" | "2">("todos");

  const { usuario } = useAuth();
  const isCasal = usuario?.tipoConta === "Casal";
  const p1 = usuario?.casalInfo?.pessoa1?.nome || "Pessoa 1";
  const p2 = usuario?.casalInfo?.pessoa2?.nome || "Pessoa 2";

  const [novaCategoria, setNovaCategoria] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null);
  const [excluindoCategoria, setExcluindoCategoria] = useState<Categoria | null>(null);
  const [adicionandoItem, setAdicionandoItem] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editandoItem, setEditandoItem] = useState<Item | null>(null);
  const [imagemAmpliada, setImagemAmpliada] = useState<Item | null>(null);
  const [excluindoItem, setExcluindoItem] = useState<Item | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById("sidebar-categories-portal"));
  }, []);

  const categoriasQ = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriasService.listar(),
  });

  const categorias = useMemo(() => categoriasQ.data ?? [], [categoriasQ.data]);
  const catAtualId = categoriaSelecionada || "tudo";
  const catAtual =
    catAtualId === "tudo" ? null : (categorias.find((c) => c.id === catAtualId) ?? null);

  const itensQ = useInfiniteQuery({
    queryKey: [
      "itens-paginado",
      catAtualId,
      buscaDebounced,
      filtroStatus,
      filtroPagamento,
      filtroResponsavel,
    ],
    queryFn: ({ pageParam = 1 }) =>
      itensService.listarPaginado({
        categoriaId: catAtualId === "tudo" ? undefined : catAtualId,
        busca: buscaDebounced.trim() || undefined,
        status: filtroStatus !== "todos" ? filtroStatus : undefined,
        pagamento: filtroPagamento !== "todos" ? filtroPagamento : undefined,
        responsavelId:
          isCasal && filtroResponsavel !== "todos" ? Number(filtroResponsavel) : undefined,
        page: pageParam as number,
        pageSize: 20,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });

  const itensFiltrados = useMemo(
    () => itensQ.data?.pages.flatMap((p) => p.items) ?? [],
    [itensQ.data],
  );

  const todosItensQ = useQuery({
    queryKey: ["itens"],
    queryFn: () => itensService.listar(),
  });
  const todosItens = useMemo(() => todosItensQ.data ?? [], [todosItensQ.data]);

  // Totais globais
  const totalGastoGeral = useMemo(() => {
    return todosItens
      .filter((i) => !["ganho", "presente", "prometido"].includes(i.origem ?? ""))
      .reduce((s, i) => s + i.preco * i.quantidade, 0);
  }, [todosItens]);

  const metaGeral = useMemo(() => {
    if (usuario?.metaGlobalEnxoval && usuario.metaGlobalEnxoval > 0) {
      return usuario.metaGlobalEnxoval;
    }
    return categorias.reduce((s, c) => s + (c.metaOrcamento || 0), 0);
  }, [usuario, categorias]);

  // Itens da categoria selecionada ou todos
  const itensCategoria = useMemo(() => {
    return todosItens.filter((i) => catAtualId === "tudo" || i.categoriaId === catAtualId);
  }, [todosItens, catAtualId]);

  const totalCategoria = useMemo(() => {
    return itensCategoria
      .filter((i) => !["ganho", "presente", "prometido"].includes(i.origem ?? ""))
      .reduce((s, i) => s + i.preco * i.quantidade, 0);
  }, [itensCategoria]);

  const compradosCategoria = useMemo(() => {
    return itensCategoria.filter(
      (i) => i.comprado && !["ganho", "presente"].includes(i.origem ?? ""),
    ).length;
  }, [itensCategoria]);

  const ganhadosCategoria = useMemo(() => {
    return itensCategoria.filter(
      (i) => i.comprado && ["ganho", "presente"].includes(i.origem ?? ""),
    ).length;
  }, [itensCategoria]);

  const totalGanhosCategoria = useMemo(() => {
    return itensCategoria
      .filter((i) => ["ganho", "presente"].includes(i.origem ?? ""))
      .reduce((s, i) => s + i.preco * i.quantidade, 0);
  }, [itensCategoria]);

  // Divisão de gastos por pessoa
  let totalP1 = 0;
  let totalP2 = 0;
  let totalConjunto = 0;

  itensCategoria.forEach((i) => {
    if (["ganho", "presente", "prometido"].includes(i.origem ?? "")) return;
    const valorTotal = i.preco * i.quantidade;
    if (i.divisaoPagamento) {
      totalP1 += i.divisaoPagamento.valorPessoa1 || 0;
      totalP2 += i.divisaoPagamento.valorPessoa2 || 0;
    } else if (i.responsavelId === 1) {
      totalP1 += valorTotal;
    } else if (i.responsavelId === 2) {
      totalP2 += valorTotal;
    } else {
      totalConjunto += valorTotal;
    }
  });

  const { totalDinheiro, totalVr } = useMemo(() => {
    const vr = itensCategoria
      .filter(
        (i) => i.pagamento === "vr" && !["ganho", "presente", "prometido"].includes(i.origem ?? ""),
      )
      .reduce((s, i) => s + i.preco * i.quantidade, 0);
    return {
      totalVr: vr,
      totalDinheiro: Math.max(0, totalCategoria - vr),
    };
  }, [itensCategoria, totalCategoria]);

  const metaAtual = catAtual?.metaOrcamento || (catAtualId === "tudo" ? metaGeral : 0);
  const restanteAtual = Math.max(0, metaAtual - totalCategoria);
  const estourouAtual = metaAtual > 0 && totalCategoria > metaAtual;

  const toggleComprado = useMutation({
    mutationFn: ({ id, comprado }: { id: string; comprado: boolean }) =>
      itensService.toggleComprado(id, comprado),
    onMutate: async ({ id, comprado }) => {
      await qc.cancelQueries({ queryKey: ["itens-paginado"] });
      await qc.cancelQueries({ queryKey: ["itens"] });
      qc.setQueriesData({ queryKey: ["itens-paginado"] }, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { pages: Array<{ items: Item[] }> };
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((i: Item) =>
              i.id === id
                ? {
                    ...i,
                    comprado,
                    dataCompra: comprado ? i.dataCompra || new Date().toISOString() : null,
                  }
                : i,
            ),
          })),
        };
      });
      qc.setQueryData<Item[]>(["itens"], (old) => {
        if (!old) return old;
        return old.map((i) =>
          i.id === id
            ? {
                ...i,
                comprado,
                dataCompra: comprado ? i.dataCompra || new Date().toISOString() : null,
              }
            : i,
        );
      });
    },
    onError: () => {
      toast.error("Erro ao atualizar item");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["itens-paginado"] });
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
    },
  });

  const excluirItem = useMutation({
    mutationFn: (id: string) => itensService.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens-paginado"] });
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      toast.success("Item removido");
      setExcluindoItem(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const excluirCategoria = useMutation({
    mutationFn: (id: string) => categoriasService.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["itens-paginado"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      setExcluindoCategoria(null);
      setCategoriaSelecionada("tudo");
      toast.success("Cômodo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if ((categoriasQ.isLoading && categorias.length === 0) || (itensQ.isLoading && !itensQ.data)) {
    return <PlanejamentoSkeleton />;
  }

  return (
    <div className="w-full space-y-6">
      {/* Sidebar categories portaled into AppShell desktop sidebar */}
      {portalTarget &&
        createPortal(
          <div className="flex flex-col gap-1.5 w-full shrink-0">
            {/* Card Todos Os Itens */}
            <div
              onClick={() => setCategoriaSelecionada("tudo")}
              className={cn(
                "group flex items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer border select-none",
                catAtualId === "tudo"
                  ? "bg-white/20 border-white/30 text-white shadow-xs font-bold"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-emerald-100/80 hover:text-white",
              )}
            >
              <span className="grid place-items-center h-8 w-8 rounded-lg text-white shrink-0 bg-white/20 shadow-xs">
                <Package className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs sm:text-sm truncate text-white">
                  Todos Os Itens
                </div>
                <div className="text-[11px] font-semibold text-emerald-200/70 mt-0.5">
                  <span>
                    {todosItens.filter((i) => i.comprado).length}/{todosItens.length} -{" "}
                    <span className="tabular-nums font-bold text-white">
                      {brl(totalGastoGeral)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Cômodos */}
            {categorias.map((c) => {
              const I = iconFor(c.icon);
              const ativo = c.id === catAtualId;
              const cItens = todosItens.filter((it) => it.categoriaId === c.id);
              const cComprados = cItens.filter((it) => it.comprado).length;
              const cGasto = cItens
                .filter((it) => !["ganho", "presente", "prometido"].includes(it.origem ?? ""))
                .reduce((s, it) => s + it.preco * it.quantidade, 0);

              return (
                <div
                  key={c.id}
                  onClick={() => setCategoriaSelecionada(c.id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer border select-none",
                    ativo
                      ? "bg-white/20 border-white/30 text-white shadow-xs font-bold"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-emerald-100/80 hover:text-white",
                    c.metaOrcamento &&
                      cGasto > c.metaOrcamento &&
                      !ativo &&
                      "border-rose-400/40 bg-rose-500/15",
                  )}
                >
                  <span
                    className="grid place-items-center h-8 w-8 rounded-lg text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: comodoColor(c.bg, c.nome) }}
                  >
                    <I className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm truncate flex items-center gap-1.5 capitalize text-white">
                      {c.nome}
                      {c.metaOrcamento && cGasto > c.metaOrcamento && (
                        <span title="Orçamento estourado" className="inline-flex shrink-0">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-300" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-200/70 mt-0.5">
                      <span>
                        {cComprados}/{cItens.length} -{" "}
                        <span className="tabular-nums font-bold text-white">
                          {brl(cGasto)}
                        </span>
                      </span>
                      {c.metaOrcamento ? (
                        <div className="mt-1 h-1 w-full bg-white/20 rounded-full overflow-hidden border border-white/10">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              cGasto / c.metaOrcamento < 0.8
                                ? "bg-emerald-300"
                                : cGasto / c.metaOrcamento <= 1
                                  ? "bg-amber-300"
                                  : "bg-rose-400",
                            )}
                            style={{
                              width: `${Math.min(100, (cGasto / c.metaOrcamento) * 100)}%`,
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="p-1 rounded-md text-emerald-200/60 hover:text-white hover:bg-white/15 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Opções do cômodo"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditandoCategoria(c)}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar cômodo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setExcluindoCategoria(c)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir cômodo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}

            {/* Botão Adicionar Novo Cômodo */}
            <button
              type="button"
              id="sidebar-btn-novo-comodo"
              onClick={() => setNovaCategoria(true)}
              aria-label="Adicionar novo cômodo"
              className="group flex items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer border-2 border-dashed border-white/25 hover:border-emerald-300/80 bg-white/5 hover:bg-white/10 text-emerald-100 hover:text-white select-none w-full text-left mt-0.5"
            >
              <span className="grid place-items-center h-8 w-8 rounded-lg shrink-0 border-2 border-dashed border-white/30 group-hover:border-emerald-300 group-hover:bg-white/10 text-emerald-200 group-hover:text-emerald-100 transition-all">
                <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs sm:text-sm whitespace-nowrap text-white group-hover:text-emerald-200 transition-colors">
                  Adicionar novo cômodo
                </div>
                <div className="text-[11px] font-semibold text-emerald-200/60 group-hover:text-emerald-200/80 mt-0.5 transition-colors">
                  Criar novo espaço
                </div>
              </div>
            </button>
          </div>,
          portalTarget,
        )}

      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Planejamento
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-0.5">
            Organize os itens por cômodo e controle o orçamento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            className="btn-sticker bg-card text-foreground font-bold text-xs sm:text-sm"
            onClick={() => setNovaCategoria(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo cômodo
          </Button>
          <Button
            className="btn-sticker bg-primary text-primary-foreground font-bold text-xs sm:text-sm"
            onClick={() => {
              if (categorias.length === 0) {
                toast.info("Crie seu primeiro cômodo para organizar os itens!");
                setNovaCategoria(true);
              } else {
                setWizardOpen(true);
              }
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar item
          </Button>
        </div>
      </header>

      {/* Mobile Horizontal Room Carousel & Selector (md:hidden) */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll -mx-4 px-4 py-1">
          {/* Todos os Itens Pill */}
          <button
            type="button"
            onClick={() => setCategoriaSelecionada("tudo")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border select-none active:scale-95",
              catAtualId === "tudo"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground",
            )}
          >
            <Package className="h-3.5 w-3.5" />
            <span>Todos</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                catAtualId === "tudo" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
              )}
            >
              {todosItens.length}
            </span>
          </button>

          {/* Cômodos */}
          {categorias.map((c) => {
            const I = iconFor(c.icon);
            const ativo = c.id === catAtualId;
            const count = todosItens.filter((it) => it.categoriaId === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoriaSelecionada(c.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border select-none active:scale-95",
                  ativo
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:text-foreground",
                )}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: comodoColor(c.bg, c.nome) }}
                />
                <span className="capitalize">{c.nome}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    ativo ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Botão Adicionar Novo Cômodo Rápido */}
          <button
            type="button"
            onClick={() => setNovaCategoria(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        </div>
      </div>

      {/* Summary Card com visual Verde Lar Oficial do Design System */}
      <div className="card-sticker p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-[#1F5C43] via-[#1a4f3a] to-[#154230] text-white flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-[3px_3px_0_rgba(19,60,43,0.6)] border-2 border-[#16382a]">
        {/* Left: Category Icon, Title, and Progress Info */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <span
            className="grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl text-white shrink-0 border-2 border-white/20 shadow-xs"
            style={{
              backgroundColor: catAtual
                ? comodoColor(catAtual.bg, catAtual.nome)
                : "rgba(255, 255, 255, 0.2)",
            }}
          >
            {(() => {
              const I = catAtual ? iconFor(catAtual.icon) : Package;
              return <I className="h-6 w-6 sm:h-7 sm:w-7" />;
            })()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white capitalize">
                {catAtual ? catAtual.nome : "Todos os itens"}
              </h2>
              {catAtual?.metaOrcamento && totalCategoria > catAtual.metaOrcamento && (
                <span
                  title="Orçamento estourado"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-200 bg-rose-500/30 px-2.5 py-0.5 rounded-full border border-rose-400/40"
                >
                  <AlertTriangle className="h-3 w-3" /> Acima da meta
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-100/85 font-semibold flex-wrap">
              <span>
                {compradosCategoria} {compradosCategoria === 1 ? "comprado" : "comprados"}
              </span>
              {ganhadosCategoria > 0 && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="text-amber-300 font-bold inline-flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    {ganhadosCategoria} {ganhadosCategoria === 1 ? "ganho" : "ganhos"}
                  </span>
                </>
              )}
              <span className="text-white/40">·</span>
              <span>de {itensCategoria.length} itens</span>
              {itensCategoria.length > 0 && (
                <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  {Math.round(
                    ((compradosCategoria + ganhadosCategoria) / itensCategoria.length) * 100,
                  )}
                  % concluído
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metrics (Total Gasto, Dinheiro/VR, Divisão do Casal em Chips) */}
        <div className="flex items-center gap-5 sm:gap-6 lg:gap-8 flex-wrap">
          {/* Total Gasto */}
          <div className="flex flex-col justify-center min-w-[120px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/90 mb-1">
              Total gasto
            </span>
            <span
              className={cn(
                "font-display text-2xl sm:text-3xl font-extrabold leading-none tabular-nums tracking-tight text-white",
                estourouAtual && "text-rose-300",
              )}
            >
              {brl(totalCategoria)}
            </span>
            {metaAtual > 0 ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold flex-wrap">
                <span className="text-emerald-200/75">meta: {brl(metaAtual)}</span>
                {!estourouAtual ? (
                  <span className="text-emerald-300 font-bold">
                    · resta {brl(restanteAtual)}
                  </span>
                ) : (
                  <span className="text-rose-300 font-bold">
                    · +{brl(totalCategoria - metaAtual)}
                  </span>
                )}
              </div>
            ) : null}
          </div>

          <div className="h-10 w-px bg-white/20 hidden sm:block" />

          {/* Dinheiro & VR */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200/90 mb-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-300" /> Dinheiro
            </div>
            <span className="font-display text-lg sm:text-xl font-bold text-white tabular-nums leading-none">
              {brl(totalDinheiro)}
            </span>
            {totalVr > 0 && (
              <span className="text-[11px] font-semibold text-emerald-200/80 mt-1.5">
                VR: <span className="tabular-nums font-bold text-white">{brl(totalVr)}</span>
              </span>
            )}
          </div>

          {/* Divisão do Casal */}
          {isCasal && (
            <>
              <div className="h-10 w-px bg-white/20 hidden md:block" />
              <div className="flex flex-col justify-center gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200/90">
                  <Users className="w-3.5 h-3.5 text-emerald-300" /> Divisão do Casal
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Pessoa 1 */}
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/25 shadow-2xs backdrop-blur-xs"
                    title={`${p1}: ${brl(totalP1)}`}
                  >
                    <span className="w-4.5 h-4.5 rounded-md bg-emerald-400 text-emerald-950 font-bold text-[10px] grid place-items-center uppercase shrink-0">
                      {p1.trim()[0]}
                    </span>
                    <span className="text-xs font-semibold text-white/90">
                      {p1.split(" ")[0]}:
                    </span>
                    <span className="text-xs font-bold text-white tabular-nums">
                      {brl(totalP1)}
                    </span>
                  </div>

                  {/* Pessoa 2 */}
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/25 shadow-2xs backdrop-blur-xs"
                    title={`${p2}: ${brl(totalP2)}`}
                  >
                    <span className="w-4.5 h-4.5 rounded-md bg-[#EF6F6C] text-white font-bold text-[10px] grid place-items-center uppercase shrink-0">
                      {p2.trim()[0]}
                    </span>
                    <span className="text-xs font-semibold text-white/90">
                      {p2.split(" ")[0]}:
                    </span>
                    <span className="text-xs font-bold text-white tabular-nums">
                      {brl(totalP2)}
                    </span>
                  </div>

                  {/* Conjunto */}
                  {totalConjunto > 0 && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 border border-white/25 shadow-2xs backdrop-blur-xs"
                      title={`Juntos: ${brl(totalConjunto)}`}
                    >
                      <span className="w-4.5 h-4.5 rounded-md bg-emerald-300/30 text-emerald-200 font-bold text-[10px] grid place-items-center shrink-0">
                        <Users className="w-2.5 h-2.5" />
                      </span>
                      <span className="text-xs font-semibold text-white/90">Juntos:</span>
                      <span className="text-xs font-bold text-white tabular-nums">
                        {brl(totalConjunto)}
                      </span>
                    </div>
                  )}

                  {/* Ganhos / Presentes */}
                  {totalGanhosCategoria > 0 && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-300/35 shadow-2xs backdrop-blur-xs"
                      title={`Ganhos / Presentes: ${brl(totalGanhosCategoria)}`}
                    >
                      <span className="w-4.5 h-4.5 rounded-md bg-amber-400 text-amber-950 font-bold text-[10px] grid place-items-center shrink-0">
                        <Gift className="w-2.5 h-2.5" />
                      </span>
                      <span className="text-xs font-semibold text-amber-200">
                        Ganhos:
                      </span>
                      <span className="text-xs font-bold text-white tabular-nums">
                        {brl(totalGanhosCategoria)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative w-full sm:flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-10 text-xs sm:text-sm card-sticker w-full"
            placeholder="Buscar item ou marca..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <Select
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as typeof filtroStatus)}
          >
            <SelectTrigger className="h-10 text-xs sm:text-sm card-sticker w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="faltando">Faltando</SelectItem>
              <SelectItem value="comprados">Comprados</SelectItem>
              <SelectItem value="presentes">Presentes</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filtroPagamento}
            onValueChange={(v) => setFiltroPagamento(v as typeof filtroPagamento)}
          >
            <SelectTrigger className="h-10 text-xs sm:text-sm card-sticker w-full sm:w-32">
              <SelectValue placeholder="Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Pagamento</SelectItem>
              <SelectItem value="normal">Dinheiro</SelectItem>
              <SelectItem value="vr">VR / VA</SelectItem>
            </SelectContent>
          </Select>

          {isCasal && (
            <div className="col-span-2 sm:col-span-1">
              <Select
                value={filtroResponsavel}
                onValueChange={(v) => setFiltroResponsavel(v as typeof filtroResponsavel)}
              >
                <SelectTrigger className="h-10 text-xs sm:text-sm card-sticker w-full sm:w-32">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Responsável</SelectItem>
                  <SelectItem value="1">{p1.split(" ")[0]}</SelectItem>
                  <SelectItem value="2">{p2.split(" ")[0]}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Items List matching media_1791749066370.png */}
      <div
        className={cn(
          "flex flex-col gap-2.5 transition-opacity duration-200",
          itensQ.isFetching && !itensQ.isLoading && "opacity-80",
        )}
      >
        {itensQ.isLoading && !itensQ.data && (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!itensQ.isLoading && itensFiltrados.length === 0 && (
          <div className="card-sticker p-12 text-center bg-card">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="font-display font-bold text-lg text-foreground mb-1">
              Nenhum item encontrado
            </h3>
            <p className="text-xs font-semibold text-muted-foreground mb-5 max-w-sm mx-auto">
              Tente ajustar os filtros ou adicione um novo produto.
            </p>
            <Button
              className="btn-sticker bg-primary text-primary-foreground font-bold"
              onClick={() => {
                if (categorias.length === 0) {
                  toast.info("Crie seu primeiro cômodo para organizar os itens!");
                  setNovaCategoria(true);
                } else {
                  setWizardOpen(true);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Adicionar item
            </Button>
          </div>
        )}

        {itensFiltrados.map((it) => {
          const itemCategoria = categorias.find((c) => c.id === it.categoriaId);
          const Icon = iconFor(itemCategoria?.icon ?? "package");
          const isPresente = ["ganho", "presente"].includes(it.origem ?? "");
          const isPrometido = it.origem === "prometido";
          const responsavelNum = it.responsavelId;

          const nomeResponsavel =
            responsavelNum === 1
              ? p1.split(" ")[0]
              : responsavelNum === 2
                ? p2.split(" ")[0]
                : "Casal";

          return (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              key={it.id}
              className={cn(
                "group card-sticker p-3 sm:p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0_var(--border)] transition-all",
                it.comprado && "bg-muted/30 border-border/60 shadow-none",
              )}
            >
              {/* Left: Checkbox + Thumbnail + Info */}
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                {/* Checkbox */}
                <Checkbox
                  className={cn(
                    "h-5 w-5 rounded-md border-2 shrink-0 cursor-pointer",
                    it.comprado &&
                      "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                  )}
                  checked={it.comprado}
                  onCheckedChange={() =>
                    toggleComprado.mutate({ id: it.id, comprado: !it.comprado })
                  }
                  aria-label={
                    it.comprado
                      ? isPresente
                        ? "Desmarcar ganhado"
                        : "Desmarcar comprado"
                      : isPresente
                        ? "Marcar como ganhado"
                        : "Marcar como comprado"
                  }
                />

                {/* Thumbnail / Room Icon */}
                {it.fotoUrl && !imageErrors[it.id] ? (
                  <button
                    type="button"
                    onClick={() => setImagemAmpliada(it)}
                    className={cn(
                      "h-12 w-12 rounded-xl border-2 border-border overflow-hidden shrink-0 bg-background transition-transform hover:scale-105",
                      it.comprado && "opacity-60 grayscale",
                    )}
                    title="Ver foto do item"
                  >
                    <img
                      src={it.fotoUrl}
                      alt={it.nome}
                      className="h-full w-full object-cover"
                      onError={() => setImageErrors((prev) => ({ ...prev, [it.id]: true }))}
                    />
                  </button>
                ) : (
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl border-2 border-border/60 grid place-items-center text-white shrink-0 shadow-xs",
                      it.comprado && "opacity-60 grayscale",
                    )}
                    style={{
                      backgroundColor: itemCategoria
                        ? comodoColor(itemCategoria.bg, itemCategoria.nome)
                        : "var(--primary)",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )}

                {/* Main Title & Subtitle Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  {/* Title + Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <button
                      type="button"
                      onClick={() => setEditandoItem(it)}
                      className={cn(
                        "font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors text-left truncate max-w-full block",
                        it.comprado && "line-through text-muted-foreground",
                      )}
                      title={it.nome}
                    >
                      {toTitleCase(it.nome)}
                    </button>

                    {/* Badge Origem (Ganho/Presente/Prometido) */}
                    {isPresente && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-2 h-4.5 font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300"
                      >
                        {it.comprado ? "Ganhado" : "Ganho"}
                      </Badge>
                    )}
                    {isPrometido && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-2 h-4.5 font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300"
                      >
                        Prometido
                      </Badge>
                    )}

                    {/* Badge Prioridade Alta / Urgente */}
                    {it.prioridade === "alta" && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-2 h-4.5 font-bold bg-destructive/10 text-destructive border-destructive/30"
                      >
                        Urgente
                      </Badge>
                    )}

                    {/* Badge Responsável / Casal */}
                    {isCasal && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] py-0 px-2 h-4.5 font-bold border",
                          responsavelNum === 1
                            ? "bg-p1/10 text-p1 border-p1/30"
                            : responsavelNum === 2
                              ? "bg-p2/15 text-p2 border-p2/40"
                              : "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {nomeResponsavel}
                      </Badge>
                    )}
                  </div>

                  {/* Subtitle details: Cômodo • Forma Pagto • Marca • Loja */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap font-medium">
                    <span className="truncate">{itemCategoria?.nome ?? "Sem cômodo"}</span>
                    <span>•</span>
                    <span>{it.pagamento === "vr" ? "VR/VA" : "Dinheiro"}</span>

                    {it.marca && (
                      <>
                        <span>•</span>
                        <span className="text-foreground/80 font-semibold">
                          {toTitleCase(it.marca)}
                        </span>
                      </>
                    )}

                    {it.loja && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-foreground/85 font-semibold">
                          <LogoBadge
                            urls={getLogoUrls(it.loja, it.linkProduto)}
                            className="w-3.5 h-3.5 rounded object-contain shrink-0"
                          />
                          <span>em {toTitleCase(it.loja)}</span>
                          {it.linkProduto && (
                            <a
                              href={it.linkProduto}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors ml-0.5"
                              title="Abrir no site da loja"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3 inline" />
                            </a>
                          )}
                        </div>
                      </>
                    )}
                    {it.dataCompra && (
                      <>
                        <span>•</span>
                        <span
                          className={
                            it.comprado
                              ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                              : "text-amber-700 dark:text-amber-400 font-semibold"
                          }
                        >
                          {it.comprado
                            ? isPresente
                              ? "Ganhado em "
                              : "Comprado em "
                            : "Previsão: "}
                          {formatDate(it.dataCompra)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Price + Installments + Menu */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2.5 sm:pt-0 border-t border-border/40 sm:border-t-0 sm:pl-3 sm:border-l sm:border-border/30">
                <div className="text-left sm:text-right">
                  <div
                    className={cn(
                      "font-display font-bold text-base sm:text-lg tabular-nums leading-none",
                      it.comprado ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {brl(it.preco * it.quantidade)}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-semibold mt-1">
                    {(it.parcelas ?? 1) > 1 ? (
                      (() => {
                        const status = calcularStatusParcelas(it);
                        if (it.comprado && status.quitado) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                              <span>
                                {it.quantidade > 1 ? `${it.quantidade} un · ` : ""}
                                {it.parcelas}x de {brl(status.valorParcela)}
                              </span>
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] uppercase tracking-wide">
                                Quitado
                              </span>
                            </span>
                          );
                        }
                        if (it.comprado && status.ativo && status.parcelaAtualMes > 0) {
                          return (
                            <span>
                              {it.quantidade > 1 ? `${it.quantidade} un · ` : ""}
                              <strong className="text-foreground">
                                {status.parcelaAtualMes}ª de {it.parcelas}x
                              </strong>{" "}
                              de {brl(status.valorParcela)}
                              {status.parcelasRestantes > 1 && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  ({status.parcelasRestantes} restantes)
                                </span>
                              )}
                              {(it.jurosMensal ?? 0) > 0 && " (com juros)"}
                            </span>
                          );
                        }
                        return (
                          <span>
                            {it.quantidade > 1 ? `${it.quantidade} un · ` : ""}
                            {it.parcelas}x de {brl(status.valorParcela)}
                            {(it.jurosMensal ?? 0) > 0 && " (com juros)"}
                          </span>
                        );
                      })()
                    ) : it.quantidade > 1 ? (
                      <span>
                        {it.quantidade}x {brl(it.preco)}
                      </span>
                    ) : (
                      <span>À vista</span>
                    )}
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Opções"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setEditandoItem(it)}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar item
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleComprado.mutate({ id: it.id, comprado: !it.comprado })}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {it.comprado
                          ? isPresente
                            ? "Desmarcar ganhado"
                            : "Marcar pendente"
                          : isPresente
                            ? "Marcar como ganhado"
                            : "Marcar comprado"}
                      </DropdownMenuItem>
                      {it.linkProduto && (
                        <DropdownMenuItem asChild>
                          <a href={it.linkProduto} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" /> Abrir no site
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setExcluindoItem(it)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Loading skeleton for next page */}
        {itensQ.isFetchingNextPage && (
          <div className="flex flex-col gap-2.5 pt-1">
            <ItemCardSkeleton />
            <ItemCardSkeleton />
          </div>
        )}

        {/* Pagination / Load more */}
        {itensQ.hasNextPage && !itensQ.isFetchingNextPage && (
          <div className="pt-4 flex justify-center">
            <Button
              variant="outline"
              className="btn-sticker"
              onClick={() => itensQ.fetchNextPage()}
              disabled={itensQ.isFetchingNextPage}
            >
              Carregar mais itens
            </Button>
          </div>
        )}
      </div>

      {/* Modals & Dialogs (All original features preserved) */}
      <CategoriaFormModal open={novaCategoria} onOpenChange={setNovaCategoria} />
      <CategoriaFormModal
        open={!!editandoCategoria}
        onOpenChange={(o) => !o && setEditandoCategoria(null)}
        categoria={editandoCategoria}
      />

      {wizardOpen && (
        <Suspense fallback={null}>
          <AddItemWizard
            open={wizardOpen}
            onOpenChange={setWizardOpen}
            categorias={categorias}
            categoriaInicialId={catAtualId === "tudo" ? "" : catAtualId}
          />
        </Suspense>
      )}

      <ItemFormModal
        open={adicionandoItem}
        onOpenChange={setAdicionandoItem}
        categorias={categorias}
        categoriaId={
          catAtualId === "tudo" && categorias.length > 0 ? categorias[0].id : catAtualId || ""
        }
        item={null}
      />

      {catAtualId && (
        <ItemFormModal
          open={!!editandoItem}
          onOpenChange={(o) => !o && setEditandoItem(null)}
          categorias={categorias}
          categoriaId={
            catAtualId === "tudo" && editandoItem ? editandoItem.categoriaId : catAtualId
          }
          item={editandoItem}
        />
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!imagemAmpliada} onOpenChange={(open) => !open && setImagemAmpliada(null)}>
        <DialogContent className="max-w-2xl p-4 card-sticker">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg">
              {imagemAmpliada?.nome}
            </DialogTitle>
          </DialogHeader>
          {imagemAmpliada?.fotoUrl && (
            <img
              src={imagemAmpliada.fotoUrl}
              alt={imagemAmpliada.nome}
              className="max-h-[70dvh] w-full rounded-xl object-contain border-2 border-border"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category AlertDialog */}
      <AlertDialog
        open={!!excluindoCategoria}
        onOpenChange={(o) => !o && setExcluindoCategoria(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este cômodo?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os itens de <b>{excluindoCategoria?.nome}</b> serão removidos. Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => excluindoCategoria && excluirCategoria.mutate(excluindoCategoria.id)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item AlertDialog */}
      <AlertDialog open={!!excluindoItem} onOpenChange={(o) => !o && setExcluindoItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <b>{excluindoItem?.nome}</b>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => excluindoItem && excluirItem.mutate(excluindoItem.id)}
            >
              {excluirItem.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
