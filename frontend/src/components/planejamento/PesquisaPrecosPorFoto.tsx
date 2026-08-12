import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { registroPrecoService, type AnaliseFotoPreco } from "@/services/registro-preco";
import { toTitleCase } from "@/lib/utils";

interface Props {
  disabled?: boolean;
  onResultado: (resultado: AnaliseFotoPreco) => void;
  onFalha: () => void;
}

type Etapa = "Identificando produto..." | null;

function toBase64(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const maxSize = 1600;
      let { width, height } = bitmap;
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context is null");
      
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", 0.85));
    } catch (error) {
      // Fallback via FileReader + canvas para redimensionar
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) { height = Math.round(height * MAX_SIZE / width); width = MAX_SIZE; }
          } else {
            if (height > MAX_SIZE) { width = Math.round(width * MAX_SIZE / height); height = MAX_SIZE; }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error("Failed to load image"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
}

export function PesquisaPrecosPorFoto({ disabled = false, onResultado, onFalha }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [etapa, setEtapa] = useState<Etapa>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;

    setEtapa("Identificando produto...");
    try {
      const imagemBase64 = await toBase64(file);
      let resultado = await registroPrecoService.analisar(imagemBase64);
      
      resultado = {
        ...resultado,
        produtoNome: toTitleCase(resultado.produtoNome),
        marca: toTitleCase(resultado.marca),
        modelo: toTitleCase(resultado.modelo),
        unidade: toTitleCase(resultado.unidade),
        endereco: toTitleCase(resultado.endereco),
        nomeMercado: toTitleCase(resultado.nomeMercado),
      };
      
      onResultado(resultado);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não consegui analisar a foto. Tente novamente ou digite manualmente.";
      toast.error(mensagem);
      onFalha();
    } finally {
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
