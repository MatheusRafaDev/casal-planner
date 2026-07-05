// components/CategoriaAdministrarModal.jsx
import React, { useState } from 'react';
import { Edit2, Trash2, Plus, X, FolderOpen } from 'lucide-react';
import CategoriaFormModal from './CategoriaFormModal';
import DynamicIcon from './DynamicIcon';

const CategoryManagementModal = ({
  isOpen,
  onClose,
  categories = [],
  onCategoryAdded,   // (result, isEditing) – callback unificado
  onDeleteCategory,  // (id, nome)
  theme,
  itens = [],        // todos os itens, para contar por categoria
}) => {
  const [formModal, setFormModal] = useState({
    isOpen: false,
    categoria: null,
    isEditing: false,
  });

  if (!isOpen) return null;

  /* ── Helpers ── */
  const getItensCount = (catId) => itens.filter(i => i.categoriaId === catId).length;

  const openAdd = () => setFormModal({ isOpen: true, categoria: null, isEditing: false });

  const openEdit = (cat) => setFormModal({ isOpen: true, categoria: cat, isEditing: true });

  const closeForm = () => setFormModal({ isOpen: false, categoria: null, isEditing: false });

  const handleFormSaved = (result, isEditing) => {
    closeForm();
    onCategoryAdded && onCategoryAdded(result, isEditing);
  };

  const handleDeleteFromForm = (id, nome) => {
    closeForm();
    onDeleteCategory && onDeleteCategory(id, nome);
  };

  /* ── Overlay click fecha ── */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* ── Overlay + Sheet ── */}
      <div
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div
          style={{
            background: theme?.surface || '#fff',
            borderRadius: '20px 20px 0 0',
            width: '100%',
            maxWidth: '540px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {/* Handle bar */}
          <div style={{
            width: 40, height: 4,
            borderRadius: 2,
            background: theme?.border || '#d1d5db',
            margin: '12px auto 0',
            flexShrink: 0,
          }} />

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${theme?.border || '#e5e7eb'}`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: (theme?.primary || '#6366f1') + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FolderOpen size={18} color={theme?.primary || '#6366f1'} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: theme?.text || '#1f2937' }}>
                  Gerenciar Categorias
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: theme?.textSoft || '#6b7280' }}>
                  {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: theme?.surface2 || '#f3f4f6',
                border: 'none',
                cursor: 'pointer',
                color: theme?.textSoft || '#6b7280',
                padding: 8,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Add Button */}
          <div style={{ padding: '14px 20px 10px', flexShrink: 0 }}>
            <button
              onClick={openAdd}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 12,
                border: `2px dashed ${theme?.primary || '#6366f1'}`,
                background: 'transparent',
                color: theme?.primary || '#6366f1',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = (theme?.primary || '#6366f1') + '12'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Plus size={16} /> Nova Categoria
            </button>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
            {categories.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 0',
                color: theme?.textSoft || '#6b7280',
              }}>
                <FolderOpen size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Nenhuma categoria cadastrada</p>
              </div>
            ) : (
              categories.map(cat => {
                const count = cat.itensCount ?? getItensCount(cat.id);
                // resolve cor para display
                const bgColor = cat.bg?.startsWith('#') ? cat.bg : (() => {
                  const m = (cat.bg || '').match(/(\d+)\s*(\d+)%\s*(\d+)%/);
                  if (!m) return '#6366f1';
                  const h = parseInt(m[1]), s = parseInt(m[2]) / 100, l = parseInt(m[3]) / 100;
                  const a = s * Math.min(l, 1 - l);
                  const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, '0'); };
                  return '#' + f(0) + f(8) + f(4);
                })();

                return (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      marginBottom: 8,
                      borderRadius: 12,
                      background: theme?.surface2 || '#f3f4f6',
                      border: `1px solid ${theme?.border || '#e5e7eb'}`,
                      transition: 'box-shadow 0.15s',
                    }}
                  >
                    {/* Icon + Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: 10,
                        background: bgColor + '22',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        border: `1.5px solid ${bgColor}40`,
                      }}>
                        <DynamicIcon
                          name={cat.icon || cat.icone || 'Home'}
                          size={18}
                          color={bgColor}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: theme?.text || '#1f2937',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {cat.nome}
                        </div>
                        <div style={{ fontSize: 12, color: theme?.textSoft || '#6b7280', marginTop: 1 }}>
                          {count} {count === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => openEdit(cat)}
                        title="Editar"
                        style={{
                          padding: '7px 9px',
                          borderRadius: 9,
                          border: 'none',
                          background: 'transparent',
                          color: theme?.textSoft || '#6b7280',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = (theme?.primary || '#6366f1') + '18'; e.currentTarget.style.color = theme?.primary || '#6366f1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme?.textSoft || '#6b7280'; }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteCategory && onDeleteCategory(cat.id, cat.nome)}
                        title="Excluir"
                        style={{
                          padding: '7px 9px',
                          borderRadius: 9,
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ef444418'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── CategoriaFormModal padrão para add/edit ── */}
      <CategoriaFormModal
        isOpen={formModal.isOpen}
        onClose={closeForm}
        onCategoryAdded={handleFormSaved}
        onDeleteCategoria={handleDeleteFromForm}
        categoriaParaEditar={formModal.categoria}
        isEditing={formModal.isEditing}
        theme={theme}
        existingCategories={categories}
        itensDaCategoria={
          formModal.categoria
            ? itens.filter(i => i.categoriaId === formModal.categoria.id)
            : []
        }
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default CategoryManagementModal;