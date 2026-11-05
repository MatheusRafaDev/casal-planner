import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Film,
  Play,
  ExternalLink,
  Loader2,
  Check,
  Plus,
  Video,
  Search,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pesquisaPrecosService, resolverVideoUrlLocal } from "@/services/pesquisa-precos";
import { VideoPlayer } from "./VideoPlayer";
import type { VideoPreview } from "@/services/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  initialVideoUrl?: string | null;
  onSelectVideo?: (videoUrl: string, thumbnailUrl?: string) => void;
  onAdicionarProduto?: (videoUrl?: string, thumbnailUrl?: string) => void;
  confirmButtonLabel?: string;
}

export function VideoPreviewModal({
  isOpen,
  onClose,
  productName,
  initialVideoUrl,
  onSelectVideo,
  onAdicionarProduto,
  confirmButtonLabel,
}: VideoPreviewModalProps) {
  const [activeVideo, setActiveVideo] = useState<VideoPreview | null>(null);
  const [inputUrl, setInputUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputUrl(initialVideoUrl || "");
      if (initialVideoUrl) {
        // Carrega preview imediato no cliente para zero latência
        const instant = resolverVideoUrlLocal(initialVideoUrl, productName);
        if (instant) {
          setActiveVideo(instant);
        }
        pesquisaPrecosService.obterPreviewVideo(initialVideoUrl, productName).then((prev) => {
          if (prev) {
            setActiveVideo(prev);
          }
        });
      } else {
        setActiveVideo(null);
      }
    }
  }, [isOpen, productName, initialVideoUrl]);

  const { data: videos = [], isLoading, isFetching } = useQuery({
    queryKey: ["video-previews", productName],
    queryFn: () => pesquisaPrecosService.buscarVideos(productName),
    enabled: isOpen && productName.trim().length > 1,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });

  // Se a lista mudar e não houver vídeo ativo, seleciona o primeiro
  useEffect(() => {
    if (videos.length > 0 && !activeVideo && !initialVideoUrl) {
      setActiveVideo(videos[0]);
    }
  }, [videos, activeVideo, initialVideoUrl]);

  const handleAplicarUrl = (urlParaAplicar?: string) => {
    const raw = (urlParaAplicar ?? inputUrl).trim();
    if (!raw) {
      toast.info("Digite ou cole uma URL de vídeo.");
      return;
    }
    const resolved = resolverVideoUrlLocal(raw, productName || "Demonstração do produto");
    if (resolved) {
      setActiveVideo(resolved);
      toast.success("Vídeo carregado com sucesso!");
    } else {
      toast.error("Link de vídeo não reconhecido. Use um link do YouTube ou TikTok.");
    }
  };

  const handleSalvarVideo = () => {
    if (!activeVideo || !onSelectVideo) return;
    onSelectVideo(activeVideo.videoUrl, activeVideo.thumbnailUrl);
    toast.success("Vídeo vinculado ao item!");
    onClose();
  };

  const handleAdicionar = () => {
    if (!onAdicionarProduto) return;
    onAdicionarProduto(activeVideo?.videoUrl, activeVideo?.thumbnailUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Film className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                Demonstração em Vídeo
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/25">
                  Reviews & Vídeos
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate max-w-xl">
                {productName ? `Vídeos de review e teste prático para "${productName}"` : "Veja o produto em ação com vídeos reais"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo Principal: Player + Lista de Vídeos */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[360px] max-h-[64vh] pr-1 pt-1">
          {/* Coluna Esquerda: Player do Vídeo Avançado */}
          <div className="md:col-span-5 flex flex-col items-center justify-start bg-muted/30 rounded-2xl p-3 border border-border/60">
            {activeVideo ? (
              <VideoPlayer video={activeVideo} className="w-full" />
            ) : isLoading ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs font-medium">Carregando demonstração do produto...</span>
              </div>
            ) : (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center gap-2 text-center text-muted-foreground p-4">
                <Video className="h-8 w-8 opacity-40" />
                <span className="text-xs font-semibold">Nenhum vídeo selecionado</span>
                <span className="text-[11px] opacity-80">Escolha uma demonstração ao lado</span>
              </div>
            )}
          </div>

          {/* Coluna Direita: Lista de Vídeos Encontrados e Campo de URL (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-3">
            {/* Campo Direto para Colar ou Trocar Link */}
            <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-primary" /> Colar ou alterar link do vídeo:
                </span>
                {activeVideo && (
                  <span className="text-[10px] text-primary font-semibold">
                    {activeVideo.platform === "youtube" ? "YouTube detectado" : "TikTok detectado"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAplicarUrl();
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=... ou TikTok"
                  className="h-8 text-xs bg-background flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAplicarUrl()}
                  disabled={!inputUrl.trim()}
                  className="h-8 text-xs font-bold px-3 cursor-pointer shrink-0"
                >
                  Visualizar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sugestões Automáticas ({videos.length})
              </span>
              {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>

            {/* Lista com Scroll Amplo */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[460px]">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-muted/60 animate-pulse" />
                  ))}
                </div>
              ) : videos.length > 0 ? (
                videos.map((v) => {
                  const isSelected = activeVideo?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveVideo(v)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer",
                        isSelected
                          ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                          : "bg-card hover:bg-muted/50 border-border/80 shadow-2xs",
                      )}
                    >
                      {/* Miniatura ou Ícone de Play */}
                      <div className="relative w-14 h-14 rounded-lg bg-black/10 shrink-0 overflow-hidden flex items-center justify-center border border-border/50">
                        {v.thumbnailUrl ? (
                          <img
                            src={v.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                          <Play className="h-4 w-4 fill-white" />
                        </div>
                      </div>

                      {/* Informações do Vídeo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] px-1.5 py-0 font-bold uppercase",
                              v.platform === "tiktok"
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "bg-red-500 text-white",
                            )}
                          >
                            {v.platform === "tiktok" ? "TikTok" : "YouTube"}
                          </Badge>
                          {v.author && (
                            <span className="text-[11px] text-muted-foreground font-semibold truncate">
                              @{v.author}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-foreground line-clamp-1 leading-snug">
                          {v.title}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="grid place-items-center h-6 w-6 rounded-full bg-primary text-primary-foreground shrink-0 shadow-xs">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border bg-muted/20 space-y-3">
                  <Film className="h-6 w-6 text-muted-foreground/60 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Buscar demonstração exata
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pesquise vídeos exatamente como está no texto do produto:
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <a
                      href={`https://www.tiktok.com/search?q=${encodeURIComponent(productName + " brasil")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-900/10 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-900/20 border border-neutral-300 transition-colors"
                    >
                      TikTok Brasil <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        productName + " review brasil",
                      )}&gl=BR&hl=pt`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-900/10 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-900/20 border border-neutral-300 transition-colors"
                    >
                      YouTube Brasil <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
                        productName,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-colors"
                    >
                      Google Shopping <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Atalhos para pesquisar exatamente o item nas plataformas */}
            {productName && (
              <div className="p-2 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Search className="h-3 w-3 text-primary" /> Pesquisar texto exato:
                </span>
                <div className="flex items-center gap-2 font-semibold">
                  <a
                    href={`https://www.tiktok.com/search?q=${encodeURIComponent(productName + " brasil")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary flex items-center gap-0.5"
                  >
                    TikTok (PT-BR) <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <span className="text-muted-foreground/40">•</span>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      productName + " review brasil",
                    )}&gl=BR&hl=pt`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary flex items-center gap-0.5"
                  >
                    YouTube (PT-BR) <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  <span className="text-muted-foreground/40">•</span>
                  <a
                    href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(productName)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary flex items-center gap-0.5"
                  >
                    Google Shopping <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="shrink-0 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs font-bold cursor-pointer">
              Fechar
            </Button>
            {onSelectVideo && (initialVideoUrl || activeVideo) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectVideo("", "");
                  toast.success("Vídeo removido deste item!");
                  onClose();
                }}
                className="text-destructive hover:bg-destructive/10 text-xs font-bold gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remover Vídeo
              </Button>
            )}
          </div>

          {onAdicionarProduto ? (
            <Button
              size="sm"
              onClick={handleAdicionar}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold gap-1.5 shadow-sm px-4 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              Adicionar Produto à Lista
            </Button>
          ) : onSelectVideo && activeVideo ? (
            <Button
              size="sm"
              onClick={handleSalvarVideo}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold gap-1.5 shadow-sm px-4 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="h-3.5 w-3.5" /> {confirmButtonLabel || "Usar este vídeo"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
