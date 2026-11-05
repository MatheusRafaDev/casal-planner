import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  ExternalLink,
  Search,
  ShoppingBag,
  Loader2,
  Globe,
  Store,
  X,
  Play,
  Film,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { VideoPreviewModal } from "@/components/planejamento/VideoPreviewModal";
import { ItemFormModal } from "@/components/planejamento/ItemFormModal";
import { AchadinhosReelsFeed } from "@/components/planejamento/AchadinhosReelsFeed";
import {
  ACHADINHOS_DATA,
  type Achadinho,
} from "@/services/indicacoes";
import { categoriasService } from "@/services/categorias";
import { itensService } from "@/services/itens";
import { pesquisaPrecosService } from "@/services/pesquisa-precos";
import type { Categoria, Item, PesquisaPrecoResultado } from "@/services/types";
import type { ItemInputDTO } from "@/services/itens";
import { brl } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/indicacoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "CasalPlanner | Achadinhos & Enxoval" },
      {
        name: "description",
        content:
          "Achadinhos virais com reviews em vídeo e fotos reais para montar o enxoval e a casa nova do casal.",
      },
    ],
  }),
  component: IndicacoesPage,
});

function IndicacoesPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<string>("todos");

  // Estado para pesquisa ao vivo na web (Google Shopping / Lojas)
  const [pesquisaWebAtiva, setPesquisaWebAtiva] = useState(false);
  const [buscandoWeb, setBuscandoWeb] = useState(false);
  const [resultadosWeb, setResultadosWeb] = useState<PesquisaPrecoResultado[]>([]);

  // Estado para visualização de vídeo do TikTok / YouTube
  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    productName: string;
    videoUrl?: string | null;
    achadinho?: Achadinho | null;
  }>({
    isOpen: false,
    productName: "",
    videoUrl: null,
    achadinho: null,
  });

  // Estado para o Modal Padrão do Sistema de Adicionar Item (ItemFormModal)
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [modalCategoriaId, setModalCategoriaId] = useState<string>("");
  const [modalInitial, setModalInitial] = useState<Partial<ItemInputDTO> | undefined>(undefined);

  // Estado para o Feed Imersivo de Vídeos Estilo Reels
  const [reelsAberto, setReelsAberto] = useState(false);
  const [reelsInitialIndex, setReelsInitialIndex] = useState(0);

  // Buscar categorias do usuário para vincular itens (somente quando autenticado e no browser)
  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ["categorias"],
    queryFn: () => categoriasService.listar(),
    enabled: typeof window !== "undefined" && isAuthenticated,
    retry: false,
  });

  // Buscar itens do usuário no planejamento para saber quais já foram adicionados
  const { data: itensDoUsuario = [] } = useQuery<Item[]>({
    queryKey: ["itens"],
    queryFn: () => itensService.listar(),
    enabled: typeof window !== "undefined" && isAuthenticated,
    retry: false,
  });

  // Mapeia quais achadinhos já estão adicionados ao planejamento do casal
  const addedItemIds = useMemo(() => {
    const ids = new Set<string>();
    const nomesCadastrados = itensDoUsuario.map((item) =>
      item.nome.trim().toLowerCase(),
    );
    for (const ach of ACHADINHOS_DATA) {
      const achNome = ach.nome.trim().toLowerCase();
      if (
        nomesCadastrados.some(
          (cad) =>
            cad === achNome ||
            cad.includes(achNome.slice(0, 16)) ||
            achNome.includes(cad.slice(0, 16)),
        )
      ) {
        ids.add(ach.id);
      }
    }
    return ids;
  }, [itensDoUsuario]);

  const abrirReels = (index = 0) => {
    setReelsInitialIndex(index);
    setReelsAberto(true);
  };

  const getEstiloComodo = (comodo?: string) => {
    switch (comodo) {
      case "cozinha":
        return { icon: "UtensilsCrossed", bg: "#EF6F6C" };
      case "quarto":
        return { icon: "Bed", bg: "#2F8A63" };
      case "sala":
        return { icon: "Sofa", bg: "#1F5C43" };
      case "banheiro":
        return { icon: "Bath", bg: "#2A7F8E" };
      case "lavanderia":
        return { icon: "WashingMachine", bg: "#16382A" };
      default:
        return { icon: "Package", bg: "#1F5C43" };
    }
  };

  // Adiciona o produto automaticamente com todos os dados preenchidos ao planejamento
  const handleAdicionarAutomatico = async (achadinho: Achadinho): Promise<boolean> => {
    let catId = "";

    if (categorias.length === 0) {
      try {
        const estilo = getEstiloComodo(achadinho.comodo);
        const nova = await categoriasService.criar({
          nome: achadinho.comodoNome || "Cozinha",
          icon: estilo.icon,
          bg: estilo.bg,
        });
        queryClient.invalidateQueries({ queryKey: ["categorias"] });
        catId = nova.id;
      } catch {
        catId = "";
      }
    } else {
      const match = categorias.find(
        (c) =>
          c.nome.toLowerCase().includes(achadinho.comodo.toLowerCase()) ||
          achadinho.comodoNome.toLowerCase().includes(c.nome.toLowerCase()),
      );
      catId = match ? match.id : categorias[0].id;
    }

    try {
      await itensService.criar({
        nome: achadinho.nome,
        preco: achadinho.precoEstimado,
        quantidade: 1,
        categoriaId: catId,
        comprado: false,
        fotoUrl: achadinho.fotoUrl,
        videoUrl: achadinho.videoUrl,
        loja: achadinho.lojaNome || "Amazon / Lojas Online",
        linkProduto: achadinho.linkLoja || "",
        marca: achadinho.marcaSugerida || "",
        prioridade: "media",
        origem: "planejado",
        pagamento: "normal",
      });

      queryClient.invalidateQueries({ queryKey: ["itens"] });
      queryClient.invalidateQueries({ queryKey: ["itens-paginados"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["progresso"] });

      toast.success(`"${achadinho.nome}" adicionado com sucesso!`, {
        description: `Item salvo automaticamente no cômodo ${achadinho.comodoNome} por ${brl(achadinho.precoEstimado)}.`,
      });
      return true;
    } catch (err) {
      console.error("Erro ao adicionar produto automaticamente:", err);
      toast.error("Não foi possível adicionar o produto automaticamente.");
      return false;
    }
  };

  // Abre o modal padrão do sistema com os dados do achadinho pré-preenchidos
  const iniciarAdicaoAchadinho = async (achadinho: Achadinho, videoUrlOverride?: string) => {
    let catId = "";

    if (categorias.length === 0) {
      try {
        const estilo = getEstiloComodo(achadinho.comodo);
        const nova = await categoriasService.criar({
          nome: achadinho.comodoNome || "Cozinha",
          icon: estilo.icon,
          bg: estilo.bg,
        });
        queryClient.invalidateQueries({ queryKey: ["categorias"] });
        catId = nova.id;
      } catch {
        catId = "";
      }
    } else {
      const match = categorias.find(
        (c) =>
          c.nome.toLowerCase().includes(achadinho.comodo.toLowerCase()) ||
          achadinho.comodoNome.toLowerCase().includes(c.nome.toLowerCase()),
      );
      catId = match ? match.id : categorias[0].id;
    }

    setModalCategoriaId(catId);
    setModalInitial({
      nome: achadinho.nome,
      preco: achadinho.precoEstimado,
      quantidade: 1,
      fotoUrl: achadinho.fotoUrl,
      videoUrl: videoUrlOverride !== undefined ? videoUrlOverride : achadinho.videoUrl,
      loja: achadinho.lojaNome || "Amazon / Online",
      linkProduto: achadinho.linkLoja || "",
      marca: achadinho.marcaSugerida || "",
      prioridade: "media",
      origem: "comprado",
      pagamento: "normal",
      categoriaId: catId,
    });
    setModalItemAberto(true);
  };

  // Abre o modal padrão do sistema com os dados do resultado da web pré-preenchidos
  const iniciarAdicaoWeb = async (webItem: PesquisaPrecoResultado) => {
    let catId = "";
    if (categorias.length === 0) {
      try {
        const nova = await categoriasService.criar({
          nome: "Geral",
          icon: "Package",
          bg: "#1F5C43",
        });
        queryClient.invalidateQueries({ queryKey: ["categorias"] });
        catId = nova.id;
      } catch {
        catId = "";
      }
    } else {
      catId = categorias[0].id;
    }

    setModalCategoriaId(catId);
    setModalInitial({
      nome: webItem.titulo,
      preco: webItem.preco,
      quantidade: 1,
      fotoUrl: webItem.thumbnail,
      linkProduto: webItem.link,
      loja: webItem.loja,
      marca: webItem.marca || "",
      prioridade: "media",
      origem: "comprado",
      pagamento: "normal",
      categoriaId: catId,
    });
    setModalItemAberto(true);
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

  // Filtragem dos achadinhos
  const achadinhosFiltrados = useMemo(() => {
    return ACHADINHOS_DATA.filter((item) => {
      const matchBusca =
        !busca.trim() ||
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        item.dica.toLowerCase().includes(busca.toLowerCase()) ||
        item.comodoNome.toLowerCase().includes(busca.toLowerCase());

      const matchComodo = filtroAtivo === "todos" || item.comodo === filtroAtivo;

      return matchBusca && matchComodo;
    });
  }, [busca, filtroAtivo]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-12 space-y-4 sm:space-y-5">
      {/* Cabeçalho Editorial e Acolhedor no Padrão CasalPlanner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Curadoria para Casa Nova
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Achadinhos & Enxoval
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-xl">
            Demonstrações reais em vídeo e produtos virais testados para o dia a dia do casal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Botão de Destaque Modo Reels com a Paleta CasalPlanner */}
          <Button
            type="button"
            onClick={() => abrirReels(0)}
            className="h-10 px-4 rounded-xl font-bold text-xs sm:text-sm gap-2 bg-primary hover:bg-primary-hover text-primary-foreground shadow-sticker active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Film className="h-4 w-4" />
            <span>Assistir no Reels</span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold text-white">
              {achadinhosFiltrados.length}
            </span>
          </Button>

          {/* Busca Rápida Integrada */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nos achadinhos..."
              className="pl-9 h-10 text-xs sm:text-sm bg-card border-border rounded-xl shadow-sticker-sm focus-ring"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Filtros com Estilo Sticker do CasalPlanner */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        {[
          { id: "todos", label: "Todos", count: ACHADINHOS_DATA.length },
          { id: "cozinha", label: "🍳 Cozinha", count: ACHADINHOS_DATA.filter((i) => i.comodo === "cozinha").length },
          { id: "quarto", label: "🛏️ Quarto", count: ACHADINHOS_DATA.filter((i) => i.comodo === "quarto").length },
          { id: "sala", label: "🛋️ Sala", count: ACHADINHOS_DATA.filter((i) => i.comodo === "sala").length },
          { id: "lavanderia", label: "🧺 Lavanderia", count: ACHADINHOS_DATA.filter((i) => i.comodo === "lavanderia").length },
          { id: "banheiro", label: "🚿 Banheiro", count: ACHADINHOS_DATA.filter((i) => i.comodo === "banheiro").length },
          { id: "organizacao", label: "💡 Smart Home", count: ACHADINHOS_DATA.filter((i) => i.comodo === "organizacao").length },
        ].map((c) => {
          const isAtivo = filtroAtivo === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setFiltroAtivo(c.id);
                setPesquisaWebAtiva(false);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer select-none border flex items-center gap-1.5",
                isAtivo
                  ? "bg-primary text-primary-foreground border-primary shadow-sticker"
                  : "bg-card text-muted-foreground hover:text-foreground border-border hover:border-primary/30 shadow-sticker-sm",
              )}
            >
              <span>{c.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                  isAtivo ? "bg-white/20 text-white" : "bg-muted text-muted-foreground",
                )}
              >
                {c.count}
              </span>
            </button>
          );
        })}

        {/* Atalho para buscar online se o usuário estiver pesquisando */}
        {busca.trim().length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBuscarNaWeb}
            disabled={buscandoWeb}
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 shrink-0 ml-auto"
          >
            {buscandoWeb ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
            Buscar na Web
          </Button>
        )}
      </div>

      {/* Painel de Resultados da Web (Quando pesquisado sob demanda) */}
      {pesquisaWebAtiva && (
        <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/25 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Ofertas online para "{busca.trim()}" ({resultadosWeb.length})
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
              <span className="text-xs font-medium">Pesquisando nas lojas...</span>
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
                      <p className="text-xs font-bold text-foreground line-clamp-1">{r.titulo}</p>
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

      {/* FEED DE ACHADINHOS - CARDS ELEGANTES NO PADRÃO CASALPLANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <AnimatePresence mode="popLayout">
          {achadinhosFiltrados.map((item, idx) => {
            const isJaAdicionado = addedItemIds.has(item.id);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className="card-sticker rounded-2xl overflow-hidden flex flex-col justify-between border border-border bg-card shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div>
                  {/* Container da Imagem: fundo branco puro de vitrine */}
                  <div
                    onClick={() => iniciarAdicaoAchadinho(item)}
                    className="relative w-full h-48 bg-white dark:bg-muted/30 border-b border-border/60 flex items-center justify-center p-4 cursor-pointer overflow-hidden"
                    title="Clique para ver detalhes e personalizar"
                  >
                    <img
                      src={item.fotoUrl}
                      alt={item.nome}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Tag do Cômodo Discreta e Elegante */}
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-card/90 dark:bg-card/90 backdrop-blur-md text-foreground text-[10px] font-bold border border-border shadow-2xs">
                      {item.comodoNome}
                    </span>

                    {/* Botão de Ver Vídeo / Review em Vidro Escuro Sofisticado */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirReels(idx);
                      }}
                      className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/85 hover:bg-neutral-900 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 shadow-md transition-transform active:scale-90 select-none cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>Ver Vídeo</span>
                    </button>
                  </div>

                  {/* Informações Claras e Tipografia Jakarta Sans */}
                  <div
                    onClick={() => iniciarAdicaoAchadinho(item)}
                    className="p-3.5 space-y-2 cursor-pointer"
                  >
                    {/* Preço e Média de Mercado */}
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-display font-black text-lg sm:text-xl text-primary">
                        {brl(item.precoEstimado)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        médio {item.precoFaixa}
                      </span>
                    </div>

                    {/* Nome do Produto com peso agradável */}
                    <h3 className="font-display font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">
                      {item.nome}
                    </h3>

                    {/* Dica do Casal em card creme suave */}
                    <div className="p-2 rounded-xl bg-background border border-border/80 flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                      <span className="text-amber-500 font-bold shrink-0">💡</span>
                      <span className="line-clamp-2">{item.dica}</span>
                    </div>
                  </div>
                </div>

                {/* Rodapé com Ações Claras */}
                <div className="p-3.5 pt-0 flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAdicionarAutomatico(item)}
                    disabled={isJaAdicionado}
                    className={cn(
                      "flex-1 h-9 rounded-xl font-bold text-xs gap-1.5 transition-all cursor-pointer shadow-sticker-sm",
                      isJaAdicionado
                        ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 cursor-default"
                        : "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95",
                    )}
                  >
                    {isJaAdicionado ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        Adicionado
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar
                      </>
                    )}
                  </Button>

                  {item.linkLoja && (
                    <a
                      href={item.linkLoja}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shrink-0 shadow-sticker-sm"
                      title={`Pesquisar ofertas online para "${item.nome}"`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal Padrão do Sistema para Adicionar Item (ItemFormModal) */}
      <ItemFormModal
        open={modalItemAberto}
        onOpenChange={setModalItemAberto}
        categorias={categorias}
        categoriaId={modalCategoriaId}
        item={null}
        initial={modalInitial}
      />

      {/* Modal de Vídeo do TikTok e Reviews */}
      {videoModal.isOpen && (
        <VideoPreviewModal
          isOpen={videoModal.isOpen}
          onClose={() => setVideoModal((prev) => ({ ...prev, isOpen: false, achadinho: null }))}
          productName={videoModal.productName}
          initialVideoUrl={videoModal.videoUrl}
          onAdicionarProduto={
            videoModal.achadinho
              ? async () => {
                  const ach = videoModal.achadinho!;
                  setVideoModal((prev) => ({ ...prev, isOpen: false, achadinho: null }));
                  await handleAdicionarAutomatico(ach);
                }
              : undefined
          }
        />
      )}

      {/* Feed Vertical Estilo Reels em Tela Cheia */}
      <AchadinhosReelsFeed
        items={achadinhosFiltrados.length > 0 ? achadinhosFiltrados : ACHADINHOS_DATA}
        initialIndex={reelsInitialIndex}
        isOpen={reelsAberto}
        onClose={() => setReelsAberto(false)}
        onAdicionarAutomatico={handleAdicionarAutomatico}
        addedItemIds={addedItemIds}
      />
    </div>
  );
}
