import { useState, useCallback, useEffect } from 'react';

export const usePriceFormat = (initialPrice = 0) => {
  const [rawValue, setRawValue] = useState(() => {
    return typeof initialPrice === 'number' ? initialPrice : Number(initialPrice) || 0;
  });
  
  const [formattedValue, setFormattedValue] = useState('');

  useEffect(() => {
    if (rawValue > 0) {
      setFormattedValue(formatarMoedaBR(rawValue));
    } else {
      setFormattedValue('');
    }
  }, [rawValue]);

  const formatarMoedaBR = (valor) => {
    return Number(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatarEnquantoDigita = (digits) => {
    if (digits.length === 0) return '';
    const valorEmCentavos = parseInt(digits) / 100;
    return valorEmCentavos.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePriceChange = useCallback((e) => {
    const inputValue = e.target.value;
    const apenasNumeros = inputValue.replace(/\D/g, '');
    
    if (apenasNumeros.length === 0) {
      setFormattedValue('');
      setRawValue(0);
      return { formatted: '', raw: 0 };
    }

    const formatado = formatarEnquantoDigita(apenasNumeros);
    const valorEmReais = parseInt(apenasNumeros) / 100;
    
    setFormattedValue(formatado);
    setRawValue(valorEmReais);
    
    return { formatted: formatado, raw: valorEmReais };
  }, []);

  const handlePriceBlur = useCallback(() => {
    if (rawValue > 0) {
      setFormattedValue(formatarMoedaBR(rawValue));
    }
  }, [rawValue]);

  const setPrice = useCallback((value) => {
    const valorNumerico = typeof value === 'number' ? value : Number(value) || 0;
    setRawValue(valorNumerico);
    if (valorNumerico > 0) {
      setFormattedValue(formatarMoedaBR(valorNumerico));
    } else {
      setFormattedValue('');
    }
  }, []);

  const resetPrice = useCallback(() => {
    setRawValue(0);
    setFormattedValue('');
  }, []);

  return {
    rawValue,
    formattedValue,
    handlePriceChange,
    handlePriceBlur,
    setPrice,
    resetPrice
  };
};