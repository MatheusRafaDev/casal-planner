// src/hooks/useItemActions.js
import { useCallback } from 'react';
import { showToast } from '../utils/toastUtils';
import { useConfirm } from '../context/ConfirmContext';

export const useItemActions = (theme, onUpdateItem, onDeleteItem) => {
  const { showConfirm } = useConfirm();

  const handleToggleComprado = useCallback((item) => {
    const novoEstado = !item.comprado;
    onUpdateItem(item.id, { comprado: novoEstado });
    showToast.itemToggled(item.nome, novoEstado, theme);
  }, [onUpdateItem, theme]);

  const handleDeleteItem = useCallback((item) => {
    showConfirm({
      title: 'Excluir Item',
      itemName: item.nome,
      itemType: 'item',
      message: `Tem certeza que deseja excluir o item "${item.nome}"?`,
      onConfirm: async () => {
        await onDeleteItem(item.id);
      }
    });
  }, [onDeleteItem, showConfirm, theme]);

  const handleEditItem = useCallback((item) => {
    onUpdateItem(item.id, { edit: true });
  }, [onUpdateItem]);

  return {
    handleToggleComprado,
    handleDeleteItem,
    handleEditItem,
  };
};