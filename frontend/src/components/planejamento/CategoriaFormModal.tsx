import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { categoriasService, type CategoriaInputDTO } from "@/services/categorias";
import type { Categoria } from "@/services/types";
import { ICON_MAP, ICON_NAMES, CATEGORIA_COLORS, iconFor } from "./icon-map";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categoria?: Categoria | null;
}

export function CategoriaFormModal({ open, onOpenChange, categoria }: Props) {
  const qc = useQueryClient();
  const isEdit = !!categoria;
  const [nome, setNome] = useState("");
  const [icon, setIcon] = useState<string>("Sofa");
  const [bg, setBg] = useState<string>(CATEGORIA_COLORS[0]);
  const [meta, setMeta] = useState<string>("");

  useEffect(() => {
    if (open) {
      setNome(categoria?.nome ?? "");
      setIcon(categoria?.icon ?? "Sofa");
      setBg(categoria?.bg ?? CATEGORIA_COLORS[0]);
      setMeta(categoria?.metaOrcamento ? String(categoria.metaOrcamento) : "");
    }
  }, [open, categoria]);

  const mutation = useMutation({
    mutationFn: async (dto: CategoriaInputDTO) => {
      if (isEdit && categoria) return categoriasService.atualizar(categoria.id, dto);
      return categoriasService.criar(dto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias"] });
      toast.success(isEdit ? "Cômodo atualizado" : "Cômodo criado");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return toast.error("Informe um nome");
    mutation.mutate({
      nome: nome.trim(),
      icon,
      bg,
      metaOrcamento: meta ? Number(meta) : null,
      removerMeta: !meta,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Editar cômodo" : "Novo cômodo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-nome">Nome</Label>
            <Input
              id="cat-nome"
              placeholder="Ex.: Sala, Cozinha, Quarto do bebê"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {ICON_NAMES.map((name) => {
                const I = ICON_MAP[name];
                const active = icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIcon(name)}
                    className={cn(
                      "aspect-square grid place-items-center rounded-lg border transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent border-transparent",
                    )}
                  >
                    <I className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIA_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBg(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    bg === c ? "border-foreground scale-110" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-meta">Meta de orçamento (opcional)</Label>
            <CurrencyInput
              id="cat-meta"
              value={meta ? Number(meta) : 0}
              onValueChange={(v) => setMeta(v === 0 ? "" : String(v))}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="rounded-lg border p-3 flex items-center gap-3 bg-muted/40">
            <span
              className="grid place-items-center h-10 w-10 rounded-lg text-white shadow-soft"
              style={{ backgroundColor: bg }}
            >
              {(() => {
                const I = iconFor(icon);
                return <I className="h-5 w-5" />;
              })()}
            </span>
            <div>
              <div className="font-medium">{nome || "Nome do cômodo"}</div>
              <div className="text-xs text-muted-foreground">Pré-visualização</div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
