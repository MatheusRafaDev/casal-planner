// src/components/Modal.jsx
import React from 'react';
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
  disableOutsideClick, 
  theme,
  
  // Novas props para toast
  showToastOnClose = false,
  toastMessage = '',
  toastType = 'success'
}) => {

  const handleOverlayClick = (e) => {
    if (disableOutsideClick) return;
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    // Mostrar toast se configurado
    if (showToastOnClose && toastMessage) {
      switch (toastType) {
        case 'success':
          toast.success(toastMessage, {
            duration: 3000,
            icon: '',
            style: {
              borderRadius: '12px',
              background: theme === 'dark' ? '#1e1e1e' : '#4CAF50',
              color: theme === 'dark' ? '#e0e0e0' : '#fff',
            },
          });
          break;
        case 'error':
          toast.error(toastMessage, {
            duration: 4000,
            icon: '❌',
            style: {
              borderRadius: '12px',
              background: '#dc3545',
              color: '#fff',
            },
          });
          break;
        case 'warning':
          toast(toastMessage, {
            duration: 4000,
            icon: '⚠️',
            style: {
              borderRadius: '12px',
              background: '#ffc107',
              color: '#000',
            },
          });
          break;
        default:
          toast.success(toastMessage);
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent theme={theme}>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={handleClose} theme={theme}>✕</CloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;