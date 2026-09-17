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
        { title: `Lista de Desejos — ${casal}` },
        { property: "og:title", content: `Lista de presentes de ${casal}` },
        { property: "og:description", content: "Escolha um presente para a nova casa 💝" },
        { property: "og:image", content: "https://casalplanner.vercel.app/og-lista.png" },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: ListaPublicaPage,
});

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
        action: resp.undoToken ? {
          label: "Desfazer",
          onClick: () => desfazerMut.mutate({ itemId, token: resp.undoToken! })
        } : undefined,
        duration: 8000,
      });
      
      setItemSelecionado(null);
      setNomeConvidado("");
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao confirmar presente"),
  });

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

  const { casal, itens } = data;

  const comprados = itens.filter(i => i.comprado).length;
  const progresso = itens.length > 0 ? (comprados / itens.length) * 100 : 0;

  const itensFiltrados = useMemo(() => {
    let filtrados = itens.filter(
      (i) =>
        i.nome.toLowerCase().includes(busca.toLowerCase()) ||
        i.marca?.toLowerCase().includes(busca.toLowerCase()),
    );

    if (apenasDisponiveis) {
      filtrados = filtrados.filter(i => !i.comprado);
    }

    if (faixaPreco !== "todos") {
      filtrados = filtrados.filter(i => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary/5 border-b border-primary/10 pt-16 pb-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-2">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            Lista de Desejos
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">{casal}</p>
          
          <div className="max-w-md mx-auto mt-6 pt-4 text-left">
            <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
              <span>{comprados} de {itens.length} presentes escolhidos</span>
              <span>{Math.round(progresso)}%</span>
            </div>
            <Progress value={progresso} className="h-2.5" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar itens..."
              className="pl-10 h-12 rounded-full bg-muted/50 border-muted focus-visible:ring-primary shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-2 bg-muted/30 p-2.5 rounded-full border px-4 h-12">
              <Checkbox 
                id="disponiveis" 
                checked={apenasDisponiveis} 
                onCheckedChange={(c) => setApenasDisponiveis(!!c)} 
              />
              <Label htmlFor="disponiveis" className="text-sm cursor-pointer whitespace-nowrap">Apenas disponíveis</Label>
            </div>
            <Select value={faixaPreco} onValueChange={setFaixaPreco}>
              <SelectTrigger className="w-[180px] h-12 rounded-full bg-muted/30 border-muted">
                <SelectValue placeholder="Preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Qualquer valor</SelectItem>
                <SelectItem value="ate-100">Até R$ 100</SelectItem>
                <SelectItem value="100-300">R$ 100 a R$ 300</SelectItem>
                <SelectItem value="acima-300">Acima de R$ 300</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {itensFiltrados.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                  item.comprado
                    ? "bg-muted/30 border-muted opacity-80"
                    : "bg-card border-border hover:shadow-md hover:border-primary/20"
              }`}
            >
              {/* Imagem */}
              <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center p-4">
                {item.fotoUrl ? (
                  <img
                    src={item.fotoUrl}
                    alt={item.nome}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <Gift className="h-12 w-12 text-muted-foreground/30" />
                )}
                {item.comprado && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-background/90 text-foreground px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-sm">
                      <Check className="h-4 w-4" /> Já Presenteado
                    </div>
                  </div>
                )}
              </div>

              {/* Informações */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    {item.prioridade && item.prioridade !== "normal" && (
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 uppercase tracking-wider ${item.prioridade === 'alta' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                        Prioridade {item.prioridade}
                      </Badge>
                    )}
                  </div>
                  <h3
                    className="font-semibold text-lg line-clamp-2 leading-tight"
                    title={item.nome}
                  >
                    {item.quantidade > 1 ? `${item.quantidade}x ` : ""}{item.nome}
                  </h3>
                  {item.marca && <p className="text-sm text-muted-foreground mt-1 font-medium">{item.marca}</p>}
                  
                  {(item.loja || (item.variantes && item.variantes.length > 0)) && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {item.loja && (
                        <Badge variant="secondary" className="text-xs font-normal opacity-80">
                          Sugerido: {item.loja}
                        </Badge>
                      )}
                      {item.variantes?.map((v, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 space-y-4">
                  {item.preco && item.preco > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Valor sugerido</span>
                      <span className="text-xl font-bold text-primary">{brl(item.preco)}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic py-1">
                      Valor não definido
                    </div>
                  )}

                  {!item.comprado && (
                    <div className="flex flex-col gap-2">
                      {item.linkProduto && (
                        <Button
                          variant="default"
                          className="w-full rounded-xl"
                          asChild
                        >
                          <a href={item.linkProduto} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" /> Comprar na Loja
                          </a>
                        </Button>
                      )}
                      <Button
                        variant={item.linkProduto ? "outline" : "default"}
                        className="w-full rounded-xl"
                        onClick={() => setItemSelecionado(item)}
                      >
                        <Gift className="h-4 w-4 mr-2" /> 
                        {item.linkProduto ? "Já comprei / Prometer" : "Presentear"}
                      </Button>
                    </div>
                  )}
                </div>
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

      {/* Modal Presentear */}
      <Dialog open={!!itemSelecionado} onOpenChange={(open) => !open && setItemSelecionado(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Você vai presentear:</DialogTitle>
            <DialogDescription>
              Ficamos muito felizes! Por favor, informe seu nome para que o casal saiba quem deu
              este presente.
            </DialogDescription>
          </DialogHeader>

          {itemSelecionado && (
            <div className="py-4 space-y-6">
              {/* Resumo do item */}
              <div className="flex gap-4 items-center bg-muted/50 p-3 rounded-xl border">
                <div className="h-16 w-16 bg-background rounded-lg border flex flex-shrink-0 items-center justify-center p-1 overflow-hidden">
                  {itemSelecionado.fotoUrl ? (
                    <img
                      src={itemSelecionado.fotoUrl}
                      alt={itemSelecionado.nome}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Gift className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-sm line-clamp-2">{itemSelecionado.nome}</h4>
                  {itemSelecionado.preco && itemSelecionado.preco > 0 && (
                    <p className="font-semibold text-primary text-sm mt-1">
                      {brl(itemSelecionado.preco)}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações da Loja */}
              {itemSelecionado.linkProduto && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">
                    Você pode adquirir este item na loja sugerida:
                  </p>
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <a href={itemSelecionado.linkProduto} target="_blank" rel="noopener noreferrer">
                      <span>Ver na loja {itemSelecionado.loja && `(${itemSelecionado.loja})`}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </Button>
                </div>
              )}

              {/* Formulário */}
              <div className="space-y-2">
                <Label htmlFor="nome">Seu Nome / Família</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Tio João e Tia Maria"
                  value={nomeConvidado}
                  onChange={(e) => setNomeConvidado(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                <strong>Atenção:</strong> Ao confirmar, o presente será marcado como "comprado" e
                não estará mais disponível para outros convidados. Você terá 10 minutos para desfazer esta ação se precisar.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setItemSelecionado(null)}>
              Cancelar
            </Button>
            <Button
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
