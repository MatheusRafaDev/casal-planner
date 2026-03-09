// src/components/AddCategoriaModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { categoriasService } from '../services/categoriasService';
import { useCategoryValidation } from '../hooks/useCategoryValidation';
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
} from '../styles/components/AddCategoriaModalStyles';

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
  
  ${props => props.theme === 'dark' && `
    color: #ff6b6b;
  `}
`;

const AddCategoriaModal = ({ 
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
  const [loading, setLoading] = useState(false);
  
  const { errors, touched, handleBlur, handleChange, resetValidation, setErrors } = 
    useCategoryValidation();

  // Carregar dados da categoria quando estiver editando
  useEffect(() => {
    if (isOpen && isEditing && categoriaParaEditar) {

      setName(categoriaParaEditar.nome || '');
      setIcon(categoriaParaEditar.icon || '🏠');
      
      // Converter cor hex para formato HSL usado no seletor
      if (categoriaParaEditar.bg) {
        const hslColor = hexToHsl(categoriaParaEditar.bg);
        setColor(hslColor);
      }
    } else if (isOpen && !isEditing) {
      // Reset para valores padrão quando for criação
      setName('');
      setColor(COLORS[0]);
      setIcon('🏠');
      resetValidation();
    }
  }, [isOpen, isEditing, categoriaParaEditar, resetValidation]);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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

  const handleClose = () => {
    resetValidation();
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

    setLoading(true);
    try {
      const [h, s, l] = color.split(' ');
      const hexColor = hslToHex(parseInt(h), parseInt(s), parseInt(l));
      

      const categoriaData = {
        nome: name.trim(),
        icon: icon,
        bg: hexColor,
        text: '#ffffff'
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
    <Overlay onClick={handleClose} theme={theme}>
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

export default AddCategoriaModal;