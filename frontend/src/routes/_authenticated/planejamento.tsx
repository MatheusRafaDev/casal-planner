import { lazy, Suspense, useState, useMemo, useDeferredValue, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreVertical,
  Sparkles,
  Check,
  ExternalLink,
  Wallet,
  Wand2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Package,
  AlertTriangle,
  Share2,
  FileText,
  Download,
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogoBadge } from "@/components/ui/LogoBadge";
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
import { brl, toTitleCase } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

import { iconFor } from "@/components/planejamento/icon-map";
import { CategoriaFormModal } from "@/components/planejamento/CategoriaFormModal";
import { ItemFormModal } from "@/components/planejamento/ItemFormModal";
import { getLogoUrls } from "@/lib/logos";

const AddItemWizard = lazy(() =>
  import("@/components/planejamento/AddItemWizard").then(({ AddItemWizard }) => ({
    default: AddItemWizard,
  })),
);

export const Route = createFileRoute("/_authenticated/planejamento")({
  head: () => ({
    meta: [{ title: "Planejamento - CasalPlanner" }, { name: "robots", content: "noindex" }],
  }),
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  const qc = useQueryClient();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
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
  const [modalCompartilharOpen, setModalCompartilharOpen] = useState(false);
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

  const categorias = categoriasQ.data ?? [];
  const catAtualId = categoriaSelecionada ?? "tudo";
  const catAtual = categorias.find((c) => c.id === catAtualId) ?? null;

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
  });

  // Lista plana de todos os itens das páginas carregadas
  const itensFiltrados = useMemo(
    () => itensQ.data?.pages.flatMap((p) => p.items) ?? [],
    [itensQ.data],
  );

  const namesToResolve = useMemo(() => {
    const names = new Set<string>();
    itensFiltrados.forEach((it) => {
      if (it.marca) names.add(it.marca);
      if (it.loja) names.add(it.loja);
    });
    return Array.from(names);
  }, [itensFiltrados]);

  // Query separada para totais da sidebar (traz tudo sem filtro de busca/status)
  const todosItensQ = useQuery({
    queryKey: ["itens"],
    queryFn: () => itensService.listar(),
    staleTime: 60_000,
  });
  const todosItens = todosItensQ.data ?? [];

  const resolvedDomains = {};

  const itensCategoria = todosItens.filter(
    (i) => catAtualId === "tudo" || i.categoriaId === catAtualId,
  );
  const totalCategoria = itensCategoria
    .filter((i) => i.origem !== "ganho")
    .reduce((s, i) => s + i.preco * i.quantidade, 0);
  const economiaCategoria = itensCategoria
    .filter((i) => i.origem === "ganho")
    .reduce((s, i) => s + i.preco * i.quantidade, 0);
  const compradosCategoria = itensCategoria.filter((i) => i.comprado).length;

  const totalP1 = itensCategoria
    .filter((i) => i.origem !== "ganho" && i.responsavelId === 1)
    .reduce((s, i) => s + i.preco * i.quantidade, 0);
  const totalP2 = itensCategoria
    .filter((i) => i.origem !== "ganho" && i.responsavelId === 2)
    .reduce((s, i) => s + i.preco * i.quantidade, 0);

  const percentComprado = itensCategoria.length
    ? (compradosCategoria / itensCategoria.length) * 100
    : 0;
  const percentMeta =
    catAtual?.metaOrcamento && catAtual.metaOrcamento > 0
      ? Math.min(100, (totalCategoria / catAtual.metaOrcamento) * 100)
      : null;

  const toggleComprado = useMutation({
    mutationFn: ({ id, comprado }: { id: string; comprado: boolean }) =>
      itensService.toggleComprado(id, comprado),
    onMutate: async ({ id, comprado }) => {
      await qc.cancelQueries({ queryKey: ["itens-paginado"] });
      // Optimistic update nas páginas do infinite query
      qc.setQueriesData({ queryKey: ["itens-paginado"] }, (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const data = old as { pages: Array<{ items: Item[] }> };
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((i: Item) => (i.id === id ? { ...i, comprado } : i)),
          })),
        };
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
      setExcluindoCategoria(null);
      setCategoriaSelecionada(null);
      toast.success("Cômodo removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Estimativa de comodo não disponível nessa versão do backend

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] space-y-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="font-display text-2xl md:text-4xl font-semibold leading-tight">
            Planejamento
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setNovaCategoria(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo cômodo
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (categorias.length === 0) {
                  toast.info("Crie seu primeiro cômodo para organizar os itens!");
                  setNovaCategoria(true);
                } else {
                  setWizardOpen(true);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Adicionar item</span>
              <span className="sm:hidden">Item</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden" aria-label="Mais ações">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setNovaCategoria(true)}>
                  <Plus className="h-4 w-4" /> Novo cômodo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-muted-foreground text-sm max-w-xl">
          Organize os itens por cômodo e controle o orçamento.
        </p>
      </header>

      {/* Mobile: Select dropdown for rooms */}
      <div className="lg:hidden">
        <Select
          value={catAtualId}
          onValueChange={(v) => setCategoriaSelecionada(v === "tudo" ? "tudo" : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um cômodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tudo">Todos os Itens</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome} {c.metaOrcamento ? `(Meta: ${brl(c.metaOrcamento)})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Desktop: Sidebar with rooms */}
        {portalTarget && createPortal(
          <aside className="hidden lg:flex flex-col gap-1.5 w-full shrink-0">
            <hr className="border-border/50 mb-2 -mx-3" />
            {categoriasQ.isLoading && (
              <div className="text-sm text-muted-foreground px-3">Carregando...</div>
            )}
            <div
              className={cn(
                "group flex items-center gap-3 rounded-lg p-2.5 transition-all cursor-pointer",
                catAtualId === "tudo"
                  ? "border border-primary/20 bg-primary/5 shadow-soft"
                  : "border border-transparent hover:bg-accent/40",
              )}
              onClick={() => setCategoriaSelecionada("tudo")}
            >
              <span className="grid place-items-center h-8 w-8 rounded-md text-white shrink-0 shadow-soft bg-zinc-800">
                <Package className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">Todos os Itens</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  <div className="flex justify-between items-center">
                    <span>
                      {todosItens.filter((i) => i.comprado).length}/{todosItens.length} -{" "}
                      <span className={cn(catAtualId === "tudo" ? "text-foreground font-medium" : "")}>
                        {brl(
                          todosItens
                            .filter((i) => i.origem !== "ganho")
                            .reduce((s, i) => s + i.preco * i.quantidade, 0),
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {categorias.map((c) => {
              const I = iconFor(c.icon);
              const ativo = c.id === catAtualId;
              const cItens = todosItens.filter((it) => it.categoriaId === c.id);
              const cComprados = cItens.filter((it) => it.comprado).length;
              const cGasto = cItens
                .filter((it) => it.origem !== "ganho")
                .reduce((s, it) => s + it.preco * it.quantidade, 0);

              return (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg p-2.5 transition-all cursor-pointer",
                    ativo
                      ? "border border-primary/20 bg-primary/5 shadow-soft"
                      : "border border-transparent hover:bg-accent/40",
                    c.metaOrcamento &&
                      cGasto > c.metaOrcamento &&
                      !ativo &&
                      "bg-destructive/5",
                  )}
                  onClick={() => setCategoriaSelecionada(c.id)}
                >
                  <span
                    className="grid place-items-center h-8 w-8 rounded-md text-white shrink-0 shadow-soft"
                    style={{ backgroundColor: c.bg }}
                  >
                    <I className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate flex items-center gap-2 capitalize">
                      {c.nome}
                      {c.metaOrcamento && cGasto > c.metaOrcamento && (
                        <span className="text-destructive" title="Orçamento estourado">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <div className="flex justify-between items-center">
                        <span>
                          {cComprados}/{cItens.length} -{" "}
                          <span
                            className={cn(
                              ativo && "text-foreground font-medium",
                              c.metaOrcamento && cGasto > c.metaOrcamento && "text-destructive",
                            )}
                          >
                            {brl(cGasto)}
                          </span>
                        </span>
                      </div>
                      {c.metaOrcamento ? (
                        <div className="mt-1 space-y-1">
                          <div className="h-0.5 w-full bg-border rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                cGasto / c.metaOrcamento < 0.8
                                  ? "bg-emerald-500"
                                  : cGasto / c.metaOrcamento <= 1
                                    ? "bg-amber-500"
                                    : "bg-destructive",
                              )}
                              style={{ width: `${Math.min(100, (cGasto / c.metaOrcamento) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => setEditandoCategoria(c)}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setExcluindoCategoria(c)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}

            {!categoriasQ.isLoading && categorias.length === 0 && (
              <div className="rounded-xl border border-dashed p-4 mx-3 mt-2 text-center text-xs text-muted-foreground">
                Nenhum cômodo ainda. Crie o primeiro para começar.
              </div>
            )}
          </aside>,
          portalTarget
        )}

        {/* Painel principal */}
        <section className="flex-1 space-y-4 min-w-0">
          {catAtualId === "tudo" || catAtual ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className={cn("rounded-2xl bg-gradient-warm p-3 border shadow-soft flex flex-col justify-between", isCasal ? "md:col-span-2" : "md:col-span-3")}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="grid place-items-center h-8 w-8 rounded-md text-white shadow-soft"
                          style={{ backgroundColor: catAtual ? catAtual.bg : "#27272a" }}
                        >
                          {(() => {
                            const I = catAtual ? iconFor(catAtual.icon) : Package;
                            return <I className="h-4 w-4" />;
                          })()}
                        </span>
                        <div>
                          <div className="font-display text-base font-semibold flex items-center gap-2 capitalize">
                            {catAtual ? catAtual.nome : "Todos os itens"}
                            {catAtual?.metaOrcamento && totalCategoria > catAtual.metaOrcamento && (
                              <span className="text-destructive" title="Orçamento estourado">
                                <AlertTriangle className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground leading-none">
                            {itensCategoria.length} itens · {compradosCategoria} comprados
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-muted-foreground font-medium mb-0.5">Total gasto</div>
                      <div
                        className={cn(
                          "font-display text-base font-bold leading-none",
                          (catAtual?.metaOrcamento && totalCategoria > catAtual.metaOrcamento) ||
                            (!catAtual &&
                              usuario?.metaGlobalEnxoval &&
                              totalCategoria > usuario.metaGlobalEnxoval)
                            ? "text-destructive"
                            : "text-primary",
                        )}
                      >
                        {brl(totalCategoria)}
                      </div>
                      {catAtual?.metaOrcamento ? (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          de {brl(catAtual.metaOrcamento)}
                          {totalCategoria > catAtual.metaOrcamento && (
                            <span className="text-destructive ml-1">
                              ({brl(totalCategoria - catAtual.metaOrcamento)} acima)
                            </span>
                          )}
                        </div>
                      ) : !catAtual && usuario?.metaGlobalEnxoval ? (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          de {brl(usuario.metaGlobalEnxoval)}
                          {totalCategoria > usuario.metaGlobalEnxoval && (
                            <span className="text-destructive ml-1">
                              ({brl(totalCategoria - usuario.metaGlobalEnxoval)} acima)
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground font-medium">
                          Progresso da compra <span className="opacity-70 font-normal">({compradosCategoria} de {itensCategoria.length} itens)</span>
                        </span>
                        <span className="font-medium">{percentComprado.toFixed(0)}%</span>
                      </div>
                      <Progress value={percentComprado} className="h-2" />
                    </div>
                    {(percentMeta !== null || (!catAtual && usuario?.metaGlobalEnxoval)) && (
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground font-medium">
                            Meta de orçamento <span className="opacity-70 font-normal">
                              ({brl(totalCategoria)} / {brl(catAtual?.metaOrcamento || usuario?.metaGlobalEnxoval || 0)})
                            </span>
                          </span>
                          <span
                            className={cn(
                              "font-medium",
                              (percentMeta !== null
                                ? percentMeta
                                : (totalCategoria / (usuario?.metaGlobalEnxoval || 1)) * 100) > 100
                                ? "text-destructive font-bold"
                                : "",
                            )}
                          >
                            {percentMeta !== null
                              ? percentMeta.toFixed(0)
                              : ((totalCategoria / (usuario?.metaGlobalEnxoval || 1)) * 100).toFixed(
                                  0,
                                )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            percentMeta !== null
                              ? percentMeta
                              : (totalCategoria / (usuario?.metaGlobalEnxoval || 1)) * 100
                          }
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-card p-3 border shadow-soft flex flex-col justify-center gap-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold text-center mb-1">
                    {isCasal ? "Divisão de Custos" : "Resumo Financeiro"}
                  </div>
                  <div className="space-y-2">
                    {isCasal ? (
                      <>
                        <div className="flex justify-between items-center bg-accent/40 rounded-lg px-2.5 py-1.5">
                          <span className="text-xs font-medium truncate pr-2 text-muted-foreground">{p1}</span>
                          <span className="font-display font-semibold text-sm">{brl(totalP1)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-accent/40 rounded-lg px-2.5 py-1.5">
                          <span className="text-xs font-medium truncate pr-2 text-muted-foreground">{p2}</span>
                          <span className="font-display font-semibold text-sm">{brl(totalP2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center bg-accent/40 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs font-medium truncate pr-2 text-muted-foreground">Você pagou</span>
                        <span className="font-display font-semibold text-sm">{brl(totalCategoria)}</span>
                      </div>
                    )}
                    {economiaCategoria > 0 && (
                      <div className="flex justify-between items-center bg-emerald-500/10 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs font-medium truncate pr-2 text-emerald-600 dark:text-emerald-500">Presentes / Ganhos</span>
                        <span className="font-display font-semibold text-sm text-emerald-600 dark:text-emerald-500">{brl(economiaCategoria)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar item ou marca..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div
                  className={cn(
                    "grid gap-2 w-full lg:w-auto",
                    isCasal ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2",
                  )}
                >
                  <Select
                    value={filtroStatus}
                    onValueChange={(v) => setFiltroStatus(v as typeof filtroStatus)}
                  >
                    <SelectTrigger className="w-full">
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
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Pagamento</SelectItem>
                      <SelectItem value="normal">Dinheiro</SelectItem>
                      <SelectItem value="vr">VR / VA</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCasal && (
                    <Select
                      value={filtroResponsavel}
                      onValueChange={(v) => setFiltroResponsavel(v as typeof filtroResponsavel)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Responsável</SelectItem>
                        <SelectItem value="1">{p1}</SelectItem>
                        <SelectItem value="2">{p2}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Itens */}
              <motion.div layout className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                {itensQ.isLoading && (
                  <div className="col-span-full text-sm text-center text-muted-foreground">
                    Carregando itens...
                  </div>
                )}
                {!itensQ.isLoading && itensFiltrados.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed p-10 text-center">
                    <Plus className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum item por aqui ainda. Que tal adicionar o primeiro?
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        if (categorias.length === 0) {
                          toast.info("Crie seu primeiro cômodo para organizar os itens!");
                          setNovaCategoria(true);
                        } else {
                          setWizardOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Adicionar item
                    </Button>
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {itensFiltrados.map((it) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{
                        opacity: { duration: 0.2 },
                        layout: { type: "spring", bounce: 0, duration: 0.4 },
                        scale: { type: "spring", bounce: 0, duration: 0.4 }
                      }}
                      key={it.id}
                      className={cn(
                        "flex flex-col gap-3 rounded-2xl border p-4 transition-shadow duration-200",
                        it.comprado 
                          ? "bg-card/40 border-transparent shadow-none" 
                          : "bg-card shadow-soft hover:shadow-elegant"
                      )}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                          className={cn("mt-1", it.comprado && "rounded-full")}
                          checked={it.comprado}
                          onCheckedChange={() =>
                            toggleComprado.mutate({ id: it.id, comprado: !it.comprado })
                          }
                        />
                        {it.fotoUrl && !imageErrors[it.id] ? (
                          <button
                            type="button"
                            onClick={() => setImagemAmpliada(it)}
                            className={cn(
                              "h-16 w-16 shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-white/50 dark:bg-white/10 overflow-hidden border border-border/50 transition-all",
                              it.comprado && "opacity-50 grayscale"
                            )}
                            aria-label={`Ampliar imagem de ${it.nome}`}
                          >
                            <img
                              src={it.fotoUrl}
                              alt={it.nome}
                              className="h-full w-full object-cover transition-transform hover:scale-110"
                              onError={() => setImageErrors((prev) => ({ ...prev, [it.id]: true }))}
                            />
                          </button>
                        ) : (
                          <div
                            className={cn(
                              "h-16 w-16 rounded-xl grid place-items-center text-white shrink-0 shadow-sm transition-all",
                              it.comprado && "opacity-50 grayscale"
                            )}
                            style={{
                              backgroundColor:
                                categorias.find((c) => c.id === it.categoriaId)?.bg ?? "#27272a",
                            }}
                          >
                            {(() => {
                              const I = iconFor(
                                categorias.find((c) => c.id === it.categoriaId)?.icon ?? "package",
                              );
                              return <I className="h-7 w-7" />;
                            })()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {/* Nome do item */}
                          <button
                            type="button"
                            onClick={() => setEditandoItem(it)}
                            title="Editar item"
                            className={cn(
                              "max-w-full line-clamp-2 text-left font-semibold text-base md:text-lg hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 block leading-tight",
                              it.comprado ? "line-through text-muted-foreground" : "text-foreground",
                            )}
                          >
                            {toTitleCase(it.nome)}
                          </button>

                          {/* Logos + nomes de marca e loja */}
                          <div className={cn("transition-opacity", it.comprado && "opacity-50 grayscale")}>
                            {(it.marca || it.loja) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {it.marca && (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 px-2 py-0.5 text-xs bg-muted/60"
                                >
                                  <LogoBadge urls={getLogoUrls(it.marca, null, resolvedDomains)} />
                                  {toTitleCase(it.marca)}
                                </Badge>
                              )}
                              {it.loja &&
                                (it.linkProduto ? (
                                  <a
                                    href={it.linkProduto}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:opacity-80 transition-opacity"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="gap-1 px-2 py-0.5 text-xs bg-card hover:bg-muted/50"
                                    >
                                      <LogoBadge
                                        urls={getLogoUrls(it.loja, it.linkProduto, resolvedDomains)}
                                      />
                                      {toTitleCase(it.loja)}
                                      <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                                    </Badge>
                                  </a>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 px-2 py-0.5 text-xs bg-card"
                                  >
                                    <LogoBadge urls={getLogoUrls(it.loja, null, resolvedDomains)} />
                                    {toTitleCase(it.loja)}
                                  </Badge>
                                ))}
                            </div>
                          )}

                          {/* Metadados secundários: Categoria/Pagamento + Badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {toTitleCase(categorias.find((c) => c.id === it.categoriaId)?.nome || "")} 
                              {' · '}
                              {it.pagamento === "vr" ? "VR / VA" : "Dinheiro"}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[11px] py-0 px-2 font-medium border",
                                it.origem === "ganho" || it.origem === "presente"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                  : it.origem === "prometido"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                    : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
                              )}
                            >
                              {it.origem === "ganho" || it.origem === "presente"
                                ? "Presente"
                                : it.origem === "prometido"
                                  ? "Prometido"
                                  : "Será comprado"}
                            </Badge>
                            {it.prioridade && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[11px] py-0 px-2 font-medium border capitalize",
                                  it.prioridade === "alta"
                                    ? "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                                    : it.prioridade === "baixa"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                      : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
                                )}
                              >
                                Prioridade {it.prioridade}
                              </Badge>
                            )}
                          </div>
                          {it.origem === "prometido" && it.origemDescricao && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                              🎁 {it.origemDescricao} — aguardando confirmação
                            </p>
                          )}
                          </div>
                        </div>
                      </div>
                      
                      <hr className="border-border/60 my-1" />

                      <div className="flex items-end justify-between gap-3 mt-auto">
                        <div className="text-left min-w-0">
                          <div className={cn(
                            "font-display font-bold text-lg md:text-xl truncate tracking-tight",
                            it.comprado ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {brl(it.preco * it.quantidade)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {it.quantidade}x {brl(it.preco)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditandoItem(it)}>
                                <Pencil className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleComprado.mutate({ id: it.id, comprado: !it.comprado })
                                }
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {it.comprado
                                  ? "Marcar como faltando"
                                  : it.origem === "prometido"
                                    ? "Confirmar recebimento"
                                    : "Marcar comprado"}
                              </DropdownMenuItem>
                              {it.linkProduto && (
                                <DropdownMenuItem asChild>
                                  <a href={it.linkProduto} target="_blank" rel="noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" /> Abrir link
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
                  ))}
                </AnimatePresence>

                {/* Carregar mais / paginação */}
                {itensQ.hasNextPage && (
                  <div className="col-span-full pt-2 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => itensQ.fetchNextPage()}
                      disabled={itensQ.isFetchingNextPage}
                      className="w-full sm:w-auto"
                    >
                      {itensQ.isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando...
                        </>
                      ) : (
                        "Carregar mais itens"
                      )}
                    </Button>
                  </div>
                )}
                {!itensQ.hasNextPage && itensFiltrados.length > 0 && (
                  <p className="col-span-full text-center text-xs text-muted-foreground pt-2">
                    {itensFiltrados.length} {itensFiltrados.length !== 1 ? "itens" : "item"} exibido
                    {itensFiltrados.length !== 1 ? "s" : ""}
                    {itensQ.data?.pages[0]?.totalCount
                      ? ` de ${itensQ.data.pages[0].totalCount} total`
                      : ""}
                  </p>
                )}
              </motion.div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed p-16 text-center bg-gradient-warm">
              <Plus className="h-8 w-8 mx-auto text-primary mb-3" />
              <p className="text-muted-foreground">
                Crie seu primeiro cômodo para começar o planejamento.
              </p>
              <Button className="mt-4" onClick={() => setNovaCategoria(true)}>
                <Plus className="h-4 w-4 mr-1" /> Novo cômodo
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Modais */}
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
          categoriaId={catAtualId}
          item={editandoItem}
        />
      )}


      <Dialog open={!!imagemAmpliada} onOpenChange={(open) => !open && setImagemAmpliada(null)}>
        <DialogContent className="max-w-4xl p-4">
          <DialogHeader>
            <DialogTitle className="pr-8">{imagemAmpliada?.nome}</DialogTitle>
          </DialogHeader>
          {imagemAmpliada?.fotoUrl && (
            <img
              src={imagemAmpliada.fotoUrl}
              alt={imagemAmpliada.nome}
              className="max-h-[75dvh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

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
              onClick={() => excluindoCategoria && excluirCategoria.mutate(excluindoCategoria.id)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
