import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  pesquisaPrecosService,
  type PesquisaPrecoPorFotoResposta,
} from "@/services/pesquisa-precos";

interface Props {
  disabled?: boolean;
  onResultado: (resultado: PesquisaPrecoPorFotoResposta) => void;
  onFalha: () => void;
}

type Etapa = "Identificando produto..." | "Buscando preços..." | null;

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PesquisaPrecosPorFoto({ disabled = false, onResultado, onFalha }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [etapa, setEtapa] = useState<Etapa>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;

    setEtapa("Identificando produto...");
    const etapaBuscaTimer = window.setTimeout(() => setEtapa("Buscando preços..."), 800);

    try {
      const resultado = await pesquisaPrecosService.analisarFoto(await toBase64(file));
      onResultado(resultado);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não consegui analisar a foto. Tente novamente ou digite manualmente.";
      toast.error(mensagem);
      onFalha();
    } finally {
      window.clearTimeout(etapaBuscaTimer);
      setEtapa(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={disabled || !!etapa}
        onClick={() => inputRef.current?.click()}
        aria-label="Pesquisar preços com uma foto"
        title="Pesquisar preços com uma foto"
      >
        {etapa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>
      {etapa && (
        <span aria-live="polite" className="whitespace-nowrap text-xs text-muted-foreground">
          {etapa}
        </span>
      )}
    </div>
  );
}
