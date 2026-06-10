import { useCallback } from 'react';
import { showToast } from '../utils/toastUtils';
import { useConfirm } from '../context/ConfirmContext';

export const useCategoryActions = (categoria, itens, theme, onDeleteCategoria, onEditCategoria) => {
  const { showConfirm } = useConfirm();

  const handleDeleteCategoria = useCallback(() => {
    const mensagem = itens.length > 0 
      ? `Esta categoria possui ${itens.length} item(ns). Deseja realmente excluí-la?`
      : 'Tem certeza que deseja excluir esta categoria?';

    showConfirm({
      title: 'Excluir Categoria',
      itemName: categoria.nome,
      itemType: 'categoria',
      message: mensagem,
      onConfirm: async () => {
        try {
          await onDeleteCategoria(categoria.id);
        } catch (error) {
          showToast.error('Erro ao excluir categoria', theme);
        }
      }
    });
  }, [categoria, itens, theme, onDeleteCategoria, showConfirm]);

  const handleEditCategoria = useCallback(() => {
    if (onEditCategoria) {
      onEditCategoria(categoria);
    }
  }, [categoria, onEditCategoria]);

  return {
    handleDeleteCategoria,
    handleEditCategoria
  };
};