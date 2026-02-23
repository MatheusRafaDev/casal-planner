import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, disableOutsideClick = false }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Se estiver desabilitado o clique fora, não faz nada
    if (disableOutsideClick) return;
    
    // Caso contrário, fecha normalmente
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;