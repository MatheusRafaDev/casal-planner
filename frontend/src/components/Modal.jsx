import React, { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  CloseButton
} from '../styles/components/ModalStyles';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  disableOutsideClick = false, 
  theme,
  showToastOnClose = false,
  toastMessage = '',
  toastType = 'success'
}) => {
  const contentRef = useRef(null);

  const handleClose = useCallback(() => {
    if (showToastOnClose && toastMessage) {
      const baseStyle = { borderRadius: '12px' };
      switch (toastType) {
        case 'error':
          toast.error(toastMessage, {
            duration: 4000, icon: '❌',
            style: { ...baseStyle, background: '#dc3545', color: '#fff' },
          });
          break;
        case 'warning':
          toast(toastMessage, {
            duration: 4000, icon: '⚠️',
            style: { ...baseStyle, background: '#ffc107', color: '#000' },
          });
          break;
        default:
          toast.success(toastMessage, {
            duration: 3000, icon: '',
            style: {
              ...baseStyle,
              background: theme === 'dark' ? '#1e1e1e' : '#4CAF50',
              color: theme === 'dark' ? '#e0e0e0' : '#fff',
            },
          });
      }
    }
    onClose();
  }, [showToastOnClose, toastMessage, toastType, theme, onClose]);

  // Trava scroll do body quando modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // ESC + focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); handleClose(); return; }
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => contentRef.current?.focus(), 50);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleOverlayClick = (e) => {
    if (disableOutsideClick) return;
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={title}>
      <ModalContent theme={theme} ref={contentRef} tabIndex={-1}>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={handleClose} theme={theme} title="Fechar (ESC)" aria-label="Fechar modal">
            ✕
          </CloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
