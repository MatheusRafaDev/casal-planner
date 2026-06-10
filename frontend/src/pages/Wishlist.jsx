import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { wishlistService } from '../services/wishlistService';
import { Gift, Plus, Share2, Edit, Check, X, Loader } from 'lucide-react';

const Wishlist = () => {
  const { usuario } = useAuth();
  const { theme } = useTheme();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    slug: '',
  });
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [showShare, setShowShare] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      const data = await wishlistService.getMinha();
      setWishlist(data);
      if (data) {
        setFormData({
          titulo: data.titulo || '',
          mensagem: data.mensagem || '',
          slug: data.slug || '',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar wishlist:', err);
      setWishlist(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const checkSlugAvailability = useCallback(async (slug) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    try {
      const result = await wishlistService.slugDisponivel(slug);
      setSlugAvailable(result.disponivel);
    } catch (err) {
      console.error('Erro ao verificar slug:', err);
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  }, []);

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug: value }));
    checkSlugAvailability(value);
  };

  const handleCreate = async () => {
    try {
      const data = await wishlistService.criar(formData);
      setWishlist(data);
      setEditing(false);
    } catch (err) {
      console.error('Erro ao criar wishlist:', err);
      alert('Erro ao criar wishlist. Tente novamente.');
    }
  };

  const handleUpdate = async () => {
    try {
      const data = await wishlistService.atualizar(formData);
      setWishlist(data);
      setEditing(false);
    } catch (err) {
      console.error('Erro ao atualizar wishlist:', err);
      alert('Erro ao atualizar wishlist. Tente novamente.');
    }
  };

  const handleShare = () => {
    if (wishlist?.slug) {
      const link = `${window.location.origin}/lista/${wishlist.slug}`;
      setShareLink(link);
      setShowShare(true);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copiado!');
    setShowShare(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Loader className="animate-spin" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text }}>
          Lista de Presentes
        </h1>
        {wishlist && !editing && (
          <button
            onClick={handleShare}
            style={{
              background: theme.primary + '20',
              color: theme.primary,
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <Share2 size={16} />
            Compartilhar
          </button>
        )}
      </div>

      {showShare && (
        <div style={{
          padding: '1rem',
          background: theme.bg,
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: theme.textLight }}>
            Link da sua lista:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={shareLink}
              readOnly
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
              }}
            />
            <button
              onClick={copyShareLink}
              style={{
                background: theme.primary,
                color: theme.surface,
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              Copiar
            </button>
            <button
              onClick={() => setShowShare(false)}
              style={{
                background: theme.error + '20',
                color: theme.error,
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {!wishlist ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: theme.bg,
          borderRadius: '1rem',
          border: `1px solid ${theme.border}`,
        }}>
          <Gift size={48} style={{ color: theme.primary, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: theme.text }}>
            Crie sua lista de presentes
          </h2>
          <p style={{ color: theme.textLight, marginBottom: '1.5rem' }}>
            Compartilhe sua lista de enxoval com amigos e familiares para que eles possam presentear vocês.
          </p>
          <button
            onClick={() => setEditing(true)}
            style={{
              background: theme.primary,
              color: theme.surface,
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              margin: '0 auto',
            }}
          >
            <Plus size={18} />
            Criar lista
          </button>
        </div>
      ) : editing ? (
        <div style={{
          padding: '1.5rem',
          background: theme.bg,
          borderRadius: '1rem',
          border: `1px solid ${theme.border}`,
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: theme.text }}>
            {wishlist ? 'Editar lista' : 'Criar lista'}
          </h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: theme.text }}>
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Lista de Casal João & Maria"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: theme.text }}>
              Slug (link personalizado) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="joao-e-maria"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
              }}
            />
            {slugChecking && (
              <div style={{ fontSize: '0.75rem', color: theme.textLight, marginTop: '0.25rem' }}>
                Verificando disponibilidade...
              </div>
            )}
            {slugAvailable === false && (
              <div style={{ fontSize: '0.75rem', color: theme.error, marginTop: '0.25rem' }}>
                Este slug já está em uso. Tente outro.
              </div>
            )}
            {slugAvailable === true && (
              <div style={{ fontSize: '0.75rem', color: theme.success, marginTop: '0.25rem' }}>
                ✓ Slug disponível!
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: theme.text }}>
              Mensagem para os convidados
            </label>
            <textarea
              value={formData.mensagem}
              onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
              placeholder="Escreva uma mensagem especial para seus convidados..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={wishlist ? handleUpdate : handleCreate}
              disabled={!formData.titulo || !formData.slug || slugAvailable === false}
              style={{
                flex: 1,
                background: theme.primary,
                color: theme.surface,
                border: 'none',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                cursor: (!formData.titulo || !formData.slug || slugAvailable === false) ? 'not-allowed' : 'pointer',
                opacity: (!formData.titulo || !formData.slug || slugAvailable === false) ? 0.5 : 1,
              }}
            >
              <Check size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              {wishlist ? 'Salvar' : 'Criar'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                if (wishlist) {
                  setFormData({
                    titulo: wishlist.titulo || '',
                    mensagem: wishlist.mensagem || '',
                    slug: wishlist.slug || '',
                  });
                }
              }}
              style={{
                background: theme.error + '20',
                color: theme.error,
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '1.5rem',
          background: theme.bg,
          borderRadius: '1rem',
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: theme.text }}>
                {wishlist.titulo}
              </h2>
              <div style={{ fontSize: '0.85rem', color: theme.textLight }}>
                /lista/{wishlist.slug}
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: theme.primary + '20',
                color: theme.primary,
                border: 'none',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <Edit size={16} />
            </button>
          </div>

          {wishlist.mensagem && (
            <div style={{
              padding: '1rem',
              background: theme.surface,
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontStyle: 'italic',
              color: theme.text,
            }}>
              {wishlist.mensagem}
            </div>
          )}

          <div style={{ fontSize: '0.85rem', color: theme.textLight }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>Itens na lista:</strong> {wishlist.itens?.length || 0}
            </div>
            <div>
              <strong>Reservas:</strong> {wishlist.reservas?.length || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
