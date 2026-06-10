import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { wishlistService } from '../services/wishlistService';
import { Gift, Heart, Check, X, Loader, Share2 } from 'lucide-react';

const WishlistPublica = () => {
  const { slug } = useParams();
  const { theme } = useTheme();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservando, setReservando] = useState(null);
  const [nomePresente, setNomePresente] = useState('');
  const [showReservaModal, setShowReservaModal] = useState(null);

  const loadWishlist = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistService.getPublica(slug);
      setWishlist(data);
    } catch (err) {
      console.error('Erro ao carregar wishlist:', err);
      setError('Lista não encontrada ou não disponível.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleReservar = async () => {
    if (!nomePresente.trim() || !showReservaModal) return;
    setReservando(showReservaModal);
    try {
      await wishlistService.reservarItem(slug, showReservaModal, { nomePresente: nomePresente.trim() });
      await loadWishlist();
      setShowReservaModal(null);
      setNomePresente('');
    } catch (err) {
      console.error('Erro ao reservar item:', err);
      alert('Erro ao reservar item. Tente novamente.');
    } finally {
      setReservando(null);
    }
  };

  const handleCancelarReserva = async (itemId) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    try {
      await wishlistService.cancelarReserva(slug, itemId, nomePresente);
      await loadWishlist();
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      alert('Erro ao cancelar reserva. Tente novamente.');
    }
  };

  const isItemReservado = (itemId) => {
    return wishlist?.reservas?.some(r => r.itemId === itemId);
  };

  const getReservaInfo = (itemId) => {
    return wishlist?.reservas?.find(r => r.itemId === itemId);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Loader className="animate-spin" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Gift size={48} style={{ color: theme.error, marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: theme.text }}>
          Lista não encontrada
        </h2>
        <p style={{ color: theme.textLight }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        padding: '2rem',
        background: theme.bg,
        borderRadius: '1rem',
        border: `1px solid ${theme.border}`,
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        <Gift size={64} style={{ color: theme.primary, marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: theme.text }}>
          {wishlist.titulo}
        </h1>
        {wishlist.mensagem && (
          <p style={{
            fontSize: '1rem',
            color: theme.textLight,
            fontStyle: 'italic',
            maxWidth: '600px',
            margin: '0 auto 1rem',
          }}>
            {wishlist.mensagem}
          </p>
        )}
        <div style={{ fontSize: '0.85rem', color: theme.textLight }}>
          {wishlist.itens?.length || 0} itens disponíveis
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {wishlist.itens?.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: theme.bg,
            borderRadius: '1rem',
            border: `1px solid ${theme.border}`,
          }}>
            <p style={{ color: theme.textLight }}>Nenhum item na lista ainda.</p>
          </div>
        ) : (
          wishlist.itens.map((item) => {
            const reservado = isItemReservado(item.id);
            const reservaInfo = getReservaInfo(item.id);

            return (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  background: theme.bg,
                  borderRadius: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                {item.fotoUrl && (
                  <img
                    src={item.fotoUrl}
                    alt={item.nome}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '0.5rem',
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: theme.text }}>
                    {item.nome}
                  </h3>
                  {item.marca && (
                    <div style={{ fontSize: '0.85rem', color: theme.textLight, marginBottom: '0.25rem' }}>
                      {item.marca}
                    </div>
                  )}
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.primary, marginBottom: '0.5rem' }}>
                    R$ {Number(item.preco).toFixed(2)}
                  </div>
                  {reservado ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: theme.success + '20',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                      color: theme.success,
                    }}>
                      <Heart size={16} fill={theme.success} />
                      Reservado por {reservaInfo?.nomePresente}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReservaModal(item.id)}
                      disabled={reservando === item.id}
                      style={{
                        background: theme.primary,
                        color: theme.surface,
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: reservando === item.id ? 'not-allowed' : 'pointer',
                        opacity: reservando === item.id ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Heart size={16} />
                      Reservar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Reserva */}
      {showReservaModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000,
        }}>
          <div style={{
            background: theme.surface,
            borderRadius: '1rem',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '100%',
            border: `1px solid ${theme.border}`,
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: theme.text }}>
              Reservar item
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: theme.text }}>
                Seu nome *
              </label>
              <input
                type="text"
                value={nomePresente}
                onChange={(e) => setNomePresente(e.target.value)}
                placeholder="Digite seu nome"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text,
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleReservar}
                disabled={!nomePresente.trim() || reservando}
                style={{
                  flex: 1,
                  background: theme.primary,
                  color: theme.surface,
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  cursor: (!nomePresente.trim() || reservando) ? 'not-allowed' : 'pointer',
                  opacity: (!nomePresente.trim() || reservando) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {reservando ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowReservaModal(null);
                  setNomePresente('');
                }}
                style={{
                  background: theme.error + '20',
                  color: theme.error,
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPublica;
