// src/hooks/useCategoryActions.js
import { useCallback } from 'react';
import { showToast } from '../utils/toastUtils';
import { useConfirm } from '../context/ConfirmContext';

export const useCategoryActions = (categoria, itens, theme, onDeleteCategoria) => {
  const { showConfirm } = useConfirm();

  const handleDeleteCategoria = useCallback(() => {
    if (categoria.isPadrao) {
      showToast.error('Categoria padrão não pode ser excluída', theme);
      return;
    }

    if (itens.length > 0) {
      showToast.error(
        `Não é possível excluir a categoria "${categoria.nome}" pois possui ${itens.length} item(ns) vinculado(s)`,
        theme
      );
      return;
    }

    showConfirm({
      title: 'Excluir Categoria',
      itemName: categoria.nome,
      itemType: 'categoria',
      message: `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
      onConfirm: async () => {
        await onDeleteCategoria(categoria.id);
        showToast.success(`Categoria "${categoria.nome}" excluída com sucesso!`, theme);
      }
    });
  }, [categoria, itens, onDeleteCategoria, showConfirm, theme]);

  return {
    handleDeleteCategoria,
  };
};