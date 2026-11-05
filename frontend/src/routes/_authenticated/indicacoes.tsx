import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Film,
  Plus,
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
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoPreviewModal } from "@/components/planejamento/VideoPreviewModal";
import { ItemFormModal } from "@/components/planejamento/ItemFormModal";
import {
  ACHADINHOS_DATA,
  DICAS_CASA_NOVA_DATA,
  type Achadinho,
  type DicaCasaNova,
} from "@/services/indicacoes";
import { categoriasService } from "@/services/categorias";
import { pesquisaPrecosService } from "@/services/pesquisa-precos";
import type { Categoria, PesquisaPrecoResultado } from "@/services/types";
import type { ItemInputDTO } from "@/services/itens";
import { brl } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/indicacoes")({
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

export function IndicacoesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
  }>({
    isOpen: false,
    productName: "",
    videoUrl: null,
  });

  // Estado para o Modal Padrão do Sistema de Adicionar Item (ItemFormModal)
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [modalCategoriaId, setModalCategoriaId] = useState<string>("");
  const [modalInitial, setModalInitial] = useState<Partial<ItemInputDTO> | undefined>(undefined);

  // Buscar categorias do usuário para vincular itens
  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ["categorias"],
    queryFn: () => categoriasService.listar(),
  });

  // Abre o modal padrão do sistema com os dados do achadinho pré-preenchidos
  const iniciarAdicaoAchadinho = async (achadinho: Achadinho) => {
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
      videoUrl: achadinho.videoUrl,
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
        item.comodoNome.toLowerCase().includes(busca.toLowerCase());

      const matchComodo = filtroAtivo === "todos" || item.comodo === filtroAtivo;

      return matchBusca && matchComodo;
    });
  }, [busca, filtroAtivo]);

  const dicasFiltradas = useMemo(() => {
    if (!busca.trim()) return DICAS_CASA_NOVA_DATA;
    return DICAS_CASA_NOVA_DATA.filter(
      (d) =>
        d.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        d.conteudo.toLowerCase().includes(busca.toLowerCase()) ||
        d.destaque.toLowerCase().includes(busca.toLowerCase()),
    );
  }, [busca]);

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

  const exibeDicas = filtroAtivo === "dicas";

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

        {/* Busca Rápida Integrada */}
        <div className="relative w-full sm:w-72">
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

      {/* Barra de Filtros em Pílulas Únicas (Cômodos + Dicas) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "todos", label: "🔥 Todos os Achadinhos" },
          { id: "cozinha", label: "🍳 Cozinha" },
          { id: "quarto", label: "🛏️ Quarto" },
          { id: "sala", label: "🛋️ Sala" },
          { id: "lavanderia", label: "🧺 Lavanderia" },
          { id: "banheiro", label: "🚿 Banheiro" },
          { id: "organizacao", label: "💡 Smart Home" },
          { id: "dicas", label: "✨ Dicas de Ouro" },
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
      {!exibeDicas && (
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
                  {/* Container da Imagem com Gatilho do Vídeo */}
                  <div
                    onClick={() =>
                      setVideoModal({
                        isOpen: true,
                        productName: item.nome,
                        videoUrl: item.videoUrl,
                      })
                    }
                    className="relative w-full h-48 bg-white dark:bg-muted/20 border-b border-border/60 flex items-center justify-center p-4 cursor-pointer overflow-hidden"
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

                    {/* Botão Flutuante de Vídeo do TikTok */}
                    <button
                      type="button"
                      className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold shadow-md transition-transform active:scale-90 select-none cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>Ver Review</span>
                    </button>
                  </div>

                  {/* Informações Diretas e Limpas */}
                  <div className="p-3.5 space-y-1.5">
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

                {/* Botão de Ação que abre o modal padrão do sistema */}
                <div className="p-3.5 pt-0 flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => iniciarAdicaoAchadinho(item)}
                    className="flex-1 h-8.5 bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-2xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>

                  {item.linkLoja && (
                    <a
                      href={item.linkLoja}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      title={`Ver na loja oficial`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ABA DE DICAS DE OURO (QUANDO SELECIONADA NA PÍLULA) */}
      {exibeDicas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dicasFiltradas.map((dica, idx) => (
            <motion.div
              key={dica.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-2xs hover:border-primary/50 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-muted/80 border border-border flex items-center justify-center">
                    {getIconeDica(dica.icone)}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 rounded-md bg-muted">
                    {dica.categoriaNome}
                  </span>
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
          onClose={() => setVideoModal((prev) => ({ ...prev, isOpen: false }))}
          productName={videoModal.productName}
          initialVideoUrl={videoModal.videoUrl}
        />
      )}
    </div>
  );
}
