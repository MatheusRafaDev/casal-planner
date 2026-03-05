import { useState, useCallback } from 'react';
import { desformatarMoeda } from '../utils/mascaras';

export const useItemValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validarCampo = useCallback((campo, valor, precoFormatado = null) => {
    switch (campo) {
      case 'nome':
        if (!valor || valor.trim() === '') {
          return 'Nome é obrigatório';
        }
        if (valor.length < 3) {
          return 'Nome deve ter pelo menos 3 caracteres';
        }
        if (valor.length > 100) {
          return 'Nome deve ter no máximo 100 caracteres';
        }
        return '';

      case 'marca':
        if (valor && valor.length > 50) {
          return 'Marca deve ter no máximo 50 caracteres';
        }
        return '';

      case 'preco':
        if (!valor || valor === 0) {
          return 'Preço é obrigatório';
        }
        if (valor <= 0) {
          return 'Preço deve ser maior que zero';
        }
        if (valor > 9999999.99) {
          return 'Preço muito alto (máximo: R$ 9.999.999,99)';
        }
        return '';

      case 'quantidade':
        if (valor < 1) {
          return 'Quantidade deve ser pelo menos 1';
        }
        if (valor > 999999) {
          return 'Quantidade máxima é 999.999';
        }
        if (!Number.isInteger(Number(valor))) {
          return 'Quantidade deve ser um número inteiro';
        }
        return '';

      default:
        return '';
    }
  }, []);

  const validarFormulario = useCallback((formData, precoFormatado) => {
    return {
      nome: validarCampo('nome', formData.nome),
      marca: validarCampo('marca', formData.marca),
      preco: validarCampo('preco', formData.preco),
      quantidade: validarCampo('quantidade', formData.quantidade)
    };
  }, [validarCampo]);

  const handleBlur = useCallback((field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ 
      ...prev, 
      [field]: validarCampo(field, value) 
    }));
  }, [validarCampo]);

  const handleChange = useCallback((field, value, wasTouched) => {
    if (wasTouched) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: validarCampo(field, value) 
      }));
    }
  }, [validarCampo]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(erro => erro !== '');
  }, [errors]);

  return {
    errors,
    touched,
    validarFormulario,
    handleBlur,
    handleChange,
    resetValidation,
    setErrors,
    setTouched,
    hasErrors
  };
};