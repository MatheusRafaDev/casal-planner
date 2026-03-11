
import toast from 'react-hot-toast';

export const useToastModal = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      icon: '',
      style: {
        borderRadius: '12px',
        background: '#4CAF50',
        color: '#fff',
      },
      ...options
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      icon: '❌',
      style: {
        borderRadius: '12px',
        background: '#dc3545',
        color: '#fff',
      },
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        borderRadius: '12px',
        background: '#ffc107',
        color: '#000',
      },
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      style: {
        borderRadius: '12px',
        background: '#17a2b8',
        color: '#fff',
      },
      ...options
    });
  };


  const showPromise = (promise, messages, options = {}) => {
    return toast.promise(promise, messages, {
      style: {
        borderRadius: '12px',
      },
      success: {
        style: {
          background: '#4CAF50',
          color: '#fff',
        },
      },
      error: {
        style: {
          background: '#dc3545',
          color: '#fff',
        },
      },
      loading: {
        style: {
          background: '#6c757d',
          color: '#fff',
        },
      },
      ...options
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPromise
  };
};