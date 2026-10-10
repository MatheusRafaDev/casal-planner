import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertTriangle,
  Check,
  Store,
  Camera,
  Upload,
  Hash,
  Tag,
  CreditCard,
  Zap,
  Gift,
  Wallet,
  Pencil,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { PainelPesquisaPrecos } from "./PainelPesquisaPrecos";
import type { Categoria, PesquisaPrecoResultado } from "@/services/types";
import { itensService } from "@/services/itens";
import { pesquisaPrecosService } from "@/services/pesquisa-precos";
import { registroPrecoService } from "@/services/registro-preco";
import { groqService } from "@/services/groq";
import { brl } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getSuggestions } from "@/lib/suggestions";
import { iconFor } from "@/components/planejamento/icon-map";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categorias: Categoria[];
  categoriaInicialId: string;
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        const maxSize = 1600;
        let { width, height } = bitmap;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context is null");

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } catch (error) {
        // Fallback em caso de erro no createImageBitmap
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;

            if (ctx) {
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, width, height);
            }

            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };
          img.onerror = reject;
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            reject(new Error("Failed to load image"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    })();
  });
}

type Step = 1 | 2 | 3;

export function AddItemWizard({ open, onOpenChange, categorias, categoriaInicialId }: Props) {
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [nome, setNome] = useState("");
  const [queryBusca, setQueryBusca] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [categoriaId, setCategoriaId] = useState(categoriaInicialId);
  const [escolhido, setEscolhido] = useState<PesquisaPrecoResultado | null>(null);
  const [precoNumerico, setPrecoNumerico] = useState<number>(0);
  const [marca, setMarca] = useState("");
  const [loja, setLoja] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [pagamento, setPagamento] = useState<"normal" | "vr">("normal");
  const [prioridade, setPrioridade] = useState("media");
  const [origem, setOrigem] = useState<"comprado" | "ganho">("comprado");
  const [responsavelId, setResponsavelId] = useState<1 | 2 | null>(null);
  const [dividir, setDividir] = useState(false);
  const [divisaoPagamento, setDivisaoPagamento] = useState<{
    valorPessoa1: number;
    valorPessoa2: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const itemFotoInputRef = useRef<HTMLInputElement>(null);
  const [analisandoFoto, setAnalisandoFoto] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setNome("");
    setQuantidade(1);
    setCategoriaId(categoriaInicialId);
    setEscolhido(null);
    setPrecoNumerico(0);
    setMarca("");
    setLoja("");
    setParcelas(1);
    setPagamento("normal");
    setPrioridade("media");
    setOrigem("comprado");
    setResponsavelId(null);
    setDividir(false);
    setDivisaoPagamento(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setFotoFile(null);
    setFotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const { usuario } = useAuth();
  const isCasal = usuario?.tipoConta === "Casal";
  const p1 = usuario?.casalInfo?.pessoa1?.nome || "Pessoa 1";
  const p2 = usuario?.casalInfo?.pessoa2?.nome || "Pessoa 2";

  useEffect(() => {
    if (open) {
      setCategoriaId(categoriaInicialId);
    }
  }, [open, categoriaInicialId]);

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNomeChange = (value: string) => {
    setNome(value);
    const s = getSuggestions(value);
    setSuggestions(s);
    setShowSuggestions(s.length > 0);

    // Auto-preencher cômodo baseado em palavras-chave
    const lowerValue = value.toLowerCase();
    const map: Record<string, string[]> = {
      cozinha: [
        "geladeira",
        "fogão",
        "fogao",
        "microondas",
        "micro-ondas",
        "forno",
        "liquidificador",
        "batedeira",
        "panela",
        "talher",
        "copo",
        "prato",
        "air fryer",
      ],
      quarto: [
        "cama",
        "colchão",
        "colchao",
        "guarda-roupa",
        "travesseiro",
        "lençol",
        "lencol",
        "cobertor",
        "edredom",
        "cabeceira",
        "mesa de cabeceira",
      ],
      sala: [
        "sofá",
        "sofa",
        "tv",
        "televisão",
        "televisao",
        "rack",
        "painel",
        "tapete",
        "poltrona",
      ],
      banheiro: [
        "toalha",
        "chuveiro",
        "espelho",
        "saboneteira",
        "tapete de banheiro",
        "armário de banheiro",
      ],
      lavanderia: [
        "máquina de lavar",
        "maquina de lavar",
        "ferro",
        "tábua",
        "tabua",
        "varal",
        "aspirador",
      ],
    };

    for (const [catName, keywords] of Object.entries(map)) {
      if (keywords.some((k) => lowerValue.includes(k))) {
        const cat = categorias.find((c) => c.nome.toLowerCase().includes(catName));
        if (cat) {
          setCategoriaId(cat.id);
          return cat.id;
        }
        break;
      }
    }
    return null;
  };

  const handleSelectSuggestion = (s: string) => {
    handleNomeChange(s);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleFileRef = useRef(handleFile);
  handleFileRef.current = handleFile;

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Aceitar paste apenas no primeiro passo e se não estiver processando
      if (step !== 1 || analisandoFoto) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileRef.current(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste as EventListener);
    return () => window.removeEventListener("paste", handlePaste as EventListener);
  }, [step, analisandoFoto]);

  async function handleFile(file?: File) {
    if (!file) return;

    // Eagerly set preview so the user sees the photo immediately
    if (fotoPreviewUrl) URL.revokeObjectURL(fotoPreviewUrl);
    setFotoFile(file);
    setFotoPreviewUrl(URL.createObjectURL(file));

    setAnalisandoFoto(true);
    try {
      const imagemBase64 = await toBase64(file);
      const analise = await registroPrecoService.analisar(imagemBase64);

      const nomeIdentificado = analise.produtoNome.trim();
      handleNomeChange(nomeIdentificado); // Isso já vai tentar preencher o cômodo
      setMarca(analise.marca ?? "");
      setLoja(analise.nomeMercado ?? "");

      if (analise.preco && analise.preco > 0) {
        setPrecoNumerico(analise.preco);
        setStep(3); // Pula direto para a confirmação
      } else {
        setQueryBusca(nomeIdentificado);
        setStep(2); // Vai para a pesquisa online
      }
    } catch (err) {
      console.error("Erro na análise da foto:", err);
      toast.error("Não consegui ler a foto. Tente preencher manualmente.");
    } finally {
      setAnalisandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  const dupQuery = useQuery({
    queryKey: ["duplicata", nome, categoriaId],
    queryFn: () => groqService.detectarDuplicata(nome, categoriaId),
    enabled: false,
  });

  const criar = useMutation({
    mutationFn: async () => {
      if (!categoriaId) throw new Error("Selecione um cômodo");
      const preco = precoNumerico;
      const total = preco * quantidade;

      if (dividir && divisaoPagamento) {
        const soma = divisaoPagamento.valorPessoa1 + divisaoPagamento.valorPessoa2;
        if (Math.abs(soma - total) > 0.01) {
          throw new Error(
            `A soma da divisão (${brl(soma)}) deve ser igual ao total (${brl(total)}).`,
          );
        }
      }

      return itensService.criar({
        nome: nome.trim(),
        categoriaId,
        quantidade,
        preco,
        loja: loja.trim() || undefined,
        linkProduto: escolhido?.link ?? undefined,
        fotoUrl: escolhido?.thumbnail ?? undefined,
        fotoFile: fotoFile ?? undefined,
        marca: marca.trim() || undefined,
        parcelas,
        pagamento,
        prioridade,
        origem,
        responsavelId: dividir ? null : responsavelId,
        divisaoPagamento: dividir ? divisaoPagamento : null,
      });
    },
    onMutate: async () => {
      onOpenChange(false);
      toast.success("Adicionando item ao cômodo...");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens-paginado"] });
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      reset();
    },
    onError: (e: Error) => {
      toast.error(e.message);
      onOpenChange(true);
    },
  });

  const extrairLink = useMutation({
    mutationFn: (url: string) => pesquisaPrecosService.extrairDeLink(url),
    onSuccess: (r) => {
      setEscolhido(r);
      setPrecoNumerico(r.preco);
      setMarca(r.marca ?? "");
      setLoja(r.loja ?? "");
      setNome(r.titulo);

      // Tenta achar categoria pelo nome retornado
      const lower = r.titulo.toLowerCase();
      const cat = categorias.find((c) => lower.includes(c.nome.toLowerCase()));
      if (cat) setCategoriaId(cat.id);
      else if (!categoriaId) setCategoriaId(categorias[0]?.id);

      setStep(3);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Erro ao extrair dados do link");
    },
  });

  const avancarDoNome = async () => {
    const nomeTrim = nome.trim();
    if (!nomeTrim) return toast.error("Informe o nome ou cole um link");

    if (nomeTrim.startsWith("http://") || nomeTrim.startsWith("https://")) {
      extrairLink.mutate(nomeTrim);
      return;
    }

    if (!categoriaId) return toast.error("Selecione um cômodo");
    // checa duplicata (não bloqueia se falhar)
    try {
      const res = await dupQuery.refetch();
      if (res.data?.duplicata) {
        toast.warning(`Parece que já existe: ${res.data.itemSimilar ?? "item similar"}`);
      }
    } catch {
      /* ignore */
    }
    setQueryBusca(nome);
    setStep(2);
  };

  const stepper = (n: number, label: string) => (
    <div className={cn("flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2", step === n ? "opacity-100" : step > n ? "opacity-100" : "opacity-40")}>
      <span
        className={cn(
          "h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors",
          step === n
            ? "border-primary bg-primary text-primary-foreground"
            : step > n
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted-foreground/30 bg-transparent text-muted-foreground",
        )}
      >
        {step > n ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      <span className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider", step === n ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90dvh] overflow-hidden flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-md">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b bg-card">
          <DialogTitle className="font-display text-xl sm:text-2xl flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <Sparkles className="h-5 w-5" />
            </div>
            Adicionar Novo Item
          </DialogTitle>
          <div className="flex items-center w-full px-1">
            {stepper(1, "Identificação")}
            <div className="h-0.5 flex-1 mx-2 sm:mx-4 bg-muted rounded-full overflow-hidden">
               <div className={cn("h-full bg-primary transition-all duration-500", step > 1 ? "w-full" : "w-0")} />
            </div>
            {stepper(2, "Busca")}
            <div className="h-0.5 flex-1 mx-2 sm:mx-4 bg-muted rounded-full overflow-hidden">
               <div className={cn("h-full bg-primary transition-all duration-500", step > 2 ? "w-full" : "w-0")} />
            </div>
            {stepper(3, "Detalhes")}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 sm:px-6">
          <div
            className={cn(
              "space-y-6 py-4 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              step === 1 ? "block" : "hidden",
            )}
          >
            <div className="space-y-3 pb-4 border-b">
              <Label>Identificar utilizando foto</Label>
              <div className="flex flex-col gap-2 w-full group/upload">
                <input
                  ref={cameraInputRef}
                  className="hidden"
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  capture="environment"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {fotoPreviewUrl ? (
                  <div
                    className={cn(
                      "relative h-40 w-full rounded-[var(--radius-lg)] overflow-hidden border bg-background/50 transition-all",
                      !analisandoFoto &&
                        !extrairLink.isPending &&
                        "cursor-pointer hover:border-primary/50",
                    )}
                    onClick={() =>
                      !analisandoFoto && !extrairLink.isPending && fileInputRef.current?.click()
                    }
                  >
                    <img
                      src={fotoPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover drop-shadow-md"
                    />

                    {analisandoFoto ? (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                        <span className="text-xs font-medium text-primary">Analisando...</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Upload className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">Trocar foto na galeria</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={analisandoFoto || extrairLink.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className="w-full h-28 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-border/60 bg-background/50 hover:bg-accent hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="h-7 w-7 text-primary/70" />
                    <span className="text-sm font-medium">Galeria ou arraste aqui</span>
                  </button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full rounded-[var(--radius-lg)] transition-all",
                    !fotoPreviewUrl
                      ? "h-12 border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:text-primary"
                      : "h-10 text-muted-foreground",
                  )}
                  disabled={analisandoFoto || extrairLink.isPending}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className={cn("mr-2", !fotoPreviewUrl ? "h-5 w-5" : "h-4 w-4")} />
                  {!fotoPreviewUrl ? "Tirar foto com a câmera" : "Tirar nova foto com a câmera"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ou preencha manualmente</Label>
              <div className="relative" ref={suggestRef}>
                <Input
                  autoFocus
                  value={nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  onFocus={() =>
                    nome.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setShowSuggestions(false);
                    if (e.key === "Enter" && !showSuggestions) avancarDoNome();
                  }}
                  placeholder="Ex.: Geladeira ou link da loja..."
                  autoComplete="off"
                  disabled={extrairLink.isPending}
                />
                {extrairLink.isPending && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 rounded-[var(--radius-lg)] border bg-popover shadow-lg overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(s);
                        }}
                      >
                        <span className="text-primary text-xs">↗</span>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cômodo</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => {
                      const Icon = iconFor(c.icon);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {c.nome}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {dupQuery.data?.duplicata && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  Parece que você já tem <b>{dupQuery.data.itemSimilar}</b> neste cômodo. Confirme
                  se é mesmo um novo item.
                </div>
              </div>
            )}
          </div>

          {step === 2 && (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-background/50 rounded-[var(--radius-lg)] border">
                <div className="p-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <PainelPesquisaPrecos
                    initialQuery={queryBusca}
                    onEscolher={(r) => {
                      setEscolhido(r);
                      setPrecoNumerico(r.preco);
                      setMarca(r.marca ?? "");
                      setLoja(r.loja ?? "");
                      setNome(r.titulo);
                      setStep(3);
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 shrink-0">
                <div className="rounded-[var(--radius-lg)] border bg-card p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
                    <Label className="text-base font-semibold">Preço manual</Label>
                    <p className="text-xs text-muted-foreground">
                      Não encontrou online? Digite o valor.
                    </p>
                  </div>
                  <div className="flex w-full sm:w-auto gap-2 items-center">
                    <CurrencyInput
                      className="w-full sm:w-32 text-center text-base font-display h-9 rounded-lg"
                      value={precoNumerico}
                      onValueChange={(v) => {
                        setPrecoNumerico(v);
                        setEscolhido(null);
                      }}
                      placeholder="R$ 0,00"
                    />
                    <Button
                      type="button"
                      className="h-9 px-4 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all shrink-0 text-sm"
                      onClick={() => {
                        setEscolhido(null);
                        setStep(3);
                      }}
                    >
                      Avançar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-4 space-y-5 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              {/* Bloco 1: Identidade Básica */}
              <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-4 sm:gap-6">
                
                {/* Foto */}
                <div className="flex flex-col gap-2">
                  <div className="relative w-full aspect-square mx-auto md:mx-0 rounded-[var(--radius-lg)] overflow-hidden border bg-background/50 group shrink-0">
                    {fotoPreviewUrl || escolhido?.thumbnail ? (
                      <>
                        <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-125" style={{ backgroundImage: `url(${fotoPreviewUrl ?? escolhido!.thumbnail})` }} />
                        <img src={fotoPreviewUrl ?? escolhido!.thumbnail} alt="" className="relative h-full w-full object-contain p-2" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                        <Camera className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-[10px] uppercase font-medium">Sem foto</span>
                      </div>
                    )}
                    
                    {/* Ações da foto no hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                       <button type="button" onClick={() => itemFotoInputRef.current?.click()} className="text-white text-xs flex items-center gap-1 hover:text-primary transition-colors">
                         <Upload className="w-4 h-4" /> Trocar
                       </button>
                       {fotoPreviewUrl && (
                         <button type="button" onClick={() => { URL.revokeObjectURL(fotoPreviewUrl); setFotoPreviewUrl(null); setFotoFile(null); if (itemFotoInputRef.current) itemFotoInputRef.current.value = ""; }} className="text-destructive text-xs flex items-center gap-1 hover:text-red-400 transition-colors">
                           <Trash2 className="w-4 h-4" /> Remover
                         </button>
                       )}
                    </div>
                  </div>
                  <input ref={itemFotoInputRef} type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (fotoPreviewUrl) URL.revokeObjectURL(fotoPreviewUrl); setFotoFile(file); setFotoPreviewUrl(URL.createObjectURL(file)); }} />
                </div>

                {/* Nome e Preço */}
                <div className="flex flex-col gap-3">
                  <div className="relative group/title">
                    <textarea value={nome} onChange={(e) => setNome(e.target.value)} rows={2} className="font-display text-xl sm:text-2xl font-bold py-2 px-3 border border-transparent hover:bg-muted/30 focus-visible:bg-muted/50 focus-visible:border-primary/50 transition-all w-full pr-8 resize-none rounded-[var(--radius-lg)] outline-none" placeholder="Nome do produto" />
                    <Pencil className="h-4 w-4 absolute right-3 top-3 text-muted-foreground opacity-0 group-hover/title:opacity-50 transition-opacity pointer-events-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 px-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Preço Unitário</Label>
                      <div className="relative group/price inline-block max-w-full">
                        <CurrencyInput value={precoNumerico} onValueChange={setPrecoNumerico} className="font-display text-2xl font-semibold text-primary py-1 px-3 border border-transparent hover:bg-muted/30 focus-visible:bg-muted/50 focus-visible:border-primary/50 transition-all text-left w-full sm:w-44 rounded-lg outline-none" />
                        <Pencil className="h-3 w-3 absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover/price:opacity-50 transition-opacity pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Quantidade</Label>
                      <Input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-20 text-lg font-semibold h-10 border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                  </div>
                  
                  <div className="px-3 flex items-center gap-2 mt-1">
                     <span className="text-sm font-medium text-muted-foreground">Custo Total:</span>
                     <span className="text-sm font-bold text-foreground">{brl(precoNumerico * quantidade)}</span>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Classificação */}
              <div className="rounded-[var(--radius-lg)] border bg-muted/10 p-4 sm:p-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 opacity-70" /> Cômodo</Label>
                  <Select value={categoriaId} onValueChange={setCategoriaId}>
                    <SelectTrigger className="h-9 bg-card"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 opacity-70" /> Marca</Label>
                  <Input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Opcional" className="h-9 bg-card" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5"><Store className="w-3.5 h-3.5 opacity-70" /> Loja</Label>
                  <Input value={loja} onChange={(e) => setLoja(e.target.value)} placeholder="Opcional" className="h-9 bg-card" />
                </div>
              </div>

              {/* Bloco 3: Financeiro e Planejamento */}
              <div className="rounded-[var(--radius-lg)] border bg-card p-4 sm:p-5 space-y-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 opacity-70" /> Origem</Label>
                    <Select value={origem} onValueChange={(v) => { setOrigem(v as "comprado" | "ganho"); if(v==="ganho") setParcelas(1); }}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprado">Compra planejada</SelectItem>
                        <SelectItem value="ganho">Presente / Ganho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {origem !== "ganho" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 opacity-70" /> Pagamento</Label>
                      <Select value={pagamento} onValueChange={(v) => { setPagamento(v as "normal" | "vr"); if(v==="vr") setParcelas(1); }}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Dinheiro / Cartão</SelectItem>
                          <SelectItem value="vr">VR / VA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 opacity-70" /> Prioridade</Label>
                    <Select value={prioridade} onValueChange={setPrioridade}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta (Urgente)</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa (Pode esperar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {origem !== "ganho" && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-medium flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 opacity-70" /> Parcelamento</Label>
                        {parcelas > 1 && <span className="text-[10px] text-muted-foreground font-medium">{brl((precoNumerico*quantidade) / parcelas)}/mês</span>}
                      </div>
                      <Select value={String(parcelas)} onValueChange={(v) => setParcelas(Number(v))} disabled={pagamento === "vr"}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(p => (
                            <SelectItem key={p} value={String(p)}>
                              {p === 1 ? "À vista" : `${p}x sem juros`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {isCasal && origem !== "ganho" && (
                  <div className="pt-4 border-t border-dashed">
                    <Label className="text-sm font-semibold mb-3 block">Responsável pelo pagamento</Label>
                    <Select
                      value={dividir ? "dividir" : responsavelId === 1 ? "1" : responsavelId === 2 ? "2" : "conjunto"}
                      onValueChange={(v) => {
                        if (v === "dividir") {
                          setDividir(true); setResponsavelId(null);
                          const total = precoNumerico * quantidade;
                          setDivisaoPagamento({ valorPessoa1: total/2, valorPessoa2: total/2 });
                        } else if (v === "conjunto") {
                          setDividir(false); setResponsavelId(null); setDivisaoPagamento(null);
                        } else {
                          setDividir(false); setResponsavelId(Number(v) as 1 | 2); setDivisaoPagamento(null);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-muted/40 h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conjunto">Conta Conjunta (Ambos pagam)</SelectItem>
                        <SelectItem value="1">{p1} paga 100%</SelectItem>
                        <SelectItem value="2">{p2} paga 100%</SelectItem>
                        <SelectItem value="dividir">Dividir valores específicos...</SelectItem>
                      </SelectContent>
                    </Select>

                    {dividir && divisaoPagamento && (
                      <div className="mt-3 p-4 rounded-[var(--radius-lg)] bg-accent/30 border space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs">{p1}</Label>
                            <CurrencyInput className="h-9 text-sm bg-background" value={divisaoPagamento.valorPessoa1} onValueChange={(v) => setDivisaoPagamento({ ...divisaoPagamento, valorPessoa1: v })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">{p2}</Label>
                            <CurrencyInput className="h-9 text-sm bg-background" value={divisaoPagamento.valorPessoa2} onValueChange={(v) => setDivisaoPagamento({ ...divisaoPagamento, valorPessoa2: v })} />
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-between items-center gap-2">
                           <div className="text-xs font-medium">
                              Soma: <span className={Math.abs((divisaoPagamento.valorPessoa1 + divisaoPagamento.valorPessoa2) - (precoNumerico * quantidade)) > 0.01 ? "text-destructive" : "text-emerald-500"}>
                                {brl(divisaoPagamento.valorPessoa1 + divisaoPagamento.valorPessoa2)}
                              </span> / {brl(precoNumerico * quantidade)}
                           </div>
                           <div className="flex gap-1.5">
                             <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px] bg-background" onClick={() => setDivisaoPagamento({ valorPessoa1: precoNumerico*quantidade, valorPessoa2: 0 })}>100/0</Button>
                             <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px] bg-background" onClick={() => setDivisaoPagamento({ valorPessoa1: (precoNumerico*quantidade)/2, valorPessoa2: (precoNumerico*quantidade)/2 })}>50/50</Button>
                             <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px] bg-background" onClick={() => setDivisaoPagamento({ valorPessoa1: 0, valorPessoa2: precoNumerico*quantidade })}>0/100</Button>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 sm:p-6 border-t bg-muted/10 shrink-0">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => (step > 1 ? setStep((s) => (s - 1) as Step) : onOpenChange(false))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step > 1 ? "Voltar" : "Cancelar"}
          </Button>

          {step === 1 && (
            <Button
              className="bg-primary hover:bg-primary/90 min-w-[120px]"
              onClick={avancarDoNome}
              disabled={dupQuery.isFetching || extrairLink.isPending || analisandoFoto}
            >
              {dupQuery.isFetching || extrairLink.isPending || analisandoFoto ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {extrairLink.isPending
                ? "Extraindo..."
                : analisandoFoto
                  ? "Analisando..."
                  : "Avançar"}
              {!(dupQuery.isFetching || extrairLink.isPending || analisandoFoto) && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          )}
          {step === 2 && (
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setStep(3)}>
              Continuar <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {step === 3 && (
            <Button
              className="bg-primary hover:bg-primary/90 min-w-[140px]"
              onClick={() => {
                if (!categoriaId) {
                  return toast.error("Selecione um cômodo antes de adicionar.");
                }
                if (dividir && divisaoPagamento) {
                  const total = precoNumerico * quantidade;
                  const soma = divisaoPagamento.valorPessoa1 + divisaoPagamento.valorPessoa2;
                  if (Math.abs(soma - total) > 0.01) {
                    return toast.error(`A soma da divisão deve ser igual ao total (${brl(total)}).`);
                  }
                }
                criar.mutate();
              }}
              disabled={criar.isPending}
            >
              {criar.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {criar.isPending ? "Salvando..." : "Concluir Cadastro"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
