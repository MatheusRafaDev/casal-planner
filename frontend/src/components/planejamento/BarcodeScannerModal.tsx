import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanBarcode, Camera, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { consultarCodigoBarras, type ProdutoBarcodeInfo } from "@/services/barcode";
import { toast } from "sonner";

interface BarcodeScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProdutoDetectado: (produto: ProdutoBarcodeInfo) => void;
}

export function BarcodeScannerModal({
  open,
  onOpenChange,
  onProdutoDetectado,
}: BarcodeScannerModalProps) {
  const [iniciando, setIniciando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "barcode-scanner-viewport";

  const pararScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Ignora erros ao parar
      }
      scannerRef.current = null;
    }
  }, []);

  const processarCodigo = useCallback(
    async (codigo: string) => {
      setBuscando(true);
      await pararScanner();

      try {
        toast.loading("Buscando produto pelo código de barras...", { id: "barcode-lookup" });
        const info = await consultarCodigoBarras(codigo);

        if (info) {
          toast.success(
            info.nome !== `Produto EAN ${codigo}`
              ? `Produto identificado: ${info.nome}`
              : `Código lido: ${codigo}`,
            { id: "barcode-lookup" },
          );
          onProdutoDetectado(info);
          onOpenChange(false);
        } else {
          toast.error("Produto não encontrado na base de dados.", { id: "barcode-lookup" });
        }
      } catch {
        toast.error("Erro ao buscar produto pelo código de barras.", { id: "barcode-lookup" });
      } finally {
        setBuscando(false);
      }
    },
    [onOpenChange, onProdutoDetectado, pararScanner],
  );

  useEffect(() => {
    if (!open) {
      pararScanner();
      return;
    }

    let isMounted = true;

    async function iniciarScanner() {
      setIniciando(true);
      try {
        // Formatos suportados: EAN-13, EAN-8, UPC-A, UPC-E, CODE 128
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
        ];

        const html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.5,
          },
          async (decodedText) => {
            if (!isMounted) return;
            // Evita disparar múltiplas vezes
            if (navigator.vibrate) navigator.vibrate(100);
            await processarCodigo(decodedText);
          },
          () => {
            // Callback contínuo de frame sem código (ignorar)
          },
        );
      } catch (err) {
        console.warn("Não foi possível iniciar câmera:", err);
      } finally {
        if (isMounted) setIniciando(false);
      }
    }

    // Aguarda o modal ser renderizado no DOM
    const t = setTimeout(() => {
      iniciarScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(t);
      pararScanner();
    };
  }, [open, pararScanner, processarCodigo]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    processarCodigo(codigoManual.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold font-display">
            <ScanBarcode className="w-5 h-5 text-primary" />
            Escanear Código de Barras (EAN)
          </DialogTitle>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-background aspect-[4/3] flex items-center justify-center">
          {/* Container onde o html5-qrcode monta o vídeo */}
          <div id={readerElementId} className="w-full h-full object-cover" />

          {/* Mira / Retículo visual do scanner */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            <div className="relative w-64 h-36 border-2 border-primary/70 rounded-md shadow-[0_0_20px_rgba(94,106,210,0.3)]">
              {/* Linha animada do scanner */}
              <div className="absolute inset-x-0 h-0.5 bg-primary animate-pulse top-1/2 -translate-y-1/2" />
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground mt-3 bg-background/80 px-2 py-0.5 rounded-full border border-border/50">
              Aponte para o código de barras da embalagem
            </p>
          </div>

          {/* Loading States */}
          {(iniciando || buscando) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs font-medium text-foreground">
                {buscando ? "Consultando catálogo Open Food Facts..." : "Iniciando câmera..."}
              </p>
            </div>
          )}
        </div>

        {/* Fallback para digitação manual */}
        <form onSubmit={handleManualSubmit} className="flex gap-2 mt-2">
          <Input
            value={codigoManual}
            onChange={(e) => setCodigoManual(e.target.value)}
            placeholder="Ou digite o código (ex: 7891000100103)"
            className="text-xs font-mono"
          />
          <Button type="submit" size="sm" disabled={buscando || !codigoManual.trim()}>
            Buscar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
