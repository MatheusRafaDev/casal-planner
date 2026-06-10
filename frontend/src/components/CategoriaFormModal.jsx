import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as Styled from '../styles/components/CategoriaFormModalStyles';
import { categoriasService } from '../services/categoriasService';
import { showToast } from '../utils/toastUtils';

// ========== 24 EMOJIS PADRÃO (menores e mais compactos) ==========
const ICONS = [
  '🏠', '🛒', '🍕', '🚗', '💳', '💰', '🎓', '💊',
  '👕', '🎮', '✈️', '🏥', '🛁', '🍳', '🧼', '🛏️',
  '🛋️', '📦', '🐶', '🎁', '⚡', '📱', '💻', '🎵'
];

// ========== 20 CORES FIXAS (mais compactas) ==========
const FIXED_COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
  '#3498db', '#2980b9', '#9b59b6', '#e84393', '#fd79a8',
  '#6c5ce7', '#00cec9', '#fdcb6e', '#e17055', '#81ecec',
  '#74b9ff', '#a29bfe', '#dfe6e9', '#b2bec3', '#636e72'
];

// ========== UTILITÁRIOS ==========
const hexToHsl = (hex) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h *= 60;
  }
  
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const formatPrice = (value) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const parsePrice = (value) => {
  if (!value) return null;
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

// ========== COMPONENTE PRINCIPAL ==========
const CategoriaFormModal = ({ 
  isOpen, 
  onClose, 
  onCategoryAdded,
  theme,
  categoriaParaEditar = null,
  isEditing = false 
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(FIXED_COLORS[0]);
  const [icon, setIcon] = useState('🏠');
  const [metaOrcamento, setMetaOrcamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setColor(FIXED_COLORS[0]);
    setIcon('🏠');
    setMetaOrcamento('');
    setErrors({});
    setTouched({});
    setLoading(false);
  };

  // Reset form quando abrir
  useEffect(() => {
    if (isOpen && isEditing && categoriaParaEditar) {
      setName(categoriaParaEditar.nome || '');
      setIcon(categoriaParaEditar.icon || '🏠');
      const metaValue = categoriaParaEditar.metaOrcamento != null ? categoriaParaEditar.metaOrcamento : '';
      setMetaOrcamento(metaValue);
      if (categoriaParaEditar.bg) {
        setColor(categoriaParaEditar.bg);
      }
    } else if (isOpen && !isEditing) {
      resetForm();
    }
    
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, isEditing, categoriaParaEditar]);

  // Prevenir scroll do body
  useEffect(() => {
    if (!isOpen) return;
    
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const validateNome = () => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, nome: 'Nome é obrigatório' }));
      return false;
    }
    setErrors(prev => ({ ...prev, nome: '' }));
    return true;
  };

  const validateMeta = () => {
    const metaValue = parsePrice(metaOrcamento);
    if (metaValue !== null && metaValue <= 0) {
      setErrors(prev => ({ ...prev, metaOrcamento: 'Meta deve ser maior que zero' }));
      return false;
    }
    setErrors(prev => ({ ...prev, metaOrcamento: '' }));
    return true;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'nome') validateNome();
    if (field === 'metaOrcamento') validateMeta();
  };

  const handleMetaChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    
    if (value === '') {
      setMetaOrcamento('');
      return;
    }
    
    const number = parseFloat(value) / 100;
    if (!isNaN(number)) {
      setMetaOrcamento(formatPrice(number));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isNomeValid = validateNome();
    const isMetaValid = validateMeta();
    
    setTouched({ nome: true, metaOrcamento: true });
    
    if (!isNomeValid) {
      showToast.error('Por favor, preencha o nome da categoria', theme);
      return;
    }
    
    if (!isMetaValid) {
      showToast.error('Meta de orçamento deve ser maior que zero', theme);
      return;
    }

    setLoading(true);
    
    try {
      let metaValue = null;
      if (metaOrcamento && metaOrcamento !== '') {
        metaValue = parsePrice(metaOrcamento);
      }

      const categoriaData = {
        nome: name.trim(),
        icon,
        bg: color,
        text: '#ffffff',
        metaOrcamento: metaValue,
      };

      let resultado;
      if (isEditing) {
        resultado = await categoriasService.update(categoriaParaEditar.id, categoriaData);
        showToast.success(`Categoria "${name}" atualizada com sucesso!`, theme);
      } else {
        resultado = await categoriasService.create(categoriaData);
        showToast.success(`Categoria "${name}" criada com sucesso!`, theme);
      }

      if (onCategoryAdded) {
        onCategoryAdded(resultado, isEditing);
      }

      handleClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      showToast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} categoria. Tente novamente.`, theme);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <Styled.Overlay theme={theme} onClick={handleClose}>
      <Styled.ModalContainer 
        onClick={(e) => e.stopPropagation()} 
        theme={theme}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Styled.SheetHandle theme={theme} />
        
        <Styled.Header theme={theme}>
          <h2 id="modal-title">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <Styled.CloseButton 
            onClick={handleClose} 
            theme={theme}
            aria-label="Fechar"
          >
            ✕
          </Styled.CloseButton>
        </Styled.Header>

        <Styled.Form onSubmit={handleSubmit} ref={formRef}>
          <Styled.FormGroup>
            <Styled.Label htmlFor="categoria-nome" theme={theme}>
              Nome *
            </Styled.Label>
            <Styled.Input
              id="categoria-nome"
              ref={firstInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('nome')}
              placeholder="Ex: Mercado, Farmácia, Lazer..."
              theme={theme}
              style={{ borderColor: errors.nome && touched.nome ? '#dc3545' : undefined }}
              maxLength={30}
              disabled={loading}
              autoComplete="off"
            />
            {errors.nome && touched.nome && (
              <Styled.ErrorMessage theme={theme} role="alert">
                {errors.nome}
              </Styled.ErrorMessage>
            )}
          </Styled.FormGroup>

          <Styled.FormGroup>
            <Styled.Label theme={theme}>Ícone</Styled.Label>
            <Styled.IconsGrid>
              {ICONS.map(ic => (
                <Styled.IconButton 
                  key={ic} 
                  type="button" 
                  onClick={() => setIcon(ic)} 
                  $active={icon === ic} 
                  theme={theme} 
                  disabled={loading}
                  aria-label={`Ícone ${ic}`}
                  aria-pressed={icon === ic}
                >
                  {ic}
                </Styled.IconButton>
              ))}
            </Styled.IconsGrid>
          </Styled.FormGroup>

          <Styled.FormGroup>
            <Styled.Label theme={theme}>Cor</Styled.Label>
            <Styled.ColorsGrid>
              {FIXED_COLORS.map(c => (
                <Styled.ColorButton
                  key={c} 
                  type="button" 
                  onClick={() => setColor(c)}
                  $active={color === c}
                  $bgColor={c}
                  theme={theme} 
                  title={c} 
                  disabled={loading}
                  aria-label={`Cor ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </Styled.ColorsGrid>
          </Styled.FormGroup>

          <Styled.FormGroup>
            <Styled.Label htmlFor="categoria-meta" theme={theme}>
              🎯 Meta de Orçamento (opcional)
            </Styled.Label>
            <Styled.Input
              id="categoria-meta"
              type="text"
              inputMode="decimal"
              value={metaOrcamento}
              onChange={handleMetaChange}
              onBlur={() => handleBlur('metaOrcamento')}
              placeholder="Ex: 500,00"
              theme={theme}
              disabled={loading}
              autoComplete="off"
            />
            {errors.metaOrcamento && touched.metaOrcamento && (
              <Styled.ErrorMessage theme={theme} role="alert">
                {errors.metaOrcamento}
              </Styled.ErrorMessage>
            )}
          </Styled.FormGroup>

          <Styled.ModalButtons>
            <Styled.CancelarButton 
              type="button" 
              onClick={handleClose} 
              disabled={loading} 
              theme={theme}
            >
              Cancelar
            </Styled.CancelarButton>
            <Styled.CriarButton 
              type="submit" 
              disabled={loading || !name.trim() || errors.nome} 
              theme={theme}
            >
              {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar')}
            </Styled.CriarButton>
          </Styled.ModalButtons>
        </Styled.Form>
        
        <Styled.VisuallyHidden aria-live="polite" role="status">
          {loading && (isEditing ? 'Salvando categoria...' : 'Criando categoria...')}
        </Styled.VisuallyHidden>
      </Styled.ModalContainer>
    </Styled.Overlay>
  );

  if (!isOpen) return null;

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CategoriaFormModal;