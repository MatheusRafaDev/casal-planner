import React, { useState, useEffect, useCallback } from "react";
import Modal from "./Modal";
import ValidatedInput from "./Form/ValidatedInput";
import Select from "./Form/Select";
import PainelPesquisaPrecos from "./PainelPesquisaPrecos";
import { useItemValidation } from "../hooks/useItemValidation";
import { usePriceFormat } from "../hooks/usePriceFormat";
import { showToast } from "../utils/toastUtils";
import {
  ModalButtons,
  CancelarButton,
  SalvarButton,
} from "../styles/components/ItemFormModalStyles";

const DEFAULT_FORM_DATA = {
  id: null,
  nome: "",
  marca: "",
  preco: 0,
  quantidade: 1,
  pagamento: "normal",
  comprado: false,
  categoriaId: null,
  loja: "",           
  linkProduto: "",   
  fotoUrl: "",       
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
    hasErrors,
  } = useItemValidation();

  const {
    formattedValue: precoFormatado,
    handlePriceChange: hookPriceChange,
    handlePriceBlur,
    setPrice: setPrecoRaw,
    resetPrice,
  } = usePriceFormat(externalFormData?.preco || 0);

  // Função handleClose memorizada com useCallback
  const handleClose = useCallback(() => {
    resetValidation();
    resetPrice();
    onClose();
  }, [resetValidation, resetPrice, onClose]);

  useEffect(() => {
    if (externalFormData?.preco !== undefined) {
      setPrecoRaw(externalFormData.preco);
    }
  }, [externalFormData?.preco, setPrecoRaw]);

  // Atalho ESC para fechar modal - CORRIGIDO
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]); // Adicionado handleClose como dependência

  useEffect(() => {
    if (isOpen) {
      if (!isEditing) {
        resetValidation();
        resetPrice();
        setExternalFormData((prev) => ({
          ...DEFAULT_FORM_DATA,
          categoriaId: prev?.categoriaId || null,
        }));
      }
    }
  }, [isOpen, isEditing, resetValidation, resetPrice, setExternalFormData]);

  const handleSelectProductItem = (item) => {
    setExternalFormData((prev) => ({
      ...prev,
      nome: item.nome,
      marca: item.marca,
      preco: item.preco,
      loja: item.loja || "",           
      linkProduto: item.link || "",    
      fotoUrl: item.imagem || "",      
    }));

    setPrecoRaw(item.preco);
    handleChange("preco", item.preco, true);
  };

  const createFieldHandler = (fieldName) => ({
    onChange: (e) => {
      const value =
        fieldName === "quantidade"
          ? parseInt(e.target.value) || 1
          : e.target.value;
      setExternalFormData((prev) => ({ ...prev, [fieldName]: value }));
      handleChange(fieldName, value, touched[fieldName]);
    },
    onBlur: () => {
      handleBlur(fieldName, externalFormData[fieldName]);
    },
  });

  const handlePrecoChange = (e) => {
    const result = hookPriceChange(e);
    if (result && result.raw !== undefined) {
      setExternalFormData((prev) => ({ ...prev, preco: result.raw }));
      handleChange("preco", result.raw, touched.preco);
    }
  };

  const handlePrecoBlur = () => {
    handlePriceBlur();
    handleBlur("preco", externalFormData.preco);
  };

  const handleSave = async () => {
    const allTouched = {
      nome: true,
      marca: true,
      preco: true,
      quantidade: true,
    };
    setTouched(allTouched);

    const novosErros = validarFormulario(externalFormData, precoFormatado);
    setErrors(novosErros);

    const ehValido = !Object.values(novosErros).some((erro) => erro !== "");

    if (ehValido) {
      if (externalFormData.preco <= 0) {
        setErrors((prev) => ({
          ...prev,
          preco: "Preço deve ser maior que zero",
        }));
        showToast.error("Preço deve ser maior que zero", theme);
        return;
      }

      setIsSaving(true);
      try {
        const dadosParaEnvio = {
          ...externalFormData,
          nome: externalFormData.nome?.trim(),
          marca: externalFormData.marca?.trim() || null,
          preco: externalFormData.preco,
          quantidade: Number(externalFormData.quantidade),
          categoriaId: Number(externalFormData.categoriaId),
          loja: externalFormData.loja || null,          
          linkProduto: externalFormData.linkProduto || null,
          fotoUrl: externalFormData.fotoUrl || null,     
        };

        await onSave(dadosParaEnvio);

        showToast.success(
          isEditing
            ? `"${externalFormData.nome}" editado com sucesso!`
            : `"${externalFormData.nome}" adicionado com sucesso!`,
          theme,
        );

        handleClose();
      } catch (error) {
        console.error("Erro:", error);
        const mensagemErro =
          error.response?.data?.message || "Erro ao salvar item";
        showToast.error(mensagemErro, theme);
      } finally {
        setIsSaving(false);
      }
    } else {
      showToast.error("Por favor, corrija os erros no formulário", theme);
    }
  };

  if (!isOpen) return null;

  // Estilos para a imagem
  const imageContainerStyle = {
    marginBottom: "20px",
    textAlign: "center",
  };

  const imageStyle = {
    maxWidth: "100%",
    maxHeight: "200px",
    borderRadius: "8px",
    objectFit: "contain",
    border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
    padding: "4px",
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f9f9f9',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "✏️ Editar Item" : "➕ Adicionar Item"}
      disableOutsideClick={true}
      theme={theme}
    >
      {/* Exibir foto do item quando tiver URL da foto */}
      {externalFormData.fotoUrl && (
        <div style={imageContainerStyle}>
          <img 
            src={externalFormData.fotoUrl} 
            alt={`Foto de ${externalFormData.nome || 'item'}`}
            style={imageStyle}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallbackDiv = document.createElement('div');
              fallbackDiv.style.cssText = `
                max-width: 100%;
                max-height: 200px;
                border-radius: 8px;
                object-fit: contain;
                border: 1px solid ${theme === 'dark' ? '#444' : '#ddd'};
                padding: 4px;
                background-color: ${theme === 'dark' ? '#2a2a2a' : '#f9f9f9'};
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${theme === 'dark' ? '#999' : '#666'};
                font-size: 14px;
                padding: 20px;
              `;
              fallbackDiv.innerHTML = '🖼️ Imagem não disponível';
              parent.appendChild(fallbackDiv);
            }}
          />
        </div>
      )}

      <ValidatedInput
        label="Nome"
        name="nome"
        value={externalFormData.nome || ""}
        onChange={createFieldHandler("nome").onChange}
        onBlur={createFieldHandler("nome").onBlur}
        error={errors.nome}
        touched={touched.nome}
        theme={theme}
        required
        placeholder=""
        maxLength={100}
        disabled={isSaving}
        autoFocus
      />

      <ValidatedInput
        label="Marca"
        name="marca"
        value={externalFormData.marca || ""}
        onChange={createFieldHandler("marca").onChange}
        onBlur={createFieldHandler("marca").onBlur}
        error={errors.marca}
        touched={touched.marca}
        theme={theme}
        placeholder=""
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

      <ValidatedInput
        label="Loja"
        name="loja"
        value={externalFormData.loja || ""}
        onChange={createFieldHandler("loja").onChange}
        onBlur={createFieldHandler("loja").onBlur}
        error={errors.loja}
        touched={touched.loja}
        theme={theme}
        placeholder=""
        maxLength={100}
        disabled={isSaving}
      />

      <PainelPesquisaPrecos
        nome={externalFormData.nome}
        marca={externalFormData.marca}
        onSelectItem={handleSelectProductItem}
        onSelectPrice={(price) => {
          setExternalFormData((prev) => ({ ...prev, preco: price }));
          setPrecoRaw(price);
        }}
        theme={theme}
      />

      <ValidatedInput
        label="Quantidade"
        name="quantidade"
        type="number"
        value={externalFormData.quantidade || 1}
        onChange={createFieldHandler("quantidade").onChange}
        onBlur={createFieldHandler("quantidade").onBlur}
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
        value={externalFormData.pagamento || "normal"}
        onChange={(e) =>
          setExternalFormData((prev) => ({
            ...prev,
            pagamento: e.target.value,
          }))
        }
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
          {isSaving ? "Salvando..." : isEditing ? "Salvar" : "Adicionar"}
        </SalvarButton>
      </ModalButtons>
    </Modal>
  );
};

export default ItemFormModal;