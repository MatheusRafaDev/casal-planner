
import React, { useState } from 'react';
import Modal from './Modal';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { useConfirm } from '../context/ConfirmContext';

const ConfirmContent = styled.div`
  padding: 1rem 0;
`;

const Message = styled.p`
  color: ${props => props.theme.text};
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const WarningText = styled.p`
  color: #dc3545;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.border};
  color: ${props => props.theme.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.textLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
  
  &:hover:not(:disabled) {
    background: #c82333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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
        icon: '',
        style: {
          borderRadius: '12px',
          background: theme === 'dark' ? '#1e1e1e' : '#dc3545',
          color: '#fff',
        },
      });
      
      hideConfirm();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error(`❌ Erro ao excluir ${itemType}. Tente novamente.`, {
        duration: 4000,
        icon: '',
        style: {
          borderRadius: '12px',
          background: '#dc3545',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    hideConfirm();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      theme={theme}
      disableOutsideClick={true}
    >
      <ConfirmContent>
        <Message theme={theme}>{message}</Message>
        <WarningText>
          Esta ação não pode ser desfeita
        </WarningText>
        <ButtonGroup>
          <CancelButton 
            onClick={handleCancel} 
            theme={theme} 
            disabled={loading}
          >
            Cancelar
          </CancelButton>
          <DeleteButton 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? 'Excluindo...' : 'Sim, excluir'}
          </DeleteButton>
        </ButtonGroup>
      </ConfirmContent>
    </Modal>
  );
};

export default ConfirmModal;