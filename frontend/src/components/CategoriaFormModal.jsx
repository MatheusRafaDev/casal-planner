import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { categoriasService } from '../services/categoriasService';
import { useCategoryValidation } from '../hooks/useCategoryValidation';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { showToast } from '../utils/toastUtils';
import { COLORS, ICONS, hexToHsl, hslToHex } from '../constants/categoryConstants';

import {
  Overlay,
  ModalContainer,
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
  CriarButton
} from '../styles/components/CategoriaFormModalStyles';

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
  
  ${props => props.theme === 'dark' && `
    color: #ff6b6b;
  `}
`;

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
  
  const { errors, touched, handleBlur, handleChange, resetValidation, setErrors } = 
    useCategoryValidation();

  // Usar o hook de formatação de preço para a meta de orçamento
  const {
    formattedValue: metaFormatada,
    handlePriceChange: handleMetaChange,
    handlePriceBlur: handleMetaBlur,
    setPrice: setMetaRaw,
    resetPrice: resetMeta,
  } = usePriceFormat(null);

  // Sincronizar a meta quando o modal abrir em modo edição
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
        const hslColor = hexToHsl(categoriaParaEditar.bg);
        setColor(hslColor);
      }
    } else if (isOpen && !isEditing) {
      setName('');
      setColor(COLORS[0]);
      setIcon('🏠');
      setMetaOrcamento('');
      resetMeta();
      resetValidation();
    }
  }, [isOpen, isEditing, categoriaParaEditar, resetValidation, setMetaRaw, resetMeta]);

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

  const handleNameChange = (e) => {
    const valor = e.target.value;
    setName(valor);
    handleChange('nome', valor, touched.nome);
  };

  const handleNameBlur = () => {
    handleBlur('nome', name);
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
    if (metaOrcamento === '' || metaOrcamento === null) {
      handleMetaBlur();
      handleBlur('metaOrcamento', '');
      return;
    }
    
    handleMetaBlur();
    handleBlur('metaOrcamento', metaOrcamento);
    
    if (metaOrcamento !== '' && parseFloat(metaOrcamento) <= 0) {
      setErrors(prev => ({
        ...prev,
        metaOrcamento: 'Meta deve ser maior que zero'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        metaOrcamento: ''
      }));
    }
  };

  const handleClose = () => {
    resetValidation();
    resetMeta();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    handleBlur('nome', name);
    const erroNome = errors.nome;
    
    if (erroNome) {
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
        icon: icon,
        bg: hexColor,
        text: '#ffffff',
        metaOrcamento: metaValue,
        removerMeta: metaOrcamento === '' || metaOrcamento === null,
      };

      if (isEditing && categoriaParaEditar) {
        await categoriasService.update(categoriaParaEditar.id, categoriaData);
        showToast.success(`Categoria "${name}" atualizada com sucesso!`, theme);
      } else {
        await categoriasService.create(categoriaData);
        showToast.success(`Categoria "${name}" criada com sucesso!`, theme);
      }

      if (onCategoryAdded) {
        onCategoryAdded();
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

  if (!isOpen) return null;

  return (
    <Overlay theme={theme}>
      <ModalContainer onClick={(e) => e.stopPropagation()} theme={theme}>
        <Header theme={theme}>
          <h2>{isEditing ? '✏️ Editar Categoria' : '➕ Nova Categoria'}</h2>
          <CloseButton onClick={handleClose} theme={theme}>
            ✕
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label theme={theme}>Nome *</Label>
            <Input
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              placeholder="Ex: Escritório"
              autoFocus
              theme={theme}
              style={{
                borderColor: errors.nome && touched.nome ? '#dc3545' : undefined
              }}
              maxLength={30}
              disabled={loading}
            />
            {errors.nome && touched.nome && (
              <ErrorMessage theme={theme}>{errors.nome}</ErrorMessage>
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
                  />
                );
              })}
            </ColorsGrid>
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>🎯 Meta de Orçamento (opcional)</Label>
            <Input
              type="text"
              value={metaFormatada === 'R$ ' ? '' : metaFormatada}
              onChange={handleMetaOrcamentoChange}
              onBlur={handleMetaOrcamentoBlur}
              placeholder="Ex: 500,00"
              theme={theme}
              disabled={loading}
            />
            {errors.metaOrcamento && touched.metaOrcamento && (
              <ErrorMessage theme={theme}>{errors.metaOrcamento}</ErrorMessage>
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
              {loading 
                ? (isEditing ? 'Salvando...' : 'Criando...') 
                : (isEditing ? 'Salvar Alterações' : 'Criar Categoria')
              }
            </CriarButton>
          </ModalButtons>
        </Form>
      </ModalContainer>
    </Overlay>
  );
};

export default CategoriaFormModal;