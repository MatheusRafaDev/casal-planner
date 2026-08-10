import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ExternalLink, AlertTriangle, Camera, Upload, X } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    mutationFn: async (dto: ItemInputDTO) => {
      if (isEdit && item) return itensService.atualizar(item.id, dto);
      return itensService.criar(dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens-paginado"] });
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      toast.success(isEdit ? "Item atualizado" : "Item adicionado");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
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

    mutation.mutate(payload);
  };

  const set = <K extends keyof ItemInputDTO>(k: K, v: ItemInputDTO[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const { usuario } = useAuth();
  const isCasal = usuario?.tipoConta === "Casal";
  const p1 = usuario?.casalInfo?.pessoa1?.nome || "Pessoa 1";
  const p2 = usuario?.casalInfo?.pessoa2?.nome || "Pessoa 2";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg max-h-[90dvh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? "Editar item" : "Novo item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Foto do produto - clique/hover para trocar */}
          {isEdit && (
            <div className="flex justify-center">
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
                <div className="relative group cursor-pointer w-full max-w-sm mx-auto h-72 rounded-2xl overflow-hidden border bg-background/50" onClick={() => fileInputRef.current?.click()}>
                  {/* Fundo Desfocado Premium */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110" 
                    style={{ backgroundImage: `url(${URL.createObjectURL(form.fotoFile)})` }} 
                  />
                  {/* Imagem Principal */}
                  <img
                    src={URL.createObjectURL(form.fotoFile)}
                    alt="Preview"
                    className="relative h-full w-full object-contain drop-shadow-xl"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Camera className="h-5 w-5 text-white" />
                    <span className="text-white text-xs font-medium">Trocar foto</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); set("fotoFile", undefined as unknown as File); }}
                    className="absolute top-1.5 right-1.5 rounded-full bg-black/60 text-white p-0.5 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remover foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : form.fotoUrl && !imageError ? (
                <div className="relative group cursor-pointer w-full max-w-sm mx-auto h-72 rounded-2xl overflow-hidden border bg-background/50" onClick={() => fileInputRef.current?.click()}>
                  {/* Fundo Desfocado Premium */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110" 
                    style={{ backgroundImage: `url(${form.fotoUrl})` }} 
                  />
                  {/* Imagem Principal */}
                  <img
                    src={form.fotoUrl}
                    alt={form.nome}
                    className="relative h-full w-full object-contain drop-shadow-xl"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Camera className="h-5 w-5 text-white" />
                    <span className="text-white text-xs font-medium">Trocar foto</span>
                  </div>
                  {form.linkProduto && (
                    <a
                      href={form.linkProduto}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1.5 hover:bg-black/70 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-white" />
                    </a>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 h-24 w-full max-w-xs rounded-xl border border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Adicionar foto</span>
                </button>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} autoFocus />
              {!isEdit && dupQuery.data?.duplicata && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex gap-2 text-sm mt-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-amber-800 dark:text-amber-200">
                    Já existe um item similar neste cômodo: <b>{dupQuery.data.itemSimilar}</b>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input value={form.marca ?? ""} onChange={(e) => set("marca", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Loja</Label>
              <Input value={form.loja ?? ""} onChange={(e) => set("loja", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preço unitário</Label>
              <CurrencyInput
                value={form.preco}
                onValueChange={(v) => set("preco", v)}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={form.quantidade}
                onChange={(e) => set("quantidade", Number(e.target.value))}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Parcelas</Label>
                {(form.parcelas ?? 1) > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {brl(form.preco / (form.parcelas ?? 1))}/parcela
                  </span>
                )}
              </div>
              <Select
                value={String(form.parcelas ?? 1)}
                onValueChange={(v) => set("parcelas", Number(v))}
                disabled={form.pagamento === "vr"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {p === 1 ? "À vista (1x)" : `${p}x • ${brl(form.preco / p)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pagamento</Label>
              <Select
                value={form.pagamento}
                onValueChange={(v) => {
                  set("pagamento", v as "normal" | "vr");
                  if (v === "vr") set("parcelas", 1);
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
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(v) => set("prioridade", v)}>
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
              <Label>Origem</Label>
              <Select value={form.origem ?? "comprado"} onValueChange={(v) => set("origem", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprado">Será comprado</SelectItem>
                  <SelectItem value="ganho">Ganho / Presente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isCasal && (
              <div className="space-y-4 sm:col-span-2 border rounded-xl p-4 bg-card mt-2">
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
                        const total = form.preco * form.quantidade;
                        set("divisaoPagamento", {
                          valorPessoa1: total / 2,
                          valorPessoa2: total / 2,
                        });
                      } else {
                        set("divisaoPagamento", null);
                      }
                    }}
                  />
                </div>

                {dividir && form.divisaoPagamento && (
                  <div className="pt-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{p1}</Label>
                        <CurrencyInput
                          value={form.divisaoPagamento.valorPessoa1}
                          onValueChange={(v) =>
                            set("divisaoPagamento", { ...form.divisaoPagamento!, valorPessoa1: v })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{p2}</Label>
                        <CurrencyInput
                          value={form.divisaoPagamento.valorPessoa2}
                          onValueChange={(v) =>
                            set("divisaoPagamento", { ...form.divisaoPagamento!, valorPessoa2: v })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs text-muted-foreground">
                        Total:{" "}
                        {brl(
                          form.divisaoPagamento.valorPessoa1 + form.divisaoPagamento.valorPessoa2,
                        )}{" "}
                        / {brl(form.preco * form.quantidade)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => {
                            const total = form.preco * form.quantidade;
                            set("divisaoPagamento", { valorPessoa1: total, valorPessoa2: 0 });
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
                            const total = form.preco * form.quantidade;
                            set("divisaoPagamento", {
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
                            const total = form.preco * form.quantidade;
                            set("divisaoPagamento", { valorPessoa1: 0, valorPessoa2: total });
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
                      value={form.responsavelId ? String(form.responsavelId) : "none"}
                      onValueChange={(v) => {
                        if (v === "none") set("responsavelId", null);
                        else set("responsavelId", Number(v) as 1 | 2);
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
            <div className="space-y-2 sm:col-span-2">
              <Label>Cômodo</Label>
              <Select value={form.categoriaId} onValueChange={(v) => set("categoriaId", v)}>
                <SelectTrigger>
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
            <div className="space-y-2 sm:col-span-2">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowLink((s) => !s)}
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showLink ? "rotate-180" : ""}`}
                />
                {showLink ? "Ocultar link do produto" : "Editar link do produto"}
              </button>
              {showLink && (
                <Input
                  value={form.linkProduto ?? ""}
                  onChange={(e) => set("linkProduto", e.target.value)}
                  placeholder="https://..."
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
