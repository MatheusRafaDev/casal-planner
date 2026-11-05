import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Film,
  Plus,
  Check,
  ExternalLink,
  Search,
  Zap,
  Ruler,
  Flame,
  Gift,
  HeartHandshake,
  ShoppingBag,
  Loader2,
  Lightbulb,
  Copy,
  Globe,
  ArrowRight,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoPreviewModal } from "@/components/planejamento/VideoPreviewModal";
import {
  ACHADINHOS_DATA,
  DICAS_CASA_NOVA_DATA,
  type Achadinho,
  type DicaCasaNova,
} from "@/services/indicacoes";
import { itensService } from "@/services/itens";
import { categoriasService } from "@/services/categorias";
import { pesquisaPrecosService } from "@/services/pesquisa-precos";
import type { Categoria, PesquisaPrecoResultado } from "@/services/types";
import { brl } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/indicacoes")({
  head: () => ({
    meta: [
      { title: "CasalPlanner | Achadinhos & Dicas para o Lar" },
      {
        name: "description",
        content:
          "Fotos reais dos melhores achadinhos, vídeos de review do TikTok e conselhos de ouro para sua casa.",
      },
    ],
  }),
  component: IndicacoesPage,
});

export function IndicacoesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState<"achadinhos" | "dicas">("achadinhos");
  const [busca, setBusca] = useState("");
  const [comodoFiltro, setComodoFiltro] = useState<string>("todos");

  // Estado para pesquisa ao vivo na web (Google Shopping / Lojas)
  const [pesquisaWebAtiva, setPesquisaWebAtiva] = useState(false);
  const [buscandoWeb, setBuscandoWeb] = useState(false);
  const [resultadosWeb, setResultadosWeb] = useState<PesquisaPrecoResultado[]>([]);

  // Estado para visualização de vídeo do TikTok / YouTube
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    productName: string;
    videoUrl?: string | null;
  }>({
    isOpen: false,
    productName: "",
    videoUrl: null,
  });

  // Estado para adicionar achadinho ao planejamento
  const [adicionandoItem, setAdicionandoItem] = useState<{
    nome: string;
    preco: number;
    fotoUrl?: string;
    videoUrl?: string;
    linkProduto?: string;
    loja?: string;
    marca?: string;
    comodoSugerido?: string;
  } | null>(null);

  const [categoriaEscolhidaId, setCategoriaEscolhidaId] = useState<string>("");
  const [criandoNovoComodo, setCriandoNovoComodo] = useState<boolean>(false);
  const [novoComodoNome, setNovoComodoNome] = useState<string>("");

  // Buscar categorias do usuário para vincular itens
  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ["categorias"],
    queryFn: () => categoriasService.listar(),
  });

  // Criar categoria sob demanda
  const criarCategoriaMutation = useMutation({
    mutationFn: async (nome: string) => {
      return categoriasService.criar({ nome: nome.trim(), cor: "#1F5C43" });
    },
    onSuccess: (novaCat) => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setCategoriaEscolhidaId(novaCat.id);
      setCriandoNovoComodo(false);
    },
  });

  // Adicionar item ao planejamento
  const adicionarAoPlanejamento = useMutation({
    mutationFn: async ({
      item,
      categoriaId,
    }: {
      item: NonNullable<typeof adicionandoItem>;
      categoriaId: string;
    }) => {
      return itensService.criar({
        nome: item.nome,
        categoriaId,
        preco: item.preco,
        quantidade: 1,
        marca: item.marca,
        loja: item.loja,
        linkProduto: item.linkProduto,
        fotoUrl: item.fotoUrl,
        videoUrl: item.videoUrl,
        origem: "comprado",
        pagamento: "normal",
        prioridade: "media",
      });
    },
    onSuccess: (itemCriado) => {
      queryClient.invalidateQueries({ queryKey: ["itens-paginado"] });
      queryClient.invalidateQueries({ queryKey: ["itens"] });
      queryClient.invalidateQueries({ queryKey: ["resumo"] });
      setAdicionandoItem(null);
      setCriandoNovoComodo(false);
      setNovoComodoNome("");
      toast.success(`"${itemCriado.nome}" adicionado à sua lista!`, {
        action: {
          label: "Ver na lista",
          onClick: () => navigate({ to: "/planejamento" }),
        },
      });
    },
    onError: () => {
      toast.error("Erro ao adicionar produto.");
    },
  });

  const iniciarAdicaoAchadinho = (achadinho: Achadinho) => {
    const match = categorias.find(
      (c) =>
        c.nome.toLowerCase().includes(achadinho.comodo.toLowerCase()) ||
        achadinho.comodoNome.toLowerCase().includes(c.nome.toLowerCase()),
    );

    if (match) {
      setCategoriaEscolhidaId(match.id);
      setCriandoNovoComodo(false);
    } else if (categorias.length > 0) {
      setCategoriaEscolhidaId(categorias[0]?.id || "");
      setCriandoNovoComodo(false);
    } else {
      setCategoriaEscolhidaId("");
      setCriandoNovoComodo(true);
    }

    setNovoComodoNome(achadinho.comodoNome);
    setAdicionandoItem({
      nome: achadinho.nome,
      preco: achadinho.precoEstimado,
      fotoUrl: achadinho.fotoUrl,
      videoUrl: achadinho.videoUrl,
      linkProduto: achadinho.linkLoja,
      loja: achadinho.lojaNome,
      marca: achadinho.marcaSugerida,
      comodoSugerido: achadinho.comodoNome,
    });
  };

  const iniciarAdicaoWeb = (webItem: PesquisaPrecoResultado) => {
    if (categorias.length > 0) {
      setCategoriaEscolhidaId(categorias[0]?.id || "");
      setCriandoNovoComodo(false);
    } else {
      setCategoriaEscolhidaId("");
      setCriandoNovoComodo(true);
    }

    setNovoComodoNome("Geral");
    setAdicionandoItem({
      nome: webItem.titulo,
      preco: webItem.preco,
      fotoUrl: webItem.thumbnail,
      linkProduto: webItem.link,
      loja: webItem.loja,
      marca: webItem.marca,
      comodoSugerido: "Geral",
    });
  };

  const handleConfirmarAdicao = async () => {
    if (!adicionandoItem) return;

    let targetCatId = categoriaEscolhidaId;

    if (criandoNovoComodo || !targetCatId) {
      const nomeFinal = novoComodoNome.trim() || adicionandoItem.comodoSugerido || "Geral";
      try {
        const novaCat = await criarCategoriaMutation.mutateAsync(nomeFinal);
        targetCatId = novaCat.id;
      } catch {
        toast.error("Erro ao criar cômodo.");
        return;
      }
    }

    if (targetCatId) {
      adicionarAoPlanejamento.mutate({
        item: adicionandoItem,
        categoriaId: targetCatId,
      });
    }
  };

  const handleBuscarNaWeb = async () => {
    const termo = busca.trim();
    if (!termo) {
      toast.info("Digite o que procura no campo de busca.");
      return;
    }

    setBuscandoWeb(true);
    setPesquisaWebAtiva(true);
    try {
      const resp = await pesquisaPrecosService.buscar(termo);
      setResultadosWeb(resp.resultados ?? []);
      if (!resp.resultados || resp.resultados.length === 0) {
        toast.info(`Nenhuma oferta encontrada para "${termo}".`);
      }
    } catch {
      toast.error("Não foi possível buscar na web agora.");
    } finally {
      setBuscandoWeb(false);
    }
  };

  const handleCopiarDica = (dica: DicaCasaNova) => {
    const texto = `💡 Dica CasalPlanner: ${dica.titulo}\n\n${dica.conteudo}\n\n⚡ ${dica.destaque}`;
    navigator.clipboard
      .writeText(texto)
      .then(() => toast.success("Dica copiada para enviar no WhatsApp!"))
      .catch(() => toast.error("Não foi possível copiar."));
  };

  // Filtragem dos achadinhos
  const achadinhosFiltrados = useMemo(() => {
    return ACHADINHOS_DATA.filter((item) => {
      const matchBusca =
        !busca.trim() ||
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        item.dica.toLowerCase().includes(busca.toLowerCase()) ||
        item.comodoNome.toLowerCase().includes(busca.toLowerCase()) ||
        (item.marcaSugerida && item.marcaSugerida.toLowerCase().includes(busca.toLowerCase()));

      const matchComodo = comodoFiltro === "todos" || item.comodo === comodoFiltro;

      return matchBusca && matchComodo;
    });
  }, [busca, comodoFiltro]);

  const getIconeDica = (iconeNome: string) => {
    switch (iconeNome) {
      case "Zap":
        return <Zap className="h-5 w-5 text-amber-500" />;
      case "Ruler":
        return <Ruler className="h-5 w-5 text-sky-500" />;
      case "Flame":
        return <Flame className="h-5 w-5 text-rose-500" />;
      case "Sparkles":
        return <Sparkles className="h-5 w-5 text-emerald-500" />;
      case "HeartHandshake":
        return <HeartHandshake className="h-5 w-5 text-pink-500" />;
      case "Gift":
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12 space-y-5">
      {/* Cabeçalho Compacto & Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            Achadinhos & Dicas para o Lar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fotos reais de produtos virais testados e conselhos de ouro para a casa nova.
          </p>
        </div>

        {/* Abas Alternáveis */}
        <div className="flex bg-muted/80 p-1 rounded-xl shrink-0 self-start sm:self-center border border-border/60">
          <button
            type="button"
            onClick={() => setAbaAtiva("achadinhos")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              abaAtiva === "achadinhos"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Achadinhos ({ACHADINHOS_DATA.length})
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("dicas")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              abaAtiva === "dicas"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Dicas do Casal ({DICAS_CASA_NOVA_DATA.length})
          </button>
        </div>
      </div>

      {/* ABA 1: ACHADINHOS */}
      {abaAtiva === "achadinhos" && (
        <div className="space-y-4">
          {/* Barra Única e Limpa de Filtro e Busca */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto (ex: air fryer, mop)..."
                className="pl-9 h-9 text-xs sm:text-sm bg-card border-border/80"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Pílulas Limpas de Cômodo */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "todos", label: "Todos" },
                { id: "cozinha", label: "Cozinha" },
                { id: "quarto", label: "Quarto" },
                { id: "sala", label: "Sala" },
                { id: "lavanderia", label: "Lavanderia" },
                { id: "banheiro", label: "Banheiro" },
                { id: "organizacao", label: "Smart Home" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setComodoFiltro(c.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer select-none border",
                    comodoFiltro === c.id
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                      : "bg-card text-muted-foreground hover:text-foreground border-border/70 hover:bg-muted/40",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Busca ao Vivo na Web (opcional se usuário digitou algo) */}
            {busca.trim().length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBuscarNaWeb}
                disabled={buscandoWeb}
                className="h-8.5 px-3 text-xs font-bold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 shrink-0"
              >
                {buscandoWeb ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                Buscar lojas na Web
              </Button>
            )}
          </div>

          {/* PAINEL DE RESULTADOS DA WEB (QUANDO O USUÁRIO PESQUISA PRODUTOS ONLINE) */}
          {pesquisaWebAtiva && (
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Resultados em lojas online para "{busca.trim()}" ({resultadosWeb.length})
                </span>
                <button
                  type="button"
                  onClick={() => setPesquisaWebAtiva(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {buscandoWeb ? (
                <div className="py-6 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs font-medium">Buscando melhores preços...</span>
                </div>
              ) : resultadosWeb.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {resultadosWeb.slice(0, 8).map((r, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-card border border-border flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex gap-2">
                        {r.thumbnail ? (
                          <img
                            src={r.thumbnail}
                            alt=""
                            className="w-12 h-12 rounded-lg object-contain bg-white p-1 border shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Store className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {r.loja}
                          </span>
                          <p className="text-xs font-bold text-foreground line-clamp-1">
                            {r.titulo}
                          </p>
                          <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {r.precoFormatado}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setVideoModal({
                              isOpen: true,
                              productName: r.titulo,
                            })
                          }
                          className="h-7 px-2 text-[11px] font-bold gap-1 text-pink-600 border-pink-500/30"
                        >
                          <Film className="h-3 w-3" />
                          Vídeo
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => iniciarAdicaoWeb(r)}
                          className="h-7 px-2 text-[11px] font-bold gap-1 flex-1 bg-primary text-primary-foreground"
                        >
                          <Plus className="h-3 w-3" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Grid de Cards de Achadinhos - VISUAL CLEAN & FOTOS REAIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {achadinhosFiltrados.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="card-sticker bg-card border border-border/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Imagem Real do Produto */}
                    <div className="relative w-full h-48 sm:h-52 bg-white dark:bg-muted/30 border-b border-border/60 flex items-center justify-center p-4 overflow-hidden">
                      <img
                        src={item.fotoUrl}
                        alt={item.nome}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Selo do Cômodo Discreto */}
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                        {item.comodoNome}
                      </span>

                      {/* Botão Ver no TikTok */}
                      {item.videoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setVideoModal({
                              isOpen: true,
                              productName: item.nome,
                              videoUrl: item.videoUrl,
                            })
                          }
                          className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-600/90 hover:bg-pink-600 text-white text-[11px] font-bold shadow-xs backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                          title="Ver demonstração real em vídeo"
                        >
                          <Film className="h-3 w-3" />
                          <span>Vídeo</span>
                        </button>
                      )}
                    </div>

                    {/* Conteúdo Limpo do Card */}
                    <div className="p-3.5 sm:p-4 space-y-2">
                      {/* Preço Estimado e Faixa */}
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-display font-extrabold text-base sm:text-lg text-emerald-700 dark:text-emerald-400">
                          {brl(item.precoEstimado)}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          média {item.precoFaixa}
                        </span>
                      </div>

                      {/* Nome do Produto */}
                      <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1 leading-snug">
                        {item.nome}
                      </h3>

                      {/* Dica de Ouro Única e Direta */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">💡 </span>
                        {item.dica}
                      </p>
                    </div>
                  </div>

                  {/* Ações do Rodapé */}
                  <div className="p-3.5 pt-0 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => iniciarAdicaoAchadinho(item)}
                      className="flex-1 h-8.5 bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-2xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar à Lista
                    </Button>

                    {item.linkLoja && (
                      <a
                        href={item.linkLoja}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                        title={`Pesquisar na ${item.lojaNome || "loja"}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {achadinhosFiltrados.length === 0 && (
            <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-border bg-card/40 space-y-2.5">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/60 mx-auto" />
              <h3 className="font-bold text-sm text-foreground">
                Nenhum achadinho encontrado para "{busca}"
              </h3>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setComodoFiltro("todos");
                  }}
                  className="text-xs font-bold h-8"
                >
                  Limpar busca
                </Button>
                {busca.trim() && (
                  <Button
                    size="sm"
                    onClick={handleBuscarNaWeb}
                    disabled={buscandoWeb}
                    className="text-xs font-bold gap-1.5 h-8 bg-primary text-primary-foreground"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Pesquisar na Web
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: DICAS DE OURO PARA A CASA NOVA */}
      {abaAtiva === "dicas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DICAS_CASA_NOVA_DATA.map((dica, idx) => (
            <motion.div
              key={dica.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="card-sticker bg-card border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-2xs hover:border-primary/50 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-muted/80 border border-border flex items-center justify-center">
                    {getIconeDica(dica.icone)}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">
                    {dica.categoriaNome}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
                  {dica.titulo}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">{dica.conteudo}</p>
              </div>

              {/* Destaque + Ações da Dica */}
              <div className="space-y-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                  <span className="font-bold text-primary block text-[10px] uppercase tracking-wider mb-0.5">
                    ⚡ Benefício:
                  </span>
                  <p className="text-foreground/90 font-medium leading-relaxed">{dica.destaque}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopiarDica(dica)}
                    className="flex-1 h-8 text-xs font-bold gap-1.5"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar Dica
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: "/planejamento" })}
                    className="h-8 px-3 text-xs font-bold gap-1 bg-primary text-primary-foreground"
                    title="Planejar no CasalPlanner"
                  >
                    <span>Planejar</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog para Escolher o Cômodo antes de Adicionar */}
      <Dialog
        open={!!adicionandoItem}
        onOpenChange={(open) => {
          if (!open) {
            setAdicionandoItem(null);
            setCriandoNovoComodo(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Adicionar ao Planejamento
            </DialogTitle>
            <DialogDescription className="text-xs">
              Escolha ou crie o cômodo onde deseja colocar este item na lista do casal.
            </DialogDescription>
          </DialogHeader>

          {adicionandoItem && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                {adicionandoItem.fotoUrl ? (
                  <img
                    src={adicionandoItem.fotoUrl}
                    alt=""
                    className="w-14 h-14 rounded-lg object-contain bg-white p-1 shrink-0 border border-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 border">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
                    {adicionandoItem.nome}
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {brl(adicionandoItem.preco)}
                  </p>
                </div>
              </div>

              {/* Seleção ou Criação do Cômodo */}
              {categorias.length === 0 ? (
                <div className="space-y-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-foreground">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    Primeiro item da sua casa!
                  </p>
                  <p className="text-muted-foreground">
                    Você ainda não tem cômodos criados. Vamos criar o cômodo abaixo automaticamente:
                  </p>
                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Nome do Cômodo:
                    </label>
                    <Input
                      value={novoComodoNome}
                      onChange={(e) => setNovoComodoNome(e.target.value)}
                      placeholder="Ex: Cozinha, Quarto, Sala..."
                      className="h-9 text-xs bg-background"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Selecione o Cômodo:
                    </label>
                    <button
                      type="button"
                      onClick={() => setCriandoNovoComodo(!criandoNovoComodo)}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      {criandoNovoComodo ? "Escolher existente" : "+ Criar novo cômodo"}
                    </button>
                  </div>

                  {criandoNovoComodo ? (
                    <Input
                      value={novoComodoNome}
                      onChange={(e) => setNovoComodoNome(e.target.value)}
                      placeholder="Nome do novo cômodo (ex: Cozinha, Sala de Estar)"
                      className="h-9 text-xs"
                      autoFocus
                    />
                  ) : (
                    <Select
                      value={categoriaEscolhidaId}
                      onValueChange={setCategoriaEscolhidaId}
                    >
                      <SelectTrigger className="h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Selecione um cômodo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdicionandoItem(null);
                setCriandoNovoComodo(false);
              }}
              className="text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={
                adicionarAoPlanejamento.isPending ||
                criarCategoriaMutation.isPending ||
                (!criandoNovoComodo && !categoriaEscolhidaId && categorias.length > 0)
              }
              onClick={handleConfirmarAdicao}
              className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-2xs"
            >
              {adicionarAoPlanejamento.isPending || criarCategoriaMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Confirmar e Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Vídeo do TikTok e Reviews */}
      {videoModal.isOpen && (
        <VideoPreviewModal
          isOpen={videoModal.isOpen}
          onClose={() => setVideoModal((prev) => ({ ...prev, isOpen: false }))}
          productName={videoModal.productName}
          initialVideoUrl={videoModal.videoUrl}
        />
      )}
    </div>
  );
}
