import { useCallback } from 'react';
import { showToast } from '../utils/toastUtils';
import { useConfirm } from '../context/ConfirmContext';

export const useItemActions = (theme, onToggleComprado, onUpdateItem, onDeleteItem) => {
  const { showConfirm } = useConfirm();

  const handleToggleComprado = useCallback((itemId, compradoAtual) => {
    const novoEstado = !compradoAtual;
    onToggleComprado(itemId, novoEstado);
  }, [onToggleComprado]);

  const handleDeleteItem = useCallback((item) => {
    showConfirm({
      title: 'Excluir Item',
      itemName: item.nome,
      itemType: 'item',
      message: `Tem certeza que deseja excluir o item "${item.nome}"?`,
      onConfirm: async () => {
        try {
          await onDeleteItem(item.id);
        } catch (error) {
          showToast.error('Erro ao excluir item', theme);
        }
      }
    });
  }, [onDeleteItem, showConfirm, theme]);

  const handleEditItem = useCallback((item) => {
    onUpdateItem(item.id);
  }, [onUpdateItem]);

  return {
    handleToggleComprado,
    handleDeleteItem,
    handleEditItem,
  };
};