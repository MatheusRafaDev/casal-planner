// src/hooks/useCategoryValidation.js
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

  const verificarNomeExistente = useCallback(async (nome, categoriaId = null) => {
    try {
      const categorias = await categoriasService.listar();
      return categorias.some(cat => 
        cat.nome.toLowerCase() === nome.toLowerCase() &&
        (!categoriaId || cat.id !== categoriaId)
      );
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