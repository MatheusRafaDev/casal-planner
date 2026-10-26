import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
import { BrandLogoText, BrandLogoIcon } from "@/components/ui/BrandLogo";

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
      if (a.comprado && !b.comprado) return 1;
      if (!a.comprado && b.comprado) return -1;

      const prio = { alta: 0, media: 1, normal: 2 };
      const valA = prio[a.prioridade as keyof typeof prio] ?? 2;
      const valB = prio[b.prioridade as keyof typeof prio] ?? 2;

      return valA - valB;
    });
  }, [itens, busca, apenasDisponiveis, faixaPreco]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background font-sans">
        <div className="card-sticker-lg p-8 max-w-md w-full bg-card shadow-[5px_5px_0_var(--border)]">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl border-2 border-border bg-gold-tint text-gold-tint-foreground mb-4 shadow-[2px_2px_0_var(--border)]">
            <Gift className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2 text-foreground">
            Lista não encontrada
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Este endereço não existe ou a lista foi desativada pelo casal. Verifique se o link está
            correto.
          </p>
          <div className="mt-6">
            <Button asChild className="btn-sticker bg-primary text-primary-foreground">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-gold/30">
      {/* Header com Branding */}
      <header className="pt-14 pb-12 px-4 text-center bg-card border-b-2 border-border relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center items-center gap-3">
            <BrandLogoIcon size="xl" className="h-12 w-12" />
            <BrandLogoText size="xl" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-border bg-primary-tint text-primary-tint-foreground text-xs font-bold uppercase tracking-wider">
            <Gift className="h-3.5 w-3.5" /> Lista de presentes
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">
            {casal}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            Obrigado por celebrar esse momento especial conosco. Escolha com carinho!
          </p>

          <div className="pt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
              <span>{comprados} Presenteados</span>
              <span>{itens.length - comprados} Restantes</span>
            </div>
            <Progress value={progresso} className="h-3 border-2 border-border bg-card" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1300px] mx-auto px-4 py-10 md:py-14">
        {/* Filtros em Card Adesivo */}
        <div className="card-sticker flex flex-col lg:flex-row gap-4 mb-10 items-center justify-between p-4 bg-card shadow-[3px_3px_0_var(--border)]">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Encontre um presente..."
              className="pl-10 h-10 bg-card border-2 border-border rounded-xl text-sm font-semibold"
            />
          </div>

          <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center w-full lg:w-auto">
            <div
              className="flex items-center space-x-2 px-3 h-10 border-2 border-border bg-card rounded-xl shadow-[2px_2px_0_var(--border)] cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setApenasDisponiveis(!apenasDisponiveis)}
            >
              <Checkbox
                id="disponiveis"
                checked={apenasDisponiveis}
                onCheckedChange={(c) => setApenasDisponiveis(!!c)}
              />
              <Label
                htmlFor="disponiveis"
                className="text-xs font-bold cursor-pointer whitespace-nowrap text-foreground"
              >
                Ocultar presenteados
              </Label>
            </div>

            <Select value={faixaPreco} onValueChange={setFaixaPreco}>
              <SelectTrigger className="w-[170px] h-10 rounded-xl border-2 border-border bg-card shadow-[2px_2px_0_var(--border)] font-bold text-xs">
                <SelectValue placeholder="Faixa de preço" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-border bg-card shadow-[4px_4px_0_var(--border)]">
                <SelectItem value="todos">Qualquer valor</SelectItem>
                <SelectItem value="ate-100">Até R$ 100</SelectItem>
                <SelectItem value="100-300">R$ 100 a R$ 300</SelectItem>
                <SelectItem value="acima-300">Acima de R$ 300</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de Itens em Cartões Adesivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {itensFiltrados.map((item) => (
            <div
              key={item.id}
              className={`card-sticker p-4 bg-card flex flex-col justify-between transition-all duration-200 shadow-[3px_3px_0_var(--border)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--border)] ${
                item.comprado ? "opacity-60 grayscale hover:grayscale-0" : ""
              }`}
            >
              <div>
                {/* Imagem Container */}
                <div className="aspect-[4/3] bg-muted/40 rounded-xl border-2 border-border relative overflow-hidden flex items-center justify-center p-4 mb-3">
                  {item.fotoUrl ? (
                    <img
                      src={item.fotoUrl}
                      alt={item.nome}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <Gift className="h-10 w-10 text-muted-foreground/40" />
                  )}

                  {item.comprado && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2">
                      <div className="border-2 border-border bg-success-tint text-success-tint-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0_var(--border)]">
                        <Check className="h-3.5 w-3.5" /> Presenteado
                      </div>
                    </div>
                  )}

                  {!item.comprado && item.prioridade === "alta" && (
                    <div className="absolute top-2 left-2 border-2 border-border bg-destructive text-destructive-foreground text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-[2px_2px_0_var(--border)]">
                      Muito Desejado
                    </div>
                  )}
                </div>

                {/* Detalhes do Produto */}
                <h3
                  className="font-bold text-base leading-snug text-foreground mb-1 line-clamp-2"
                  title={item.nome}
                >
                  {item.quantidade > 1 ? (
                    <span className="text-muted-foreground">{item.quantidade}x </span>
                  ) : (
                    ""
                  )}
                  {item.nome}
                </h3>

                {item.marca && (
                  <p className="text-xs text-muted-foreground font-semibold">{item.marca}</p>
                )}
              </div>

              <div className="pt-4 border-t-2 border-border/20 mt-4">
                <div className="flex items-end justify-between gap-4 mb-3">
                  {item.preco && item.preco > 0 ? (
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        Valor Sugerido
                      </span>
                      <span className="text-xl font-display font-bold tracking-tight tabular-nums text-foreground">
                        {brl(item.preco)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        Valor
                      </span>
                      <span className="text-sm font-bold text-muted-foreground">Livre</span>
                    </div>
                  )}
                </div>

                {!item.comprado && (
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full btn-sticker bg-primary text-primary-foreground font-bold h-10"
                      onClick={() => setItemSelecionado(item)}
                    >
                      Presentear
                    </Button>
                    {item.linkProduto && (
                      <Button
                        variant="outline"
                        className="w-full btn-sticker bg-card text-foreground font-bold h-9 text-xs"
                        asChild
                      >
                        <a href={item.linkProduto} target="_blank" rel="noopener noreferrer">
                          <span>Ver na Loja</span>
                          <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {itensFiltrados.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground font-bold">
              Nenhum item encontrado com os filtros atuais.
            </div>
          )}
        </div>
      </main>

      {/* Modal Presentear */}
      <Dialog open={!!itemSelecionado} onOpenChange={(open) => !open && setItemSelecionado(null)}>
        <DialogContent className="sm:max-w-md p-6 bg-card border-2 border-border rounded-2xl shadow-[6px_6px_0_var(--border)]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-display font-bold">Presentear</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium">
              Por favor, informe seu nome para que o casal saiba quem preparou esta surpresa.
            </DialogDescription>
          </DialogHeader>

          {itemSelecionado && (
            <div className="space-y-4 pt-2">
              {/* Card Resumo do Produto */}
              <div className="card-sticker flex gap-3.5 items-center bg-card p-3 shadow-[2px_2px_0_var(--border)]">
                <div className="h-16 w-16 bg-muted/40 rounded-xl border-2 border-border flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                  {itemSelecionado.fotoUrl ? (
                    <img
                      src={itemSelecionado.fotoUrl}
                      alt={itemSelecionado.nome}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Gift className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0 pr-2">
                  <h4 className="font-bold text-sm line-clamp-2 leading-snug">
                    {itemSelecionado.nome}
                  </h4>
                  <div className="mt-1">
                    {itemSelecionado.preco && itemSelecionado.preco > 0 ? (
                      <span className="font-bold font-display text-base text-foreground tabular-nums">
                        {brl(itemSelecionado.preco)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-bold">Valor livre</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Loja (Se Houver) */}
              {itemSelecionado.linkProduto && (
                <div className="card-sticker bg-muted/30 p-3 text-sm text-center shadow-[2px_2px_0_var(--border)]">
                  <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wider font-bold">
                    Link sugerido para compra
                  </p>
                  <Button
                    variant="outline"
                    className="w-full btn-sticker bg-card h-9 text-xs font-bold"
                    asChild
                  >
                    <a href={itemSelecionado.linkProduto} target="_blank" rel="noopener noreferrer">
                      <span>Acessar {itemSelecionado.loja && itemSelecionado.loja}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                    </a>
                  </Button>
                </div>
              )}

              {/* Identificação */}
              <div className="space-y-2">
                <Label
                  htmlFor="nome"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-bold"
                >
                  Seu Nome ou Família
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex: Tio João e Tia Maria"
                  value={nomeConvidado}
                  onChange={(e) => setNomeConvidado(e.target.value)}
                  autoFocus
                  className="h-10 rounded-xl font-semibold"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center font-medium">
                O presente será reservado no sistema imediatamente.
                <br /> Você poderá desfazer a reserva por 10 minutos se mudar de ideia.
              </p>
            </div>
          )}

          <DialogFooter className="pt-4 border-t-2 border-border/20 flex-row justify-end gap-2">
            <Button
              variant="outline"
              className="btn-sticker bg-card"
              onClick={() => setItemSelecionado(null)}
            >
              Cancelar
            </Button>
            <Button
              className="btn-sticker bg-primary text-primary-foreground font-bold"
              onClick={() => presentearMut.mutate()}
              disabled={!nomeConvidado.trim() || presentearMut.isPending}
            >
              {presentearMut.isPending ? "Confirmando..." : "Confirmar Presente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer com branding CasalPlanner */}
      <footer className="pt-8 pb-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-semibold">
        <BrandLogoIcon size="xs" className="h-5 w-5" />
        <BrandLogoText size="sm" />
        <span>— Gestão do lar e lista de presentes</span>
      </footer>
    </div>
  );
}
