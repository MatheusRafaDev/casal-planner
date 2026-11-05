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
  isOpen: boolean;
  onClose: () => void;
  onAdicionarAutomatico: (achadinho: Achadinho) => Promise<boolean>;
  addedItemIds?: Set<string>;
}

export function AchadinhosReelsFeed({
  items,
  initialIndex = 0,
  isOpen,
  onClose,
  onAdicionarAutomatico,
  addedItemIds = new Set(),
}: AchadinhosReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAdding, setIsAdding] = useState(false);
  const [localAddedIds, setLocalAddedIds] = useState<Set<string>>(new Set());
  const [videoLoading, setVideoLoading] = useState(true);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, items.length - 1)));
    }
  }, [isOpen, initialIndex, items.length]);

  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setVideoLoading(true);
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.info("Você chegou ao final dos achadinhos!");
    }
  }, [currentIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setVideoLoading(true);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

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
    if (!currentItem || isAdding) return;
    setIsAdding(true);
    try {
      const sucesso = await onAdicionarAutomatico(currentItem);
      if (sucesso) {
        setLocalAddedIds((prev) => new Set(prev).add(currentItem.id));
      }
    } finally {
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
        <Badge className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-none font-bold text-xs gap-1.5 px-3 py-1 shadow-md">
          <Film className="h-3.5 w-3.5" />
          Reels do Lar
        </Badge>
        <span className="text-xs font-bold text-white/80 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* Container Central do Reel no formato 9:16 (Estilo Smartphone / Instagram Reels) */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[92vh] max-h-[860px] bg-neutral-950 sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border-2 border-white/15 flex flex-col justify-between">
        {/* Barra de Progresso Segmentada no Topo */}
        <div className="absolute top-2 left-3 right-3 z-30 flex items-center gap-1">
          {items.slice(0, 25).map((_, i) => (
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
          ))}
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
                    />
                  )}
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500 relative z-10" />
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
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none z-10" />
        </div>

        {/* Coluna Flutuante de Ações Laterais (Direita) */}
        <div className="absolute right-3 bottom-32 z-30 flex flex-col items-center gap-3.5">
          {/* Botão Adicionar ao Planejamento (Ação Primária Redonda com Pulso) */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleAdicionar}
              disabled={isAdding || isJaAdicionado}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-transform active:scale-90 cursor-pointer backdrop-blur-md",
                isJaAdicionado
                  ? "bg-emerald-600 text-white border-emerald-400"
                  : "bg-primary text-primary-foreground border-white/40 hover:scale-105 animate-pulse",
              )}
              title={isJaAdicionado ? "Já está no seu planejamento" : "Adicionar ao Planejamento"}
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isJaAdicionado ? (
                <Check className="h-6 w-6 stroke-[3]" />
              ) : (
                <Plus className="h-6 w-6 stroke-[3]" />
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
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
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
              disabled={currentIndex === items.length - 1}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-30 flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
              title="Próximo vídeo (Seta Baixo)"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Card de Informações do Produto Sobreposto na Base (Estilo TikTok Shop / Reels) */}
        <div className="relative z-20 p-4 pb-5 space-y-2.5 mt-auto">
          {/* Tag do Cômodo + Preço */}
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-[11px] font-bold px-2 py-0.5 backdrop-blur-md uppercase">
              {currentItem.comodoNome}
            </Badge>

            <span className="text-emerald-400 font-display font-black text-lg drop-shadow-md">
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
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                {currentItem.nome}
              </h2>
            </div>
          </div>

          {/* Dica do Casal */}
          <p className="text-xs text-white/90 line-clamp-2 leading-relaxed bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
            <span className="text-amber-400 font-bold">💡 </span>
            {currentItem.dica}
          </p>

          {/* BOTÃO PRIMÁRIO: Adiciona Automaticamente ao Planejamento */}
          <Button
            type="button"
            size="lg"
            onClick={handleAdicionar}
            disabled={isAdding}
            className={cn(
              "w-full h-11 text-xs sm:text-sm font-extrabold gap-2 rounded-xl shadow-xl transition-all cursor-pointer active:scale-95",
              isJaAdicionado
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-primary hover:bg-primary-hover text-primary-foreground",
            )}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adicionando ao planejamento...
              </>
            ) : isJaAdicionado ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Adicionado ao Cômodo {currentItem.comodoNome}!
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[3]" />
                Adicionar ao Planejamento Automático
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
