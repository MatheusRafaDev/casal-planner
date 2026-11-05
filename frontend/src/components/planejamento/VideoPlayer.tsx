import { useState, useRef, useEffect } from "react";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCw,
  Loader2,
  Volume2,
  Film,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VideoPreview } from "@/services/types";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  video: VideoPreview;
  className?: string;
  autoPlay?: boolean;
  showDetails?: boolean;
  onOpenExternal?: () => void;
}

export function VideoPlayer({
  video,
  className,
  autoPlay = true,
  showDetails = true,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0); // Para forçar reload se o usuário desejar
  const [showSoundHint, setShowSoundHint] = useState(true);

  // Detecta se o vídeo é vertical (TikTok ou Shorts) ou horizontal (YouTube tradicional)
  const isVertical =
    video.platform === "tiktok" ||
    video.videoUrl.includes("/shorts/") ||
    video.playerUrl.includes("/shorts/") ||
    video.id.startsWith("tiktok");

  // Resetar loading quando trocar de vídeo
  useEffect(() => {
    setIsLoading(true);
    setShowSoundHint(true);
    const timer = setTimeout(() => setShowSoundHint(false), 4500);
    return () => clearTimeout(timer);
  }, [video.id, video.playerUrl]);

  // Listener para estado de fullscreen do navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignora erro se fullscreen for bloqueado pelo navegador
    }
  };

  const handleRecarregar = () => {
    setIsLoading(true);
    setKey((prev) => prev + 1);
  };

  return (
    <div className={cn("w-full flex flex-col items-center gap-2.5", className)}>
      {/* Moldura do Player com Glassmorphism e Efeito Sticker */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full overflow-hidden bg-black rounded-2xl shadow-xl border-2 border-border/80 transition-all group select-none",
          isVertical
            ? "max-w-[280px] sm:max-w-[320px] aspect-[9/16] max-h-[500px]"
            : "max-w-[560px] aspect-video max-h-[380px]",
          isFullscreen && "max-w-none max-h-none h-full w-full rounded-none border-0 aspect-auto",
        )}
      >
        {/* Barra de Controles Superiores Flutuantes (Discreta) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1 pointer-events-none">
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] font-extrabold px-2 py-0.5 shadow-sm border backdrop-blur-md pointer-events-auto",
              video.platform === "tiktok"
                ? "bg-black/80 text-white border-white/20"
                : "bg-red-600/90 text-white border-red-500/30",
            )}
          >
            {video.platform === "tiktok" ? "TikTok" : "YouTube"}
          </Badge>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Botão Recarregar Player */}
            <button
              type="button"
              onClick={handleRecarregar}
              title="Recarregar player"
              className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-90 cursor-pointer shadow-xs"
            >
              <RotateCw className="h-3 w-3" />
            </button>

            {/* Botão Tela Cheia */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              className="h-7 w-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-transform active:scale-90 cursor-pointer shadow-xs"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Overlay de Carregamento Suave */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-white gap-2.5 p-4 text-center">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25 blur-sm"
              />
            ) : null}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-pink-500" />
              <p className="text-xs font-semibold">Carregando demonstração...</p>
              <p className="text-[10px] text-white/70 max-w-[200px] line-clamp-1">
                {video.title}
              </p>
            </div>
          </div>
        )}

        {/* Aviso Temporário de Som Mudo */}
        {showSoundHint && !isLoading && (
          <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none transition-opacity duration-500 animate-in fade-in">
            <div className="mx-auto w-fit max-w-full px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md">
              <Volume2 className="h-3 w-3 text-pink-400 shrink-0" />
              <span className="truncate">Toque no player para ativar o som</span>
            </div>
          </div>
        )}

        {/* IFRAME Oficial Otimizado */}
        <iframe
          key={key}
          ref={iframeRef}
          src={video.playerUrl}
          title={video.title || "Demonstração do produto"}
          className="w-full h-full border-0 relative z-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Detalhes e Ações Abaixo do Player */}
      {showDetails && (
        <div className="w-full text-left px-1 space-y-1.5 max-w-[560px]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-bold line-clamp-2 text-foreground leading-snug">
              {video.title}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground flex-wrap">
            {video.author && (
              <span className="font-semibold text-foreground/90 flex items-center gap-1 truncate">
                <span className="text-pink-500 font-bold">@</span>
                {video.author.replace(/^@/, "")}
              </span>
            )}

            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 ml-auto"
            >
              Abrir no {video.platform === "tiktok" ? "TikTok" : "YouTube"}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Dica de Segurança / Cookies de Terceiros */}
          <p className="text-[10px] text-muted-foreground/75 leading-tight pt-0.5">
            Se o vídeo não iniciar pelo bloqueio de rastreamento do navegador,{" "}
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              clique aqui para assistir diretamente
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
