import { useEffect, useState } from "react";
import { MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { registroPrecoService, type AnaliseFotoPreco } from "@/services/registro-preco";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  dados: AnaliseFotoPreco | null;
  onSalvo: () => void;
}

export function ConfirmarRegistroPreco({ open, onOpenChange, itemId, dados, onSalvo }: Props) {
  const [form, setForm] = useState<AnaliseFotoPreco>({ produtoNome: "", preco: 0, endereco: "" });
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    if (dados) setForm(dados);
  }, [dados]);
  function setField<K extends keyof AnaliseFotoPreco>(key: K, value: AnaliseFotoPreco[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const confirmar = async () => {
    if (!form.produtoNome.trim() || !form.endereco.trim()) {
      toast.error("Preencha o produto e o endereço antes de salvar.");
      return;
    }
    setSalvando(true);
    try {
      await registroPrecoService.confirmar({ ...form, itemId, preco: form.preco || 0 });
      toast.success("Preço registrado no histórico.");
      onSalvo();
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível salvar o registro agora.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background/95 backdrop-blur-md">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b bg-card">
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Save className="h-5 w-5 text-primary" /> Confirmar Preço
          </DialogTitle>
          <DialogDescription>
            Revise os dados extraídos antes de salvar este preço no histórico.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-6 max-h-[70dvh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Preço em Destaque */}
          <div className="flex flex-col items-center justify-center p-6 bg-primary/5 border rounded-[var(--radius-lg)] border-primary/20 group">
            <label className="text-primary font-semibold text-xs uppercase tracking-wider mb-2">
              Valor Registrado
            </label>
            <div className="w-full max-w-[200px] relative">
              <CurrencyInput
                value={form.preco || 0}
                onValueChange={(value) => setField("preco", value)}
                className="h-16 text-center text-3xl sm:text-4xl font-display font-bold bg-transparent border-none shadow-none focus-visible:ring-0"
              />
              <div className="absolute inset-x-0 bottom-1 h-px bg-primary/30 group-hover:bg-primary/60 transition-colors" />
            </div>
          </div>

          <div className="grid gap-6">
            {/* Informações do Produto */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Identificação do Produto
              </h4>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome do Produto
                  </label>
                  <Input
                    value={form.produtoNome}
                    onChange={(e) => setField("produtoNome", e.target.value)}
                    placeholder="Ex: Arroz Branco Tipo 1"
                    className="bg-card font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Marca
                    </label>
                    <Input
                      value={form.marca ?? ""}
                      onChange={(e) => setField("marca", e.target.value || null)}
                      placeholder="Desconhecida"
                      className="bg-card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tamanho / Unidade
                    </label>
                    <Input
                      value={form.unidade ?? ""}
                      onChange={(e) => setField("unidade", e.target.value || null)}
                      placeholder="Ex: 5kg"
                      className="bg-card"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border/60" />

            {/* Origem / Local */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Origem do Preço
              </h4>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome do Estabelecimento
                  </label>
                  <Input
                    value={form.nomeMercado ?? ""}
                    onChange={(e) => setField("nomeMercado", e.target.value || null)}
                    placeholder="Ex: Supermercado Extra"
                    className="bg-card"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Endereço Completo
                  </label>
                  <Input
                    value={form.endereco}
                    onChange={(e) => setField("endereco", e.target.value)}
                    placeholder="Rua, Número, Cidade"
                    className="bg-card text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-5 bg-card border-t flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button disabled={salvando} onClick={confirmar} className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
            {salvando ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Salvar Preço
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
