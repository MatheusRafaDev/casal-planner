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
  Edit2,
  Info,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
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

  // Se não tem data configurada ainda, exibe banner convidativo no mesmo design system
  if (!usuario?.dataMudanca) {
    return (
      <>
        <div className="card-sticker bg-card border border-border rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl border border-primary/20 bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-foreground">
                    Data da Mudança & Previsão do Tempo
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    Open-Meteo
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
                  Defina o dia do novo lar para ativar a contagem regressiva, alertas de chuva em
                  tempo real e dicas logísticas para o transporte seguro do seu enxoval.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-primary-foreground shrink-0 h-10 px-4 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
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
      <div className="card-sticker bg-card border border-border rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-xs transition-all">
        {/* Efeito sutil de luz suave no canto */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5 dark:bg-primary/10 blur-2xl pointer-events-none" />

        {/* Topo do Widget: Identificação da Mudança & Botão de Edição */}
        <div className="flex items-start sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-border/80 flex-wrap relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                  Dia da Mudança
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Contagem Regressiva
                </span>
              </div>
              {usuario.cidadeMudanca && (
                <div
                  className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mt-0.5 truncate"
                  title={usuario.cidadeMudanca}
                >
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate max-w-[260px] sm:max-w-[420px]">
                    {usuario.cidadeMudanca}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="text-xs h-9 px-3.5 gap-1.5 bg-card hover:bg-muted border-border text-foreground font-bold rounded-xl shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Alterar data e local</span>
          </Button>
        </div>

        {/* Corpo Principal: Grid equilibrado entre Contagem Regressiva e Radar do Tempo */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-5 items-stretch relative z-10">
          {/* Lado Esquerdo: Contagem Regressiva Hero */}
          <div className="p-5 sm:p-6 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/80 flex flex-col justify-between space-y-4">
            {diasRestantes !== null && diasRestantes > 0 ? (
              <>
                <div className="flex items-baseline gap-3.5 flex-wrap">
                  <span className="font-display font-black text-5xl sm:text-6xl text-primary leading-none tracking-tight tabular-nums">
                    {diasRestantes}
                  </span>
                  <span className="font-display font-bold text-lg sm:text-2xl text-foreground leading-tight">
                    {diasRestantes === 1 ? "dia para a mudança!" : "dias para o grande dia!"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs sm:text-sm font-semibold text-foreground shadow-2xs self-start">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    Data prevista:{" "}
                    <strong className="font-bold text-foreground">
                      {dataMudancaFormatada}
                    </strong>
                  </span>
                </div>
              </>
            ) : diasRestantes === 0 ? (
              <div className="space-y-2">
                <h4 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-primary flex items-center gap-2">
                  É Hoje! Feliz Casa Nova! 🎉
                </h4>
                <p className="text-sm text-muted-foreground font-medium">
                  Chegou o grande momento de começar essa nova etapa a dois! 🏠🥂
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                  Mudança realizada! 🏠🥂
                </h4>
                <p className="text-sm text-muted-foreground font-medium">
                  Celebrando o novo lar desde{" "}
                  <strong className="text-foreground font-bold">{dataMudancaFormatada}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Lado Direito: Radar Meteorológico Open-Meteo */}
          <div className="p-5 sm:p-6 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/80 flex flex-col justify-between">
            {loadingClima ? (
              <div className="flex flex-col items-center justify-center gap-2.5 text-xs text-muted-foreground py-6 my-auto">
                <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                <span>Consultando previsão Open-Meteo...</span>
              </div>
            ) : previsaoDiaMudanca ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-card rounded-xl border border-border shadow-xs shrink-0">
                      {renderIconeClima(infoClima?.icone)}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5 font-display font-bold text-base sm:text-lg text-foreground">
                        <span>{previsaoDiaMudanca.tempMax}°C</span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          / {previsaoDiaMudanca.tempMin}°C
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize font-medium leading-none mt-0.5">
                        {infoClima?.descricao}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 border shadow-none ${
                      risco.nivel === "alto"
                        ? "border-red-500/30 text-red-600 bg-red-500/10"
                        : risco.nivel === "medio"
                          ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                          : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                    }`}
                  >
                    {risco.badge}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-border/60 font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <CloudRain className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {previsaoDiaMudanca.probabilidadeChuva}% chance de chuva
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {risco.titulo}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 my-auto">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-display font-bold text-sm text-foreground">
                    <CloudSun className="h-4 w-4 text-amber-500" />
                    <span>Previsão do Tempo</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {usuario.cidadeMudanca
                    ? `O monitoramento em tempo real de chuva e temperatura para ${
                        usuario.cidadeMudanca.split(",")[0]
                      } será ativado automaticamente 16 dias antes da data para proteger o transporte do enxoval.`
                    : "Defina sua cidade para ativar a previsão meteorológica e alertas de chuva."}
                </p>

                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">

                  {!usuario.cidadeMudanca && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModalOpen(true)}
                      className="h-6 px-2 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Configurar local
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dicas logísticas de transporte */}
        {previsaoDiaMudanca && risco.dicas.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs relative z-10">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span className="font-bold text-foreground">Dica Logística:</span>
              <span className="text-muted-foreground italic">"{risco.dicas[0]}"</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">
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
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-xl rounded-2xl p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2 text-foreground">
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
              <Input
                type="date"
                value={dataMudancaInput}
                onChange={(e) => setDataMudancaInput(e.target.value)}
                className="h-10 text-sm bg-muted/40 border-border rounded-xl"
              />
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
                  className="h-10 pl-9 bg-muted/40 border-border rounded-xl"
                />
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                {buscandoCidades && (
                  <Loader2 className="h-4 w-4 text-primary absolute right-3 top-3 animate-spin" />
                )}
              </div>

              {/* Sugestões de Cidade */}
              {sugestoes.length > 0 && !cidadeSelecionada && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-border">
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
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-muted transition-colors flex items-center justify-between cursor-pointer"
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
                className="text-destructive hover:bg-destructive/10 text-xs sm:mr-auto font-bold cursor-pointer"
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
              className="font-bold rounded-xl border-border cursor-pointer"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-xl shadow-xs cursor-pointer"
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
