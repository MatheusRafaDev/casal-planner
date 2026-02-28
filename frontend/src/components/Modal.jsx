import React from 'react';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  CloseButton
} from '../styles/components/ModalStyles';

const Modal = ({ isOpen, onClose, title, children, disableOutsideClick, theme }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (disableOutsideClick) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent theme={theme}>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={onClose} theme={theme}>✕</CloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;