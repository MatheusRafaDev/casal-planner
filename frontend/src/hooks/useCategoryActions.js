
import { useCallback } from 'react';
import { showToast } from '../utils/toastUtils';

export const useCategoryActions = (categoria, itens, theme, onDeleteCategoria, onEditCategoria) => {
  const handleDeleteCategoria = useCallback(async () => {
    if (categoria.isPadrao) {
      showToast.warning('Esta categoria não pode ser excluída pois é padrão do sistema', theme);
      return;
    }

    const mensagem = itens.length > 0 
      ? `Esta categoria possui ${itens.length} item(ns). Deseja realmente excluí-la?`
      : 'Tem certeza que deseja excluir esta categoria?';

    if (window.confirm(mensagem)) {
      try {
        await onDeleteCategoria(categoria.id);
        showToast.success(`Categoria "${categoria.nome}" excluída com sucesso!`, theme);
      } catch (error) {
        showToast.error('Erro ao excluir categoria', theme);
      }
    }
  }, [categoria, itens, theme, onDeleteCategoria]);

  const handleEditCategoria = useCallback(() => {
    if (categoria.isPadrao) {
      showToast.warning('Esta categoria não pode ser editada pois é padrão do sistema', theme);
      return;
    }
    
    if (onEditCategoria) {
      onEditCategoria(categoria);
    }
  }, [categoria, theme, onEditCategoria]);

  return {
    handleDeleteCategoria,
    handleEditCategoria
  };
};