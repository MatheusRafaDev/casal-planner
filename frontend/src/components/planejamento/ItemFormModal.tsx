import { valorParcela } from "@/lib/parcelas";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  Camera,
  Upload,
  X,
  Type,
  Tag,
  Store,
  CircleDollarSign,
  Hash,
  CreditCard,
  Wallet,
  Zap,
  Gift,
  LayoutGrid,
  Check,
  Pencil,
  Sparkles,
  Loader2,
  Barcode,
  Calendar,
} from "lucide-react";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { itensService, type ItemInputDTO } from "@/services/itens";
import type { Categoria, Item } from "@/services/types";
import { brl, formatDate } from "@/lib/formatters";
import { groqService } from "@/services/groq";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categorias: Categoria[];
  categoriaId: string;
  item?: Item | null;
  initial?: Partial<ItemInputDTO>;
}

const empty = (categoriaId: string): ItemInputDTO => ({
  nome: "",
  marca: "",
  preco: 0,
  quantidade: 1,
  categoriaId,
  comprado: false,
  pagamento: "normal",
  prioridade: "media",
  loja: "",
  linkProduto: "",
  fotoUrl: "",
  parcelas: 1,
  origem: "comprado",
});

export function ItemFormModal({
  open,
  onOpenChange,
  categorias,
  categoriaId,
  item,
  initial,
}: Props) {
  const qc = useQueryClient();
  const isEdit = !!item;
  const [form, setForm] = useState<ItemInputDTO>(empty(categoriaId));
  const [jurosTexto, setJurosTexto] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [dividir, setDividir] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeDetectado = (prod: {
    nome?: string;
    marca?: string;
    fotoUrl?: string;
    quantidade?: string;
  }) => {
    if (prod.nome) set("nome", prod.nome);
    if (prod.marca) set("marca", prod.marca);
    if (prod.fotoUrl && !form.fotoUrl && !form.fotoFile) {
      set("fotoUrl", prod.fotoUrl);
      setImageError(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          nome: item.nome,
          marca: item.marca ?? "",
          preco: item.preco,
          quantidade: item.quantidade,
          categoriaId: item.categoriaId,
          comprado: item.comprado,
          pagamento: item.pagamento,
          prioridade: item.prioridade ?? "media",
          loja: item.loja ?? "",
          linkProduto: item.linkProduto ?? "",
          fotoUrl: item.fotoUrl ?? "",
          parcelas: item.parcelas ?? 1,
          jurosMensal: item.jurosMensal ?? 0,
          origem: item.origem ?? "comprado",
          responsavelId: item.responsavelId ?? null,
          divisaoPagamento: item.divisaoPagamento ? { ...item.divisaoPagamento } : null,
          dataCompra: item.dataCompra ? item.dataCompra.split("T")[0] : null,
        });
        setJurosTexto(item.jurosMensal ? String(item.jurosMensal) : "");
        setDividir(!!item.divisaoPagamento);
        setShowLink(false);
      } else {
        setForm({ ...empty(categoriaId), ...initial });
        setJurosTexto("");
        setDividir(false);
        setShowLink(!!initial?.linkProduto);
      }
      setImageError(false);
    }
  }, [open, item, categoriaId, initial]);

  const [debouncedNome, setDebouncedNome] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedNome(form.nome);
    }, 600);
    return () => clearTimeout(t);
  }, [form.nome]);

  const dupQuery = useQuery({
    queryKey: ["duplicata", debouncedNome, form.categoriaId],
    queryFn: () => groqService.detectarDuplicata(debouncedNome, form.categoriaId),
    enabled: !isEdit && debouncedNome.trim().length >= 3 && !!form.categoriaId,
  });

  const mutation = useMutation({
    mutationFn: async (vars: { id?: string; dto: ItemInputDTO }) => {
      if (vars.id) return itensService.atualizar(vars.id, vars.dto);
      return itensService.criar(vars.dto);
    },
    onMutate: async (vars) => {
      onOpenChange(false);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["itens-paginado"] });
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success(vars.id ? "Item atualizado" : "Item adicionado");
    },
    onError: (e: Error) => {
      toast.error(e.message);
      onOpenChange(true); // reabre se falhar
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Informe o nome");

    const payload = { ...form };

    if (dividir && payload.divisaoPagamento) {
      const soma = payload.divisaoPagamento.valorPessoa1 + payload.divisaoPagamento.valorPessoa2;
      const total = payload.preco * payload.quantidade;
      // Allow minor floating point diffs
      if (Math.abs(soma - total) > 0.01) {
        return toast.error(
          `A soma da divisão (${brl(soma)}) deve ser igual ao total (${brl(total)}).`,
        );
      }
    } else {
      payload.clearDivisaoPagamento = true;
      delete payload.divisaoPagamento;
    }

    if (payload.responsavelId === null) {
      payload.clearResponsavelId = true;
    }

    if (!payload.dataCompra) {
      payload.clearDataCompra = true;
    } else {
      payload.dataCompra = new Date(payload.dataCompra + "T12:00:00Z").toISOString();
    }

    mutation.mutate({ id: isEdit && item ? item.id : undefined, dto: payload });
  };

  const set = <K extends keyof ItemInputDTO>(k: K, v: ItemInputDTO[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const { usuario } = useAuth();
  const isCasal = usuario?.tipoConta === "Casal";
  const p1 = usuario?.casalInfo?.pessoa1?.nome || "Pessoa 1";
  const p2 = usuario?.casalInfo?.pessoa2?.nome || "Pessoa 2";

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          set("fotoFile", file);
          setImageError(false);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      set("fotoFile", file);
      setImageError(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[96vw] max-w-5xl xl:max-w-6xl max-h-[92dvh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-md overflow-hidden card-sticker"
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <DialogHeader className="px-5 py-4 sm:px-6 sm:py-4 border-b bg-card shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="font-display text-xl sm:text-2xl flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                {isEdit ? <Pencil className="h-4.5 w-4.5" /> : <Sparkles className="h-4.5 w-4.5" />}
              </div>
              <div className="flex flex-col text-left">
                <span>{isEdit ? "Editar Item" : "Novo Item"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {isEdit
                    ? "Atualize as informações, fotos e status do item"
                    : "Adicione manualmente um item ao planejamento"}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={submit}
            className="flex-1 overflow-y-auto lg:overflow-y-auto flex flex-col min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            <div className="p-4 sm:p-6 lg:p-6 flex-1 lg:grid lg:grid-cols-12 lg:gap-6 space-y-5 lg:space-y-0">
              {/* Coluna Esquerda: Mídia, Cômodo, Marca/Loja e Link */}
              <div className="lg:col-span-5 space-y-4">
                {/* Card de Foto e Drag & Drop */}
                <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-primary" /> Foto do Produto
                    </Label>
                    {(form.fotoFile || (form.fotoUrl && !imageError)) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-destructive hover:bg-destructive/10 px-2"
                        onClick={() => {
                          set("fotoFile", undefined as unknown as File);
                          set("fotoUrl", "");
                        }}
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  <div
                    className="w-full h-36 relative group rounded-xl overflow-hidden border-2 border-dashed border-border/70 bg-muted/20 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          set("fotoFile", e.target.files[0]);
                          setImageError(false);
                        }
                      }}
                    />

                    {form.fotoFile ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-125"
                          style={{ backgroundImage: `url(${URL.createObjectURL(form.fotoFile)})` }}
                        />
                        <img
                          src={URL.createObjectURL(form.fotoFile)}
                          alt=""
                          className="relative h-full w-full object-contain p-2"
                        />
                      </>
                    ) : form.fotoUrl && !imageError ? (
                      <>
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-125"
                          style={{ backgroundImage: `url(${form.fotoUrl})` }}
                        />
                        <img
                          src={form.fotoUrl}
                          alt=""
                          className="relative h-full w-full object-contain p-2"
                          onError={() => setImageError(true)}
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-3 text-center">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                          <Upload className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Escolher Foto</span>
                        <span className="text-[10px] text-muted-foreground">
                          Arraste ou cole (Ctrl+V)
                        </span>
                      </div>
                    )}

                    {/* Hover Actions se tiver foto */}
                    {(form.fotoFile || (form.fotoUrl && !imageError)) && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 backdrop-blur-sm text-white">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs font-semibold">Trocar Imagem</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card de Classificação */}
                <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <LayoutGrid className="w-3.5 h-3.5 text-primary" /> Classificação
                  </h4>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Cômodo</Label>
                    <Select value={form.categoriaId} onValueChange={(v) => set("categoriaId", v)}>
                      <SelectTrigger className="bg-background h-9 text-xs sm:text-sm">
                        <SelectValue />
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Marca</Label>
                      <Input
                        value={form.marca ?? ""}
                        onChange={(e) => set("marca", e.target.value)}
                        className="bg-background h-9 text-xs sm:text-sm"
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Loja</Label>
                      <Input
                        value={form.loja ?? ""}
                        onChange={(e) => set("loja", e.target.value)}
                        className="bg-background h-9 text-xs sm:text-sm"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>

                {/* Card de Link do Produto */}
                <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <Label
                          htmlFor="toggle-link-produto"
                          className="text-xs font-bold text-foreground cursor-pointer block"
                        >
                          Link do Produto
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Guardar endereço da loja para comprar depois
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="toggle-link-produto"
                      onClick={() => setShowLink((v) => !v)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer shrink-0"
                    >
                      {showLink ? "Ocultar ▲" : form.linkProduto ? "Ver link ▼" : "Adicionar ▼"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showLink && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 6 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1.5 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            value={form.linkProduto ?? ""}
                            onChange={(e) => set("linkProduto", e.target.value)}
                            className="bg-background text-xs sm:text-sm flex-1 h-9"
                            placeholder="https://..."
                          />
                          {form.linkProduto && form.linkProduto.trim().length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="btn-sticker shrink-0 h-9 px-2.5 flex items-center gap-1.5 font-bold text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/40 cursor-pointer"
                              asChild
                            >
                              <a
                                href={
                                  form.linkProduto.startsWith("http://") ||
                                  form.linkProduto.startsWith("https://")
                                    ? form.linkProduto
                                    : `https://${form.linkProduto}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                title="Abrir link em nova aba"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Ir para link</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Coluna Direita: Identificação, Valores, Financeiro e Divisão */}
              <div className="lg:col-span-7 space-y-4">
                {/* Card de Identificação e Valores */}
                <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 sm:p-5 space-y-3.5 shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Nome do Produto
                      </Label>
                      {!item && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setScannerOpen(true)}
                          className="h-6 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10 font-bold"
                        >
                          <Barcode className="h-3 w-3" />
                          EAN / Barcode
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        value={form.nome}
                        onChange={(e) => set("nome", e.target.value)}
                        autoFocus
                        className="font-display text-base sm:text-lg font-bold h-11 bg-background"
                        placeholder="Ex: Geladeira Brastemp Frost Free..."
                      />
                      {!isEdit && dupQuery.data?.duplicata && (
                        <div className="absolute top-full mt-1 z-10 w-full rounded-md border border-amber-500/40 bg-amber-500/10 p-2 flex gap-2 text-xs text-amber-800 dark:text-amber-200 shadow-md">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                          <div>
                            Já existe um item similar neste cômodo:{" "}
                            <b>{dupQuery.data.itemSimilar}</b>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Preço Unitário
                      </Label>
                      <CurrencyInput
                        value={form.preco}
                        onValueChange={(v) => set("preco", v)}
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
                        value={form.quantidade}
                        onChange={(e) => set("quantidade", Number(e.target.value))}
                        className="h-10 text-base font-bold bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Total Previsto
                      </Label>
                      <div className="h-10 px-3 rounded-md border bg-muted/40 flex items-center font-display font-bold text-sm text-foreground">
                        {brl(form.preco * form.quantidade)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Financeiro & Compra */}
                <div className="rounded-[var(--radius-lg)] border-2 border-border/80 bg-card p-4 sm:p-5 space-y-3.5 shadow-sm">
                  {/* Card de Status & Data (Comprado vs Previsão) */}
                  <div className="bg-muted/20 p-3 sm:p-3.5 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-md shrink-0 transition-colors ${
                            form.comprado
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold leading-tight">
                            {form.comprado
                              ? form.origem === "ganho"
                                ? "Item Ganhado / Recebido"
                                : "Item Comprado / Adquirido"
                              : "Pendente na Lista"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            {form.comprado
                              ? form.dataCompra
                                ? form.origem === "ganho"
                                  ? `Ganhado em ${formatDate(form.dataCompra)}`
                                  : `Comprado em ${formatDate(form.dataCompra)}`
                                : form.origem === "ganho"
                                  ? "Já recebido de presente"
                                  : "Já adquirido pelo casal"
                              : form.dataCompra
                                ? `Previsão para ${formatDate(form.dataCompra)}`
                                : form.origem === "ganho"
                                  ? "Ainda não recebido"
                                  : "Ainda não comprado"}
                          </p>
                        </div>
                      </div>

                      <Switch
                        id="modal-switch-comprado"
                        checked={form.comprado}
                        onCheckedChange={(c) => {
                          set("comprado", c);
                          if (c && !form.dataCompra)
                            set("dataCompra", new Date().toLocaleDateString("en-CA"));
                        }}
                      />
                    </div>

                    {/* Campo unificado de data: Data da Compra ou Data de Previsão */}
                    <div className="pt-2.5 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="modal-data-compra"
                          className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-foreground"
                        >
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {form.comprado
                            ? form.origem === "ganho"
                              ? "Data que Ganhou"
                              : "Data da Compra"
                            : "Data de Previsão"}
                        </Label>
                        <p className="text-[10px] text-muted-foreground">
                          {form.comprado
                            ? form.origem === "ganho"
                              ? "Data em que o presente foi recebido"
                              : "Data em que o item foi adquirido"
                            : "Previsão estimada para compra (opcional)"}
                        </p>
                      </div>
                      <Input
                        id="modal-data-compra"
                        type="date"
                        value={form.dataCompra ?? ""}
                        onChange={(e) => set("dataCompra", e.target.value || null)}
                        className="h-8 text-xs bg-background w-full sm:w-44 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">Origem</Label>
                      <Select
                        value={form.origem ?? "comprado"}
                        onValueChange={(v) => {
                          set("origem", v as ItemInputDTO["origem"]);
                          if (v === "ganho") set("parcelas", 1);
                        }}
                      >
                        <SelectTrigger className="bg-background h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprado">Compra planejada</SelectItem>
                          <SelectItem value="ganho">Presente / Ganho</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground font-medium">
                        Prioridade
                      </Label>
                      <Select
                        value={form.prioridade}
                        onValueChange={(v) => set("prioridade", v as ItemInputDTO["prioridade"])}
                      >
                        <SelectTrigger className="bg-background h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta (Urgente)</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa (Pode esperar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.origem !== "ganho" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground font-medium">
                            Pagamento
                          </Label>
                          <Select
                            value={form.pagamento}
                            onValueChange={(v) => {
                              set("pagamento", v as ItemInputDTO["pagamento"]);
                              if (v === "vr") set("parcelas", 1);
                            }}
                          >
                            <SelectTrigger className="bg-background h-9 text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Dinheiro / Cartão</SelectItem>
                              <SelectItem value="vr">VR / VA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs text-muted-foreground font-medium">
                              Parcelamento
                            </Label>
                            {(form.parcelas ?? 1) > 1 && (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                Total:{" "}
                                <strong className="text-foreground">
                                  {brl(
                                    valorParcela(
                                      form.preco * form.quantidade,
                                      form.parcelas ?? 1,
                                      form.jurosMensal ?? 0,
                                    ) * (form.parcelas ?? 1),
                                  )}
                                </strong>
                              </span>
                            )}
                          </div>

                          <Select
                            value={String(form.parcelas ?? 1)}
                            onValueChange={(v) => {
                              const p = Number(v);
                              set("parcelas", p);
                              if (p === 1) {
                                set("jurosMensal", 0);
                                setJurosTexto("");
                              }
                            }}
                            disabled={form.pagamento === "vr"}
                          >
                            <SelectTrigger className="bg-background h-9 text-xs sm:text-sm w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((p) => {
                                const total = form.preco * form.quantidade;
                                const vParc = valorParcela(total, p, form.jurosMensal ?? 0);
                                return (
                                  <SelectItem key={p} value={String(p)}>
                                    {p === 1
                                      ? `À vista (1x) · ${brl(total)}`
                                      : `${p}x de ${brl(vParc)}${(form.jurosMensal ?? 0) > 0 ? " (com juros)" : " sem juros"}`}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>

                          {/* Campo pequeno para juros embaixo do parcelamento quando mais de 1 parcela */}
                          {(form.parcelas ?? 1) > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/60">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor="modal-juros"
                                  className="text-xs text-muted-foreground font-medium shrink-0 cursor-pointer"
                                >
                                  Taxa de juros:
                                </Label>
                                <div className="relative w-28">
                                  <Input
                                    id="modal-juros"
                                    type="text"
                                    inputMode="decimal"
                                    value={jurosTexto}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return;
                                      setJurosTexto(raw);
                                      const parsed = parseFloat(raw.replace(",", "."));
                                      set("jurosMensal", isNaN(parsed) || parsed < 0 ? 0 : parsed);
                                    }}
                                    placeholder="0,00"
                                    title="Taxa de juros ao mês (% a.m.)"
                                    className="bg-background h-8 text-xs pr-10 font-medium"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                                    % a.m.
                                  </span>
                                </div>
                              </div>

                              <div className="text-[11px] font-medium text-right">
                                {(form.jurosMensal ?? 0) > 0 ? (
                                  <span className="text-amber-600 dark:text-amber-400">
                                    Parcela:{" "}
                                    <strong>
                                      {form.parcelas}x de{" "}
                                      {brl(
                                        valorParcela(
                                          form.preco * form.quantidade,
                                          form.parcelas ?? 1,
                                          form.jurosMensal ?? 0,
                                        ),
                                      )}
                                    </strong>
                                    {" · "}
                                    Total:{" "}
                                    <strong>
                                      {brl(
                                        valorParcela(
                                          form.preco * form.quantidade,
                                          form.parcelas ?? 1,
                                          form.jurosMensal ?? 0,
                                        ) * (form.parcelas ?? 1),
                                      )}
                                    </strong>
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    Parcela:{" "}
                                    <strong>
                                      {form.parcelas}x de{" "}
                                      {brl((form.preco * form.quantidade) / (form.parcelas ?? 1))}
                                    </strong>{" "}
                                    (sem juros)
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {isCasal && form.origem !== "ganho" && (
                    <div className="pt-3 border-t border-dashed space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <Label className="text-xs font-bold">Responsável Financeiro</Label>
                          <p className="text-[11px] text-muted-foreground">
                            Quem pagará por este item?
                          </p>
                        </div>
                        <Select
                          value={
                            dividir
                              ? "dividir"
                              : form.responsavelId === 1
                                ? "1"
                                : form.responsavelId === 2
                                  ? "2"
                                  : "conjunto"
                          }
                          onValueChange={(v) => {
                            if (v === "dividir") {
                              setDividir(true);
                              set("responsavelId", null);
                              const total = form.preco * form.quantidade;
                              set("divisaoPagamento", {
                                valorPessoa1: total / 2,
                                valorPessoa2: total / 2,
                              });
                            } else if (v === "conjunto") {
                              setDividir(false);
                              set("responsavelId", null);
                              set("divisaoPagamento", null);
                            } else {
                              setDividir(false);
                              set("responsavelId", Number(v) as 1 | 2);
                              set("divisaoPagamento", null);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[220px] h-9 bg-background text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conjunto">Conta Conjunta</SelectItem>
                            <SelectItem value="1">{p1} paga 100%</SelectItem>
                            <SelectItem value="2">{p2} paga 100%</SelectItem>
                            <SelectItem value="dividir">Dividir valores específicos...</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {dividir && form.divisaoPagamento && (
                        <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">{p1}</Label>
                              <CurrencyInput
                                value={form.divisaoPagamento.valorPessoa1}
                                onValueChange={(v) =>
                                  set("divisaoPagamento", {
                                    ...form.divisaoPagamento!,
                                    valorPessoa1: v,
                                  })
                                }
                                className="bg-background h-8 text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{p2}</Label>
                              <CurrencyInput
                                value={form.divisaoPagamento.valorPessoa2}
                                onValueChange={(v) =>
                                  set("divisaoPagamento", {
                                    ...form.divisaoPagamento!,
                                    valorPessoa2: v,
                                  })
                                }
                                className="bg-background h-8 text-xs font-semibold"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="text-xs font-medium">
                              Soma:{" "}
                              <span
                                className={
                                  Math.abs(
                                    form.divisaoPagamento.valorPessoa1 +
                                      form.divisaoPagamento.valorPessoa2 -
                                      form.preco * form.quantidade,
                                  ) > 0.01
                                    ? "text-destructive font-bold"
                                    : "text-emerald-500 font-bold"
                                }
                              >
                                {brl(
                                  form.divisaoPagamento.valorPessoa1 +
                                    form.divisaoPagamento.valorPessoa2,
                                )}
                              </span>{" "}
                              / {brl(form.preco * form.quantidade)}
                            </div>
                            <div className="flex gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[10px] bg-background"
                                onClick={() =>
                                  set("divisaoPagamento", {
                                    valorPessoa1: form.preco * form.quantidade,
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
                                  set("divisaoPagamento", {
                                    valorPessoa1: (form.preco * form.quantidade) / 2,
                                    valorPessoa2: (form.preco * form.quantidade) / 2,
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
                                  set("divisaoPagamento", {
                                    valorPessoa1: 0,
                                    valorPessoa2: form.preco * form.quantidade,
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

            <DialogFooter className="p-4 sm:px-6 border-t-2 border-border/80 bg-card shrink-0 flex items-center justify-between sm:justify-between gap-3">
              <div className="flex items-center gap-2.5 ml-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-primary hover:bg-primary/90 font-bold min-w-[130px]"
                >
                  {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mutation.isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Item"}
                </Button>
              </div>
            </DialogFooter>
          </form>
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
