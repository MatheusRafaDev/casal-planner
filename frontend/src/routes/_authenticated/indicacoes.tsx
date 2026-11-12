import { useState, useEffect, useMemo, useRef } from "react";
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
  Shuffle,
  RotateCw,
  SlidersHorizontal,
  ArrowUpDown,
  Flame,
  Tag,
  Filter,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoPreviewModal } from "@/components/planejamento/VideoPreviewModal";
import { ItemFormModal } from "@/components/planejamento/ItemFormModal";
import { AchadinhosReelsFeed } from "@/components/planejamento/AchadinhosReelsFeed";
import { AchadinhoCardImage } from "@/components/indicacoes/AchadinhoCardImage";
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

const ITENS_POR_PAGINA = 24;

// Função determinística com base em seed para rotacionar o catálogo mantendo variedade
function rotateCatalog(items: Achadinho[], seed: number): Achadinho[] {
  if (items.length === 0) return items;
  const result = [...items];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;

  function nextRandom() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Normalização de texto para busca tolerante a acentos e maiúsculas
function normalizarTexto(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function IndicacoesPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<string>("todos");
  const [faixaPreco, setFaixaPreco] = useState<
    "todos" | "ate-50" | "50-150" | "150-300" | "acima-300"
  >("todos");
  const [seloAtivo, setSeloAtivo] = useState<
    "todos" | "tiktok" | "custo-beneficio" | "indispensavel" | "presente" | "com-video"
  >("todos");
  const [ordenacao, setOrdenacao] = useState<
    "relevancia" | "menor-preco" | "maior-preco" | "custo-beneficio" | "virais" | "nome-az"
  >("relevancia");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [visiveis, setVisiveis] = useState(ITENS_POR_PAGINA);
  const [seed, setSeed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("cp_achadinhos_seed");
      if (saved) return Number(saved);
      const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60)) * 7919 + Math.floor(Math.random() * 1000);
      sessionStorage.setItem("cp_achadinhos_seed", String(hourSeed));
      return hourSeed;
    }
    return 42;
  });
  const [girando, setGirando] = useState(false);

  const girarVitrine = () => {
    setGirando(true);
    const nextSeed = Date.now() + Math.floor(Math.random() * 100000);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cp_achadinhos_seed", String(nextSeed));
    }
    setSeed(nextSeed);
    setOrdenacao("relevancia");
    setVisiveis(ITENS_POR_PAGINA);
    toast.success("Vitrine renovada com novos achadinhos!", {
      icon: "🎲",
    });
    setTimeout(() => setGirando(false), 500);
  };

  // Resetar paginação ao trocar de filtro, busca ou ordenação
  useEffect(() => {
    setVisiveis(ITENS_POR_PAGINA);
  }, [busca, filtroAtivo, faixaPreco, seloAtivo, ordenacao]);

  // Contagem de filtros ativos
  const totalFiltrosAtivos = useMemo(() => {
    let count = 0;
    if (busca.trim()) count++;
    if (filtroAtivo !== "todos") count++;
    if (faixaPreco !== "todos") count++;
    if (seloAtivo !== "todos") count++;
    if (ordenacao !== "relevancia") count++;
    return count;
  }, [busca, filtroAtivo, faixaPreco, seloAtivo, ordenacao]);

  const limparFiltros = () => {
    setBusca("");
    setFiltroAtivo("todos");
    setFaixaPreco("todos");
    setSeloAtivo("todos");
    setOrdenacao("relevancia");
    setPesquisaWebAtiva(false);
    toast.info("Filtros resetados!");
  };

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
  const [reelsInitialId, setReelsInitialId] = useState<string | null>(null);

  // Trava de idempotência no frontend para evitar clique duplo
  const pendingAddRef = useRef<Set<string>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

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
    const listaItens = Array.isArray(itensDoUsuario) ? itensDoUsuario : [];
    const nomesCadastrados = listaItens
      .filter((item): item is Item => !!item && typeof item.nome === "string")
      .map((item) => item.nome.trim().toLowerCase());

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

  const abrirReels = (itemId?: string) => {
    setReelsInitialId(itemId ?? null);
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
    if (pendingAddRef.current.has(achadinho.id)) {
      return false;
    }
    pendingAddRef.current.add(achadinho.id);
    setAddingIds((prev) => new Set(prev).add(achadinho.id));

    let catId = "";

    try {
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

      await itensService.criar({
        idempotencyKey: `achadinho-${achadinho.id}`,
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
    } finally {
      pendingAddRef.current.delete(achadinho.id);
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(achadinho.id);
        return next;
      });
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

  // Quando troca o termo de busca e o painel web está ativo, reinicia a busca online automaticamente
  useEffect(() => {
    if (!pesquisaWebAtiva) return;
    const termo = busca.trim();
    if (termo.length < 2) return;

    const timer = setTimeout(() => {
      handleBuscarNaWeb();
    }, 600);
    return () => clearTimeout(timer);
  }, [busca, pesquisaWebAtiva]);

  // 1. Filtragem e Ranqueamento dos achadinhos
  const achadinhosFiltrados = useMemo(() => {
    const buscaNorm = normalizarTexto(busca);
    const tokens = buscaNorm ? buscaNorm.split(/\s+/).filter(Boolean) : [];

    // 1. Filtrar catálogo
    const filtrados = ACHADINHOS_DATA.filter((item) => {
      // Filtro de cômodo
      if (filtroAtivo !== "todos" && item.comodo !== filtroAtivo) {
        return false;
      }

      // Filtro de faixa de preço
      if (faixaPreco === "ate-50" && item.precoEstimado > 50) return false;
      if (faixaPreco === "50-150" && (item.precoEstimado < 50 || item.precoEstimado > 150)) return false;
      if (faixaPreco === "150-300" && (item.precoEstimado < 150 || item.precoEstimado > 300)) return false;
      if (faixaPreco === "acima-300" && item.precoEstimado <= 300) return false;

      // Filtro de selo / vídeo
      if (seloAtivo === "com-video" && !item.videoUrl) return false;
      if (
        seloAtivo !== "todos" &&
        seloAtivo !== "com-video" &&
        (!item.selos || !item.selos.includes(seloAtivo as any))
      ) {
        return false;
      }

      // Busca por texto (com normalização de acentos e multi-tokens)
      if (tokens.length > 0) {
        const pool = normalizarTexto(
          `${item.nome} ${item.dica} ${item.porQueValeAPena} ${item.comodoNome} ${item.marcaSugerida || ""} ${item.selos?.join(" ") || ""}`
        );
        const matchesAll = tokens.every((token) => pool.includes(token));
        if (!matchesAll) return false;
      }

      return true;
    });

    // 2. Ordenação e Rankeamento
    if (ordenacao === "menor-preco") {
      return filtrados.slice().sort((a, b) => a.precoEstimado - b.precoEstimado);
    }
    if (ordenacao === "maior-preco") {
      return filtrados.slice().sort((a, b) => b.precoEstimado - a.precoEstimado);
    }
    if (ordenacao === "virais") {
      return filtrados.slice().sort((a, b) => {
        const scoreA = (a.videoUrl ? 10 : 0) + (a.selos?.includes("tiktok") ? 5 : 0);
        const scoreB = (b.videoUrl ? 10 : 0) + (b.selos?.includes("tiktok") ? 5 : 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.precoEstimado - b.precoEstimado;
      });
    }
    if (ordenacao === "custo-beneficio") {
      return filtrados.slice().sort((a, b) => {
        const cbA = a.selos?.includes("custo-beneficio") ? 1 : 0;
        const cbB = b.selos?.includes("custo-beneficio") ? 1 : 0;
        if (cbA !== cbB) return cbB - cbA;
        return a.precoEstimado - b.precoEstimado;
      });
    }
    if (ordenacao === "nome-az") {
      return filtrados.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }

    // "relevancia": rotação determinística pelo seed da vitrine
    return rotateCatalog(filtrados, seed);
  }, [busca, filtroAtivo, faixaPreco, seloAtivo, ordenacao, seed]);

  // 2. Paginação progressiva para performance suave
  const itensExibidos = useMemo(() => {
    return achadinhosFiltrados.slice(0, visiveis);
  }, [achadinhosFiltrados, visiveis]);

  // Sugestões de descoberta rápida
  const sugestoesRapidas = [
    { label: "💰 Mais Baratos", action: () => { setOrdenacao("menor-preco"); toast.success("Ordenado pelos mais baratos primeiro!"); } },
    { label: "🔥 Virais no TikTok", action: () => { setSeloAtivo("tiktok"); toast.success("Filtrado por virais do TikTok!"); } },
    { label: "⭐ Custo-Benefício", action: () => { setSeloAtivo("custo-beneficio"); toast.success("Filtrado por melhor custo-benefício!"); } },
    { label: "✨ Indispensáveis", action: () => { setSeloAtivo("indispensavel"); toast.success("Filtrado por itens indispensáveis!"); } },
    { label: "📹 Com Vídeo Review", action: () => { setSeloAtivo("com-video"); toast.success("Filtrado por itens com demonstração em vídeo!"); } },
    { label: "🍳 Air Fryer", action: () => setBusca("Air Fryer") },
    { label: "🤖 Robô Aspirador", action: () => setBusca("Robô Aspirador") },
    { label: "🧺 Organizador", action: () => setBusca("Organizador") },
    { label: "🛏️ Lençol", action: () => setBusca("Lençol") },
  ];

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
            onClick={() => abrirReels()}
            className="h-10 px-4 rounded-xl font-bold text-xs sm:text-sm gap-2 bg-primary hover:bg-primary-hover text-primary-foreground shadow-sticker active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Film className="h-4 w-4" />
            <span>Assistir no Reels</span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold text-white">
              {achadinhosFiltrados.length}
            </span>
          </Button>

          {/* Botão de Girar Vitrine */}
          <Button
            type="button"
            variant="outline"
            onClick={girarVitrine}
            className="h-10 px-3 sm:px-3.5 rounded-xl font-bold text-xs gap-1.5 border-border shadow-sticker-sm hover:border-primary/40 active:scale-95 transition-all cursor-pointer bg-card text-foreground shrink-0"
            title="Girar vitrine e descobrir novos achadinhos"
          >
            <Shuffle className={cn("h-3.5 w-3.5 text-primary", girando && "animate-spin")} />
            <span className="hidden sm:inline">Girar Vitrine</span>
          </Button>

          {/* Busca Rápida Integrada */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && busca.trim().length > 1) {
                  e.preventDefault();
                  handleBuscarNaWeb();
                }
              }}
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

      {/* Sugestões de Descoberta Rápida */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
        <span className="text-[11px] font-bold text-muted-foreground shrink-0 uppercase tracking-wider pl-0.5 pr-1 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          Sugestões:
        </span>
        {sugestoesRapidas.map((sug, i) => (
          <button
            key={i}
            type="button"
            onClick={sug.action}
            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            {sug.label}
          </button>
        ))}
      </div>

      {/* Barra de Categorias por Cômodo com Estilo Sticker do CasalPlanner */}
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

      {/* Barra de Controles: Ordenação / Ranks e Filtros Avançados */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Ordenação / Ranking */}
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-2.5 py-1 shadow-sticker-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0 hidden sm:inline">
              Ordenar:
            </span>
            <Select
              value={ordenacao}
              onValueChange={(val: any) => setOrdenacao(val)}
            >
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-xs font-bold text-foreground focus:ring-0 w-auto gap-1 shadow-none cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-sticker bg-card">
                <SelectItem value="relevancia" className="text-xs font-medium cursor-pointer">
                  ⚡ Relevância (Rotativo)
                </SelectItem>
                <SelectItem value="menor-preco" className="text-xs font-medium cursor-pointer">
                  💰 Menor Preço (Mais Baratos)
                </SelectItem>
                <SelectItem value="maior-preco" className="text-xs font-medium cursor-pointer">
                  💎 Maior Preço (Investimentos)
                </SelectItem>
                <SelectItem value="custo-beneficio" className="text-xs font-medium cursor-pointer">
                  ⭐ Melhor Custo-Benefício
                </SelectItem>
                <SelectItem value="virais" className="text-xs font-medium cursor-pointer">
                  🔥 Mais Virais & Populares
                </SelectItem>
                <SelectItem value="nome-az" className="text-xs font-medium cursor-pointer">
                  🔤 Nome (A a Z)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão de Expansão dos Filtros Avançados */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFiltrosAbertos((prev) => !prev)}
            className={cn(
              "h-9 px-3 rounded-xl text-xs font-bold gap-1.5 transition-all cursor-pointer shadow-sticker-sm border",
              filtrosAbertos || faixaPreco !== "todos" || seloAtivo !== "todos"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/30",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span>Filtros</span>
            {(faixaPreco !== "todos" || seloAtivo !== "todos") && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </Button>

          {/* Botão de Limpar Filtros */}
          {totalFiltrosAtivos > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="h-9 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground gap-1 hover:bg-muted/60 cursor-pointer"
              title="Resetar todos os filtros"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Limpar ({totalFiltrosAtivos})</span>
            </Button>
          )}
        </div>

        {/* Resumo da Contagem */}
        <div className="text-[11px] sm:text-xs text-muted-foreground font-medium shrink-0 ml-auto">
          Exibindo <b className="text-foreground">{itensExibidos.length}</b> de{" "}
          <b className="text-foreground">{achadinhosFiltrados.length}</b> achadinhos
        </div>
      </div>

      {/* Painel Expansível de Filtros Avançados */}
      {filtrosAbertos && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sticker space-y-3">
          {/* Filtro por Faixa de Preço */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-primary" />
              Faixa de Preço
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "todos", label: "Todos os Valores" },
                { id: "ate-50", label: "Até R$ 50" },
                { id: "50-150", label: "R$ 50 ~ R$ 150" },
                { id: "150-300", label: "R$ 150 ~ R$ 300" },
                { id: "acima-300", label: "Acima de R$ 300" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFaixaPreco(f.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                    faixaPreco === f.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background text-muted-foreground hover:text-foreground border-border hover:border-primary/30",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por Selos & Destaques */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Tag className="h-3 w-3 text-primary" />
              Selos & Destaques
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "todos", label: "Todos os Selos" },
                { id: "tiktok", label: "🔥 TikTok Viral" },
                { id: "custo-beneficio", label: "⭐ Melhor Custo-Benefício" },
                { id: "indispensavel", label: "✨ Indispensáveis" },
                { id: "presente", label: "🎁 Para Presentear" },
                { id: "com-video", label: "📹 Com Vídeo Review" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeloAtivo(s.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                    seloAtivo === s.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background text-muted-foreground hover:text-foreground border-border hover:border-primary/30",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-12 h-12 rounded-lg object-contain bg-white p-1 border shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: r.thumbnail ? "none" : "flex" }}
                      className="w-12 h-12 rounded-lg bg-muted items-center justify-center shrink-0 border"
                    >
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </div>
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

      {/* FEED DE ACHADINHOS OU EMPTY STATE */}
      {achadinhosFiltrados.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-3 shadow-sticker">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl mb-1 shadow-sticker-sm">
            🔍
          </div>
          <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
            Nenhum achadinho encontrado
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            {busca
              ? `Não encontramos nenhum produto com o termo "${busca}" para os filtros selecionados.`
              : "Nenhum produto corresponde a essa combinação de filtros e cômodo."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={limparFiltros}
              className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-sticker-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar Filtros
            </Button>
            {busca && (
              <Button
                size="sm"
                onClick={handleBuscarNaWeb}
                className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer shadow-sticker-sm"
              >
                <Globe className="h-3.5 w-3.5" />
                Buscar "{busca}" no Google Shopping
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {itensExibidos.map((item, idx) => {
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
                      <AchadinhoCardImage
                        src={item.fotoUrl}
                        alt={item.nome}
                        videoUrl={item.videoUrl}
                        comodoNome={item.comodoNome}
                      />

                      {/* Tag do Cômodo Discreta e Elegante */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-card/90 dark:bg-card/90 backdrop-blur-md text-foreground text-[10px] font-bold border border-border shadow-2xs">
                        {item.comodoNome}
                      </span>

                      {/* Botão de Ver Vídeo / Review em Vidro Escuro Sofisticado */}
                      {item.videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirReels(item.id);
                          }}
                          className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/85 hover:bg-neutral-900 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 shadow-md transition-transform active:scale-90 select-none cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          <span>Ver Vídeo</span>
                        </button>
                      )}
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

                      {/* Badges de Selos do Produto */}
                      {item.selos && item.selos.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {item.selos.map((s) => {
                            if (s === "tiktok") {
                              return (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20"
                                >
                                  🔥 Viral TikTok
                                </span>
                              );
                            }
                            if (s === "custo-beneficio") {
                              return (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                                >
                                  ⭐ Custo-Benefício
                                </span>
                              );
                            }
                            if (s === "indispensavel") {
                              return (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                >
                                  ✨ Indispensável
                                </span>
                              );
                            }
                            if (s === "presente") {
                              return (
                                <span
                                  key={s}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                                >
                                  🎁 Presente
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}

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
                      disabled={isJaAdicionado || addingIds.has(item.id)}
                      className={cn(
                        "flex-1 h-9 rounded-xl font-bold text-xs gap-1.5 transition-all cursor-pointer shadow-sticker-sm",
                        isJaAdicionado
                          ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 cursor-default"
                          : addingIds.has(item.id)
                            ? "opacity-80 cursor-wait bg-primary text-primary-foreground"
                            : "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95",
                      )}
                    >
                      {isJaAdicionado ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          Adicionado
                        </>
                      ) : addingIds.has(item.id) ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Adicionando...
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
      )}

      {/* Paginação / Carregamento Progressivo para os 500+ Achadinhos */}
      {visiveis < achadinhosFiltrados.length && (
        <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-3">
          <p className="text-xs text-muted-foreground font-medium">
            Exibindo <span className="font-bold text-foreground">{itensExibidos.length}</span> de{" "}
            <span className="font-bold text-foreground">{achadinhosFiltrados.length}</span> achadinhos rotativos
          </p>
          <div className="w-56 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, (itensExibidos.length / achadinhosFiltrados.length) * 100)}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisiveis((v) => v + ITENS_POR_PAGINA)}
              className="rounded-xl font-bold text-xs px-5 h-10 border-primary/30 hover:bg-primary/10 text-primary shadow-sticker-sm cursor-pointer"
            >
              Carregar mais 24 achadinhos
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setVisiveis(achadinhosFiltrados.length)}
              className="text-xs text-muted-foreground hover:text-foreground h-10 px-3 cursor-pointer"
            >
              Ver todos ({achadinhosFiltrados.length})
            </Button>
          </div>
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
        initialItemId={reelsInitialId}
        isOpen={reelsAberto}
        onClose={() => setReelsAberto(false)}
        onAdicionarAutomatico={handleAdicionarAutomatico}
        addedItemIds={addedItemIds}
      />
    </div>
  );
}
