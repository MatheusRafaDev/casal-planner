import React, { useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { useConfirm } from '../context/ConfirmContext';
import { AlertTriangle } from 'lucide-react';
import {
  ConfirmContent,
  WarningBox,
  WarningIcon,
  WarningTexts,
  Message,
  WarningNote,
  ButtonGroup,
  CancelButton,
  DeleteButton
} from '../styles/components/ConfirmModalStyles.jsx';

const ConfirmModal = ({ theme }) => {
  const { confirmDialog, hideConfirm } = useConfirm();
  const [loading, setLoading] = useState(false);
  const { isOpen, title, message, itemName, itemType, onConfirm } = confirmDialog;

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      toast.success(`"${itemName}" excluído com sucesso!`, {
        duration: 3000,
        style: { borderRadius: '12px', background: '#dc3545', color: '#fff' },
      });
      hideConfirm();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error(`Erro ao excluir ${itemType}. Tente novamente.`, {
        duration: 4000,
        style: { borderRadius: '12px', background: '#dc3545', color: '#fff' },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={hideConfirm} title={title || 'Confirmar exclusão'} theme={theme} disableOutsideClick={loading}>
      <ConfirmContent>
        <WarningBox>
          <WarningIcon><AlertTriangle size={20} /></WarningIcon>
          <WarningTexts>
            <Message theme={theme}>{message}</Message>
            <WarningNote>⚠️ Esta ação não pode ser desfeita</WarningNote>
          </WarningTexts>
        </WarningBox>
        <ButtonGroup>
          <CancelButton onClick={hideConfirm} theme={theme} disabled={loading}>
            Cancelar
          </CancelButton>
          <DeleteButton onClick={handleConfirm} disabled={loading}>
            {loading ? 'Excluindo…' : 'Sim, excluir'}
          </DeleteButton>
        </ButtonGroup>
      </ConfirmContent>
    </Modal>
  );
};

export default ConfirmModal;