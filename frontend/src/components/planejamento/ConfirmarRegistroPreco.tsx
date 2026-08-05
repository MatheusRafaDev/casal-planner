import { useEffect, useState } from "react";
import { MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { registroPrecoService, type AnaliseFotoPreco } from "@/services/registro-preco";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; itemId: string; dados: AnaliseFotoPreco | null; onSalvo: () => void; }

export function ConfirmarRegistroPreco({ open, onOpenChange, itemId, dados, onSalvo }: Props) {
  const [form, setForm] = useState<AnaliseFotoPreco>({ produtoNome: "", preco: 0, endereco: "" });
  const [salvando, setSalvando] = useState(false);
  useEffect(() => { if (dados) setForm(dados); }, [dados]);
  function setField<K extends keyof AnaliseFotoPreco>(key: K, value: AnaliseFotoPreco[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const confirmar = async () => {
    if (!form.produtoNome.trim() || !form.endereco.trim()) { toast.error("Preencha o produto e o endereço antes de salvar."); return; }
    setSalvando(true);
    try {
      await registroPrecoService.confirmar({ ...form, itemId });
      toast.success("Preço registrado no histórico.");
      onSalvo();
      onOpenChange(false);
    } catch { toast.error("Não foi possível salvar o registro agora."); } finally { setSalvando(false); }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>Confirmar preço encontrado</DialogTitle><DialogDescription>Revise os dados antes de salvar. Todos os campos podem ser corrigidos.</DialogDescription></DialogHeader>
      <div className="grid gap-3">
        <Input value={form.produtoNome} onChange={(e) => setField("produtoNome", e.target.value)} placeholder="Produto" />
        <div className="grid grid-cols-2 gap-3"><Input value={form.marca ?? ""} onChange={(e) => setField("marca", e.target.value || null)} placeholder="Marca" /><Input value={form.unidade ?? ""} onChange={(e) => setField("unidade", e.target.value || null)} placeholder="Unidade (ex.: 1 kg)" /></div>
        <CurrencyInput value={form.preco} onValueChange={(value) => setField("preco", value)} />
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /><span>Endereço sugerido pela sua localização. Corrija-o se necessário antes de salvar.</span></div>
        <Input value={form.endereco} onChange={(e) => setField("endereco", e.target.value)} placeholder="Endereço" />
        <Input value={form.nomeMercado ?? ""} onChange={(e) => setField("nomeMercado", e.target.value || null)} placeholder="Nome do mercado (opcional)" />
      </div>
      <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button disabled={salvando} onClick={confirmar}><Save className="h-4 w-4 mr-1" />{salvando ? "Salvando..." : "Salvar preço"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
