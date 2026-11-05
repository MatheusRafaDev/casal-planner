import { useState, useEffect, useRef, useCallback } from "react";
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Check,
  ExternalLink,
  Share2,
  ChevronUp,
  ChevronDown,
  X,
  ShoppingBag,
  Sparkles,
  Loader2,
  CheckCircle2,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/formatters";
import type { Achadinho } from "@/services/indicacoes";
import { resolverVideoUrlLocal } from "@/services/pesquisa-precos";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AchadinhosReelsFeedProps {
  items: Achadinho[];
  initialIndex?: number;
  initialItemId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAdicionarAutomatico: (achadinho: Achadinho) => Promise<boolean>;
  addedItemIds?: Set<string>;
}

// Algoritmo Fisher-Yates para garantir distribuição 100% aleatória e imparcial
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function AchadinhosReelsFeed({
  items,
  initialIndex = 0,
  initialItemId = null,
  isOpen,
  onClose,
  onAdicionarAutomatico,
  addedItemIds = new Set(),
}: AchadinhosReelsFeedProps) {
  const [feedItems, setFeedItems] = useState<Achadinho[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const isAddingRef = useRef(false);
  const [localAddedIds, setLocalAddedIds] = useState<Set<string>>(new Set());
  const [videoLoading, setVideoLoading] = useState(true);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Inicializa o feed 100% aleatório toda vez que o Reels é aberto
  useEffect(() => {
    if (!isOpen) return;

    const baseList = items.length > 0 ? items : [];
    if (baseList.length === 0) return;

    // Embaralha aleatoriamente todos os achadinhos
    const shuffled = shuffleArray(baseList);

    // Se o usuário clicou no "Ver Vídeo" de um card específico, coloca ele como primeiro
    if (initialItemId) {
      const idx = shuffled.findIndex((it) => it.id === initialItemId);
      if (idx > -1) {
        const [target] = shuffled.splice(idx, 1);
        shuffled.unshift(target);
      }
    } else if (typeof initialIndex === "number" && initialIndex > 0 && initialIndex < baseList.length) {
      const targetItem = baseList[initialIndex];
      if (targetItem) {
        const idx = shuffled.findIndex((it) => it.id === targetItem.id);
        if (idx > -1) {
          const [target] = shuffled.splice(idx, 1);
          shuffled.unshift(target);
        }
      }
    }

    setFeedItems(shuffled);
    setCurrentIndex(0);
    setVideoLoading(true);
  }, [isOpen, initialItemId, initialIndex, items]);

  const currentItem = feedItems[currentIndex] || items[0];

  // Resetar loading e adicionar timer de segurança para conexões lentas ou adblockers
  useEffect(() => {
    setVideoLoading(true);
    const timer = setTimeout(() => {
      setVideoLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (feedItems.length === 0) return;

    if (currentIndex < feedItems.length - 1) {
      setVideoLoading(true);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Chegou ao final da lista: reembaralha e reinicia de forma infinita
      setVideoLoading(true);
      setFeedItems((prev) => shuffleArray(prev));
      setCurrentIndex(0);
      toast.info("🎲 Novos achadinhos aleatórios carregados!");
    }
  }, [currentIndex, feedItems.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setVideoLoading(true);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    if (feedItems.length <= 1) return;
    const current = feedItems[currentIndex];
    const rest = feedItems.filter((_, i) => i !== currentIndex);
    const newOrder = [current, ...shuffleArray(rest)];
    setFeedItems(newOrder);
    toast.success("🎲 Próximos vídeos reembaralhados aleatoriamente!", { duration: 2000 });
  };

  // Navegação por teclado (Setas Cima / Baixo e Espaço)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Gestos de Touch no mobile (Swipe Up para próximo, Swipe Down para anterior)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    // Deslizar para cima (mais de 45px) avança para o próximo
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStartY(null);
  };

  // Scroll com a rodinha do mouse (Wheel)
  const wheelLockRef = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) > 40) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 400);
    }
  };

  const handleAdicionar = async () => {
    if (!currentItem || isAddingRef.current || isAdding) return;
    isAddingRef.current = true;
    setIsAdding(true);
    try {
      const sucesso = await onAdicionarAutomatico(currentItem);
      if (sucesso) {
        setLocalAddedIds((prev) => new Set(prev).add(currentItem.id));
      }
    } finally {
      isAddingRef.current = false;
      setIsAdding(false);
    }
  };

  const handleCompartilhar = async () => {
    if (!currentItem) return;
    const url = currentItem.linkLoja || window.location.href;
    const texto = `Olha esse achadinho para a nossa casa nova: ${currentItem.nome}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentItem.nome,
          text: texto,
          url,
        });
        return;
      } catch {
        // Fallback para cópia
      }
    }

    try {
      await navigator.clipboard.writeText(`${texto} ${url}`);
      toast.success("Link do produto copiado para compartilhar!");
    } catch {
      toast.info("Link pronto para envio.");
    }
  };

  if (!isOpen || !currentItem) return null;

  const isJaAdicionado = addedItemIds.has(currentItem.id) || localAddedIds.has(currentItem.id);
  const resolvedVideo = currentItem.videoUrl
    ? resolverVideoUrlLocal(currentItem.videoUrl, currentItem.nome)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden select-none animate-in fade-in duration-200"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Botão Fechar no Topo */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-90 cursor-pointer shadow-lg"
        title="Voltar para a vitrine (Esc)"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Indicador de Reels no Topo Esquerdo */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 font-bold text-xs shadow-md">
          <Film className="h-3.5 w-3.5 text-primary" />
          Reels do Lar
        </span>
        <span className="text-xs font-bold text-white/80 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          {currentIndex + 1} / {feedItems.length}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-md">
          <Shuffle className="h-3 w-3" />
          100% Aleatório
        </span>
      </div>

      {/* Container Central do Reel no formato 9:16 (Estilo Smartphone / Instagram Reels) */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[92vh] max-h-[860px] bg-neutral-950 sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border-2 border-white/15 flex flex-col justify-between">
        {/* Barra de Progresso no Topo */}
        <div className="absolute top-2 left-3 right-3 z-30 flex items-center gap-1">
          {feedItems.length <= 30 ? (
            feedItems.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full flex-1 transition-all",
                  i === currentIndex
                    ? "bg-white shadow-xs"
                    : i < currentIndex
                      ? "bg-white/50"
                      : "bg-white/20",
                )}
              />
            ))
          ) : (
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 rounded-full shadow-xs"
                style={{ width: `${((currentIndex + 1) / feedItems.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Player de Vídeo em Tela Cheia no Fundo do Reel */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
          {resolvedVideo ? (
            <div className="relative w-full h-full">
              {videoLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white gap-2">
                  {currentItem.fotoUrl && (
                    <img
                      src={currentItem.fotoUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (currentItem.videoUrl) {
                          const match = currentItem.videoUrl.match(/(?:embed\/|v=|youtu\.be\/|\/v\/)([a-zA-Z0-9_-]{11})/);
                          if (match && !target.src.includes(match[1])) {
                            target.src = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                          }
                        }
                      }}
                    />
                  )}
                  <Loader2 className="h-8 w-8 animate-spin text-white/90 relative z-10" />
                  <span className="text-xs font-semibold relative z-10 text-white/80">
                    Carregando demonstração...
                  </span>
                </div>
              )}
              <iframe
                key={currentItem.id}
                src={resolvedVideo.playerUrl}
                title={currentItem.nome}
                className="w-full h-full border-0 object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
                onLoad={() => setVideoLoading(false)}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
              <img
                src={currentItem.fotoUrl}
                alt={currentItem.nome}
                className="w-56 h-56 object-contain p-2 bg-white/10 rounded-2xl border border-white/20 mb-4"
              />
              <p className="text-sm font-bold text-white max-w-xs">{currentItem.nome}</p>
            </div>
          )}

          {/* Gradiente Escuro na Base para Leitura dos Dados do Produto */}
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />
        </div>

        {/* Coluna Flutuante de Ações Laterais (Direita) */}
        <div className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-3.5">
          {/* Botão Adicionar ao Planejamento (Ação Primária Redonda) */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleAdicionar}
              disabled={isAdding || isJaAdicionado}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-transform active:scale-90 cursor-pointer backdrop-blur-md",
                isJaAdicionado
                  ? "bg-primary text-white border-white/60"
                  : "bg-primary text-white border-white/40 hover:scale-105",
              )}
              title={isJaAdicionado ? "Já está no seu planejamento" : "Adicionar ao Planejamento"}
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : isJaAdicionado ? (
                <Check className="h-6 w-6 stroke-[3] text-white" />
              ) : (
                <Plus className="h-6 w-6 stroke-[3] text-white" />
              )}
            </button>
            <span className="text-[10px] font-extrabold text-white drop-shadow-md">
              {isJaAdicionado ? "Adicionado" : "Adicionar"}
            </span>
          </div>

          {/* Botão Pesquisar Ofertas / Loja Oficial */}
          {currentItem.linkLoja && (
            <div className="flex flex-col items-center gap-1">
              <a
                href={currentItem.linkLoja}
                target="_blank"
                rel="noreferrer"
                className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90"
                title="Pesquisar ofertas online"
              >
                <ShoppingBag className="h-4 w-4 text-white" />
              </a>
              <span className="text-[9px] font-bold text-white/90 drop-shadow-md">Ofertas</span>
            </div>
          )}

          {/* Botão Compartilhar */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleCompartilhar}
              className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer"
              title="Compartilhar achadinho com parceiro(a)"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <span className="text-[9px] font-bold text-white/90 drop-shadow-md">Enviar</span>
          </div>

          {/* Botão de Som / Dica de Volume */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                toast.info("🔊 Dica de Som", {
                  description: "Os vídeos iniciam com som. Se o seu navegador ou celular bloqueou o áudio, toque no ícone de volume dentro do vídeo para ouvir!",
                });
              }}
              className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer"
              title="Informações de som do vídeo"
            >
              <Volume2 className="h-4 w-4 text-white" />
            </button>
            <span className="text-[9px] font-bold text-white/90 drop-shadow-md">Áudio</span>
          </div>

          {/* Botão Assistir Vídeo Original no YouTube / TikTok */}
          {resolvedVideo?.videoUrl && (
            <div className="flex flex-col items-center gap-1">
              <a
                href={resolvedVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90"
                title={`Assistir no ${resolvedVideo.platform === "tiktok" ? "TikTok" : "YouTube"}`}
              >
                <ExternalLink className="h-4 w-4 text-white" />
              </a>
              <span className="text-[9px] font-bold text-white/90 drop-shadow-md">Original</span>
            </div>
          )}

          {/* Botão Reembaralhar / Modo 100% Aleatório */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleShuffle}
              className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-emerald-400 border border-emerald-500/40 flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 cursor-pointer"
              title="Embaralhar vídeos novamente (100% aleatório)"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <span className="text-[9px] font-bold text-emerald-300 drop-shadow-md">Mix</span>
          </div>

          {/* Setas de Próximo / Anterior */}
          <div className="pt-2 flex flex-col gap-1.5 border-t border-white/20">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-30 flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
              title="Vídeo anterior (Seta Cima)"
            >
              <ChevronUp className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
              title="Próximo vídeo aleatório (Seta Baixo)"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Card de Informações do Produto Sobreposto na Base */}
        <div className="relative z-20 p-4 pb-5 space-y-2.5 mt-auto">
          {/* Tag do Cômodo + Preço */}
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-[11px] font-bold px-2 py-0.5 backdrop-blur-md uppercase">
              {currentItem.comodoNome}
            </Badge>

            <span className="text-white font-display font-extrabold text-xl drop-shadow-md">
              {brl(currentItem.precoEstimado)}
            </span>

            <span className="text-[11px] text-white/70 font-medium">
              médio {currentItem.precoFaixa}
            </span>
          </div>

          {/* Foto Miniatura + Nome do Produto */}
          <div className="flex items-start gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-white/40 shrink-0 overflow-hidden shadow-md">
              <img
                src={currentItem.fotoUrl}
                alt={currentItem.nome}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (currentItem.videoUrl) {
                    const match = currentItem.videoUrl.match(/(?:embed\/|v=|youtu\.be\/|\/v\/)([a-zA-Z0-9_-]{11})/);
                    if (match && !target.src.includes(match[1])) {
                      target.src = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                    }
                  }
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                {currentItem.nome}
              </h2>
              {currentItem.lojaNome && (
                <p className="text-[11px] text-white/70 font-semibold mt-0.5">
                  {currentItem.lojaNome} {currentItem.marcaSugerida ? `• ${currentItem.marcaSugerida}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* BOTÃO PRIMÁRIO: Adiciona Automaticamente ao Planejamento */}
          <Button
            type="button"
            size="lg"
            onClick={handleAdicionar}
            disabled={isAdding}
            className={cn(
              "w-full h-11 text-xs sm:text-sm font-extrabold gap-2 rounded-xl shadow-xl transition-all cursor-pointer active:scale-95",
              isJaAdicionado
                ? "bg-primary/90 text-white border border-white/20 cursor-default"
                : "bg-primary hover:bg-primary-hover text-white shadow-xl",
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Adicionando ao planejamento...
              </>
            ) : isJaAdicionado ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                No Planejamento ({currentItem.comodoNome})
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[3]" />
                Adicionar ao Planejamento
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

