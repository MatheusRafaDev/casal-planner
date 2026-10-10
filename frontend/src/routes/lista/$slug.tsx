import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Gift, Check, Search, ExternalLink, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl } from "@/lib/formatters";
import { listaPublicaService, ItemPublico } from "@/services/lista-publica";

export const Route = createFileRoute("/lista/$slug")({
  loader: async ({ params }) => {
    try {
      return await listaPublicaService.getLista(params.slug);
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => {
    const casal = loaderData?.casal ?? "Casal";
    return {
      meta: [
        { title: `CasalPlanner - Lista de Desejos — ${casal}` },
        { property: "og:title", content: `Lista de presentes de ${casal}` },
        { property: "og:description", content: "Escolha um presente para a nova casa 💝" },
        { property: "og:image", content: "https://casalplanner.vercel.app/og-lista.png" },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: ListaPublicaPage,
});

const EMPTY_ARRAY: ItemPublico[] = [];

function ListaPublicaPage() {
  const { slug } = useParams({ from: "/lista/$slug" });
  const loaderData = Route.useLoaderData();

  const [busca, setBusca] = useState("");
  const [apenasDisponiveis, setApenasDisponiveis] = useState(false);
  const [faixaPreco, setFaixaPreco] = useState("todos");

  const [itemSelecionado, setItemSelecionado] = useState<ItemPublico | null>(null);
  const [nomeConvidado, setNomeConvidado] = useState("");
  const [undoTokens, setUndoTokens] = useState<Record<string, string>>({});

  const { data, refetch } = useQuery({
    queryKey: ["lista-publica", slug],
    queryFn: () => listaPublicaService.getLista(slug),
    initialData: loaderData ?? undefined,
    enabled: !!loaderData,
  });

  const desfazerMut = useMutation({
    mutationFn: ({ itemId, token }: { itemId: string; token: string }) =>
      listaPublicaService.desfazerPresente(slug, itemId, token),
    onSuccess: (_, { itemId }) => {
      toast.success("Ação desfeita com sucesso.");
      setUndoTokens((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao desfazer"),
  });

  const presentearMut = useMutation({
    mutationFn: () => listaPublicaService.presentear(slug, itemSelecionado!.id, nomeConvidado),
    onSuccess: (resp) => {
      const itemId = itemSelecionado!.id;
      if (resp.undoToken) {
        setUndoTokens((prev) => ({ ...prev, [itemId]: resp.undoToken! }));
      }

      toast.success("Presente confirmado! O casal vai amar 💖", {
        action: resp.undoToken
          ? {
              label: "Desfazer",
              onClick: () => desfazerMut.mutate({ itemId, token: resp.undoToken! }),
            }
          : undefined,
        duration: 8000,
      });

      setItemSelecionado(null);
      setNomeConvidado("");
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao confirmar presente"),
  });

  const casal = data?.casal;
  const itens = data?.itens ?? EMPTY_ARRAY;

  const comprados = itens.filter((i) => i.comprado).length;
  const progresso = itens.length > 0 ? (comprados / itens.length) * 100 : 0;

  const itensFiltrados = useMemo(() => {
    let filtrados = itens.filter(
      (i) =>
        i.nome.toLowerCase().includes(busca.toLowerCase()) ||
        i.marca?.toLowerCase().includes(busca.toLowerCase()),
    );

    if (apenasDisponiveis) {
      filtrados = filtrados.filter((i) => !i.comprado);
    }

    if (faixaPreco !== "todos") {
      filtrados = filtrados.filter((i) => {
        const p = i.preco || 0;
        if (faixaPreco === "ate-100") return p > 0 && p <= 100;
        if (faixaPreco === "100-300") return p > 100 && p <= 300;
        if (faixaPreco === "acima-300") return p > 300;
        return true;
      });
    }

    return filtrados.sort((a, b) => {
      // 1. Disponibilidade
      if (a.comprado && !b.comprado) return 1;
      if (!a.comprado && b.comprado) return -1;

      // 2. Prioridade (Alta = 0, Média = 1, Normal = 2)
      const prio = { alta: 0, media: 1, normal: 2 };
      const valA = prio[a.prioridade as keyof typeof prio] ?? 2;
      const valB = prio[b.prioridade as keyof typeof prio] ?? 2;

      return valA - valB;
    });
  }, [itens, busca, apenasDisponiveis, faixaPreco]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Gift className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-display font-bold mb-2">Lista não encontrada</h1>
        <p className="text-muted-foreground max-w-md">
          Este endereço não existe ou a lista foi desativada pelo casal. Verifique se o link está
          correto.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-primary/20">
      {/* Header Premium */}
      <header className="pt-20 pb-16 px-4 text-center bg-white border-b shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-60" />
        <div className="relative max-w-4xl mx-auto space-y-5">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-primary/80">
            Lista de Presentes
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-foreground">
            {casal}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-light">
            Obrigado por celebrar esse momento especial conosco. Escolha com carinho!
          </p>

          <div className="pt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-medium text-muted-foreground/70 mb-2 uppercase tracking-wide">
              <span>{comprados} Presenteados</span>
              <span>{itens.length - comprados} Restantes</span>
            </div>
            <Progress value={progresso} className="h-1.5 bg-muted/50 [&>div]:bg-primary/60" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 py-12 md:py-16">
        {/* Filtros Elegantes */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10 items-center justify-between bg-white p-2 rounded-[var(--radius-lg)] shadow-sm border border-border/40">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Encontre um presente..."
              className="pl-11 h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="h-px w-full lg:h-8 lg:w-px bg-border/50 hidden lg:block" />
          <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center w-full lg:w-auto px-2 lg:px-0 pb-2 lg:pb-0">
            <div className="flex items-center space-x-2 px-3 h-10 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer" onClick={() => setApenasDisponiveis(!apenasDisponiveis)}>
              <Checkbox
                id="disponiveis"
                checked={apenasDisponiveis}
                onCheckedChange={(c) => setApenasDisponiveis(!!c)}
                className="border-muted-foreground/30 data-[state=checked]:bg-primary"
              />
              <Label htmlFor="disponiveis" className="text-sm cursor-pointer whitespace-nowrap text-muted-foreground">
                Ocultar presenteados
              </Label>
            </div>
            <div className="h-4 w-px bg-border/50 hidden sm:block mx-1" />
            <Select value={faixaPreco} onValueChange={setFaixaPreco}>
              <SelectTrigger className="w-[160px] h-10 border-none bg-transparent hover:bg-muted/50 rounded-lg shadow-none focus:ring-0 text-muted-foreground">
                <SelectValue placeholder="Faixa de preço" />
              </SelectTrigger>
              <SelectContent className="rounded-[var(--radius-lg)]">
                <SelectItem value="todos">Qualquer valor</SelectItem>
                <SelectItem value="ate-100">Até R$ 100</SelectItem>
                <SelectItem value="100-300">R$ 100 a R$ 300</SelectItem>
                <SelectItem value="acima-300">Acima de R$ 300</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid Elegante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {itensFiltrados.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col transition-all duration-500 rounded-[var(--radius-lg)] ${
                item.comprado
                  ? "opacity-60 grayscale hover:grayscale-0"
                  : "hover:-translate-y-1"
              }`}
            >
              {/* Imagem Container */}
              <div className="aspect-[4/3] bg-white rounded-[var(--radius-lg)] border border-border/40 shadow-sm relative overflow-hidden flex items-center justify-center p-6 mb-4">
                {item.fotoUrl ? (
                  <img
                    src={item.fotoUrl}
                    alt={item.nome}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <Gift className="h-10 w-10 text-muted-foreground/20" />
                )}
                
                {item.comprado && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Presenteado
                    </div>
                  </div>
                )}
                
                {!item.comprado && item.prioridade === "alta" && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md shadow-sm">
                    Muito Desejado
                  </div>
                )}
              </div>

              {/* Detalhes Minimalistas */}
              <div className="flex flex-col flex-1 px-1">
                <h3
                  className="font-medium text-lg leading-snug text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2"
                  title={item.nome}
                >
                  {item.quantidade > 1 ? <span className="text-muted-foreground">{item.quantidade}x </span> : ""}
                  {item.nome}
                </h3>
                
                {item.marca && (
                  <p className="text-sm text-muted-foreground font-light">{item.marca}</p>
                )}

                <div className="mt-4 flex items-end justify-between gap-4">
                  {item.preco && item.preco > 0 ? (
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Valor Sugerido</span>
                      <span className="text-xl font-display font-semibold tracking-tight">{brl(item.preco)}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-transparent mb-0.5">-</span>
                      <span className="text-sm font-medium italic text-muted-foreground">Valor Livre</span>
                    </div>
                  )}
                </div>

                {!item.comprado && (
                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      className="w-full rounded-[var(--radius-lg)] bg-foreground text-background hover:bg-foreground/90 h-11 shadow-none transition-transform active:scale-95"
                      onClick={() => setItemSelecionado(item)}
                    >
                      Presentear
                    </Button>
                    {item.linkProduto && (
                      <Button variant="ghost" className="w-full rounded-[var(--radius-lg)] h-11 text-muted-foreground hover:text-foreground" asChild>
                        <a href={item.linkProduto} target="_blank" rel="noopener noreferrer">
                          <span>Ver na Loja</span>
                          <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {itensFiltrados.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum item encontrado com os filtros atuais.
            </div>
          )}
        </div>
      </main>

      {/* Modal Presentear (Minimalista) */}
      <Dialog open={!!itemSelecionado} onOpenChange={(open) => !open && setItemSelecionado(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background rounded-[var(--radius-lg)]">
          <DialogHeader className="p-6 pb-2 text-left">
            <DialogTitle className="text-2xl font-display">Presentear</DialogTitle>
            <DialogDescription className="text-sm">
              Por favor, informe seu nome para que o casal saiba quem preparou esta surpresa.
            </DialogDescription>
          </DialogHeader>

          {itemSelecionado && (
            <div className="px-6 pb-6 space-y-6">
              {/* Card Resumo do Produto */}
              <div className="flex gap-4 items-center bg-white border shadow-sm p-3 rounded-[var(--radius-lg)]">
                <div className="h-20 w-20 bg-muted/20 rounded-[var(--radius-lg)] flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                  {itemSelecionado.fotoUrl ? (
                    <img src={itemSelecionado.fotoUrl} alt={itemSelecionado.nome} className="w-full h-full object-contain" />
                  ) : (
                    <Gift className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                <div className="min-w-0 pr-2">
                  <h4 className="font-medium text-sm line-clamp-2 leading-snug">{itemSelecionado.nome}</h4>
                  <div className="mt-1 flex items-center justify-between">
                    {itemSelecionado.preco && itemSelecionado.preco > 0 ? (
                      <span className="font-semibold font-display text-foreground">{brl(itemSelecionado.preco)}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Livre</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Loja (Se Houver) */}
              {itemSelecionado.linkProduto && (
                <div className="bg-muted/30 rounded-[var(--radius-lg)] p-4 text-sm text-center">
                  <p className="text-muted-foreground mb-3 text-xs uppercase tracking-wider font-medium">Link sugerido para compra</p>
                  <Button variant="outline" className="w-full rounded-[var(--radius-lg)] bg-white" asChild>
                    <a href={itemSelecionado.linkProduto} target="_blank" rel="noopener noreferrer">
                      <span>Acessar {itemSelecionado.loja && itemSelecionado.loja}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-2" />
                    </a>
                  </Button>
                </div>
              )}

              {/* Identificação */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Seu Nome ou Família
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex: Tio João e Tia Maria"
                  value={nomeConvidado}
                  onChange={(e) => setNomeConvidado(e.target.value)}
                  autoFocus
                  className="h-12 rounded-[var(--radius-lg)] bg-muted/20"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                O presente será reservado no sistema imediatamente.<br/> Você poderá desfazer a reserva por 10 minutos se mudar de ideia.
              </p>
            </div>
          )}

          <DialogFooter className="p-4 bg-muted/10 border-t flex-row justify-end gap-2">
            <Button variant="ghost" className="rounded-[var(--radius-lg)] w-full sm:w-auto" onClick={() => setItemSelecionado(null)}>
              Cancelar
            </Button>
            <Button
              className="rounded-[var(--radius-lg)] w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
              onClick={() => presentearMut.mutate()}
              disabled={!nomeConvidado.trim() || presentearMut.isPending}
            >
              {presentearMut.isPending ? "Confirmando..." : "Confirmar Presente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
