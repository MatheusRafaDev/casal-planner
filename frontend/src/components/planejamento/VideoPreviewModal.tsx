import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Film,
  Play,
  ExternalLink,
  Loader2,
  Check,
  Search,
  Sparkles,
  Link as LinkIcon,
  Video,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { pesquisaPrecosService } from "@/services/pesquisa-precos";
import type { VideoPreview } from "@/services/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  initialVideoUrl?: string | null;
  onSelectVideo?: (videoUrl: string, thumbnailUrl?: string) => void;
}

export function VideoPreviewModal({
  isOpen,
  onClose,
  productName,
  initialVideoUrl,
  onSelectVideo,
}: VideoPreviewModalProps) {
  const [searchQuery, setSearchQuery] = useState(productName);
  const [activeQuery, setActiveQuery] = useState(productName);
  const [activeVideo, setActiveVideo] = useState<VideoPreview | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(productName);
      setActiveQuery(productName);
      setCustomUrl("");

      if (initialVideoUrl) {
        // Se já tem uma URL inicial, tentar carregar o preview
        pesquisaPrecosService.obterPreviewVideo(initialVideoUrl).then((prev) => {
          if (prev) {
            setActiveVideo(prev);
          }
        });
      }
    }
  }, [isOpen, productName, initialVideoUrl]);

  const { data: videos = [], isLoading, isFetching } = useQuery({
    queryKey: ["video-previews", activeQuery],
    queryFn: () => pesquisaPrecosService.buscarVideos(activeQuery),
    enabled: isOpen && activeQuery.trim().length > 1,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });

  // Se a lista mudar e não houver vídeo ativo, seleciona o primeiro
  useEffect(() => {
    if (videos.length > 0 && (!activeVideo || !videos.some((v) => v.id === activeVideo.id))) {
      setActiveVideo(videos[0]);
    }
  }, [videos, activeVideo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 1) {
      setActiveQuery(searchQuery.trim());
    }
  };

  const handleCarregarUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    setLoadingCustom(true);
    try {
      const prev = await pesquisaPrecosService.obterPreviewVideo(customUrl.trim());
      if (prev) {
        setActiveVideo(prev);
        toast.success("Vídeo carregado com sucesso!");
      } else {
        toast.error("Não foi possível carregar a prévia deste vídeo.");
      }
    } catch {
      toast.error("Erro ao carregar o vídeo. Verifique o link e tente novamente.");
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleSalvarVideo = () => {
    if (!activeVideo || !onSelectVideo) return;
    onSelectVideo(activeVideo.videoUrl, activeVideo.thumbnailUrl);
    toast.success("Vídeo demonstrativo vinculado ao item!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Film className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                Demonstrações e Reviews no TikTok
                <Badge variant="outline" className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30">
                  TikTok & Vídeos
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate max-w-xl">
                {productName ? `Vídeos e reviews para "${productName}"` : "Veja o produto em ação com vídeos reais"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Barra de Pesquisa */}
        <div className="shrink-0 mb-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar demonstração do produto..."
                className="pl-9 text-xs sm:text-sm h-9"
              />
            </div>
            <Button type="submit" size="sm" className="h-9 px-3 text-xs font-bold gap-1.5" disabled={isFetching}>
              {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Buscar
            </Button>
          </form>
        </div>

        {/* Conteúdo Principal: Player + Lista de Vídeos */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[360px] max-h-[58vh] pr-1">
          {/* Coluna Esquerda: Player do Vídeo (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-start bg-muted/40 rounded-2xl p-3 border border-border/60">
            {activeVideo ? (
              <div className="w-full flex flex-col items-center gap-2.5">
                {/* Player Responsivo */}
                <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] max-h-[460px] bg-black rounded-xl overflow-hidden shadow-lg border border-border/80">
                  <iframe
                    src={activeVideo.playerUrl}
                    title={activeVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Info do Vídeo Ativo */}
                <div className="w-full text-left px-1">
                  <p className="text-xs font-bold line-clamp-2 leading-snug">{activeVideo.title}</p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] text-muted-foreground">
                    {activeVideo.author && (
                      <span className="font-semibold text-foreground/80 truncate">
                        @{activeVideo.author}
                      </span>
                    )}
                    <a
                      href={activeVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 ml-auto"
                    >
                      Abrir no {activeVideo.platform === "tiktok" ? "TikTok" : "YouTube"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span className="text-xs font-medium">Buscando reviews no TikTok...</span>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-2 text-center text-muted-foreground p-4">
                <Video className="h-8 w-8 opacity-40" />
                <span className="text-xs font-semibold">Nenhum vídeo selecionado</span>
                <span className="text-[11px] opacity-80">Escolha um vídeo ao lado ou cole o link direto</span>
              </div>
            )}
          </div>

          {/* Coluna Direita: Lista de Vídeos Encontrados + Link Manual (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vídeos encontrados ({videos.length})
              </span>
              {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>

            {/* Lista com Scroll */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[310px]">
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
                          ? "bg-primary/10 border-primary shadow-xs"
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
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border bg-muted/20">
                  <Film className="h-6 w-6 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">Nenhum vídeo encontrado</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Tente buscar por um termo mais simples ou cole o link do TikTok abaixo.
                  </p>
                </div>
              )}
            </div>

            {/* Input para Colar Link Manual */}
            <form onSubmit={handleCarregarUrl} className="pt-2 border-t border-border/60">
              <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mb-1.5">
                <LinkIcon className="h-3 w-3" /> Colar link direto do TikTok ou YouTube:
              </label>
              <div className="flex gap-2">
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@usuario/video/..."
                  className="text-xs h-8.5"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-8.5 text-xs font-bold shrink-0"
                  disabled={loadingCustom || !customUrl.trim()}
                >
                  {loadingCustom ? <Loader2 className="h-3 w-3 animate-spin" /> : "Carregar"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="shrink-0 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs font-bold">
            Fechar
          </Button>

          {onSelectVideo && activeVideo && (
            <Button
              size="sm"
              onClick={handleSalvarVideo}
              className="bg-primary text-primary-foreground text-xs font-bold gap-1.5 shadow-xs"
            >
              <Check className="h-3.5 w-3.5" /> Salvar este vídeo no produto
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

