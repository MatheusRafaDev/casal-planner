import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

import { categoriasService } from "@/services/categorias";
import { itensService } from "@/services/itens";
import { groqService, type SugestaoItem } from "@/services/groq";
import type { Categoria, Item } from "@/services/types";
import { brl } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import { iconFor } from "@/components/planejamento/icon-map";
import { CategoriaFormModal } from "@/components/planejamento/CategoriaFormModal";
import { ItemFormModal } from "@/components/planejamento/ItemFormModal";
import { AddItemWizard } from "@/components/planejamento/AddItemWizard";

export const Route = createFileRoute("/_authenticated/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento — Casal Planner" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlanejamentoPage,
});

function PlanejamentoPage() {
  const qc = useQueryClient();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "comprados" | "faltando">("todos");
  const [filtroPagamento, setFiltroPagamento] = useState<"todos" | "normal" | "vr">("todos");

  const [novaCategoria, setNovaCategoria] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null);
  const [excluindoCategoria, setExcluindoCategoria] = useState<Categoria | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editandoItem, setEditandoItem] = useState<Item | null>(null);

  const categoriasQ = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriasService.listar(),
  });

  const categorias = categoriasQ.data ?? [];
  const catAtualId = categoriaSelecionada ?? categorias[0]?.id ?? null;
  const catAtual = categorias.find((c) => c.id === catAtualId) ?? null;

  const itensQ = useQuery({
    queryKey: ["itens", catAtualId],
    queryFn: () => (catAtualId ? itensService.porCategoria(catAtualId) : Promise.resolve([])),
    enabled: !!catAtualId,
  });

  const itens = itensQ.data ?? [];

  const itensFiltrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return itens.filter((i) => {
      if (b && !i.nome.toLowerCase().includes(b) && !(i.marca ?? "").toLowerCase().includes(b))
        return false;
      if (filtroStatus === "comprados" && !i.comprado) return false;
      if (filtroStatus === "faltando" && i.comprado) return false;
      if (filtroPagamento !== "todos" && i.pagamento !== filtroPagamento) return false;
      return true;
    });
  }, [itens, busca, filtroStatus, filtroPagamento]);

  const totalCategoria = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const compradosCategoria = itens.filter((i) => i.comprado).length;
  const percentComprado = itens.length ? (compradosCategoria / itens.length) * 100 : 0;
  const percentMeta =
    catAtual?.metaOrcamento && catAtual.metaOrcamento > 0
      ? Math.min(100, (totalCategoria / catAtual.metaOrcamento) * 100)
      : null;

  const toggleComprado = useMutation({
    mutationFn: ({ id, comprado }: { id: string; comprado: boolean }) =>
      itensService.toggleComprado(id, comprado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
    },
  });

  const excluirItem = useMutation({
    mutationFn: (id: string) => itensService.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      toast.success("Item removido");
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

  const sugestoesQ = useQuery({
    queryKey: ["sugestoes-comodo", catAtual?.nome],
    queryFn: () => (catAtual ? groqService.sugestoesComodo(catAtual.nome) : Promise.resolve([])),
    enabled: false,
  });

  // Estimativa de comodo não disponível nessa versão do backend

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Planejamento</h1>
          <p className="text-muted-foreground text-sm">
            Organize os itens por cômodo, controle o orçamento e pesquise preços com IA.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setNovaCategoria(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo cômodo
          </Button>
          <Button onClick={() => setWizardOpen(true)} disabled={!catAtualId}>
            <Sparkles className="h-4 w-4 mr-1" /> Adicionar item
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Coluna cômodos */}
        <aside className="space-y-2">
          {categoriasQ.isLoading && (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          )}
          {categorias.map((c, i) => {
            const I = iconFor(c.icon);
            const ativo = c.id === catAtualId;
            return (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer",
                  ativo
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "hover:bg-accent/40 hover:border-accent",
                )}
                onClick={() => setCategoriaSelecionada(c.id)}
              >
                <span
                  className="grid place-items-center h-10 w-10 rounded-lg text-white shrink-0 shadow-soft"
                  style={{ backgroundColor: c.bg }}
                >
                  <I className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.nome}</div>
                  {c.metaOrcamento ? (
                    <div className="text-xs text-muted-foreground">
                      Meta {brl(c.metaOrcamento)}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Sem meta</div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
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
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum cômodo ainda. Crie o primeiro para começar.
            </div>
          )}
        </aside>

        {/* Painel principal */}
        <section className="space-y-4">
          {catAtual ? (
            <>
              <div className="rounded-2xl bg-gradient-warm p-5 border shadow-soft">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className="grid place-items-center h-12 w-12 rounded-xl text-white shadow-soft"
                        style={{ backgroundColor: catAtual.bg }}
                      >
                        {(() => {
                          const I = iconFor(catAtual.icon);
                          return <I className="h-6 w-6" />;
                        })()}
                      </span>
                      <div>
                        <div className="font-display text-2xl font-semibold">{catAtual.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {itens.length} itens · {compradosCategoria} comprados
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Total gasto</div>
                    <div className="font-display text-2xl font-semibold text-primary">
                      {brl(totalCategoria)}
                    </div>
                    {catAtual.metaOrcamento ? (
                      <div className="text-xs text-muted-foreground">
                        de {brl(catAtual.metaOrcamento)}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso da compra</span>
                      <span className="font-medium">{percentComprado.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentComprado} />
                  </div>
                  {percentMeta !== null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Meta de orçamento</span>
                        <span
                          className={cn(
                            "font-medium",
                            percentMeta > 100 ? "text-destructive" : "",
                          )}
                        >
                          {percentMeta.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={percentMeta} />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2 flex-wrap items-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => sugestoesQ.refetch()}
                    disabled={sugestoesQ.isFetching}
                  >
                    {sugestoesQ.isFetching ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                    )}
                    Sugerir itens com IA
                  </Button>

                </div>

                {sugestoesQ.data && sugestoesQ.data.length > 0 && (
                  <div className="mt-4 rounded-xl border bg-card p-3">
                    <div className="text-xs font-medium mb-2 text-muted-foreground">
                      Sugestões da IA para este cômodo
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sugestoesQ.data.map((s: SugestaoItem) => (
                        <Badge key={s.nome} variant="secondary" className="font-normal">
                          {s.nome}
                          {s.estimativa ? (
                            <span className="ml-1 text-muted-foreground">
                              · {brl(s.estimativa)}
                            </span>
                          ) : null}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimativa de comodo removida - funcionalidade não disponível no backend */}
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Buscar item ou marca..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as typeof filtroStatus)}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="faltando">Faltando</SelectItem>
                    <SelectItem value="comprados">Comprados</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filtroPagamento}
                  onValueChange={(v) => setFiltroPagamento(v as typeof filtroPagamento)}
                >
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Qualquer pagamento</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="vr">VR / VA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Itens */}
              <div className="space-y-2">
                {itensQ.isLoading && (
                  <div className="text-sm text-muted-foreground">Carregando itens...</div>
                )}
                {!itensQ.isLoading && itensFiltrados.length === 0 && (
                  <div className="rounded-xl border border-dashed p-10 text-center">
                    <Sparkles className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum item por aqui ainda. Que tal adicionar o primeiro?
                    </p>
                    <Button className="mt-4" onClick={() => setWizardOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Adicionar item
                    </Button>
                  </div>
                )}

                {itensFiltrados.map((it) => (
                  <div
                    key={it.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border bg-card p-3 hover:shadow-soft transition-shadow",
                      it.comprado && "opacity-70",
                    )}
                  >
                    <Checkbox
                      checked={it.comprado}
                      onCheckedChange={() =>
                        toggleComprado.mutate({ id: it.id, comprado: !it.comprado })
                      }
                    />
                    {it.fotoUrl ? (
                      <img
                        src={it.fotoUrl}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div
                        className="h-12 w-12 rounded-lg grid place-items-center text-white"
                        style={{ backgroundColor: catAtual.bg }}
                      >
                        {(() => {
                          const I = iconFor(catAtual.icon);
                          return <I className="h-5 w-5" />;
                        })()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={cn("font-medium truncate", it.comprado && "line-through")}>
                        {it.nome}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {it.marca && <span>{it.marca}</span>}
                        {it.loja && <span>· {it.loja}</span>}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] py-0",
                            it.pagamento === "vr" && "border-primary text-primary",
                          )}
                        >
                          {it.pagamento === "vr" ? "VR" : "Normal"}
                        </Badge>
                        {it.prioridade === "alta" && (
                          <Badge className="text-[10px] py-0" variant="destructive">
                            Alta
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-semibold">{brl(it.preco * it.quantidade)}</div>
                      <div className="text-xs text-muted-foreground">
                        {it.quantidade}× {brl(it.preco)}
                      </div>
                    </div>
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
                          {it.comprado ? "Marcar como faltando" : "Marcar comprado"}
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
                          onClick={() => excluirItem.mutate(it.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed p-16 text-center bg-gradient-warm">
              <Sparkles className="h-8 w-8 mx-auto text-primary mb-3" />
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
      {catAtualId && (
        <AddItemWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          categorias={categorias}
          categoriaInicialId={catAtualId}
        />
      )}
      {catAtualId && (
        <ItemFormModal
          open={!!editandoItem}
          onOpenChange={(o) => !o && setEditandoItem(null)}
          categorias={categorias}
          categoriaId={catAtualId}
          item={editandoItem}
        />
      )}

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
              onClick={() =>
                excluindoCategoria && excluirCategoria.mutate(excluindoCategoria.id)
              }
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
