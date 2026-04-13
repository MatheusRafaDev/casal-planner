import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Monitora o status de rede do dispositivo.
 * Exibe toast automático ao ficar offline/online.
 * Essencial para usuários mobile em áreas com sinal instável.
 */
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada!', {
        id: 'network-status',
        duration: 2500,
        icon: '📶',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Sem conexão com a internet', {
        id: 'network-status',
        duration: Infinity, // fica até voltar online
        icon: '📵',
      });
    };

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
