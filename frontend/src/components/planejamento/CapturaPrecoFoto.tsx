import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { registroPrecoService, type AnaliseFotoPreco } from "@/services/registro-preco";

interface Props {
  itemNome: string;
  onAnalisado: (analise: AnaliseFotoPreco, imagemBase64: string) => void;
  onFalha: () => void;
}

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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CapturaPrecoFoto({ itemNome, onAnalisado, onFalha }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [carregando, setCarregando] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setCarregando(true);
    try {
      const [imagemBase64, location] = await Promise.all([toBase64(file), getLocation()]);
      const analise = await registroPrecoService.analisar(imagemBase64, location.latitude, location.longitude);
      onAnalisado(analise, imagemBase64);
    } catch {
      toast.error("Não consegui ler a foto. Tente de novo ou preencha manualmente.");
      onFalha();
    } finally {
      setCarregando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={inputRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => handleFile(e.target.files?.[0])} />
      <Button size="sm" variant="outline" disabled={carregando} onClick={() => inputRef.current?.click()}>
        {carregando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Camera className="h-4 w-4 mr-1" />}
        {carregando ? "Lendo foto..." : `Foto do preço${itemNome ? "" : ""}`}
      </Button>
    </>
  );
}
