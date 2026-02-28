import React from 'react';
import Modal from './Modal';

import {
  FormGroup,
  Label,
  Input,
  Select,
  ModalButtons,
  CancelarButton,
  SalvarButton
} from '../styles/components/ItemFormModalStyles';

import { formatarMoeda, desformatarMoeda } from '../utils/mascaras';

const ItemFormModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  isEditing,
  theme,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "✏️ Editar Item" : "➕ Adicionar Item"}
      disableOutsideClick={true}
      theme={theme}
    >
      <FormGroup>
        <Label theme={theme}>Nome *</Label>
        <Input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Ex: Geladeira"
          theme={theme}
        />
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Marca</Label>
        <Input
          type="text"
          value={formData.marca}
          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
          placeholder="Ex: Consul"
          theme={theme}
        />
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Preço (R$) *</Label>
        <Input
          type="text"
          value={formData.precoFormatado}
          onChange={(e) => {
            const rawValue = e.target.value;
            const formatado = formatarMoeda(rawValue);
            setFormData({
              ...formData,
              precoFormatado: formatado,
              preco: desformatarMoeda(formatado).toString(),
            });
          }}
          placeholder="Ex: 2.500,00"
          theme={theme}
        />
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Quantidade</Label>
        <Input
          type="number"
          min="1"
          value={formData.quantidade}
          onChange={(e) =>
            setFormData({
              ...formData,
              quantidade: parseInt(e.target.value) || 1,
            })
          }
          theme={theme}
        />
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Pagamento</Label>
        <Select
          value={formData.pagamento}
          onChange={(e) =>
            setFormData({ ...formData, pagamento: e.target.value })
          }
          theme={theme}
        >
          <option value="normal">💵 Normal</option>
          <option value="vr">🍽️ VR/VA</option>
        </Select>
      </FormGroup>

      <ModalButtons>
        <CancelarButton onClick={onClose} theme={theme}>
          Cancelar
        </CancelarButton>
        <SalvarButton onClick={onSave} theme={theme}>
          {isEditing ? "Salvar" : "Adicionar"}
        </SalvarButton>
      </ModalButtons>
    </Modal>
  );
};

export default ItemFormModal;