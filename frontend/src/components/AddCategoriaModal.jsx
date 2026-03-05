// src/components/AddCategoriaModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { categoriasService } from '../services/categoriasService';

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

// ErrorMessage local
const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
  
  ${props => props.theme === 'dark' && `
    color: #ff6b6b;
  `}
`;

const COLORS = [
  '0 72% 51%',    // Vermelho
  '15 85% 58%',   // Laranja
  '38 92% 50%',   // Amarelo
  '152 60% 42%',  // Verde
  '168 65% 38%',  // Verde água
  '200 70% 50%',  // Azul claro
  '230 60% 55%',  // Azul
  '262 60% 55%',  // Roxo
  '330 70% 50%',  // Rosa
  '280 50% 50%',  // Roxo escuro
];

const ICONS = ['🏠', '🍳', '🛋️', '🛏️', '🚿', '👕', '🧹', '🪴', '🏋️', '🎮', '📚', '🧸', '🐾', '🚗', '💊'];

const AddCategoriaModal = ({ isOpen, onClose, onCategoryAdded, theme }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('🏠');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setColor(COLORS[0]);
      setIcon('🏠');
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

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

  // Função de validação do nome da categoria
  const validarNome = (valor) => {
    if (!valor || valor.trim() === '') {
      return 'Nome da categoria é obrigatório';
    }
    if (valor.length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres';
    }
    if (valor.length > 30) {
      return 'Nome deve ter no máximo 30 caracteres';
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) {
      return 'Nome deve conter apenas letras e espaços';
    }
    return '';
  };

  // Handlers com validação
  const handleNameChange = (e) => {
    const valor = e.target.value;
    setName(valor);
    
    if (touched.nome) {
      setErrors(prev => ({ ...prev, nome: validarNome(valor) }));
    }
  };

  const handleNameBlur = () => {
    setTouched(prev => ({ ...prev, nome: true }));
    setErrors(prev => ({ ...prev, nome: validarNome(name) }));
  };

  const handleClose = () => {
    setErrors({});
    setTouched({});
    onClose();
  };

  // Função auxiliar para converter HSL para Hex
  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Verificar se nome já existe
  const verificarNomeExistente = async (nome) => {
    try {
      const categorias = await categoriasService.listar();
      return categorias.some(cat => 
        cat.nome.toLowerCase() === nome.toLowerCase()
      );
    } catch (error) {
      console.error('Erro ao verificar nome existente:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ nome: true });
    const erroNome = validarNome(name);
    
    if (erroNome) {
      setErrors({ nome: erroNome });
      toast.error('Por favor, corrija os erros no formulário', {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#dc3545',
          color: '#fff',
        },
      });
      return;
    }

    setLoading(true);
    try {
      const nomeExiste = await verificarNomeExistente(name);
      
      if (nomeExiste) {
        setErrors({ nome: 'Já existe uma categoria com este nome' });
        toast.error('Já existe uma categoria com este nome', {
          duration: 4000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#dc3545',
            color: '#fff',
          },
        });
        setLoading(false);
        return;
      }

      const [h, s, l] = color.split(' ');
      const hexColor = hslToHex(parseInt(h), parseInt(s), parseInt(l));
      
      await categoriasService.create({
        nome: name.trim(),
        icone: icon,
        bg: hexColor,
        text: '#ffffff'
      });

      // Mostrar toast de sucesso
      toast.success(`Categoria "${name}" criada com sucesso!`, {
        duration: 3000,
        icon: '',
        style: {
          borderRadius: '12px',
          background: theme === 'dark' ? '#1e1e1e' : '#4CAF50',
          color: theme === 'dark' ? '#e0e0e0' : '#fff',
          border: `1px solid ${theme === 'dark' ? '#333' : 'transparent'}`,
        },
      });

      if (onCategoryAdded) {
        onCategoryAdded();
      }
      
      handleClose();
      
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      
      if (error.response?.status === 400) {
        toast.error('Dados inválidos. Verifique as informações.', {
          duration: 4000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#dc3545',
            color: '#fff',
          },
        });
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.', {
          duration: 4000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#dc3545',
            color: '#fff',
          },
        });
      } else {
        toast.error('Erro ao criar categoria. Tente novamente.', {
          duration: 4000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#dc3545',
            color: '#fff',
          },
        });
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
          <h2>➕ Nova Categoria</h2>
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
              {loading ? 'Criando...' : 'Criar Categoria'}
            </CriarButton>
          </ModalButtons>
        </Form>
      </ModalContainer>
    </Overlay>
  );
};

export default AddCategoriaModal;