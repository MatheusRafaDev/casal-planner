// AddCategoriaModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { categoriasService } from '../services/categoriasService';

import {
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setColor(COLORS[0]);
      setIcon('🏠');
    }
  }, [isOpen]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="➕ Nova Categoria"
      disableOutsideClick={true}
      theme={theme}
    >
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label theme={theme}>Nome *</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Escritório"
            autoFocus
            theme={theme}
          />
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
              >
                {ic}
              </IconButton>
            ))}
          </IconsGrid>
        </FormGroup>

        <FormGroup>
          <Label theme={theme}>Cor</Label>
          <ColorsGrid>
            {COLORS.map(c => (
              <ColorButton
                key={c}
                type="button"
                onClick={() => setColor(c)}
                $active={color === c}
                style={{ backgroundColor: `hsl(${c})` }}
                theme={theme}
              />
            ))}
          </ColorsGrid>
        </FormGroup>

        <ModalButtons>
          <CancelarButton 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            theme={theme}
          >
            Cancelar
          </CancelarButton>
          <CriarButton 
            type="submit" 
            disabled={loading || !name.trim()}
            theme={theme}
          >
            {loading ? 'Criando...' : 'Criar Categoria'}
          </CriarButton>
        </ModalButtons>
      </form>
    </Modal>
  );
};

export default AddCategoriaModal;