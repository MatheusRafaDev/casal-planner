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

function getLocation(): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 60_000 },
    );
  });
}

function toBase64(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
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

      resolve(canvas.toDataURL("image/jpeg", 0.85));
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

  const handleFile = async (file?: File) => {
    if (!file) return;
    setAnalisandoFoto(true);
    try {
      const [imagemBase64, location] = await Promise.all([toBase64(file), getLocation()]);
      const analise = await registroPrecoService.analisar(imagemBase64, location.latitude, location.longitude);
      
      const nomeIdentificado = analise.produtoNome.trim();
      handleNomeChange(nomeIdentificado); // Isso já vai tentar preencher o cômodo
      setMarca(analise.marca ?? "");
      setLoja(analise.nomeMercado ?? "");
      
      // Store the image to be used as the item's photo
      if (fotoPreviewUrl) URL.revokeObjectURL(fotoPreviewUrl);
      setFotoFile(file);
      setFotoPreviewUrl(URL.createObjectURL(file));

      if (analise.preco && analise.preco > 0) {
        setPrecoNumerico(analise.preco);
        setStep(3); // Pula direto para a confirmação
      } else {
        setQueryBusca(nomeIdentificado);
        setStep(2); // Vai para a pesquisa online
      }
    } catch {
      toast.error("Não consegui ler a foto. Tente preencher manualmente.");
    } finally {
      setAnalisandoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const dupQuery = useQuery({
    queryKey: ["duplicata", nome, categoriaId],
    queryFn: () => groqService.detectarDuplicata(nome, categoriaId),
    enabled: false,
  });

  const criar = useMutation({
    mutationFn: async () => {
      if (!categoriaId) throw new Error("Selecione um cômodo");
      const preco = escolhido?.preco ?? precoNumerico;
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
      qc.invalidateQueries({ queryKey: ["resumo"] });
      reset();
    },
    onError: (e: Error) => {
      toast.error(e.message);
      onOpenChange(true);
    },
  });

  const avancarDoNome = async () => {
    if (!nome.trim()) return toast.error("Informe o nome");
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
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-6 w-6 rounded-full grid place-items-center text-xs font-medium",
          step === n
            ? "bg-primary text-primary-foreground"
            : step > n
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
        )}
      >
        {step > n ? <Check className="h-3 w-3" /> : n}
      </span>
      <span className={cn("text-xs", step === n ? "text-foreground" : "text-muted-foreground")}>
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85dvh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Novo item
          </DialogTitle>
          <div className="flex items-center gap-4 pt-2">
            {stepper(1, "Item")}
            <div className="h-px flex-1 bg-border" />
            {stepper(2, "Preço")}
            <div className="h-px flex-1 bg-border" />
            {stepper(3, "Confirmar")}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 pr-1">
          <div
            className={cn(
              "space-y-4 py-2 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              step === 1 ? "block" : "hidden",
            )}
          >
            <div className="space-y-3 pb-4 border-b">
              <Label>Identificar utilizando foto</Label>
              <div className="grid grid-cols-2 gap-3">
                <input ref={cameraInputRef} className="hidden" type="file" accept="image/jpeg, image/png, image/webp" capture="environment" onChange={(e) => handleFile(e.target.files?.[0])} />
                <input ref={fileInputRef} className="hidden" type="file" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleFile(e.target.files?.[0])} />
                <Button type="button" variant="outline" className="h-20 flex flex-col gap-2 bg-background/50 hover:bg-accent" disabled={analisandoFoto} onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="h-6 w-6 text-primary" />
                  Tirar foto
                </Button>
                <Button type="button" variant="outline" className="h-20 flex flex-col gap-2 bg-background/50 hover:bg-accent" disabled={analisandoFoto} onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-6 w-6 text-primary" />
                  Subir foto
                </Button>
              </div>
              {analisandoFoto && (
                <div className="flex items-center justify-center text-sm text-primary pt-2">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando imagem...
                </div>
              )}
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
                  placeholder="Ex.: Geladeira Frost Free 400L"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden">
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
              <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-background/50 rounded-xl border">
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
              <div className="border-t pt-3 mt-4 space-y-3 shrink-0 flex flex-col items-center">
                <Label className="text-center w-full">Ou informe o preço manualmente</Label>
                <div className="flex gap-2 items-center justify-center">
                  <CurrencyInput
                    className="w-32 text-center"
                    value={precoNumerico}
                    onValueChange={(v) => {
                      setPrecoNumerico(v);
                      setEscolhido(null);
                    }}
                    placeholder="R$ 0,00"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEscolhido(null);
                      setStep(3);
                    }}
                  >
                    Usar preço manual
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-2 space-y-4 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="rounded-xl border p-4 bg-gradient-warm">
                <div className="font-display text-lg font-semibold">{nome}</div>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground items-center">
                  <Select value={categoriaId} onValueChange={setCategoriaId}>
                    <SelectTrigger className="h-6 text-xs min-w-[160px] w-auto px-2 py-0">
                      <SelectValue placeholder="Selecione um cômodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {escolhido?.loja && <Badge variant="outline">{escolhido.loja}</Badge>}
                  {escolhido?.marca && <Badge variant="outline">{escolhido.marca}</Badge>}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Preço unitário</div>
                    <div className="font-display text-2xl font-semibold text-primary">
                      {brl(escolhido?.preco ?? precoNumerico)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-display text-xl font-semibold">
                      {brl((escolhido?.preco ?? precoNumerico) * quantidade)}
                    </div>
                  </div>
                </div>
                {/* Preview: imagem do item (upload manual ou thumbnail online) */}
                {(fotoPreviewUrl || escolhido?.thumbnail) && (
                  <div className="relative mt-4 w-full h-72 rounded-2xl overflow-hidden border bg-background/50">
                    {/* Fundo Desfocado Premium */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110" 
                      style={{ backgroundImage: `url(${fotoPreviewUrl ?? escolhido!.thumbnail})` }} 
                    />
                    {/* Imagem Principal */}
                    <img
                      src={fotoPreviewUrl ?? escolhido!.thumbnail}
                      alt=""
                      className="relative h-full w-full object-contain drop-shadow-xl"
                    />
                    {fotoPreviewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(fotoPreviewUrl);
                          setFotoPreviewUrl(null);
                          setFotoFile(null);
                          if (itemFotoInputRef.current) itemFotoInputRef.current.value = "";
                        }}
                        className="absolute top-1 right-1 rounded-full bg-black/60 text-white text-xs px-1.5 py-0.5 hover:bg-black/80 transition-colors"
                        title="Remover foto"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
                {/* Botão para adicionar foto do item (só aparece se não há thumbnail online) */}
                {!escolhido?.thumbnail && !fotoPreviewUrl && (
                  <button
                    type="button"
                    onClick={() => itemFotoInputRef.current?.click()}
                    className="mt-4 w-full rounded-lg border border-dashed border-border/60 py-3 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Adicionar foto do item
                  </button>
                )}
                {/* Se tem thumbnail mas quer substituir */}
                {escolhido?.thumbnail && !fotoPreviewUrl && (
                  <button
                    type="button"
                    onClick={() => itemFotoInputRef.current?.click()}
                    className="mt-2 w-full text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Substituir por foto própria
                  </button>
                )}
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

              <div className="grid gap-4 sm:grid-cols-3 mt-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    Quantidade
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    Marca
                  </Label>
                  <Input
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Ex.: Brastemp"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-muted-foreground" />
                    Loja
                  </Label>
                  <Input
                    value={loja}
                    onChange={(e) => setLoja(e.target.value)}
                    placeholder="Ex.: Fast Shop"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 mt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      Parcelas
                    </Label>
                    {parcelas > 1 && (
                      <span className="text-xs text-muted-foreground">
                        {brl((escolhido?.preco ?? precoNumerico) / parcelas)}/parcela
                      </span>
                    )}
                  </div>
                  <Select
                    value={String(parcelas)}
                    onValueChange={(v) => setParcelas(Number(v))}
                    disabled={pagamento === "vr" || origem === "ganho"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          {p === 1
                            ? "À vista (1x)"
                            : `${p}x • ${brl((escolhido?.preco ?? precoNumerico) / p)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    Prioridade
                  </Label>
                  <Select value={prioridade} onValueChange={(v) => setPrioridade(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-muted-foreground" />
                    Origem
                  </Label>
                  <Select value={origem} onValueChange={(v) => {
                    setOrigem(v as "comprado" | "ganho");
                    if (v === "ganho") setParcelas(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprado">Será comprado</SelectItem>
                      <SelectItem value="ganho">Ganho / Presente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    Pagamento
                  </Label>
                  <Select
                    value={pagamento}
                    onValueChange={(v) => {
                      setPagamento(v as "normal" | "vr");
                      if (v === "vr") setParcelas(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Dinheiro</SelectItem>
                      <SelectItem value="vr">VR / VA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isCasal && (
                  <div className="space-y-4 sm:col-span-3 border rounded-xl p-4 bg-card mt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Dividir pagamento entre o casal?</Label>
                        <p className="text-xs text-muted-foreground">
                          Especifique quanto cada um vai pagar.
                        </p>
                      </div>
                      <Switch
                        checked={dividir}
                        onCheckedChange={(checked) => {
                          setDividir(checked);
                          if (checked) {
                            const total = (escolhido?.preco ?? precoNumerico) * quantidade;
                            setDivisaoPagamento({
                              valorPessoa1: total / 2,
                              valorPessoa2: total / 2,
                            });
                          } else {
                            setDivisaoPagamento(null);
                          }
                        }}
                      />
                    </div>

                    {dividir && divisaoPagamento && (
                      <div className="pt-2">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>{p1}</Label>
                            <CurrencyInput
                              value={divisaoPagamento.valorPessoa1}
                              onValueChange={(v) =>
                                setDivisaoPagamento({ ...divisaoPagamento, valorPessoa1: v })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{p2}</Label>
                            <CurrencyInput
                              value={divisaoPagamento.valorPessoa2}
                              onValueChange={(v) =>
                                setDivisaoPagamento({ ...divisaoPagamento, valorPessoa2: v })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-xs text-muted-foreground">
                            Total:{" "}
                            {brl(divisaoPagamento.valorPessoa1 + divisaoPagamento.valorPessoa2)} /{" "}
                            {brl((escolhido?.preco ?? precoNumerico) * quantidade)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => {
                                const total = (escolhido?.preco ?? precoNumerico) * quantidade;
                                setDivisaoPagamento({ valorPessoa1: total, valorPessoa2: 0 });
                              }}
                            >
                              100/0
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => {
                                const total = (escolhido?.preco ?? precoNumerico) * quantidade;
                                setDivisaoPagamento({
                                  valorPessoa1: total / 2,
                                  valorPessoa2: total / 2,
                                });
                              }}
                            >
                              50/50
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2"
                              onClick={() => {
                                const total = (escolhido?.preco ?? precoNumerico) * quantidade;
                                setDivisaoPagamento({ valorPessoa1: 0, valorPessoa2: total });
                              }}
                            >
                              0/100
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!dividir && (
                      <div className="space-y-2 pt-2 border-t mt-4">
                        <Label>Ou defina um Responsável (quem compra tudo)</Label>
                        <Select
                          value={responsavelId ? String(responsavelId) : "none"}
                          onValueChange={(v) => {
                            if (v === "none") setResponsavelId(null);
                            else setResponsavelId(Number(v) as 1 | 2);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem responsável (juntos)</SelectItem>
                            <SelectItem value="1">{p1}</SelectItem>
                            <SelectItem value="2">{p2}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <Button
            variant="ghost"
            onClick={() => (step > 1 ? setStep((s) => (s - 1) as Step) : onOpenChange(false))}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {step > 1 ? "Voltar" : "Cancelar"}
          </Button>

          {step === 1 && (
            <Button onClick={avancarDoNome} disabled={dupQuery.isFetching}>
              {dupQuery.isFetching ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-1" />
              )}
              Buscar preços
            </Button>
          )}
          {step === 2 && (
            <Button variant="secondary" onClick={() => setStep(3)}>
              Pular <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 3 && (
            <Button
              onClick={() => {
                if (!categoriaId) {
                  return toast.error("Selecione um cômodo antes de adicionar.");
                }
                if (dividir && divisaoPagamento) {
                  const preco = escolhido?.preco ?? precoNumerico;
                  const total = preco * quantidade;
                  const soma = divisaoPagamento.valorPessoa1 + divisaoPagamento.valorPessoa2;
                  if (Math.abs(soma - total) > 0.01) {
                    return toast.error(
                      `A soma da divisão (${brl(soma)}) deve ser igual ao total (${brl(total)}).`,
                    );
                  }
                }
                criar.mutate();
              }}
              disabled={criar.isPending}
            >
              {criar.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Adicionar item
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
