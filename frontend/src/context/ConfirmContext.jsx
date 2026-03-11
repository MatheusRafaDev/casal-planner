
import React, { createContext, useContext, useState } from 'react';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    itemType: '',
    onConfirm: null
  });

  const showConfirm = ({ title, message, itemName, itemType, onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title: title || `Excluir ${itemType}`,
      message: message || `Tem certeza que deseja excluir ${itemType} "${itemName}"?`,
      itemName,
      itemType,
      onConfirm
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirmDialog, showConfirm, hideConfirm }}>
      {children}
    </ConfirmContext.Provider>
  );
};