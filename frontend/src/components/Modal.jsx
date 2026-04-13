import React, { useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  ModalOverlay,
  ModalContent,
  SheetHandle,
  ModalHeader,
  CloseButton,
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
  toastType = 'success',
}) => {
  const contentRef = useRef(null);
  // Guarda a posição de scroll ANTES de abrir (restaura depois)
  const scrollYRef = useRef(0);

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
            duration: 3000, icon: '✅',
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

  // Trava scroll do body — método robusto que preserva posição
  useEffect(() => {
    if (!isOpen) return;
    scrollYRef.current = window.scrollY;
    // Usa CSS var para que o body saiba onde estava
    document.documentElement.style.setProperty('--scroll-y', `-${scrollYRef.current}px`);
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.style.removeProperty('--scroll-y');
      // Restaura posição silenciosamente
      window.scrollTo({ top: scrollYRef.current, behavior: 'instant' });
    };
  }, [isOpen]);

  // ESC + focus trap acessível
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); handleClose(); return; }
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
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
    // Foca no modal com pequeno delay para deixar a animação de entrada terminar
    const focusTimer = setTimeout(() => contentRef.current?.focus(), 80);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen, handleClose]);

  const handleOverlayClick = (e) => {
    if (disableOutsideClick) return;
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <ModalContent theme={theme} ref={contentRef} tabIndex={-1}>
        {/* Handle de arraste visível apenas em mobile */}
        <SheetHandle theme={theme} />
        <ModalHeader theme={theme}>
          <h2>{title}</h2>
          <CloseButton
            onClick={handleClose}
            theme={theme}
            title="Fechar (ESC)"
            aria-label="Fechar modal"
          >
            ✕
          </CloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
