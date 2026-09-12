import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Gift, Check, Search, ExternalLink } from "lucide-react";
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
import { brl } from "@/lib/formatters";
import { listaPublicaService, ItemPublico } from "@/services/lista-publica";

export const Route = createFileRoute("/lista/$slug")({
  head: () => ({
    meta: [{ title: "Lista de Desejos — Planner" }],
  }),
  component: ListaPublicaPage,
});

function ListaPublicaPage() {
  const { slug } = useParams({ from: "/lista/$slug" });
  const [busca, setBusca] = useState("");
  const [itemSelecionado, setItemSelecionado] = useState<ItemPublico | null>(null);
  const [nomeConvidado, setNomeConvidado] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["lista-publica", slug],
    queryFn: () => listaPublicaService.getLista(slug),
    retry: false,
  });

  const presentearMut = useMutation({
    mutationFn: () => listaPublicaService.presentear(slug, itemSelecionado!.id, nomeConvidado),
    onSuccess: () => {
      toast.success("Presente confirmado! O casal vai amar 💖");
      setItemSelecionado(null);
      setNomeConvidado("");
      refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao confirmar presente"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Carregando lista de presentes...</p>
      </div>
    );
  }

  if (isError || !data) {
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

  const itensFiltrados = itens.filter(
    (i) =>
      i.nome.toLowerCase().includes(busca.toLowerCase()) ||
      i.marca?.toLowerCase().includes(busca.toLowerCase()),
  );

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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8 md:mb-12">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar itens..."
            className="pl-10 h-12 rounded-full bg-muted/50 border-muted focus-visible:ring-primary shadow-sm"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {itensFiltrados.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                item.comprado
                  ? "bg-muted/30 border-muted opacity-60 grayscale hover:grayscale-0"
                  : "bg-card border-border hover:shadow-md hover:border-primary/20"
              }`}
            >
              {/* Imagem */}
              <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center p-4">
                {item.fotoUrl ? (
                  <img
                    src={item.fotoUrl}
                    alt={item.nome}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
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
                  <h3
                    className="font-semibold text-lg line-clamp-2 leading-tight"
                    title={item.nome}
                  >
                    {item.nome}
                  </h3>
                  {item.marca && <p className="text-sm text-muted-foreground mt-1">{item.marca}</p>}
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
              Nenhum item encontrado com esse nome.
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
                não estará mais disponível para outros convidados.
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
