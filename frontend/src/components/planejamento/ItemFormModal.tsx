import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ExternalLink, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
        });
      } else {
        setForm({ ...empty(categoriaId), ...initial });
      }
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
    mutation.mutate(form);
  };

  const set = <K extends keyof ItemInputDTO>(k: K, v: ItemInputDTO[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[100dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Editar item" : "Novo item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* Foto do produto (só no modo editar) */}
          {isEdit && form.fotoUrl && (
            <div className="flex justify-center">
              <div className="relative group">
                <img
                  src={form.fotoUrl}
                  alt={form.nome}
                  className="h-36 w-full max-w-xs rounded-xl object-contain border bg-muted/30"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                {form.linkProduto && (
                  <a
                    href={form.linkProduto}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-6 w-6 text-white" />
                  </a>
                )}
              </div>
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
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                onValueChange={(v) => set("pagamento", v as "normal" | "vr")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="vr">VR / VA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={form.prioridade}
                onValueChange={(v) => set("prioridade", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                value={form.origem ?? "comprado"}
                onValueChange={(v) => set("origem", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprado">Será comprado</SelectItem>
                  <SelectItem value="ganho">Ganho / Presente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Cômodo</Label>
              <Select
                value={form.categoriaId}
                onValueChange={(v) => set("categoriaId", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
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
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showLink ? 'rotate-180' : ''}`} />
                {showLink ? 'Ocultar link do produto' : 'Editar link do produto'}
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
