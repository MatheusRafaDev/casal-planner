import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { categoriasService } from '../services/categoriasService';
import { useCategoryValidation } from '../hooks/useCategoryValidation';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { showToast } from '../utils/toastUtils';
import { COLORS, ICONS, hexToHsl, hslToHex } from '../constants/categoryConstants';

import {
  Overlay,
  ModalContainer,
  SheetHandle,
  Header,
  CloseButton,
  Form,
  FormGroup,
  Label,
  Input,
  IconsGrid,
  IconButton,
  ColorsGrid,
  ColorButton,
  ModalButtons,
  CancelarButton,
  CriarButton,
  ErrorMessage,
  VisuallyHidden
} from '../styles/components/CategoriaFormModalStyles';

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
  
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  
  const { errors, touched, handleBlur, handleChange, resetValidation, setErrors } = 
    useCategoryValidation();

  const {
    formattedValue: metaFormatada,
    handlePriceChange: handleMetaChange,
    handlePriceBlur: handleMetaBlur,
    setPrice: setMetaRaw,
    resetPrice: resetMeta,
  } = usePriceFormat(null);

  // ✅ DEFINIR handleClose ANTES dos useEffects que o utilizam
  const handleClose = () => {
    resetValidation();
    resetMeta();
    onClose();
  };

  // Reset form quando abrir
  useEffect(() => {
    if (isOpen && isEditing && categoriaParaEditar) {
      setName(categoriaParaEditar.nome || '');
      setIcon(categoriaParaEditar.icon || '🏠');
      const metaValue = categoriaParaEditar.metaOrcamento != null ? categoriaParaEditar.metaOrcamento : '';
      setMetaOrcamento(metaValue);
      if (metaValue !== '' && metaValue !== null && !isNaN(parseFloat(metaValue))) {
        setMetaRaw(parseFloat(metaValue));
      } else {
        resetMeta();
      }
      if (categoriaParaEditar.bg) {
        setColor(hexToHsl(categoriaParaEditar.bg));
      }
    } else if (isOpen && !isEditing) {
      setName('');
      setColor(COLORS[0]);
      setIcon('🏠');
      setMetaOrcamento('');
      resetMeta();
      resetValidation();
    }
    
    // Focar no primeiro input quando abrir
    if (isOpen && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isEditing, categoriaParaEditar, resetValidation, setMetaRaw, resetMeta]);

  // Prevenir scroll do body - Versão compatível com iOS
  useEffect(() => {
    if (!isOpen) return;
    
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width
    };
    
    // Para iOS, precisamos de uma abordagem diferente
    const scrollY = window.scrollY;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.width = originalStyle.width;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // ✅ Keyboard handling - AGORA handleClose já está definido
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]); // ✅ handleClose agora está no array de dependências

  const handleNameChange = (e) => {
    const valor = e.target.value;
    setName(valor);
    handleChange('nome', valor, touched.nome);
  };

  const handleMetaOrcamentoChange = (e) => {
    const result = handleMetaChange(e);
    if (e.target.value === '') {
      setMetaOrcamento('');
      resetMeta();
      handleChange('metaOrcamento', '', touched.metaOrcamento);
      return;
    }
    if (result && result.raw !== undefined && result.raw !== null && !isNaN(result.raw)) {
      setMetaOrcamento(result.raw);
      handleChange('metaOrcamento', result.raw, touched.metaOrcamento);
    }
  };

  const handleMetaOrcamentoBlur = () => {
    handleMetaBlur();
    handleBlur('metaOrcamento', metaOrcamento);
    if (metaOrcamento !== '' && parseFloat(metaOrcamento) <= 0) {
      setErrors(prev => ({ ...prev, metaOrcamento: 'Meta deve ser maior que zero' }));
    } else {
      setErrors(prev => ({ ...prev, metaOrcamento: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleBlur('nome', name);
    
    if (errors.nome) {
      showToast.error('Por favor, corrija os erros no formulário', theme);
      return;
    }
    
    if (metaOrcamento !== '' && parseFloat(metaOrcamento) <= 0) {
      showToast.error('Meta de orçamento deve ser maior que zero', theme);
      return;
    }

    setLoading(true);
    
    try {
      const [h, s, l] = color.split(' ');
      const hexColor = hslToHex(parseInt(h), parseInt(s), parseInt(l));
      
      let metaValue = null;
      if (metaOrcamento !== '' && metaOrcamento !== null && !isNaN(parseFloat(metaOrcamento))) {
        metaValue = parseFloat(metaOrcamento);
      }

      const categoriaData = {
        nome: name.trim(),
        icon,
        bg: hexColor,
        text: '#ffffff',
        metaOrcamento: metaValue,
        removerMeta: metaOrcamento === '' || metaOrcamento === null,
      };

      let categoriaResultado;
      
      if (isEditing && categoriaParaEditar) {
        await categoriasService.update(categoriaParaEditar.id, categoriaData);
        categoriaResultado = { ...categoriaParaEditar, ...categoriaData };
        showToast.success(`Categoria "${name}" atualizada!`, theme);
      } else {
        categoriaResultado = await categoriasService.create(categoriaData);
        showToast.success(`Categoria "${name}" criada!`, theme);
      }

      if (onCategoryAdded) {
        onCategoryAdded(categoriaResultado, isEditing);
      }

      handleClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      
      if (error.response?.status === 400) {
        showToast.error('Dados inválidos. Verifique as informações.', theme);
      } else if (error.response?.status === 401) {
        showToast.error('Sessão expirada. Faça login novamente.', theme);
      } else {
        showToast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} categoria. Tente novamente.`, theme);
      }
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <Overlay theme={theme} onClick={handleClose}>
      <ModalContainer 
        onClick={(e) => e.stopPropagation()} 
        theme={theme}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <SheetHandle theme={theme} />
        
        <Header theme={theme}>
          <h2 id="modal-title">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <CloseButton 
            onClick={handleClose} 
            theme={theme}
            aria-label="Fechar"
          >
            ✕
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit} ref={formRef}>
          <FormGroup>
            <Label htmlFor="categoria-nome" theme={theme}>
              Nome *
            </Label>
            <Input
              id="categoria-nome"
              ref={firstInputRef}
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={() => handleBlur('nome', name)}
              placeholder="Ex: Mercado"
              theme={theme}
              style={{ borderColor: errors.nome && touched.nome ? '#dc3545' : undefined }}
              maxLength={30}
              disabled={loading}
              autoComplete="off"
              enterKeyHint="next"
            />
            {errors.nome && touched.nome && (
              <ErrorMessage theme={theme} role="alert">
                {errors.nome}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Ícone</Label>
            <IconsGrid>
              {ICONS.map(ic => (
                <IconButton 
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
                </IconButton>
              ))}
            </IconsGrid>
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Cor</Label>
            <ColorsGrid>
              {COLORS.map(c => {
                const [h, s, l] = c.split(' ');
                const bgColor = `hsl(${h}, ${s}, ${l})`;
                return (
                  <ColorButton
                    key={c} 
                    type="button" 
                    onClick={() => setColor(c)}
                    $active={color === c}
                    style={{ backgroundColor: bgColor }}
                    theme={theme} 
                    title={`Cor ${c}`} 
                    disabled={loading}
                    aria-label={`Selecionar cor ${c}`}
                    aria-pressed={color === c}
                  />
                );
              })}
            </ColorsGrid>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="categoria-meta" theme={theme}>
              🎯 Meta de Orçamento (opcional)
            </Label>
            <Input
              id="categoria-meta"
              type="text"
              inputMode="decimal"
              value={metaFormatada === 'R$ ' ? '' : metaFormatada}
              onChange={handleMetaOrcamentoChange}
              onBlur={handleMetaOrcamentoBlur}
              placeholder="Ex: 500,00"
              theme={theme}
              disabled={loading}
              autoComplete="off"
              enterKeyHint="done"
            />
            {errors.metaOrcamento && touched.metaOrcamento && (
              <ErrorMessage theme={theme} role="alert">
                {errors.metaOrcamento}
              </ErrorMessage>
            )}
          </FormGroup>

          <ModalButtons>
            <CancelarButton 
              type="button" 
              onClick={handleClose} 
              disabled={loading} 
              theme={theme}
            >
              Cancelar
            </CancelarButton>
            <CriarButton 
              type="submit" 
              disabled={loading || !name.trim() || errors.nome} 
              theme={theme}
            >
              {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar' : 'Criar')}
            </CriarButton>
          </ModalButtons>
        </Form>
        
        <VisuallyHidden aria-live="polite" role="status">
          {loading && (isEditing ? 'Salvando categoria...' : 'Criando categoria...')}
        </VisuallyHidden>
      </ModalContainer>
    </Overlay>
  );

  if (!isOpen) return null;

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CategoriaFormModal;