import { useState, useEffect, useRef } from "react";
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
import { brl } from "@/lib/formatters";
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
  const [showLink, setShowLink] = useState(false);
  const [dividir, setDividir] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeDetectado = (prod: { nome?: string; marca?: string; fotoUrl?: string; quantidade?: string }) => {
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
          origem: item.origem ?? "comprado",
          responsavelId: item.responsavelId ?? null,
          divisaoPagamento: item.divisaoPagamento ? { ...item.divisaoPagamento } : null,
          dataCompra: item.dataCompra ? item.dataCompra.split("T")[0] : null,
        });
        setDividir(!!item.divisaoPagamento);
      } else {
        setForm({ ...empty(categoriaId), ...initial });
        setDividir(false);
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
        className="w-[95vw] sm:max-w-2xl max-h-[90dvh] overflow-y-auto flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-md"
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b bg-card shrink-0">
          <DialogTitle className="font-display text-xl sm:text-2xl flex items-center gap-2">
            {isEdit ? <Pencil className="h-5 w-5 text-primary" /> : <Sparkles className="h-5 w-5 text-primary" />}
            {isEdit ? "Editar Item" : "Novo Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Seção 1: Identificação Básica */}
          <section className="flex flex-col sm:flex-row gap-6">
            {/* Imagem */}
            <div className="w-32 h-32 mx-auto sm:mx-0 shrink-0 relative group rounded-[var(--radius-lg)] overflow-hidden border bg-muted/20">
              <input ref={fileInputRef} type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { set("fotoFile", e.target.files[0]); setImageError(false); } }} />
              
              {form.fotoFile ? (
                <>
                  <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-125" style={{ backgroundImage: `url(${URL.createObjectURL(form.fotoFile)})` }} />
                  <img src={URL.createObjectURL(form.fotoFile)} alt="" className="relative h-full w-full object-contain p-2" />
                </>
              ) : form.fotoUrl && !imageError ? (
                <>
                  <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-125" style={{ backgroundImage: `url(${form.fotoUrl})` }} />
                  <img src={form.fotoUrl} alt="" className="relative h-full w-full object-contain p-2" onError={() => setImageError(true)} />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-8 w-8 mb-1 opacity-50" />
                  <span className="text-[10px] font-medium uppercase">Foto</span>
                </div>
              )}

              {/* Hover Actions */}
              {(form.fotoFile || (form.fotoUrl && !imageError)) && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-medium">Trocar</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); set("fotoFile", undefined as unknown as File); set("fotoUrl", ""); }} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Nome e Preços */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome do Produto</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScannerOpen(true)}
                    className="h-6 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    <Barcode className="h-3 w-3" />
                    EAN / Código de Barras
                  </Button>
                </div>
                <div className="relative">
                  <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} autoFocus className="font-display text-lg font-semibold h-12 bg-card" placeholder="Ex: Geladeira Brastemp" />
                  {!isEdit && dupQuery.data?.duplicata && (
                    <div className="absolute top-full mt-1 z-10 w-full rounded-md border border-amber-500/40 bg-amber-500/10 p-2 flex gap-2 text-xs text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                      <div>Já existe um item similar neste cômodo: <b>{dupQuery.data.itemSimilar}</b></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preço Unitário</Label>
                  <CurrencyInput value={form.preco} onValueChange={(v) => set("preco", v)} className="h-10 text-base font-semibold bg-card" placeholder="R$ 0,00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantidade</Label>
                  <Input type="number" min="1" value={form.quantidade} onChange={(e) => set("quantidade", Number(e.target.value))} className="h-10 text-base font-semibold bg-card [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-border/60" />

          {/* Seção 2: Classificação */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-primary" /> Classificação</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cômodo</Label>
                <Select value={form.categoriaId} onValueChange={(v) => set("categoriaId", v)}>
                  <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Marca</Label>
                <Input value={form.marca ?? ""} onChange={(e) => set("marca", e.target.value)} className="bg-card" placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Loja</Label>
                <Input value={form.loja ?? ""} onChange={(e) => set("loja", e.target.value)} className="bg-card" placeholder="Opcional" />
              </div>
            </div>
            
            <div className="space-y-1.5 sm:col-span-3">
              <Label className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Link do Produto (URL)</span>
                {form.linkProduto && (
                  <a href={form.linkProduto} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" /> Testar link
                  </a>
                )}
              </Label>
              <Input value={form.linkProduto ?? ""} onChange={(e) => set("linkProduto", e.target.value)} className="bg-card text-sm" placeholder="https://..." />
            </div>
          </section>

          <hr className="border-border/60" />

          {/* Seção 3: Financeiro & Compra */}
          <section className="space-y-5">
            <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${form.comprado ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{form.comprado ? "Item Comprado" : "Pendente"}</h3>
                  <p className="text-xs text-muted-foreground">O item já foi adquirido?</p>
                </div>
              </div>
              <Switch checked={form.comprado} onCheckedChange={(c) => set("comprado", c)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Origem</Label>
                <Select value={form.origem ?? "comprado"} onValueChange={(v) => { set("origem", v as any); if(v==="ganho") set("parcelas", 1); }}>
                  <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprado">Compra planejada</SelectItem>
                    <SelectItem value="ganho">Presente / Ganho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v as any)}>
                  <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta (Urgente)</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa (Pode esperar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{form.comprado ? "Data da Compra" : "Previsão de Compra"}</Label>
                <Input type="date" value={form.dataCompra ?? ""} onChange={(e) => set("dataCompra", e.target.value || null)} className="bg-card" />
              </div>

              {form.origem !== "ganho" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Método de Pagamento</Label>
                    <Select value={form.pagamento} onValueChange={(v) => { set("pagamento", v as any); if (v === "vr") set("parcelas", 1); }}>
                      <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Dinheiro / Cartão</SelectItem>
                        <SelectItem value="vr">VR / VA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-muted-foreground">Parcelamento</Label>
                      {(form.parcelas ?? 1) > 1 && (
                        <span className="text-[10px] text-muted-foreground font-medium">{brl((form.preco*form.quantidade) / (form.parcelas ?? 1))}/mês</span>
                      )}
                    </div>
                    <Select value={String(form.parcelas ?? 1)} onValueChange={(v) => set("parcelas", Number(v))} disabled={form.pagamento === "vr"}>
                      <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((p) => (
                          <SelectItem key={p} value={String(p)}>
                            {p === 1 ? "À vista (1x)" : `${p}x sem juros`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {isCasal && form.origem !== "ganho" && (
              <div className="mt-4 p-4 rounded-[var(--radius-lg)] border bg-muted/10 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Responsável Financeiro</Label>
                    <p className="text-xs text-muted-foreground">Como o pagamento será feito ou dividido?</p>
                  </div>
                  <Select
                    value={dividir ? "dividir" : form.responsavelId === 1 ? "1" : form.responsavelId === 2 ? "2" : "conjunto"}
                    onValueChange={(v) => {
                      if (v === "dividir") {
                        setDividir(true);
                        set("responsavelId", null);
                        const total = form.preco * form.quantidade;
                        set("divisaoPagamento", { valorPessoa1: total / 2, valorPessoa2: total / 2 });
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
                    <SelectTrigger className="w-full sm:w-[220px] bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conjunto">Conta Conjunta</SelectItem>
                      <SelectItem value="1">{p1} paga 100%</SelectItem>
                      <SelectItem value="2">{p2} paga 100%</SelectItem>
                      <SelectItem value="dividir">Dividir valores específicos...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dividir && form.divisaoPagamento && (
                  <div className="pt-4 border-t border-dashed">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{p1}</Label>
                        <CurrencyInput value={form.divisaoPagamento.valorPessoa1} onValueChange={(v) => set("divisaoPagamento", { ...form.divisaoPagamento!, valorPessoa1: v })} className="bg-card h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{p2}</Label>
                        <CurrencyInput value={form.divisaoPagamento.valorPessoa2} onValueChange={(v) => set("divisaoPagamento", { ...form.divisaoPagamento!, valorPessoa2: v })} className="bg-card h-9" />
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
                      <div className="text-xs font-medium">
                        Soma: <span className={Math.abs((form.divisaoPagamento.valorPessoa1 + form.divisaoPagamento.valorPessoa2) - (form.preco * form.quantidade)) > 0.01 ? "text-destructive" : "text-emerald-500"}>
                          {brl(form.divisaoPagamento.valorPessoa1 + form.divisaoPagamento.valorPessoa2)}
                        </span> / {brl(form.preco * form.quantidade)}
                      </div>
                      <div className="flex gap-1.5">
                        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px] bg-background" onClick={() => set("divisaoPagamento", { valorPessoa1: form.preco*form.quantidade, valorPessoa2: 0 })}>100/0</Button>
                        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px] bg-background" onClick={() => set("divisaoPagamento", { valorPessoa1: (form.preco*form.quantidade)/2, valorPessoa2: (form.preco*form.quantidade)/2 })}>50/50</Button>
                        <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-[10px] bg-background" onClick={() => set("divisaoPagamento", { valorPessoa1: 0, valorPessoa2: form.preco*form.quantidade })}>0/100</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <DialogFooter className="pt-4 mt-6 border-t gap-2 sm:gap-0 sticky bottom-0 bg-background/95 pb-4 backdrop-blur-sm z-10">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/90">
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mutation.isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Item"}
            </Button>
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
