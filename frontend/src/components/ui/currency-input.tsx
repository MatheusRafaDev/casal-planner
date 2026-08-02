import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { maskBRL, parseBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  /** Valor numérico controlado (ex: 1234.56) */
  value: number | string | null | undefined;
  /** Callback com o valor numérico já parseado */
  onValueChange: (value: number) => void;
  /** Callback com a string mascarada (opcional) */
  onMaskedChange?: (masked: string) => void;
}

/**
 * Input monetário no padrão brasileiro (R$ 1.234,56).
 * Aceita `value` numérico e devolve `onValueChange(number)`.
 */
export function CurrencyInput({
  value,
  onValueChange,
  onMaskedChange,
  className,
  placeholder = "R$ 0,00",
  ...props
}: CurrencyInputProps) {
  // Inicializa a máscara a partir do valor numérico recebido
  const initMask = () => {
    const n = Number(value);
    if (!value && value !== 0) return "";
    if (isNaN(n) || n === 0) return "";
    // Converte o número em string de centavos e passa pelo maskBRL
    const centavos = String(Math.round(n * 100));
    return maskBRL(centavos);
  };

  const [masked, setMasked] = useState<string>(initMask);
  // Guarda o ref para sincronizar quando o value externo mudar significativamente
  const lastExternalValue = useRef<number | null>(null);

  // Sincroniza quando o pai força um novo valor numérico
  const numValue = Number(value);
  if (!isNaN(numValue) && numValue !== lastExternalValue.current) {
    lastExternalValue.current = numValue;
    const centavos = numValue === 0 ? "" : String(Math.round(numValue * 100));
    const newMask = centavos ? maskBRL(centavos) : "";
    // Só re-seta se diferente (evita loop)
    if (newMask !== masked) setMasked(newMask);
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const newMasked = maskBRL(raw);
      setMasked(newMasked);
      const parsed = parseBRL(newMasked);
      lastExternalValue.current = parsed;
      onValueChange(parsed);
      onMaskedChange?.(newMasked);
    },
    [onValueChange, onMaskedChange],
  );

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        inputMode="numeric"
        value={masked}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn("pl-3", className)}
      />
    </div>
  );
}
