import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
        });
      } else {
        setForm({ ...empty(categoriaId), ...initial });
      }
    }
  }, [open, item, categoriaId, initial]);

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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} autoFocus />
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
              />
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
              <Label>Link do produto</Label>
              <Input
                value={form.linkProduto ?? ""}
                onChange={(e) => set("linkProduto", e.target.value)}
                placeholder="https://..."
              />
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
