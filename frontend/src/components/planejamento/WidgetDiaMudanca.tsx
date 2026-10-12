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
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 bg-white dark:bg-slate-900 relative overflow-hidden transition-all shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                    Data da Mudança & Previsão do Tempo
                  </h3>
                  <span className="px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
                    Open-Meteo
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                  Defina o dia do novo lar para ativar a contagem regressiva, alertas de chuva em
                  tempo real e dicas logísticas para o transporte seguro do seu enxoval.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-9 px-4 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 bg-white dark:bg-slate-900 relative overflow-hidden transition-all shadow-xs">
        {/* Barra Superior do Widget: Tags de Identificação & Ação Clara */}
        <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
              <Truck className="h-3.5 w-3.5" />
              <span>Dia da Mudança</span>
            </span>
            {usuario.cidadeMudanca && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700 max-w-[220px] sm:max-w-[360px] truncate"
                title={usuario.cidadeMudanca}
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{usuario.cidadeMudanca}</span>
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="text-xs h-8 px-3 gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shrink-0 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Alterar data</span>
          </Button>
        </div>

        {/* Corpo Principal: Contagem em Destaque + Card de Meteorologia */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
          {/* Lado Esquerdo: Contagem Regressiva Hero */}
          <div className="flex-1 min-w-0">
            {diasRestantes !== null && diasRestantes > 0 ? (
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <div className="font-display text-5xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-400 leading-none tracking-tight tabular-nums shrink-0">
                  {diasRestantes}
                </div>
                <div className="space-y-1 min-w-0">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {diasRestantes === 1 ? "dia para a mudança!" : "dias para o grande dia!"}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Data prevista: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{dataMudancaFormatada}</strong></span>
                  </div>
                </div>
              </div>
            ) : diasRestantes === 0 ? (
              <div className="space-y-1">
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 flex items-center gap-2">
                  É Hoje! Feliz Casa Nova! 🎉
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
                  Chegou o grande momento de começar essa nova etapa a dois! 🏠🥂
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Mudança realizada! 🏠🥂
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Celebrando o novo lar desde{" "}
                  <strong className="text-slate-700 dark:text-slate-200 font-semibold">{dataMudancaFormatada}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Lado Direito: Previsão do Tempo */}
          <div className="lg:w-[360px] w-full shrink-0">
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-4">
              {loadingClima ? (
                <div className="flex items-center justify-center gap-2.5 text-xs text-slate-500 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600 shrink-0" />
                  <span>Consultando previsão Open-Meteo...</span>
                </div>
              ) : previsaoDiaMudanca ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                        {renderIconeClima(infoClima?.icone)}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5 font-display font-bold text-base text-slate-900 dark:text-slate-100">
                          <span>{previsaoDiaMudanca.tempMax}°C</span>
                          <span className="text-xs text-slate-500 font-semibold">
                            / {previsaoDiaMudanca.tempMin}°C
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium leading-none mt-0.5">
                          {infoClima?.descricao}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 border shadow-none ${
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

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      {previsaoDiaMudanca.probabilidadeChuva}% chance de chuva
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {risco.titulo}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Previsão do Tempo
                        </span>
                        {usuario.cidadeMudanca && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 leading-none">
                            16 dias
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
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
                      className="text-xs h-7 px-2.5 shrink-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
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
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Info className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-slate-100">Dica Logística:</span>
              <span className="text-slate-500 dark:text-slate-400 italic">"{risco.dicas[0]}"</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Truck className="h-5 w-5 text-emerald-600" />
              Configurar Data da Mudança
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhe a contagem regressiva e consulte as condições climáticas e risco de chuva
              para o transporte do enxoval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Campo de Data */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Data Prevista
              </Label>
              <Input
                type="date"
                value={dataMudancaInput}
                onChange={(e) => setDataMudancaInput(e.target.value)}
                className="h-10 text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            {/* Campo de Cidade com Autocomplete Open-Meteo */}
            <div className="space-y-1.5 relative">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
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
                  className="h-10 pl-9 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                {buscandoCidades && (
                  <Loader2 className="h-4 w-4 text-emerald-600 absolute right-3 top-3 animate-spin" />
                )}
              </div>

              {/* Sugestões de Cidade */}
              {sugestoes.length > 0 && !cidadeSelecionada && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
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
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{cid.name}</span>
                        <span className="text-slate-500">
                          {cid.admin1} {cid.country ? `(${cid.country})` : ""}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
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
                className="text-destructive hover:bg-destructive/10 text-xs sm:mr-auto font-medium"
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
              className="font-medium rounded-lg border-slate-200 dark:border-slate-700"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-xs"
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
