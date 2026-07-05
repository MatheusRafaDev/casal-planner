// frontend/src/services/toastService.js
import toast from 'react-hot-toast';

export const toastService = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
    });
  },
  
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
    });
  },
  
  info: (message) => {
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
    });
  },
  
  warning: (message) => {
    toast(message, {
      duration: 3500,
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
    });
  }
};
