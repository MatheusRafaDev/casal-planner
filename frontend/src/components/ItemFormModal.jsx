import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  FormGroup,
  Label,
  Input,
  Select,
  ModalButtons,
  CancelarButton,
  SalvarButton,
  ErrorMessage
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localPrecoFormatado, setLocalPrecoFormatado] = useState('');

  // Initialize formatted price when formData changes
  useEffect(() => {
    if (formData?.preco) {
      setLocalPrecoFormatado(formatarMoeda(formData.preco.toString()));
    } else {
      setLocalPrecoFormatado('');
    }
    
    // Reset errors and touched when modal opens
    if (isOpen) {
      setErrors({});
      setTouched({});
    }
  }, [formData.preco, isOpen]);

  // Validação de cada campo
  const validarCampo = (campo, valor) => {
    switch (campo) {
      case 'nome':
        if (!valor || valor.trim() === '') {
          return 'Nome é obrigatório';
        }
        if (valor.length < 3) {
          return 'Nome deve ter pelo menos 3 caracteres';
        }
        if (valor.length > 100) {
          return 'Nome deve ter no máximo 100 caracteres';
        }
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) {
          return 'Nome deve conter apenas letras e espaços';
        }
        return '';

      case 'marca':
        if (valor && valor.length > 50) {
          return 'Marca deve ter no máximo 50 caracteres';
        }
        if (valor && !/^[a-zA-ZÀ-ÿ\s]+$/.test(valor)) {
          return 'Marca deve conter apenas letras e espaços';
        }
        return '';

      case 'preco':
        if (!valor || valor === '' || valor === '0') {
          return 'Preço é obrigatório';
        }
        const precoNum = desformatarMoeda(valor);
        if (isNaN(precoNum) || precoNum <= 0) {
          return 'Preço deve ser maior que zero';
        }
        if (precoNum > 9999999.99) {
          return 'Preço muito alto (máximo: R$ 9.999.999,99)';
        }
        return '';

      case 'quantidade':
        if (valor < 1) {
          return 'Quantidade deve ser pelo menos 1';
        }
        if (valor > 999999) {
          return 'Quantidade máxima é 999.999';
        }
        if (!Number.isInteger(Number(valor))) {
          return 'Quantidade deve ser um número inteiro';
        }
        return '';

      default:
        return '';
    }
  };

  // Valida todos os campos do formulário
  const validarFormulario = () => {
    const novosErros = {
      nome: validarCampo('nome', formData.nome),
      marca: validarCampo('marca', formData.marca),
      preco: validarCampo('preco', localPrecoFormatado),
      quantidade: validarCampo('quantidade', formData.quantidade)
    };

    setErrors(novosErros);
    return !Object.values(novosErros).some(erro => erro !== '');
  };

  // Handlers com validação em tempo real
  const handleNomeChange = (e) => {
    const valor = e.target.value;
    setFormData({ ...formData, nome: valor });
    
    if (touched.nome) {
      setErrors(prev => ({ ...prev, nome: validarCampo('nome', valor) }));
    }
  };

  const handleNomeBlur = () => {
    setTouched(prev => ({ ...prev, nome: true }));
    setErrors(prev => ({ ...prev, nome: validarCampo('nome', formData.nome) }));
  };

  const handleMarcaChange = (e) => {
    const valor = e.target.value;
    setFormData({ ...formData, marca: valor });
    
    if (touched.marca) {
      setErrors(prev => ({ ...prev, marca: validarCampo('marca', valor) }));
    }
  };

  const handleMarcaBlur = () => {
    setTouched(prev => ({ ...prev, marca: true }));
    setErrors(prev => ({ ...prev, marca: validarCampo('marca', formData.marca) }));
  };

  const handlePrecoChange = (e) => {
    const rawValue = e.target.value;
    const formatado = formatarMoeda(rawValue);
    const desformatado = desformatarMoeda(formatado);
    
    setLocalPrecoFormatado(formatado);
    setFormData({
      ...formData,
      preco: desformatado
    });

    if (touched.preco) {
      setErrors(prev => ({
        ...prev,
        preco: validarCampo('preco', formatado)
      }));
    }
  };

  const handlePrecoBlur = () => {
    setTouched(prev => ({ ...prev, preco: true }));
    setErrors(prev => ({
      ...prev,
      preco: validarCampo('preco', localPrecoFormatado)
    }));
  };

  const handleQuantidadeChange = (e) => {
    const valor = parseInt(e.target.value) || 1;
    setFormData({
      ...formData,
      quantidade: valor
    });
    
    if (touched.quantidade) {
      setErrors(prev => ({
        ...prev,
        quantidade: validarCampo('quantidade', valor)
      }));
    }
  };

  const handleQuantidadeBlur = () => {
    setTouched(prev => ({ ...prev, quantidade: true }));
    setErrors(prev => ({
      ...prev,
      quantidade: validarCampo('quantidade', formData.quantidade)
    }));
  };

  const handleSave = () => {
    // Marca todos os campos como tocados
    setTouched({
      nome: true,
      marca: true,
      preco: true,
      quantidade: true
    });

    // Valida todos os campos
    const ehValido = validarFormulario();

    if (ehValido) {
      onSave();
    }
  };

  const handleClose = () => {
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "✏️ Editar Item" : "➕ Adicionar Item"}
      disableOutsideClick={true}
      theme={theme}
    >
      <FormGroup>
        <Label theme={theme}>Nome *</Label>
        <Input
          type="text"
          value={formData.nome || ''}
          onChange={handleNomeChange}
          onBlur={handleNomeBlur}
          placeholder="Ex: Geladeira"
          theme={theme}
          className={errors.nome && touched.nome ? 'error' : ''}
          maxLength={100}
        />
        {errors.nome && touched.nome && (
          <ErrorMessage theme={theme}>{errors.nome}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Marca</Label>
        <Input
          type="text"
          value={formData.marca || ''}
          onChange={handleMarcaChange}
          onBlur={handleMarcaBlur}
          placeholder="Ex: Consul"
          theme={theme}
          className={errors.marca && touched.marca ? 'error' : ''}
          maxLength={50}
        />
        {errors.marca && touched.marca && (
          <ErrorMessage theme={theme}>{errors.marca}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Preço (R$) *</Label>
        <Input
          type="text"
          value={localPrecoFormatado}
          onChange={handlePrecoChange}
          onBlur={handlePrecoBlur}
          placeholder="Ex: 2.500,00"
          theme={theme}
          className={errors.preco && touched.preco ? 'error' : ''}
        />
        {errors.preco && touched.preco && (
          <ErrorMessage theme={theme}>{errors.preco}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Quantidade</Label>
        <Input
          type="number"
          min="1"
          max="999999"
          step="1"
          value={formData.quantidade || 1}
          onChange={handleQuantidadeChange}
          onBlur={handleQuantidadeBlur}
          theme={theme}
          className={errors.quantidade && touched.quantidade ? 'error' : ''}
        />
        {errors.quantidade && touched.quantidade && (
          <ErrorMessage theme={theme}>{errors.quantidade}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label theme={theme}>Pagamento</Label>
        <Select
          value={formData.pagamento || 'normal'}
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
        <CancelarButton onClick={handleClose} theme={theme}>
          Cancelar
        </CancelarButton>
        <SalvarButton 
          onClick={handleSave} 
          theme={theme}
          disabled={Object.values(errors).some(error => error !== '')}
        >
          {isEditing ? "Salvar" : "Adicionar"}
        </SalvarButton>
      </ModalButtons>
    </Modal>
  );
};

export default ItemFormModal;