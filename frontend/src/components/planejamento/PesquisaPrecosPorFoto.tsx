import { useRef, useState } from "react";
import { Camera, Loader2, UploadCloud, X, Check, AlertCircle, ImageIcon, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { registroPrecoService, type AnaliseFotoPreco } from "@/services/registro-preco";
import { toTitleCase } from "@/lib/utils";

interface Props {
  disabled?: boolean;
  onResultado: (resultado: AnaliseFotoPreco) => void;
  onFalha: () => void;
}

type Estado = "idle" | "processing" | "success" | "error";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    (async () => {
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
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const MAX_SIZE = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height = Math.round((height * MAX_SIZE) / width);
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width = Math.round((width * MAX_SIZE) / height);
                height = MAX_SIZE;
              }
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
    })();
  });
}

export function PesquisaPrecosPorFoto({ disabled = false, onResultado, onFalha }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [etapaTexto, setEtapaTexto] = useState("");
  const [resultado, setResultado] = useState<AnaliseFotoPreco | null>(null);
  const [erroMsg, setErroMsg] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, envie uma imagem válida.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setEstado("processing");
    setEtapaTexto("Analisando a foto com IA...");
    setErroMsg("");
    
    try {
      const imagemBase64 = await toBase64(file);
      let res = await registroPrecoService.analisar(imagemBase64);

      res = {
        ...res,
        produtoNome: toTitleCase(res.produtoNome),
        marca: toTitleCase(res.marca),
        modelo: toTitleCase(res.modelo),
        unidade: toTitleCase(res.unidade),
        endereco: toTitleCase(res.endereco),
        nomeMercado: toTitleCase(res.nomeMercado),
      };

      setResultado(res);
      setEstado("success");
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Não conseguimos extrair as informações da foto.";
      setErroMsg(mensagem);
      setEstado("error");
      onFalha();
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const resetar = () => {
    setEstado("idle");
    setPreview(null);
    setResultado(null);
    setErroMsg("");
  };

  const confirmar = () => {
    if (resultado) {
      onResultado(resultado);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || estado === "processing") return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (estado === "idle" || estado === "error") {
    return (
      <div 
        className="w-full flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer text-center group"
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={disabled}
        />
        
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
          <Camera className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold">Tirar foto ou enviar imagem</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Nossa IA tentará identificar o produto e a loja para facilitar sua pesquisa.
        </p>

        {estado === "error" && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 max-w-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-left leading-tight">{erroMsg}</span>
          </div>
        )}
      </div>
    );
  }

  if (estado === "processing") {
    return (
      <div className="w-full flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border bg-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <div className="h-full bg-primary animate-pulse w-1/2 rounded-full" />
        </div>
        
        <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border bg-black/5 relative">
          {preview && (
            <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-50" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-2">
          <h3 className="text-base font-semibold">{etapaTexto}</h3>
          <p className="text-sm text-muted-foreground">Isso deve levar apenas alguns segundos...</p>
        </div>
      </div>
    );
  }

  if (estado === "success" && resultado) {
    return (
      <div className="w-full rounded-2xl border bg-card overflow-hidden flex flex-col">
        {/* Header e Preview */}
        <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-6 bg-muted/10 border-b">
          <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border bg-background relative group">
            {preview && <img src={preview} alt="Preview" className="w-full h-full object-cover" />}
            <button 
              onClick={resetar}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1"
            >
              <X className="w-4 h-4" /> Trocar
            </button>
          </div>
          <div className="flex-1 space-y-1">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 mb-2 border-0">
              <Check className="w-3 h-3 mr-1" /> Produto Identificado
            </Badge>
            <h3 className="text-lg font-semibold leading-tight">{resultado.produtoNome}</h3>
            <p className="text-sm text-muted-foreground">Confirme os dados extraídos antes de pesquisar os preços.</p>
          </div>
        </div>

        {/* Formulário de Confirmação */}
        <div className="p-4 sm:p-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nome do Produto</Label>
            <Input 
              value={resultado.produtoNome} 
              onChange={e => setResultado({...resultado, produtoNome: e.target.value})} 
              className="font-medium bg-muted/30"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Marca</Label>
            <Input 
              value={resultado.marca} 
              onChange={e => setResultado({...resultado, marca: e.target.value})}
              placeholder="Desconhecida" 
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Modelo</Label>
            <Input 
              value={resultado.modelo} 
              onChange={e => setResultado({...resultado, modelo: e.target.value})}
              placeholder="Desconhecido" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Loja / Mercado</Label>
            <Input 
              value={resultado.nomeMercado} 
              onChange={e => setResultado({...resultado, nomeMercado: e.target.value})}
              placeholder="Desconhecida" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tamanho / Unidade</Label>
            <Input 
              value={resultado.unidade} 
              onChange={e => setResultado({...resultado, unidade: e.target.value})}
              placeholder="Ex: 500g, 1L" 
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row justify-end gap-3">
          <Button variant="ghost" onClick={resetar}>Descartar e Tentar Novamente</Button>
          <Button onClick={confirmar} className="gap-2">
            <Search className="w-4 h-4" /> Buscar Preços
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
