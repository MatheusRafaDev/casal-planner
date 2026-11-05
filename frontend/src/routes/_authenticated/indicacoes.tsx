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

export const Route = createFileRoute("/_authenticated/indicacoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "CasalPlanner | Achadinhos Virais do TikTok" },
      {
        name: "description",
        content:
          "Os produtos mais virais do TikTok com reviews em vídeo e fotos reais para montar sua casa nova.",
      },
    ],
  }),
  component: IndicacoesPage,
});

function IndicacoesPage() {
  const queryClient = useQueryClient();

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

  // Buscar categorias do usuário para vincular itens
  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ["categorias"],
    queryFn: () => categoriasService.listar(),
  });

  // Buscar itens do usuário no planejamento para saber quais já foram adicionados
  const { data: itensDoUsuario = [] } = useQuery<Item[]>({
    queryKey: ["itens"],
    queryFn: () => itensService.listar(),
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

  // Adiciona o produto automaticamente com todos os dados preenchidos ao planejamento
  const handleAdicionarAutomatico = async (achadinho: Achadinho): Promise<boolean> => {
    let catId = "";

    if (categorias.length === 0) {
      try {
        const nova = await categoriasService.criar({
          nome: achadinho.comodoNome || "Cozinha",
          cor: "#1F5C43",
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
        const nova = await categoriasService.criar({
          nome: achadinho.comodoNome || "Cozinha",
          cor: "#1F5C43",
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
        const nova = await categoriasService.criar({ nome: "Geral", cor: "#1F5C43" });
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
      {/* Cabeçalho Minimalista e Arejado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary shrink-0" />
            Achadinhos do TikTok
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Produtos virais com demonstrações reais em vídeo para inspirar seu enxoval.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Botão de Destaque para o Feed em Modo Reels */}
          <Button
            type="button"
            onClick={() => abrirReels(0)}
            className="h-9 px-3.5 rounded-xl font-extrabold text-xs sm:text-sm gap-2 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Film className="h-4 w-4" />
            <span>Assistir no Reels</span>
            <Badge className="bg-white/20 text-white border-none text-[10px] px-1.5 py-0 font-black">
              {achadinhosFiltrados.length}
            </Badge>
          </Button>

          {/* Busca Rápida Integrada */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="pl-9 h-9 text-xs sm:text-sm bg-card"
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
        </div>
      </div>

      {/* Barra de Filtros em Pílulas Únicas (Cômodos) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "todos", label: "🔥 Todos os Achadinhos" },
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
            onClick={() => {
              setFiltroAtivo(c.id);
              setPesquisaWebAtiva(false);
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer select-none border",
              filtroAtivo === c.id
                ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/40",
            )}
          >
            {c.label}
          </button>
        ))}

        {/* Atalho para buscar online se o usuário estiver pesquisando */}
        {busca.trim().length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBuscarNaWeb}
            disabled={buscandoWeb}
            className="h-7.5 px-3 rounded-full text-xs font-bold gap-1.5 text-primary border-primary/30 hover:bg-primary/10 shrink-0 ml-auto"
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

      {/* FEED DE ACHADINHOS (VISUAL VIRAL ESTILO TIKTOK / REELS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {achadinhosFiltrados.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              className="bg-card border border-border/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div>
                {/* Container da Imagem: clica e abre diretamente para adicionar o produto */}
                <div
                  onClick={() => iniciarAdicaoAchadinho(item)}
                  className="relative w-full h-48 bg-white dark:bg-muted/20 border-b border-border/60 flex items-center justify-center p-4 cursor-pointer overflow-hidden"
                  title="Clique para adicionar este item"
                >
                  <img
                    src={item.fotoUrl}
                    alt={item.nome}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Tag do Cômodo Discreta */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                    {item.comodoNome}
                  </span>

                  {/* Botão Flutuante de Vídeo do TikTok -> Abre no Reels no item clicado */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirReels(idx);
                    }}
                    className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold shadow-md transition-transform active:scale-90 select-none cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Ver Review</span>
                  </button>
                </div>

                {/* Informações Diretas e Limpas */}
                <div
                  onClick={() => iniciarAdicaoAchadinho(item)}
                  className="p-3.5 space-y-1.5 cursor-pointer"
                >
                  {/* Preço em Destaque */}
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-black text-base sm:text-lg text-emerald-700 dark:text-emerald-400">
                      {brl(item.precoEstimado)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      médio {item.precoFaixa}
                    </span>
                  </div>

                  {/* Nome do Produto */}
                  <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1 leading-snug">
                    {item.nome}
                  </h3>

                  {/* Dica Rápida */}
                  <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">💡 </span>
                    {item.dica}
                  </p>
                </div>
              </div>

              {/* Botão de Ação que adiciona automaticamente com todos os dados ou indica que já foi adicionado */}
              <div className="p-3.5 pt-0 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAdicionarAutomatico(item)}
                  disabled={addedItemIds.has(item.id)}
                  className={cn(
                    "flex-1 h-8.5 font-bold text-xs gap-1.5 shadow-2xs transition-all cursor-pointer",
                    addedItemIds.has(item.id)
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-default"
                      : "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95",
                  )}
                >
                  {addedItemIds.has(item.id) ? (
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
                    className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                    title={`Pesquisar ofertas online para "${item.nome}"`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
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
