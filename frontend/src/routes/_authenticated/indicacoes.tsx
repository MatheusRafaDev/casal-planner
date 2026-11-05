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
  Tag,
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
      { title: "CasalPlanner | Achadinhos & Dicas para a Casa Nova" },
      {
        name: "description",
        content:
          "Indicações de produtos, achadinhos virais do TikTok e conselhos de ouro para casais.",
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
  const [seloFiltro, setSeloFiltro] = useState<string>("todos");

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

  // Criar categoria sob demanda se usuário não tiver nenhuma ou quiser uma nova
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
      toast.success(`"${itemCriado.nome}" foi adicionado à sua lista!`, {
        action: {
          label: "Ver na lista",
          onClick: () => navigate({ to: "/planejamento" }),
        },
      });
    },
    onError: () => {
      toast.error("Erro ao adicionar produto ao planejamento.");
    },
  });

  // Tentar encontrar uma categoria correspondente no enxoval do usuário
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

    // Se estiver criando novo cômodo ou não houver categoria selecionada
    if (criandoNovoComodo || !targetCatId) {
      const nomeFinal = novoComodoNome.trim() || adicionandoItem.comodoSugerido || "Geral";
      try {
        const novaCat = await criarCategoriaMutation.mutateAsync(nomeFinal);
        targetCatId = novaCat.id;
      } catch {
        toast.error("Erro ao criar cômodo. Tente novamente.");
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

  // Buscar produtos ao vivo na Web via Google Shopping / Mercado Livre
  const handleBuscarNaWeb = async () => {
    const termo = busca.trim();
    if (!termo) {
      toast.info("Digite o que procura no campo de busca para pesquisar nas lojas.");
      return;
    }

    setBuscandoWeb(true);
    setPesquisaWebAtiva(true);
    try {
      const resp = await pesquisaPrecosService.buscar(termo);
      setResultadosWeb(resp.resultados ?? []);
      if (!resp.resultados || resp.resultados.length === 0) {
        toast.info(`Nenhuma oferta encontrada para "${termo}". Tente outro termo.`);
      }
    } catch {
      toast.error("Não foi possível buscar na web agora. Tente novamente.");
    } finally {
      setBuscandoWeb(false);
    }
  };

  // Copiar dica para a área de transferência
  const handleCopiarDica = (dica: DicaCasaNova) => {
    const texto = `💡 Dica CasalPlanner: ${dica.titulo}\n\n${dica.conteudo}\n\n⚡ ${dica.destaque}`;
    navigator.clipboard
      .writeText(texto)
      .then(() => {
        toast.success("Dica copiada para enviar no WhatsApp do parceiro(a)!");
      })
      .catch(() => {
        toast.error("Não foi possível copiar.");
      });
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

      const matchSelo =
        seloFiltro === "todos" ||
        item.selos.includes(
          seloFiltro as "tiktok" | "custo-beneficio" | "indispensavel" | "presente",
        );

      return matchBusca && matchComodo && matchSelo;
    });
  }, [busca, comodoFiltro, seloFiltro]);

  // Ícone dinâmico para dicas
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
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header com Visual Sticker do CasalPlanner */}
      <div className="card-sticker p-5 sm:p-7 bg-gradient-to-br from-[#1F5C43] via-[#1a4f3a] to-[#154230] text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[4px_4px_0_rgba(19,60,43,0.7)] border-2 border-[#16382a]">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-emerald-200">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Curadoria & Reviews Reais
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Achadinhos & Dicas para o Lar
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Produtos testados que realmente valem a pena, demonstrações e reviews do TikTok em vídeo
            e conselhos de ouro para quem está montando a casa a dois.
          </p>
        </div>

        {/* Abas Alternáveis */}
        <div className="flex bg-black/25 p-1 rounded-xl border border-white/15 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setAbaAtiva("achadinhos")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              abaAtiva === "achadinhos"
                ? "bg-white text-emerald-950 shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10",
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Achadinhos ({ACHADINHOS_DATA.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("dicas")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              abaAtiva === "dicas"
                ? "bg-white text-emerald-950 shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10",
            )}
          >
            <Lightbulb className="h-4 w-4" />
            <span>Dicas do Casal ({DICAS_CASA_NOVA_DATA.length})</span>
          </button>
        </div>
      </div>

      {/* ABA 1: ACHADINHOS */}
      {abaAtiva === "achadinhos" && (
        <div className="space-y-5">
          {/* Barra de Filtros e Busca */}
          <div className="card-sticker p-4 bg-card border-2 border-border/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Input de Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, marca ou dica (ex: air fryer, mop, potes)..."
                className="pl-9 h-9 text-xs sm:text-sm bg-background"
              />
            </div>

            {/* Filtros Rápidos de Cômodo */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "todos", label: "Todos os Cômodos" },
                { id: "cozinha", label: "🍳 Cozinha" },
                { id: "quarto", label: "🛏️ Quarto" },
                { id: "sala", label: "🛋️ Sala" },
                { id: "lavanderia", label: "🧺 Lavanderia" },
                { id: "banheiro", label: "🚿 Banheiro" },
                { id: "organizacao", label: "💡 Smart Home" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setComodoFiltro(c.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all border cursor-pointer select-none",
                    comodoFiltro === c.id
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground border-border/70",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros por Selo + Botão de Busca na Web */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-muted-foreground flex items-center gap-1 text-[11px] uppercase tracking-wider mr-1">
                <Tag className="h-3 w-3" /> Filtrar por:
              </span>
              {[
                { id: "todos", label: "Ver todos" },
                { id: "tiktok", label: "🎬 Viral no TikTok" },
                { id: "custo-beneficio", label: "💰 Super Custo-Benefício" },
                { id: "indispensavel", label: "🚨 Indispensável" },
                { id: "presente", label: "🎁 Ideal para Presente" },
              ].map((s) => (
                <Badge
                  key={s.id}
                  variant={seloFiltro === s.id ? "default" : "outline"}
                  onClick={() => setSeloFiltro(s.id)}
                  className={cn(
                    "cursor-pointer px-2.5 py-1 text-xs transition-all font-semibold",
                    seloFiltro === s.id ? "shadow-2xs" : "hover:bg-muted",
                  )}
                >
                  {s.label}
                </Badge>
              ))}
            </div>

            {/* Ação rápida para buscar online */}
            {busca.trim().length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBuscarNaWeb}
                disabled={buscandoWeb}
                className="h-8 text-xs font-bold gap-1.5 text-primary border-primary/40 hover:bg-primary/10 ml-auto"
              >
                {buscandoWeb ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                Buscar "{busca.trim()}" na Web
              </Button>
            )}
          </div>

          {/* PAINEL DE RESULTADOS DA WEB (QUANDO O USUÁRIO PESQUISA PRODUTOS ONLINE) */}
          {pesquisaWebAtiva && (
            <div className="p-4 rounded-2xl bg-primary/5 border-2 border-primary/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    Resultados ao vivo na Web para "{busca.trim()}" ({resultadosWeb.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPesquisaWebAtiva(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {buscandoWeb ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs font-semibold">Pesquisando nas principais lojas...</span>
                </div>
              ) : resultadosWeb.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {resultadosWeb.slice(0, 8).map((r, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-card border border-border flex flex-col justify-between gap-2 shadow-xs hover:border-primary/40 transition-all"
                    >
                      <div className="flex gap-2.5">
                        {r.thumbnail ? (
                          <img
                            src={r.thumbnail}
                            alt=""
                            className="w-14 h-14 rounded-lg object-contain bg-white p-1 border shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Store className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-muted-foreground block truncate">
                            {r.loja}
                          </span>
                          <p className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
                            {r.titulo}
                          </p>
                          <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
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
                          className="h-7 px-2 text-[11px] font-bold gap-1 text-pink-600 border-pink-500/30 hover:bg-pink-500/10"
                        >
                          <Film className="h-3 w-3" />
                          Ver vídeo
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
              ) : (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  Nenhum produto ao vivo encontrado. Tente pesquisar com um nome mais genérico.
                </p>
              )}
            </div>
          )}

          {/* Grid de Cards de Achadinhos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {achadinhosFiltrados.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="card-sticker bg-card border-2 border-border/80 flex flex-col justify-between overflow-hidden hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Imagem do Produto + Tags de Destaque */}
                    <div className="relative w-full h-48 bg-muted/40 overflow-hidden border-b border-border/60">
                      <img
                        src={item.fotoUrl}
                        alt={item.nome}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Selo do Cômodo */}
                      <Badge className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white border-white/20 text-[10px] font-bold uppercase">
                        {item.comodoNome}
                      </Badge>

                      {/* Preço Estimado */}
                      <div className="absolute bottom-2.5 left-2.5 text-white">
                        <span className="text-[10px] uppercase font-bold text-emerald-300 block leading-tight">
                          Preço médio
                        </span>
                        <span className="font-display font-bold text-base sm:text-lg tabular-nums drop-shadow-md">
                          {item.precoFaixa}
                        </span>
                      </div>

                      {/* Botão Ver no TikTok 100% Funcional */}
                      <button
                        type="button"
                        onClick={() =>
                          setVideoModal({
                            isOpen: true,
                            productName: item.nome,
                            videoUrl: item.videoUrl,
                          })
                        }
                        className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold shadow-md backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                        title="Ver review e demonstração em vídeo"
                      >
                        <Film className="h-3.5 w-3.5" />
                        <span>Ver no TikTok</span>
                      </button>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-4 space-y-3">
                      {/* Selos extras */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.selos.includes("tiktok") && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/25"
                          >
                            🎬 Viral TikTok
                          </Badge>
                        )}
                        {item.selos.includes("indispensavel") && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-bold"
                          >
                            🚨 Indispensável
                          </Badge>
                        )}
                        {item.selos.includes("custo-beneficio") && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                          >
                            💰 Custo-Benefício
                          </Badge>
                        )}
                        {item.selos.includes("presente") && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25"
                          >
                            🎁 Presente Ideal
                          </Badge>
                        )}
                      </div>

                      {/* Nome do Produto */}
                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                        {item.nome}
                      </h3>

                      {/* Dica de Ouro do Casal */}
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                        <span className="font-bold flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300">
                          <Lightbulb className="h-3 w-3" /> Dica de Casal:
                        </span>
                        <p className="leading-relaxed opacity-95">{item.dica}</p>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {item.porQueValeAPena}
                      </p>
                    </div>
                  </div>

                  {/* Ações do Rodapé */}
                  <div className="p-4 pt-2 border-t border-border/60 flex items-center gap-2">
                    {/* Botão Adicionar ao Planejamento */}
                    <Button
                      type="button"
                      onClick={() => iniciarAdicaoAchadinho(item)}
                      className="flex-1 bg-primary text-primary-foreground font-bold text-xs h-9 gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar à Lista
                    </Button>

                    {/* Botão Link da Loja */}
                    {item.linkLoja && (
                      <a
                        href={item.linkLoja}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={`Pesquisar na ${item.lojaNome || "loja"}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {achadinhosFiltrados.length === 0 && (
            <div className="text-center py-16 p-6 rounded-2xl border-2 border-dashed border-border bg-card/50 space-y-3">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h3 className="font-bold text-base text-foreground">
                Nenhum achadinho da curadoria encontrado para "{busca}"
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Você pode buscar este produto ao vivo no Google Shopping ou limpar os filtros.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setComodoFiltro("todos");
                    setSeloFiltro("todos");
                  }}
                  className="text-xs font-bold"
                >
                  Limpar filtros
                </Button>
                {busca.trim() && (
                  <Button
                    size="sm"
                    onClick={handleBuscarNaWeb}
                    disabled={buscandoWeb}
                    className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground"
                  >
                    {buscandoWeb ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DICAS_CASA_NOVA_DATA.map((dica, idx) => (
            <motion.div
              key={dica.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="card-sticker bg-card border-2 border-border/80 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/50 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-muted/80 border border-border flex items-center justify-center">
                    {getIconeDica(dica.icone)}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">
                    {dica.categoriaNome}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-foreground leading-snug">{dica.titulo}</h3>

                <p className="text-xs text-muted-foreground leading-relaxed">{dica.conteudo}</p>
              </div>

              {/* Destaque + Ações da Dica */}
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                  <span className="font-bold text-primary block text-[11px] uppercase tracking-wider mb-0.5">
                    ⚡ O que você ganha:
                  </span>
                  <p className="text-foreground/90 font-medium leading-relaxed">{dica.destaque}</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
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
                    title="Aplicar no Planejamento"
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

      {/* Dialog para Escolher o Cômodo antes de Adicionar (com criação sob demanda) */}
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
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border"
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
