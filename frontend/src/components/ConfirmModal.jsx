import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useConfirm } from '../context/ConfirmContext';
import { AlertTriangle, X } from 'lucide-react';
import {
  ConfirmOverlay,
  ConfirmContainer,
  ConfirmHeader,
  CloseButton,
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
  const contentRef = useRef(null);
  const { isOpen, title, message, itemName, itemType, onConfirm } = confirmDialog;

  // ✅ Previne scroll do body - SEM position fixed, apenas overflow hidden
  useEffect(() => {
    if (!isOpen) return;
    
    // Apenas bloqueia o scroll, mantém a posição
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Remove o bloqueio, a posição permanece a mesma
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC + focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!loading) hideConfirm();
        return;
      }
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => contentRef.current?.focus(), 50);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, hideConfirm]);

  const handleOverlayClick = (e) => {
    if (loading) return;
    if (e.target === e.currentTarget) hideConfirm();
  };

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setLoading(true);
    try {
      await onConfirm();
      toast.success(`"${itemName}" excluído com sucesso!`, {
        duration: 3000,
        style: { borderRadius: '12px', background: '#28a745', color: '#fff' },
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
    <ConfirmOverlay onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={title}>
      <ConfirmContainer theme={theme} ref={contentRef} tabIndex={-1}>
        <ConfirmHeader theme={theme}>
          <h2>{title || 'Confirmar exclusão'}</h2>
          <CloseButton 
            onClick={hideConfirm} 
            theme={theme} 
            title="Fechar (ESC)" 
            aria-label="Fechar modal"
            disabled={loading}
          >
            <X size={20} />
          </CloseButton>
        </ConfirmHeader>
        <ConfirmContent>
          <WarningBox theme={theme}>
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
      </ConfirmContainer>
    </ConfirmOverlay>
  );
};

export default ConfirmModal;