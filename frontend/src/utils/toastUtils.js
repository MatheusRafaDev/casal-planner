
import toast from 'react-hot-toast';

const toastStyles = {
  success: (theme) => ({
    duration: 2000,
    icon: '',
    style: {
      borderRadius: '12px',
      background: theme === 'dark' ? '#1e1e1e' : '#4CAF50',
      color: '#fff',
    },
  }),
  error: (theme) => ({
    duration: 4000,
    icon: '❌',
    style: {
      borderRadius: '12px',
      background: '#dc3545',
      color: '#fff',
    },
  }),
  warning: (theme) => ({
    duration: 3000,
    icon: '⚠️',
    style: {
      borderRadius: '12px',
      background: '#ff9800',
      color: '#fff',
    },
  }),
  info: (theme) => ({
    duration: 3000,
    icon: 'ℹ️',
    style: {
      borderRadius: '12px',
      background: theme === 'dark' ? '#333' : '#17a2b8',
      color: '#fff',
    },
  }),
};

export const showToast = {
  success: (message, theme = 'light') => {
    toast.success(message, toastStyles.success(theme));
  },
  error: (message, theme = 'light') => {
    toast.error(message, toastStyles.error(theme));
  },
  warning: (message, theme = 'light') => {
    toast(message, toastStyles.warning(theme));
  },
  info: (message, theme = 'light') => {
    toast(message, toastStyles.info(theme));
  },

  itemToggled: (itemName, isComprado, theme = 'light') => {
    const message = isComprado 
      ? `"${itemName}" marcado como comprado!`
      : `"${itemName}" voltou para a lista!`;
    
    const style = {
      duration: 2000,
      icon: '',
      style: {
        borderRadius: '12px',
        background: theme === 'dark' 
          ? '#1e1e1e' 
          : isComprado ? '#4CAF50' : '#ff9800',
        color: '#fff',
      },
    };
    
    toast.success(message, style);
  },
};