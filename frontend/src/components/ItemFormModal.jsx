import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ValidatedInput from './Form/ValidatedInput';
import Select from './Form/Select';
import PriceResearchPanel from './PriceResearchPanel';
import { useItemValidation } from '../hooks/useItemValidation';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { showToast } from '../utils/toastUtils';
import {
  ModalButtons,
  CancelarButton,
  SalvarButton
} from '../styles/components/ItemFormModalStyles';

const DEFAULT_FORM_DATA = {
  id: null,
  nome: '',
  marca: '',
  preco: 0,
  quantidade: 1,
  pagamento: 'normal',
  comprado: false,
  categoriaId: null
};


const ItemFormModal = ({
  isOpen,
  onClose,
  formData: externalFormData,
  setFormData: setExternalFormData,
  onSave,
  isEditing,
  theme,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const {
    errors,
    touched,
    validarFormulario,
    handleBlur,
    handleChange,
    resetValidation,
    setErrors,
    setTouched,
    hasErrors
  } = useItemValidation();


  const {
    formattedValue: precoFormatado,
    handlePriceChange: hookPriceChange,
    handlePriceBlur,
    setPrice: setPrecoRaw,
    resetPrice
  } = usePriceFormat(externalFormData?.preco || 0);

  useEffect(() => {
    if (externalFormData?.preco !== undefined) {
      setPrecoRaw(externalFormData.preco);
    }
  }, [externalFormData?.preco, setPrecoRaw]);

  useEffect(() => {
    if (isOpen) {
      if (!isEditing) {
        resetValidation();
        resetPrice();
        setExternalFormData(prev => ({
          ...DEFAULT_FORM_DATA,
          categoriaId: prev?.categoriaId || null
        }));
      }
    }
  }, [isOpen, isEditing, resetValidation, resetPrice, setExternalFormData]);

      const handleSelectProductItem = (item) => {

      setExternalFormData(prev => ({ 
        ...prev, 
        nome: item.nome,
        marca: item.marca,
        preco: item.preco
      }));
      
      setPrecoRaw(item.preco);
      handleChange('preco', item.preco, true);

    };

  const createFieldHandler = (fieldName) => ({
    onChange: (e) => {
      const value = fieldName === 'quantidade'
        ? parseInt(e.target.value) || 1
        : e.target.value;
      setExternalFormData((prev) => ({ ...prev, [fieldName]: value }));
      handleChange(fieldName, value, touched[fieldName]);
    },
    onBlur: () => {
      handleBlur(fieldName, externalFormData[fieldName]);
    }
  });

  const handlePrecoChange = (e) => {
    const result = hookPriceChange(e);
    if (result && result.raw !== undefined) {
      setExternalFormData((prev) => ({ ...prev, preco: result.raw }));
      handleChange('preco', result.raw, touched.preco);
    }
  };

  const handlePrecoBlur = () => {
    handlePriceBlur();
    handleBlur('preco', externalFormData.preco);
  };

  const handleSave = async () => {
    const allTouched = { nome: true, marca: true, preco: true, quantidade: true };
    setTouched(allTouched);

    const novosErros = validarFormulario(externalFormData, precoFormatado);
    setErrors(novosErros);

    const ehValido = !Object.values(novosErros).some(erro => erro !== '');

    if (ehValido) {
      if (externalFormData.preco <= 0) {
        setErrors(prev => ({ ...prev, preco: 'Preço deve ser maior que zero' }));
        showToast.error('Preço deve ser maior que zero', theme);
        return;
      }

      setIsSaving(true);
      try {
        const dadosParaEnvio = {
          ...externalFormData,
          nome: externalFormData.nome?.trim(),
          marca: externalFormData.marca?.trim() || null,
          preco: Number(externalFormData.preco),
          quantidade: Number(externalFormData.quantidade),
          categoriaId: Number(externalFormData.categoriaId)
        };

        await onSave(dadosParaEnvio);

        showToast.success(
          isEditing
            ? `"${externalFormData.nome}" editado com sucesso!`
            : `"${externalFormData.nome}" adicionado com sucesso!`,
          theme
        );

        handleClose();
      } catch (error) {
        console.error('Erro:', error);
        const mensagemErro = error.response?.data?.message || 'Erro ao salvar item';
        showToast.error(mensagemErro, theme);
      } finally {
        setIsSaving(false);
      }
    } else {
      showToast.error('Por favor, corrija os erros no formulário', theme);
    }
  };

  const handleClose = () => {
    resetValidation();
    resetPrice();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "✏️ Editar Item" : "➕ Adicionar Item"}
      disableOutsideClick={true}
      theme={theme}
    >
      <ValidatedInput
        label="Nome"
        name="nome"
        value={externalFormData.nome || ''}
        onChange={createFieldHandler('nome').onChange}
        onBlur={createFieldHandler('nome').onBlur}
        error={errors.nome}
        touched={touched.nome}
        theme={theme}
        required
        placeholder="Ex: Geladeira"
        maxLength={100}
        disabled={isSaving}
        autoFocus
      />

      <ValidatedInput
        label="Marca"
        name="marca"
        value={externalFormData.marca || ''}
        onChange={createFieldHandler('marca').onChange}
        onBlur={createFieldHandler('marca').onBlur}
        error={errors.marca}
        touched={touched.marca}
        theme={theme}
        placeholder="Ex: Consul"
        maxLength={50}
        disabled={isSaving}
      />

      <ValidatedInput
        label="Preço"
        name="preco"
        type="text"
        value={precoFormatado}
        onChange={handlePrecoChange}
        onBlur={handlePrecoBlur}
        error={errors.preco}
        touched={touched.preco}
        theme={theme}
        required
        placeholder="0,00"
        disabled={isSaving}
      />


      <PriceResearchPanel
        nome={externalFormData.nome}
        marca={externalFormData.marca}
        onSelectItem={handleSelectProductItem}
        onSelectPrice={(price) => {
          setExternalFormData(prev => ({ ...prev, preco: price }));
          setPrecoRaw(price);
        }}
      />
      
      <ValidatedInput
        label="Quantidade"
        name="quantidade"
        type="number"
        value={externalFormData.quantidade || 1}
        onChange={createFieldHandler('quantidade').onChange}
        onBlur={createFieldHandler('quantidade').onBlur}
        error={errors.quantidade}
        touched={touched.quantidade}
        theme={theme}
        min="1"
        max="999999"
        step="1"
        disabled={isSaving}
      />

      <Select
        label="Pagamento"
        value={externalFormData.pagamento || 'normal'}
        onChange={(e) => setExternalFormData((prev) => ({ ...prev, pagamento: e.target.value }))}
        theme={theme}
        disabled={isSaving}
      >
        <option value="normal">💵 Normal</option>
        <option value="vr">🍽️ VR/VA</option>
      </Select>

      <ModalButtons>
        <CancelarButton
          onClick={handleClose}
          theme={theme}
          disabled={isSaving}
          type="button"
        >
          Cancelar
        </CancelarButton>
        <SalvarButton
          onClick={handleSave}
          theme={theme}
          disabled={hasErrors() || isSaving}
          type="button"
        >
          {isSaving
            ? 'Salvando...'
            : isEditing
              ? 'Salvar'
              : 'Adicionar'
          }
        </SalvarButton>
      </ModalButtons>
    </Modal>
  );
};

export default ItemFormModal;