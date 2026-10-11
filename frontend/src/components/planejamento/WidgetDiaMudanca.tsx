import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Truck,
  MapPin,
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Sparkles,
  Info,
  Loader2,
  Search,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { usuarioService } from "@/services/usuario";
import {
  buscarCidades,
  buscarPrevisaoTempo,
  getDescricaoClima,
  analisarRiscoMudanca,
  type CidadeSugerida,
  type PrevisaoDia,
} from "@/services/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function WidgetDiaMudanca() {
  const { usuario, refresh } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [dataMudancaInput, setDataMudancaInput] = useState(
    usuario?.dataMudanca ? usuario.dataMudanca.split("T")[0] : ""
  );
  const [cidadeBusca, setCidadeBusca] = useState(usuario?.cidadeMudanca || "");
  const [cidadeSelecionada, setCidadeSelecionada] = useState<{
    nome: string;
    latitude: number;
    longitude: number;
  } | null>(
    usuario?.latitudeMudanca && usuario?.longitudeMudanca
      ? {
          nome: usuario.cidadeMudanca || "Local selecionado",
          latitude: usuario.latitudeMudanca,
          longitude: usuario.longitudeMudanca,
        }
      : null
  );

  const [sugestoes, setSugestoes] = useState<CidadeSugerida[]>([]);
  const [buscandoCidades, setBuscandoCidades] = useState(false);

  // Sincroniza dados com o usuário autenticado
  useEffect(() => {
    if (usuario) {
      if (usuario.dataMudanca) {
        setDataMudancaInput(usuario.dataMudanca.split("T")[0]);
      }
      if (usuario.cidadeMudanca) {
        setCidadeBusca(usuario.cidadeMudanca);
      }
      if (usuario.latitudeMudanca && usuario.longitudeMudanca) {
        setCidadeSelecionada({
          nome: usuario.cidadeMudanca || "Local selecionado",
          latitude: usuario.latitudeMudanca,
          longitude: usuario.longitudeMudanca,
        });
      }
    }
  }, [usuario]);

  // Busca sugestões de cidades com debounce
  useEffect(() => {
    if (!cidadeBusca || cidadeBusca.trim().length < 2) {
      setSugestoes([]);
      return;
    }

    if (cidadeSelecionada && cidadeSelecionada.nome === cidadeBusca) {
      return;
    }

    const timer = setTimeout(async () => {
      setBuscandoCidades(true);
      const res = await buscarCidades(cidadeBusca);
      setSugestoes(res);
      setBuscandoCidades(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [cidadeBusca, cidadeSelecionada]);

  // Consulta Open-Meteo quando latitude/longitude estão preenchidas
  const lat = usuario?.latitudeMudanca;
  const lon = usuario?.longitudeMudanca;

  const { data: previsao, isLoading: loadingClima } = useQuery({
    queryKey: ["previsao-tempo-mudanca", lat, lon],
    queryFn: () => (lat && lon ? buscarPrevisaoTempo(lat, lon) : null),
    enabled: !!(lat && lon),
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  const salvarMutation = useMutation({
    mutationFn: async () => {
      return await usuarioService.atualizarDataMudanca({
        dataMudanca: dataMudancaInput || null,
        cidadeMudanca: cidadeSelecionada?.nome || (dataMudancaInput ? cidadeBusca : null),
        latitudeMudanca: cidadeSelecionada?.latitude ?? null,
        longitudeMudanca: cidadeSelecionada?.longitude ?? null,
      });
    },
    onSuccess: async () => {
      toast.success("Data da mudança e local salvos com sucesso!");
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["previsao-tempo-mudanca"] });
      await refresh();
    },
    onError: () => {
      toast.error("Erro ao salvar informações da mudança.");
    },
  });

  // Cálculo de dias até a mudança
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let diasRestantes: number | null = null;
  let dataMudancaFormatada = "";
  let previsaoDiaMudanca: PrevisaoDia | null = null;

  if (usuario?.dataMudanca) {
    const dataAlvoStr = usuario.dataMudanca.split("T")[0];
    const partes = dataAlvoStr.split("-");
    if (partes.length === 3) {
      const dataAlvo = new Date(
        parseInt(partes[0]),
        parseInt(partes[1]) - 1,
        parseInt(partes[2])
      );
      dataAlvo.setHours(0, 0, 0, 0);

      const diffMs = dataAlvo.getTime() - hoje.getTime();
      diasRestantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

      dataMudancaFormatada = dataAlvo.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Tenta achar previsão exata para o dia da mudança
      if (previsao && previsao.dias) {
        previsaoDiaMudanca =
          previsao.dias.find((d) => d.data === dataAlvoStr) || null;
      }
    }
  }

  const risco = analisarRiscoMudanca(previsaoDiaMudanca);
  const infoClima = previsaoDiaMudanca
    ? getDescricaoClima(previsaoDiaMudanca.weatherCode)
    : null;

  const renderIconeClima = (icone?: string) => {
    switch (icone) {
      case "sol":
        return <Sun className="h-6 w-6 text-amber-500 animate-pulse" />;
      case "chuva":
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "tempestade":
        return <CloudLightning className="h-6 w-6 text-purple-500" />;
      case "nevoeiro":
        return <CloudFog className="h-6 w-6 text-slate-400" />;
      default:
        return <CloudSun className="h-6 w-6 text-amber-400" />;
    }
  };

  // Se não tem data configurada ainda, exibe banner convidativo elegante
  if (!usuario?.dataMudanca) {
    return (
      <>
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-background p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-[var(--radius-md)] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-base text-foreground">
                    Data da Mudança & Previsão do Tempo
                  </h3>
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-mono">
                    Open-Meteo
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Defina o dia do novo lar para ativar a contagem regressiva, alertas de chuva em tempo real e dicas logísticas para o transporte seguro do seu enxoval.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white shrink-0 shadow-sm"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Definir Data da Mudança
            </Button>
          </div>
        </div>

        {renderModal()}
      </>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border bg-card p-5 sm:p-6 shadow-sm">
        {/* Glow sutil de fundo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Coluna 1: Contagem Regressiva e Local */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-[var(--radius-lg)] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-inner">
              <Truck className="h-7 w-7" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-primary">
                  Data da Mudança
                </span>
                {usuario.cidadeMudanca && (
                  <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground/70" />
                    {usuario.cidadeMudanca}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  title="Alterar data ou local"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Status da Contagem */}
              <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                {diasRestantes !== null && diasRestantes > 0 ? (
                  <>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Faltam{" "}
                      <span className="text-primary font-mono">{diasRestantes}</span>{" "}
                      {diasRestantes === 1 ? "dia" : "dias"}
                    </h2>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      para o grande dia! ({dataMudancaFormatada})
                    </span>
                  </>
                ) : diasRestantes === 0 ? (
                  <>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-emerald-500 flex items-center gap-2">
                      É Hoje! Feliz Casa Nova! 🎉
                    </h2>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Dia de começar essa nova história!
                    </span>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Mudança realizada! 🏠🥂
                    </h2>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ({dataMudancaFormatada})
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Coluna 2: Previsão do Tempo Open-Meteo & Alerta Logístico */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 bg-muted/30 border border-border/60 rounded-[var(--radius-md)] p-3 sm:px-4 sm:py-3">
            {loadingClima ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 px-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Consultando Open-Meteo...
              </div>
            ) : previsaoDiaMudanca ? (
              <>
                <div className="flex items-center gap-3 pr-2 sm:border-r sm:border-border/60">
                  <div className="p-2 bg-background rounded-[var(--radius-sm)] border border-border/40 shrink-0">
                    {renderIconeClima(infoClima?.icone)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                      <span className="text-foreground">{previsaoDiaMudanca.tempMax}°C</span>
                      <span className="text-xs text-muted-foreground font-normal">/ {previsaoDiaMudanca.tempMin}°C</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {infoClima?.descricao}
                    </p>
                  </div>
                </div>

                {/* Probabilidade de Chuva & Risco Logístico */}
                <div className="flex flex-col gap-1 justify-center min-w-[150px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <CloudRain className="h-3 w-3 text-blue-500" />
                      {previsaoDiaMudanca.probabilidadeChuva}% chuva
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0 ${
                        risco.nivel === "alto"
                          ? "border-red-500/40 text-red-500 bg-red-500/10"
                          : risco.nivel === "medio"
                          ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                          : "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                      }`}
                    >
                      {risco.badge}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {risco.titulo}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground py-1 px-2">
                <CloudSun className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {usuario.cidadeMudanca
                    ? "Previsão do tempo ativa até 16 dias da data."
                    : "Defina sua cidade para previsão do tempo exata."}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="h-6 text-[11px] ml-auto px-2"
                >
                  Configurar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Dicas logísticas contextuais */}
        {previsaoDiaMudanca && risco.dicas.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium text-[11px]">
              <Info className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Dica de Logística do Dia:</span>
              <span className="font-normal text-muted-foreground italic">
                "{risco.dicas[0]}"
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/80 self-end sm:self-auto">
              Previsão sem custo via Open-Meteo API
            </span>
          </div>
        )}
      </div>

      {renderModal()}
    </>
  );

  function renderModal() {
    return (
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-background border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Configurar Data da Mudança
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Acompanhe a contagem regressiva e consulte as condições climáticas e risco de chuva para o transporte do enxoval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Campo de Data */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Data Prevista
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={dataMudancaInput}
                  onChange={(e) => setDataMudancaInput(e.target.value)}
                  className="h-10 font-mono text-sm bg-card"
                />
              </div>
            </div>

            {/* Campo de Cidade com Autocomplete Open-Meteo */}
            <div className="space-y-1.5 relative">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cidade da Casa Nova (para previsão do tempo)
              </Label>
              <div className="relative">
                <Input
                  value={cidadeBusca}
                  onChange={(e) => {
                    setCidadeBusca(e.target.value);
                    if (cidadeSelecionada && cidadeSelecionada.nome !== e.target.value) {
                      setCidadeSelecionada(null);
                    }
                  }}
                  placeholder="Ex: São Paulo, Campinas, Curitiba..."
                  className="h-10 pl-9 bg-card"
                />
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                {buscandoCidades && (
                  <Loader2 className="h-4 w-4 text-primary absolute right-3 top-3 animate-spin" />
                )}
              </div>

              {/* Sugestões de Cidade */}
              {sugestoes.length > 0 && !cidadeSelecionada && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border rounded-[var(--radius-md)] shadow-lg max-h-48 overflow-y-auto">
                  {sugestoes.map((cid) => (
                    <button
                      key={cid.id}
                      type="button"
                      onClick={() => {
                        const nomeFormatado = `${cid.name}${
                          cid.admin1 ? `, ${cid.admin1}` : ""
                        }${cid.country ? ` - ${cid.country}` : ""}`;
                        setCidadeBusca(nomeFormatado);
                        setCidadeSelecionada({
                          nome: nomeFormatado,
                          latitude: cid.latitude,
                          longitude: cid.longitude,
                        });
                        setSugestoes([]);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition-colors flex items-center justify-between border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{cid.name}</span>
                        <span className="text-muted-foreground">
                          {cid.admin1} {cid.country ? `(${cid.country})` : ""}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {cid.latitude.toFixed(2)}, {cid.longitude.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {cidadeSelecionada && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium pt-1">
                  <Check className="h-3 w-3" />
                  Localização confirmada via Open-Meteo Geocoding
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            {usuario?.dataMudanca && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 text-xs sm:mr-auto"
                onClick={() => {
                  setDataMudancaInput("");
                  setCidadeBusca("");
                  setCidadeSelecionada(null);
                  salvarMutation.mutate();
                }}
                disabled={salvarMutation.isPending}
              >
                Limpar Data
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => salvarMutation.mutate()}
              disabled={salvarMutation.isPending}
            >
              {salvarMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Salvar Data & Local
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}
