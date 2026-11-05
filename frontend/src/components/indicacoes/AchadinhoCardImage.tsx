import React, { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchadinhoCardImageProps {
  src: string;
  alt: string;
  videoUrl?: string;
  comodoNome?: string;
  className?: string;
}

/**
 * Componente resiliente para exibição de fotos de achadinhos.
 * - Esconde o ícone nativo quebrado do navegador usando alt="" e fallback gracioso.
 * - Suporta carregamento assíncrono com skeleton pulse suave.
 * - Utiliza política referrerPolicy="no-referrer" para evitar bloqueios de CDNs e Google Shopping.
 * - Fallback em cascata: Imagem do Produto -> Thumbnail do Vídeo -> Placeholder Elegante.
 */
export function AchadinhoCardImage({
  src,
  alt,
  videoUrl,
  comodoNome,
  className,
}: AchadinhoCardImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setTriedFallback(false);
  }, [src]);

  const handleError = () => {
    if (!triedFallback && videoUrl) {
      const match = videoUrl.match(/(?:embed\/|v=|youtu\.be\/|\/v\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        setTriedFallback(true);
        setCurrentSrc(`https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`);
        return;
      }
    }
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden", className)}>
      {/* Skeleton Pulse durante o carregamento */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse rounded-xl" />
      )}

      {hasError ? (
        <div className="flex flex-col items-center justify-center p-3 text-center text-muted-foreground select-none">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1 shadow-xs">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
          </div>
          <span className="text-[11px] font-bold text-foreground line-clamp-1">{comodoNome || "Achadinho"}</span>
          <span className="text-[10px] text-muted-foreground">Foto ilustrativa</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt=""
          aria-label={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-105",
            isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        />
      )}
    </div>
  );
}

