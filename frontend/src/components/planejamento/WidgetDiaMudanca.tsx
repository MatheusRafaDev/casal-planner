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
    usuario?.dataMudanca ? usuario.dataMudanca.split("T")[0] : "",
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
      : null,
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
      const dataAlvo = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
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
        previsaoDiaMudanca = previsao.dias.find((d) => d.data === dataAlvoStr) || null;
      }
    }
  }

  const risco = analisarRiscoMudanca(previsaoDiaMudanca);
  const infoClima = previsaoDiaMudanca ? getDescricaoClima(previsaoDiaMudanca.weatherCode) : null;

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
        <div className="card-sticker p-5 sm:p-6 bg-card relative overflow-hidden transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl border-2 border-border bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sticker-sm">
                <Truck className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Data da Mudança & Previsão do Tempo
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full border-2 border-border text-primary text-[10px] uppercase font-mono font-bold bg-primary/10 shadow-sticker-sm">
                    Open-Meteo
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Defina o dia do novo lar para ativar a contagem regressiva, alertas de chuva em
                  tempo real e dicas logísticas para o transporte seguro do seu enxoval.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="btn-sticker bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 h-10 px-4 font-bold"
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
      <div className="card-sticker p-5 sm:p-6 bg-card relative overflow-hidden transition-all">
        {/* Glow sutil de fundo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Barra Superior do Widget: Tags de Identificação & Ação Clara */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b-2 border-border/40">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border-2 border-border text-primary text-xs font-bold uppercase tracking-wider font-mono shadow-sticker-sm">
              <Truck className="h-3.5 w-3.5" />
              <span>Dia da Mudança</span>
            </div>
            {usuario.cidadeMudanca && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border-2 border-border text-muted-foreground text-xs font-semibold shadow-sticker-sm max-w-[280px] sm:max-w-[360px] truncate"
                title={usuario.cidadeMudanca}
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{usuario.cidadeMudanca}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="btn-sticker text-xs h-8 px-3 gap-1.5 bg-background hover:bg-muted font-bold text-foreground shrink-0"
          >
            <Edit2 className="h-3.5 w-3.5 text-primary" />
            <span>Alterar data</span>
          </Button>
        </div>

        {/* Grid Principal: Contagem em Destaque + Card de Meteorologia */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          {/* Lado Esquerdo: Contagem Regressiva Ampla e Fluida */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {diasRestantes !== null && diasRestantes > 0 ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground whitespace-nowrap">
                    Faltam <span className="text-primary font-mono">{diasRestantes}</span>{" "}
                    {diasRestantes === 1 ? "dia" : "dias"}
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
                  <span>para o grande dia!</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                  <span className="font-semibold text-foreground">({dataMudancaFormatada})</span>
                </p>
              </div>
            ) : diasRestantes === 0 ? (
              <div className="space-y-1">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-emerald-600 flex items-center gap-2">
                  É Hoje! Feliz Casa Nova! 🎉
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  Chegou o grande momento de começar essa nova etapa a dois! 🏠🥂
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground flex items-center gap-2">
                  Mudança realizada! 🏠🥂
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Celebrando o novo lar desde{" "}
                  <span className="font-semibold text-foreground">{dataMudancaFormatada}</span>
                </p>
              </div>
            )}
          </div>

          {/* Lado Direito: Previsão do Tempo / Status Aberto Open-Meteo */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border-2 border-border bg-muted/40 p-3.5 sm:p-4 shadow-sticker-sm">
              {loadingClima ? (
                <div className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  <span>Consultando previsão Open-Meteo...</span>
                </div>
              ) : previsaoDiaMudanca ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-card rounded-lg border-2 border-border shadow-sticker-sm shrink-0">
                        {renderIconeClima(infoClima?.icone)}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5 font-mono font-black text-base text-foreground">
                          <span>{previsaoDiaMudanca.tempMax}°C</span>
                          <span className="text-xs text-muted-foreground font-semibold">
                            / {previsaoDiaMudanca.tempMin}°C
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize font-medium">
                          {infoClima?.descricao}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 border-2 shadow-none ${
                        risco.nivel === "alto"
                          ? "border-red-500/50 text-red-600 bg-red-500/10"
                          : risco.nivel === "medio"
                            ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                            : "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                      }`}
                    >
                      {risco.badge}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40 font-medium">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <CloudRain className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      {previsaoDiaMudanca.probabilidadeChuva}% chance de chuva
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {risco.titulo}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-card border-2 border-border shadow-sticker-sm text-primary shrink-0">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        {usuario.cidadeMudanca ? "Previsão Antecipada" : "Previsão do Tempo"}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {usuario.cidadeMudanca
                          ? "A previsão detalhada fica ativa a até 16 dias da data."
                          : "Defina sua cidade para previsão do tempo e alertas de chuva."}
                      </p>
                    </div>
                  </div>
                  {!usuario.cidadeMudanca && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModalOpen(true)}
                      className="btn-sticker text-xs h-7 px-2.5 shrink-0 bg-background hover:bg-muted font-bold"
                    >
                      Configurar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dicas logísticas contextuais */}
        {previsaoDiaMudanca && risco.dicas.length > 0 && (
          <div className="mt-4 pt-3 border-t-2 border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span className="font-bold">Dica Logística:</span>
              <span className="text-muted-foreground italic">"{risco.dicas[0]}"</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/80 shrink-0">
              Open-Meteo Weather API
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
        <DialogContent className="sm:max-w-md bg-card border-2 border-border shadow-sticker-modal rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Configurar Data da Mudança
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Acompanhe a contagem regressiva e consulte as condições climáticas e risco de chuva
              para o transporte do enxoval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Campo de Data */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Data Prevista
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={dataMudancaInput}
                  onChange={(e) => setDataMudancaInput(e.target.value)}
                  className="h-10 font-mono text-sm bg-background border-2 border-border rounded-xl shadow-inner"
                />
              </div>
            </div>

            {/* Campo de Cidade com Autocomplete Open-Meteo */}
            <div className="space-y-1.5 relative">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                  className="h-10 pl-9 bg-background border-2 border-border rounded-xl shadow-inner"
                />
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                {buscandoCidades && (
                  <Loader2 className="h-4 w-4 text-primary absolute right-3 top-3 animate-spin" />
                )}
              </div>

              {/* Sugestões de Cidade */}
              {sugestoes.length > 0 && !cidadeSelecionada && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border-2 border-border rounded-xl shadow-sticker-lg max-h-48 overflow-y-auto divide-y divide-border/50">
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
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-muted/70 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-bold text-foreground">{cid.name}</span>
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
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            {usuario?.dataMudanca && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 text-xs sm:mr-auto font-bold"
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
              className="btn-sticker font-bold"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              size="sm"
              className="btn-sticker bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={() => salvarMutation.mutate()}
              disabled={salvarMutation.isPending}
            >
              {salvarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Data & Local
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}
