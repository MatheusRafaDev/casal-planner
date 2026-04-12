import React, { useState } from 'react';
import Modal from './Modal';
import styled, { keyframes } from 'styled-components';
import toast from 'react-hot-toast';
import { useConfirm } from '../context/ConfirmContext';
import { AlertTriangle } from 'lucide-react';

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
`;

const ConfirmContent = styled.div`
  padding: 0.5rem 0 0;
`;

const WarningBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 0.875rem;
  margin-bottom: 1.5rem;
`;

const WarningIcon = styled.div`
  flex-shrink: 0;
  color: #dc3545;
  margin-top: 1px;
`;

const WarningTexts = styled.div`
  flex: 1;
`;

const Message = styled.p`
  color: ${props => props.theme?.text || '#1a1a1a'};
  font-size: 0.9375rem;
  margin: 0 0 0.25rem;
  line-height: 1.5;
  font-weight: 500;
`;

const WarningNote = styled.p`
  color: #dc3545;
  font-size: 0.8125rem;
  margin: 0;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.8125rem 1.5rem;
  background: ${props => props.theme?.border || '#f0f0f0'};
  color: ${props => props.theme?.text || '#333'};
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.18s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme?.hover || '#e0e0e0'};
    transform: translateY(-1px);
  }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid ${props => props.theme?.primary || '#e91e8c'}; outline-offset: 2px; }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 0.8125rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.18s ease;
  
  &:hover:not(:disabled) {
    background: #c82333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.35);
  }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #dc3545; outline-offset: 2px; }

  &.shaking { animation: ${shake} 0.4s ease; }
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
