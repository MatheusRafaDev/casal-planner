import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as Styled from '../styles/components/CategoriaFormModalStyles';

// ========== CONSTANTES COMPLETAS ==========
const COLORS = [
  '0 70% 50%',     // Vermelho
  '10 70% 50%',    // Vermelho alaranjado
  '20 70% 50%',    // Laranja
  '35 70% 50%',    // Laranja amarelado
  '45 70% 50%',    // Amarelo
  '60 70% 45%',    // Amarelo esverdeado
  '90 70% 45%',    // Verde claro
  '120 70% 45%',   // Verde
  '150 70% 45%',   // Verde azulado
  '180 70% 45%',   // Ciano
  '200 70% 50%',   // Azul claro
  '220 70% 55%',   // Azul
  '240 70% 55%',   // Azul royal
  '260 70% 55%',   // Azul violeta
  '270 70% 55%',   // Roxo
  '280 70% 55%',   // Violeta
  '300 70% 60%',   // Rosa
  '320 70% 60%',   // Rosa choque
  '340 70% 55%',   // Magenta
  '0 0% 40%',      // Cinza escuro
  '0 0% 50%',      // Cinza médio
  '0 0% 60%'       // Cinza claro
];

const ICONS = [
  '🏠', '🛒', '🍕', '🚗', '💳', '💰', '🎓', '💊',
  '👕', '🎮', '✈️', '🏥', '⚡', '📱', '💻', '🎵',
  '📚', '🏋️', '🎬', '🍔', '☕', '🍺', '🎁', '💎'
];

// Utilitários
const hslToHex = (h, s, l) => {
  h = (h % 360 + 360) % 360;
  s = Math.min(100, Math.max(0, s));
  l = Math.min(100, Math.max(0, l));
  
  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l / 100 - c / 2;
  
  let r, g, b;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const toHex = (val) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

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

// Componente Principal
const CategoriaFormModal = ({ 
  isOpen, 
  onClose, 
  onCategoryAdded,
  theme,
  categoriaParaEditar = null,
  isEditing = false 
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
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
    setColor(COLORS[0]);
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
        setColor(hexToHsl(categoriaParaEditar.bg));
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
      alert('Por favor, preencha o nome da categoria');
      return;
    }
    
    if (!isMetaValid) {
      alert('Meta de orçamento deve ser maior que zero');
      return;
    }

    setLoading(true);
    
    try {
      const [h, s, l] = color.split(' ');
      const hexColor = hslToHex(parseInt(h), parseInt(s), parseInt(l));
      
      let metaValue = null;
      if (metaOrcamento && metaOrcamento !== '') {
        metaValue = parsePrice(metaOrcamento);
      }

      const categoriaData = {
        nome: name.trim(),
        icon,
        bg: hexColor,
        text: '#ffffff',
        metaOrcamento: metaValue,
      };

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Categoria salva:', categoriaData);
      alert(`Categoria "${name}" ${isEditing ? 'atualizada' : 'crirada'}!`);

      if (onCategoryAdded) {
        onCategoryAdded(categoriaData, isEditing);
      }

      handleClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert(`Erro ao ${isEditing ? 'atualizar' : 'criar'} categoria. Tente novamente.`);
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
              placeholder="Ex: Mercado"
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
              {COLORS.map(c => {
                const [h, s, l] = c.split(' ');
                const bgColor = `hsl(${h}, ${s}, ${l})`;
                return (
                  <Styled.ColorButton
                    key={c} 
                    type="button" 
                    onClick={() => setColor(c)}
                    $active={color === c}
                    $bgColor={bgColor}
                    theme={theme} 
                    title={`Cor ${c}`} 
                    disabled={loading}
                    aria-label={`Selecionar cor ${c}`}
                    aria-pressed={color === c}
                  />
                );
              })}
            </Styled.ColorsGrid>
          </Styled.FormGroup>

          <Styled.FormGroup>
            <Styled.Label htmlFor="categoria-meta" theme={theme}>
              🎯 Meta de Orçamento
            </Styled.Label>
            <Styled.Input
              id="categoria-meta"
              type="text"
              inputMode="decimal"
              value={metaOrcamento}
              onChange={handleMetaChange}
              onBlur={() => handleBlur('metaOrcamento')}
              placeholder="Opcional - Ex: 500,00"
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