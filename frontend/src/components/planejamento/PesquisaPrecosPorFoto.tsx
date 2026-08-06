import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { registroPrecoService, type AnaliseFotoPreco } from "@/services/registro-preco";

interface Props {
  disabled?: boolean;
  onResultado: (resultado: AnaliseFotoPreco) => void;
  onFalha: () => void;
}

type Etapa = "Capturando localização..." | "Identificando produto..." | null;

function getLocation(): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 60_000 },
    );
  });
}

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
      // Fallback
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
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

    setEtapa("Capturando localização...");
    try {
      const [imagemBase64, location] = await Promise.all([toBase64(file), getLocation()]);
      
      setEtapa("Identificando produto...");
      const resultado = await registroPrecoService.analisar(
        imagemBase64,
        location.latitude,
        location.longitude
      );
      
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
