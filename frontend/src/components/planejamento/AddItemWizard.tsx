import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, AlertTriangle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PainelPesquisaPrecos } from "./PainelPesquisaPrecos";
import type { Categoria, PesquisaPrecoResultado } from "@/services/types";
import { itensService } from "@/services/itens";
import { groqService } from "@/services/groq";
import { brl } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categorias: Categoria[];
  categoriaInicialId: string;
}

type Step = 1 | 2 | 3;

export function AddItemWizard({ open, onOpenChange, categorias, categoriaInicialId }: Props) {
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [categoriaId, setCategoriaId] = useState(categoriaInicialId);
  const [escolhido, setEscolhido] = useState<PesquisaPrecoResultado | null>(null);
  const [precoNumerico, setPrecoNumerico] = useState<number>(0);
  const [marca, setMarca] = useState("");
  const [loja, setLoja] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [prioridade, setPrioridade] = useState("media");

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
    setPrioridade("media");
  };

  const dupQuery = useQuery({
    queryKey: ["duplicata", nome, categoriaId],
    queryFn: () => groqService.detectarDuplicata(nome, categoriaId),
    enabled: false,
  });

  const criar = useMutation({
    mutationFn: async () => {
      const preco = escolhido?.preco ?? precoNumerico;
      return itensService.criar({
        nome: nome.trim(),
        categoriaId,
        quantidade,
        preco,
        loja: loja.trim() || undefined,
        linkProduto: escolhido?.link ?? undefined,
        fotoUrl: escolhido?.thumbnail ?? undefined,
        marca: marca.trim() || undefined,
        parcelas,
        pagamento: "normal",
        prioridade,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itens"] });
      qc.invalidateQueries({ queryKey: ["resumo"] });
      toast.success("Item adicionado ao cômodo");
      onOpenChange(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
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
      <DialogContent className="sm:max-w-2xl max-h-[100dvh] overflow-hidden flex flex-col">
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

        <div className="flex-1 overflow-y-auto pr-1">
          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome do item</Label>
                <Input
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Geladeira Frost Free 400L"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cômodo</Label>
                  <Select value={categoriaId} onValueChange={setCategoriaId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
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
          )}

          {step === 2 && (
            <div className="py-2 space-y-3">
              <div className="text-sm text-muted-foreground">
                Buscando preços para <span className="text-foreground font-medium">{nome}</span>. Escolha
                uma opção ou preencha manualmente.
              </div>
              <PainelPesquisaPrecos
                initialQuery={nome}
                onEscolher={(r) => {
                  setEscolhido(r);
                  setPrecoNumerico(r.preco);
                  setMarca(r.marca ?? "");
                  setLoja(r.loja ?? "");
                  setNome(r.titulo);
                  setStep(3);
                }}
              />
              <div className="border-t pt-3 space-y-2">
                <Label>Ou informe o preço manualmente</Label>
                <div className="flex gap-2">
                  <CurrencyInput
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
            <div className="py-2 space-y-4">
              <div className="rounded-xl border p-4 bg-gradient-warm">
                <div className="font-display text-lg font-semibold">{nome}</div>
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    {categorias.find((c) => c.id === categoriaId)?.nome ?? "Cômodo"}
                  </Badge>
                  <Badge variant="outline">Qtd: {quantidade}</Badge>
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
                {escolhido?.thumbnail && (
                  <img
                    src={escolhido.thumbnail}
                    alt=""
                    className="mt-4 h-32 rounded-lg border object-cover"
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-2">
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex.: Brastemp" />
                </div>
                <div className="space-y-2">
                  <Label>Loja</Label>
                  <Input value={loja} onChange={e => setLoja(e.target.value)} placeholder="Ex.: Fast Shop" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Parcelas</Label>
                    {parcelas > 1 && (
                      <span className="text-xs text-muted-foreground">
                        {brl((escolhido?.preco ?? precoNumerico) / parcelas)}/parcela
                      </span>
                    )}
                  </div>
                  <Select
                    value={String(parcelas)}
                    onValueChange={(v) => setParcelas(Number(v))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label>Prioridade</Label>
                  <Select
                    value={prioridade}
                    onValueChange={(v) => setPrioridade(v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            <Button onClick={() => criar.mutate()} disabled={criar.isPending}>
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
