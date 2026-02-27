import React from 'react';
import styled from 'styled-components';

const Modal = ({ isOpen, onClose, title, children, disableOutsideClick, darkMode }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (disableOutsideClick) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick} darkMode={darkMode}>
      <ModalContent darkMode={darkMode}>
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton onClick={onClose} darkMode={darkMode}>✕</CloseButton>
        </ModalHeader>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.darkMode ? '#2d3748' : 'white'};
  border-radius: 32px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);

  h2 {
    color: ${props => props.darkMode ? '#e2e8f0' : '#2c3e50'};
    margin-bottom: 1.5rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.darkMode ? '#a0aec0' : '#7f8c8d'};
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;

  &:hover {
    background: ${props => props.darkMode ? '#4a5568' : '#ecf0f1'};
    color: #e74c3c;
  }
`;

export default Modal;