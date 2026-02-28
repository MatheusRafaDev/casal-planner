import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
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
  ButtonGroup,
  CancelButton,
  CreateButton
} from '../styles/components/AddCategoriaModalStyles';

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

// Ícones (igual ao projeto referência)
const ICONS = ['🏠', '🍳', '🛋️', '🛏️', '🚿', '👕', '🧹', '🪴', '🏋️', '🎮', '📚', '🧸', '🐾', '🚗', '💊'];



// Componente principal
const AddCategoriaModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('🏠');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Converter cor HSL para hex
      const [h, s, l] = color.split(' ');
      const hexColor = hslToHex(parseInt(h), parseInt(s), parseInt(l));
      
      await categoriasService.create({
        nome: name.trim(),
        icone: icon,
        bg: hexColor,
        text: '#ffffff' // Texto branco para contraste
      });

      setName('');
      setColor(COLORS[0]);
      setIcon('🏠');
      if (onCategoryAdded) onCategoryAdded();
      onClose();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <h3>Nova Categoria</h3>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Escritório"
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label>Ícone</Label>
            <IconsGrid>
              {ICONS.map(ic => (
                <IconButton
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  $active={icon === ic}
                >
                  {ic}
                </IconButton>
              ))}
            </IconsGrid>
          </FormGroup>

          <FormGroup>
            <Label>Cor</Label>
            <ColorsGrid>
              {COLORS.map(c => (
                <ColorButton
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  $active={color === c}
                  style={{ backgroundColor: `hsl(${c})` }}
                />
              ))}
            </ColorsGrid>
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </CancelButton>
            <CreateButton type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Criando...' : 'Criar'}
            </CreateButton>
          </ButtonGroup>
        </Form>
      </ModalContainer>
    </Overlay>
  );
};

export default AddCategoriaModal;