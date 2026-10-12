import { valorParcela } from "@/lib/parcelas";
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
  ScanBarcode,
  Type,
  LayoutGrid,
  Calendar,
} from "lucide-react";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import type { ProdutoBarcodeInfo } from "@/services/barcode";
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
import { brl, formatDate } from "@/lib/formatters";
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
  const [comprado, setComprado] = useState(false);
  const [dataCompra, setDataCompra] = useState<string | null>(null);
  const [parcelas, setParcelas] = useState(1);
  const [jurosMensal, setJurosMensal] = useState(0);
  const [jurosTexto, setJurosTexto] = useState("");
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
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleBarcodeDetectado = (produto: ProdutoBarcodeInfo) => {
    handleNomeChange(produto.nome);
    if (produto.marca) setMarca(produto.marca);
    if (produto.categoriaSugerida) {
      const cat = categorias.find((c) =>
        c.nome.toLowerCase().includes(produto.categoriaSugerida!.toLowerCase()),
      );
      if (cat) setCategoriaId(cat.id);
    }
    setQueryBusca(produto.nome);
    setStep(2);
  };

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
    setJurosMensal(0);
    setJurosTexto("");
    setComprado(false);
    setDataCompra(null);
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
        comprado,
        dataCompra: dataCompra ? new Date(dataCompra + "T12:00:00Z").toISOString() : undefined,
        parcelas,
        jurosMensal: parcelas > 1 ? jurosMensal : 0,
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
      qc.invalidateQueries({ queryKey: ["categorias"] });
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
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2",
        step === n ? "opacity-100" : step > n ? "opacity-100" : "opacity-40",
      )}
    >
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
      <span
        className={cn(
          "text-[10px] sm:text-xs font-semibold uppercase tracking-wider",
          step === n ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="w-[96vw] max-w-5xl xl:max-w-6xl max-h-[92dvh] overflow-hidden flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-md card-sticker">
          <DialogHeader className="p-4 sm:px-6 sm:py-4 pb-3 border-b bg-card shrink-0">
            <DialogTitle className="font-display text-xl sm:text-2xl flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Adicionar Novo Item</span>
            </DialogTitle>
            <div className="flex items-center w-full px-1">
              {stepper(1, "Identificação")}
              <div className="h-0.5 flex-1 mx-2 sm:mx-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-primary transition-all duration-500",
                    step > 1 ? "w-full" : "w-0",
                  )}
                />
              </div>
              {stepper(2, "Busca")}
              <div className="h-0.5 flex-1 mx-2 sm:mx-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-primary transition-all duration-500",
                    step > 2 ? "w-full" : "w-0",
                  )}
                />
              </div>
              {stepper(3, "Detalhes")}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 sm:px-6">
            <div
              className={cn(
                "py-4 flex-1 min-h-0 overflow-y-auto lg:overflow-visible flex flex-col justify-center",
                step === 1 ? "block" : "hidden",
              )}
            >
              <div className="lg:grid lg:grid-cols-12 lg:gap-6 space-y-4 lg:space-y-0 items-start">
                {/* Coluna Esquerda: Foto / Câmera / Barcode */}
                <div className="lg:col-span-5 rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-primary" /> Foto ou Barcode
                    </Label>
                    {fotoPreviewUrl && !analisandoFoto && !extrairLink.isPending && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-destructive hover:bg-destructive/10 px-2"
                        onClick={() => {
                          URL.revokeObjectURL(fotoPreviewUrl);
                          setFotoPreviewUrl(null);
                          setFotoFile(null);
                        }}
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5 w-full group/upload">
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
                          "relative h-44 w-full rounded-[var(--radius-lg)] overflow-hidden border-2 border-border/70 bg-background/50 transition-all",
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
                          className="w-full h-full object-contain p-2 drop-shadow-md"
                        />

                        {analisandoFoto ? (
                          <div className="absolute inset-0 bg-background/85 flex flex-col items-center justify-center backdrop-blur-sm">
                            <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
                            <span className="text-xs font-bold text-primary">Analisando imagem com IA...</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs">
                            <Upload className="h-6 w-6 mb-1" />
                            <span className="text-xs font-semibold">Trocar foto</span>
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
                        className="w-full h-40 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-foreground block">Galeria ou arraste a foto</span>
                          <span className="text-[11px] text-muted-foreground">A IA detecta o item automaticamente</span>
                        </div>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 text-xs font-semibold rounded-[var(--radius-md)] border-border/80 hover:bg-muted"
                        disabled={analisandoFoto || extrairLink.isPending}
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="mr-1.5 h-3.5 w-3.5 text-primary" />
                        Tirar Foto
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 text-xs font-semibold rounded-[var(--radius-md)] border-border/80 hover:bg-muted text-primary font-bold"
                        disabled={analisandoFoto || extrairLink.isPending}
                        onClick={() => setScannerOpen(true)}
                      >
                        <ScanBarcode className="mr-1.5 h-3.5 w-3.5" />
                        Ler Código EAN
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Dados Manuais e Cômodo */}
                <div className="lg:col-span-7 rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-primary" /> Nome do Produto ou Link da Loja
                    </Label>
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
                        className="h-11 text-base font-bold bg-background"
                        placeholder="Ex.: Geladeira Frost Free ou link de loja online..."
                        autoComplete="off"
                        disabled={extrairLink.isPending}
                      />
                      {extrairLink.isPending && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 rounded-[var(--radius-lg)] border-2 bg-popover shadow-lg overflow-hidden">
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 font-medium"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectSuggestion(s);
                              }}
                            >
                              <span className="text-primary text-xs font-bold">↗</span>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <LayoutGrid className="w-3.5 h-3.5 text-primary" /> Cômodo
                      </Label>
                      <Select value={categoriaId} onValueChange={setCategoriaId}>
                        <SelectTrigger className="bg-background h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((c) => {
                            const Icon = iconFor(c.icon);
                            return (
                              <SelectItem key={c.id} value={c.id}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-primary" />
                                  {c.nome}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-primary" /> Quantidade
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={quantidade}
                        onChange={(e) => setQuantidade(Number(e.target.value))}
                        className="h-10 text-base font-bold bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {dupQuery.data?.duplicata && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        Já existe um item similar neste cômodo: <b>{dupQuery.data.itemSimilar}</b>. Confirme se é mesmo um novo item.
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {step === 2 && (
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 gap-3 py-2">
                <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-background/50 rounded-[var(--radius-lg)] border-2 border-border/80 p-3 sm:p-4">
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
                <div className="shrink-0">
                  <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-3 sm:p-3.5 flex flex-col sm:flex-row items-center gap-3 justify-between shadow-sm">
                    <div className="space-y-0.5 text-center sm:text-left w-full sm:w-auto">
                      <Label className="text-sm font-bold">Preço manual</Label>
                      <p className="text-xs text-muted-foreground">
                        Não encontrou online ou prefere definir seu valor?
                      </p>
                    </div>
                    <div className="flex w-full sm:w-auto gap-2 items-center">
                      <CurrencyInput
                        className="w-full sm:w-36 text-center text-base font-bold bg-background h-9 rounded-lg"
                        value={precoNumerico}
                        onValueChange={(v) => {
                          setPrecoNumerico(v);
                          setEscolhido(null);
                        }}
                        placeholder="R$ 0,00"
                      />
                      <Button
                        type="button"
                        className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-bold shadow-sm hover:shadow-md transition-all shrink-0 text-xs sm:text-sm"
                        onClick={() => {
                          setEscolhido(null);
                          setStep(3);
                        }}
                      >
                        Avançar com este preço
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-4 flex-1 min-h-0 overflow-y-auto lg:overflow-visible flex flex-col justify-center">
                <div className="lg:grid lg:grid-cols-12 lg:gap-6 space-y-4 lg:space-y-0 items-start">
                  {/* Coluna Esquerda: Mídia, Classificação e Custo Total */}
                  <div className="lg:col-span-5 space-y-3.5">
                    {/* Foto */}
                    <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-3.5 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-primary" /> Foto do Item
                        </Label>
                        {fotoPreviewUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              URL.revokeObjectURL(fotoPreviewUrl);
                              setFotoPreviewUrl(null);
                              setFotoFile(null);
                              if (itemFotoInputRef.current) itemFotoInputRef.current.value = "";
                            }}
                            className="text-destructive text-xs hover:text-red-400 font-semibold"
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-border/70 bg-background/50 group shrink-0">
                        {fotoPreviewUrl || escolhido?.thumbnail ? (
                          <>
                            <div
                              className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-125"
                              style={{
                                backgroundImage: `url(${fotoPreviewUrl ?? escolhido!.thumbnail})`,
                              }}
                            />
                            <img
                              src={fotoPreviewUrl ?? escolhido!.thumbnail}
                              alt=""
                              className="relative h-full w-full object-contain p-2"
                            />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                            <Camera className="h-7 w-7 mb-1 opacity-50" />
                            <span className="text-[10px] uppercase font-medium">Sem foto</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={() => itemFotoInputRef.current?.click()}
                            className="text-white text-xs flex items-center gap-1 hover:text-primary transition-colors font-semibold"
                          >
                            <Upload className="w-4 h-4" /> Trocar Foto
                          </button>
                        </div>
                      </div>

                      <input
                        ref={itemFotoInputRef}
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (fotoPreviewUrl) URL.revokeObjectURL(fotoPreviewUrl);
                          setFotoFile(file);
                          setFotoPreviewUrl(URL.createObjectURL(file));
                        }}
                      />
                    </div>

                    {/* Classificação */}
                    <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-3.5 space-y-3 shadow-sm">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <LayoutGrid className="w-3.5 h-3.5 text-primary" /> Classificação
                      </Label>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Cômodo</Label>
                        <Select value={categoriaId} onValueChange={setCategoriaId}>
                          <SelectTrigger className="h-9 bg-background text-xs sm:text-sm">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Marca</Label>
                          <Input
                            value={marca}
                            onChange={(e) => setMarca(e.target.value)}
                            placeholder="Opcional"
                            className="h-9 bg-background text-xs sm:text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Loja</Label>
                          <Input
                            value={loja}
                            onChange={(e) => setLoja(e.target.value)}
                            placeholder="Opcional"
                            className="h-9 bg-background text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resumo de Custo */}
                    <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-3.5 flex items-center justify-between shadow-sm">
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Custo Estimado</span>
                        <span className="text-xs text-muted-foreground">{quantidade} un. × {brl(precoNumerico)}</span>
                      </div>
                      <span className="font-display font-bold text-lg text-primary">
                        {brl(precoNumerico * quantidade)}
                      </span>
                    </div>
                  </div>

                  {/* Coluna Direita: Nome, Preços, Financeiro e Divisão */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {/* Nome e Preços */}
                    <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 space-y-3 shadow-sm">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Nome do Produto
                        </Label>
                        <Input
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="font-display text-base font-bold h-10 bg-background"
                          placeholder="Nome do produto"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Preço Unitário
                          </Label>
                          <CurrencyInput
                            value={precoNumerico}
                            onValueChange={setPrecoNumerico}
                            className="h-10 text-base font-bold bg-background text-primary"
                            placeholder="R$ 0,00"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Quantidade
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={quantidade}
                            onChange={(e) => setQuantidade(Number(e.target.value))}
                            className="h-10 text-base font-bold bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financeiro e Planejamento */}
                    <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 space-y-3.5 shadow-sm">
                      {/* Card de Status & Data (Comprado vs Previsão) */}
                      <div className="bg-muted/20 p-3 sm:p-3.5 rounded-lg border space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`p-1.5 rounded-md shrink-0 transition-colors ${
                                comprado
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold leading-tight">
                                {comprado
                                  ? origem === "ganho"
                                    ? "Item Ganhado / Recebido"
                                    : "Item Comprado / Adquirido"
                                  : "Pendente na Lista"}
                              </h4>
                              <p className="text-[11px] text-muted-foreground leading-tight">
                                {comprado
                                  ? dataCompra
                                    ? origem === "ganho"
                                      ? `Ganhado em ${formatDate(dataCompra)}`
                                      : `Comprado em ${formatDate(dataCompra)}`
                                    : origem === "ganho"
                                      ? "Já recebido de presente"
                                      : "Já adquirido pelo casal"
                                  : dataCompra
                                    ? `Previsão para ${formatDate(dataCompra)}`
                                    : origem === "ganho"
                                      ? "Ainda não recebido"
                                      : "Ainda não comprado"}
                              </p>
                            </div>
                          </div>

                          <Switch
                            id="wizard-switch-comprado"
                            checked={comprado}
                            onCheckedChange={(c) => {
                              setComprado(c);
                              if (c && !dataCompra) setDataCompra(new Date().toLocaleDateString("en-CA"));
                            }}
                          />
                        </div>

                        {/* Campo unificado de data: Data da Compra ou Data de Previsão */}
                        <div className="pt-2.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <Label
                              htmlFor="wizard-data-compra"
                              className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-foreground"
                            >
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {comprado
                                ? origem === "ganho"
                                  ? "Data que Ganhou"
                                  : "Data da Compra"
                                : "Data de Previsão"}
                            </Label>
                            <p className="text-[10px] text-muted-foreground">
                              {comprado
                                ? origem === "ganho"
                                  ? "Data em que o presente foi recebido"
                                  : "Data em que o item foi adquirido"
                                : "Previsão estimada para compra (opcional)"}
                            </p>
                          </div>
                          <Input
                            id="wizard-data-compra"
                            type="date"
                            value={dataCompra ?? ""}
                            onChange={(e) => setDataCompra(e.target.value || null)}
                            className="h-8 text-xs bg-background w-full sm:w-44 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground font-medium">Origem</Label>
                          <Select
                            value={origem}
                            onValueChange={(v) => {
                              setOrigem(v as "comprado" | "ganho");
                              if (v === "ganho") setParcelas(1);
                            }}
                          >
                            <SelectTrigger className="h-9 bg-background text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comprado">Compra planejada</SelectItem>
                              <SelectItem value="ganho">Presente / Ganho</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground font-medium">Prioridade</Label>
                          <Select value={prioridade} onValueChange={setPrioridade}>
                            <SelectTrigger className="h-9 bg-background text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alta">Alta (Urgente)</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="baixa">Baixa (Pode esperar)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {origem !== "ganho" && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground font-medium">Pagamento</Label>
                            <Select
                              value={pagamento}
                              onValueChange={(v) => {
                                setPagamento(v as "normal" | "vr");
                                if (v === "vr") setParcelas(1);
                              }}
                            >
                              <SelectTrigger className="h-9 bg-background text-xs sm:text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Dinheiro / Cartão</SelectItem>
                                <SelectItem value="vr">VR / VA</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {origem !== "ganho" && (
                          <div className="space-y-2 sm:col-span-3">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs text-muted-foreground font-medium">Parcelamento</Label>
                              {parcelas > 1 && (
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  Total:{" "}
                                  <strong className="text-foreground">
                                    {brl(valorParcela(precoNumerico * quantidade, parcelas, jurosMensal) * parcelas)}
                                  </strong>
                                </span>
                              )}
                            </div>

                            <Select
                              value={String(parcelas)}
                              onValueChange={(v) => {
                                const p = Number(v);
                                setParcelas(p);
                                if (p === 1) {
                                  setJurosMensal(0);
                                  setJurosTexto("");
                                }
                              }}
                              disabled={pagamento === "vr"}
                            >
                              <SelectTrigger className="h-9 bg-background text-xs sm:text-sm w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((p) => {
                                  const total = precoNumerico * quantidade;
                                  const vParc = valorParcela(total, p, jurosMensal);
                                  return (
                                    <SelectItem key={p} value={String(p)}>
                                      {p === 1
                                        ? `À vista (1x) · ${brl(total)}`
                                        : `${p}x de ${brl(vParc)}${jurosMensal > 0 ? " (com juros)" : " sem juros"}`}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>

                            {/* Campo pequeno para juros embaixo do parcelamento quando mais de 1 parcela */}
                            {parcelas > 1 && (
                              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/60">
                                <div className="flex items-center gap-2">
                                  <Label
                                    htmlFor="wizard-juros"
                                    className="text-xs text-muted-foreground font-medium shrink-0 cursor-pointer"
                                  >
                                    Taxa de juros:
                                  </Label>
                                  <div className="relative w-28">
                                    <Input
                                      id="wizard-juros"
                                      type="text"
                                      inputMode="decimal"
                                      value={jurosTexto}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return;
                                        setJurosTexto(raw);
                                        const parsed = parseFloat(raw.replace(",", "."));
                                        setJurosMensal(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                                      }}
                                      placeholder="0,00"
                                      title="Taxa de juros ao mês (% a.m.)"
                                      className="h-8 text-xs bg-background pr-10 font-medium"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                                      % a.m.
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[11px] font-medium text-right">
                                  {jurosMensal > 0 ? (
                                    <span className="text-amber-600 dark:text-amber-400">
                                      Parcela: <strong>{parcelas}x de {brl(valorParcela(precoNumerico * quantidade, parcelas, jurosMensal))}</strong>
                                      {" · "}
                                      Total: <strong>{brl(valorParcela(precoNumerico * quantidade, parcelas, jurosMensal) * parcelas)}</strong>
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                      Parcela: <strong>{parcelas}x de {brl((precoNumerico * quantidade) / parcelas)}</strong> (sem juros)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isCasal && origem !== "ganho" && (
                        <div className="pt-3 border-t border-dashed space-y-3">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                              <Label className="text-xs font-bold">Responsável Financeiro</Label>
                              <p className="text-[11px] text-muted-foreground">Quem pagará por este item?</p>
                            </div>
                            <Select
                              value={
                                dividir
                                  ? "dividir"
                                  : responsavelId === 1
                                    ? "1"
                                    : responsavelId === 2
                                      ? "2"
                                      : "conjunto"
                              }
                              onValueChange={(v) => {
                                if (v === "dividir") {
                                  setDividir(true);
                                  setResponsavelId(null);
                                  const total = precoNumerico * quantidade;
                                  setDivisaoPagamento({
                                    valorPessoa1: total / 2,
                                    valorPessoa2: total / 2,
                                  });
                                } else if (v === "conjunto") {
                                  setDividir(false);
                                  setResponsavelId(null);
                                  setDivisaoPagamento(null);
                                } else {
                                  setDividir(false);
                                  setResponsavelId(Number(v) as 1 | 2);
                                  setDivisaoPagamento(null);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full sm:w-[220px] h-9 bg-background text-xs sm:text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conjunto">Conta Conjunta (Ambos)</SelectItem>
                                <SelectItem value="1">{p1} paga 100%</SelectItem>
                                <SelectItem value="2">{p2} paga 100%</SelectItem>
                                <SelectItem value="dividir">Dividir valores específicos...</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {dividir && divisaoPagamento && (
                            <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">{p1}</Label>
                                  <CurrencyInput
                                    className="h-8 text-xs font-semibold bg-background"
                                    value={divisaoPagamento.valorPessoa1}
                                    onValueChange={(v) =>
                                      setDivisaoPagamento({ ...divisaoPagamento, valorPessoa1: v })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">{p2}</Label>
                                  <CurrencyInput
                                    className="h-8 text-xs font-semibold bg-background"
                                    value={divisaoPagamento.valorPessoa2}
                                    onValueChange={(v) =>
                                      setDivisaoPagamento({ ...divisaoPagamento, valorPessoa2: v })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex flex-wrap justify-between items-center gap-2">
                                <div className="text-xs font-medium">
                                  Soma:{" "}
                                  <span
                                    className={
                                      Math.abs(
                                        divisaoPagamento.valorPessoa1 +
                                          divisaoPagamento.valorPessoa2 -
                                          precoNumerico * quantidade,
                                      ) > 0.01
                                        ? "text-destructive font-bold"
                                        : "text-emerald-500 font-bold"
                                    }
                                  >
                                    {brl(divisaoPagamento.valorPessoa1 + divisaoPagamento.valorPessoa2)}
                                  </span>{" "}
                                  / {brl(precoNumerico * quantidade)}
                                </div>
                                <div className="flex gap-1.5">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] bg-background"
                                    onClick={() =>
                                      setDivisaoPagamento({
                                        valorPessoa1: precoNumerico * quantidade,
                                        valorPessoa2: 0,
                                      })
                                    }
                                  >
                                    100/0
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] bg-background"
                                    onClick={() =>
                                      setDivisaoPagamento({
                                        valorPessoa1: (precoNumerico * quantidade) / 2,
                                        valorPessoa2: (precoNumerico * quantidade) / 2,
                                      })
                                    }
                                  >
                                    50/50
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-[10px] bg-background"
                                    onClick={() =>
                                      setDivisaoPagamento({
                                        valorPessoa1: 0,
                                        valorPessoa2: precoNumerico * quantidade,
                                      })
                                    }
                                  >
                                    0/100
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
                {!(dupQuery.isFetching || extrairLink.isPending || analisandoFoto) && (
                  <ArrowRight className="h-4 w-4 ml-2" />
                )}
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
                      return toast.error(
                        `A soma da divisão deve ser igual ao total (${brl(total)}).`,
                      );
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

      <BarcodeScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onProdutoDetectado={handleBarcodeDetectado}
      />
    </>
  );
}
