
import { useState, useCallback } from 'react';
import { categoriasService } from '../services/categoriasService';

export const useCategoryValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validarNome = useCallback((valor) => {
    if (!valor || valor.trim() === '') {
      return 'Nome da categoria é obrigatório';
    }
    if (valor.length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres';
    }
    if (valor.length > 30) {
      return 'Nome deve ter no máximo 30 caracteres';
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) {
      return 'Nome deve conter apenas letras e espaços';
    }
    return '';
  }, []);

  // Usa o método cache-aware do service: não dispara request de rede
  // quando as categorias já foram carregadas nos últimos 30 s.
  const verificarNomeExistente = useCallback(async (nome, categoriaId = null) => {
    try {
      return await categoriasService.verificarNomeExistente(nome, categoriaId);
    } catch (error) {
      console.error('Erro ao verificar nome existente:', error);
      return false;
    }
  }, []);

  const validateField = useCallback((field, value) => {
    if (field === 'nome') {
      return validarNome(value);
    }
    return '';
  }, [validarNome]);

  const handleBlur = useCallback((field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  }, [validateField]);

  const handleChange = useCallback((field, value, wasTouched) => {
    if (wasTouched) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  }, [validateField]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validarNome,
    verificarNomeExistente,
    validateField,
    handleBlur,
    handleChange,
    resetValidation,
    setErrors,
    setTouched,
  };
};