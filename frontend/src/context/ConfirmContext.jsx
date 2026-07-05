import React, { createContext, useContext, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
};

// ─── Styled Components ───────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.18s ease;
`;

const Dialog = styled.div`
  background: ${p => p.theme?.card || '#27272A'};
  border: 1px solid ${p => p.$isDanger ? (p.theme?.error || '#F87171') + '40' : (p.theme?.border || '#3F3F46')};
  border-radius: 1.25rem;
  padding: 1.75rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: ${slideUp} 0.22s ease;
`;

const IconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${p => p.$isDanger ? (p.theme?.error || '#F87171') + '18' : (p.theme?.warning || '#FBBF24') + '18'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${p => p.$isDanger ? (p.theme?.error || '#F87171') : (p.theme?.warning || '#FBBF24')};
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${p => p.theme?.text || '#F4F4F5'};
  margin: 0 0 0.5rem;
`;

const Message = styled.p`
  font-size: 0.875rem;
  color: ${p => p.theme?.textSoft || '#D4D4D8'};
  margin: 0 0 1.5rem;
  line-height: 1.6;
`;

const ItemName = styled.span`
  display: block;
  font-weight: 600;
  color: ${p => p.$isDanger ? (p.theme?.error || '#F87171') : (p.theme?.text || '#F4F4F5')};
  font-size: 0.9rem;
  background: ${p => p.$isDanger ? (p.theme?.error || '#F87171') + '12' : (p.theme?.hover || '#3F3F46')};
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  word-break: break-word;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;

  @media (max-width: 400px) {
    flex-direction: column-reverse;
  }
`;

const CancelBtn = styled.button`
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  border: 1.5px solid ${p => p.theme?.border || '#3F3F46'};
  background: transparent;
  color: ${p => p.theme?.textSoft || '#D4D4D8'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: ${p => p.theme?.hover || '#3F3F46'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 400px) {
    width: 100%;
  }
`;

const ConfirmBtn = styled.button`
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  background: ${p => p.$isDanger ? (p.theme?.error || '#F87171') : (p.theme?.primary || '#A78BFA')};
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 400px) {
    width: 100%;
  }
`;

// ─── Componente de Dialog Global ─────────────────────────────────────────────

const GlobalConfirmDialog = ({ confirmDialog, hideConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!confirmDialog.isOpen) return null;

  const {
    title,
    message,
    itemName,
    itemType,
    isDanger,
    confirmText,
    cancelText,
    onConfirm,
    theme,
  } = confirmDialog;

  const handleConfirm = async () => {
    if (!onConfirm) { hideConfirm(); return; }
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      hideConfirm();
    }
  };

  const handleCancel = () => {
    if (loading) return;
    hideConfirm();
  };

  return (
    <Overlay onClick={handleCancel}>
      <Dialog
        theme={theme}
        $isDanger={isDanger}
        onClick={e => e.stopPropagation()}
      >
        <IconWrapper theme={theme} $isDanger={isDanger}>
          <AlertTriangle size={24} />
        </IconWrapper>

        <Title theme={theme}>{title || `Excluir ${itemType}`}</Title>

        {itemName && (
          <ItemName theme={theme} $isDanger={isDanger}>
            {itemName}
          </ItemName>
        )}

        {message && <Message theme={theme}>{message}</Message>}

        <Actions>
          <CancelBtn theme={theme} onClick={handleCancel} disabled={loading}>
            {cancelText || 'Cancelar'}
          </CancelBtn>
          <ConfirmBtn
            theme={theme}
            $isDanger={isDanger}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Aguarde…' : (confirmText || 'Confirmar')}
          </ConfirmBtn>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const ConfirmProvider = ({ children }) => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    itemType: '',
    isDanger: false,
    confirmText: '',
    cancelText: '',
    onConfirm: null,
    theme: null,
  });

  const showConfirm = ({
    title,
    message,
    itemName,
    itemType,
    isDanger,
    confirmText,
    cancelText,
    onConfirm,
    theme,
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: title || `Excluir ${itemType}`,
      message: message || `Tem certeza que deseja excluir ${itemType} "${itemName}"?`,
      itemName,
      itemType,
      isDanger: isDanger ?? true,
      confirmText,
      cancelText,
      onConfirm,
      theme,
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  return (
    <ConfirmContext.Provider value={{ confirmDialog, showConfirm, hideConfirm }}>
      {children}
      <GlobalConfirmDialog confirmDialog={confirmDialog} hideConfirm={hideConfirm} />
    </ConfirmContext.Provider>
  );
};