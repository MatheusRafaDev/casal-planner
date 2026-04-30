import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { itensService } from '../services/itensService';
import { useItemValidation } from '../hooks/useItemValidation';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { showToast } from '../utils/toastUtils';
import PainelPesquisaPrecos from "./PainelPesquisaPrecos";

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
  Select,
  ImageContainer,
  Image,
  ModalButtons,
  CancelarButton,
  SalvarButton,
  ErrorMessage,
  RowGrid,
  QuantidadeWrapper,
  QuantidadeButton,
  QuantidadeInput,
  TwoColumnGrid,
  ScrollContent
} from '../styles/components/ItemFormModalStyles';

const DEFAULT_FORM_DATA = {
  id: null,
  nome: "",
  marca: "",
  preco: 0,
  quantidade: 1,
  pagamento: "normal",
  prioridade: "normal",
  categoriaId: null,
  loja: "",           
  linkProduto: "",   
  fotoUrl: "",       
};

const ItemFormModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  theme,
  itemParaEditar = null,
  isEditing = false,
  categoriaId = null
}) => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const nomeInputRef = useRef(null);

  const {
    errors,
    touched,
    validarFormulario,
    handleBlur,
    handleChange,
    resetValidation,
    setErrors,
    setTouched,
  } = useItemValidation();

  const {
    formattedValue: precoFormatado,
    handlePriceChange: hookPriceChange,
    handlePriceBlur,
    setPrice: setPrecoRaw,
    resetPrice,
  } = usePriceFormat(formData?.preco || 0);

  // Atualiza o formulário quando o modal abre
  useEffect(() => {
    if (isOpen) {
      if (isEditing && itemParaEditar) {
        setFormData({
          id: itemParaEditar.id || null,
          nome: itemParaEditar.nome || "",
          marca: itemParaEditar.marca || "",
          preco: itemParaEditar.preco || 0,
          quantidade: itemParaEditar.quantidade || 1,
          pagamento: itemParaEditar.pagamento || "normal",
          prioridade: itemParaEditar.prioridade || "normal",
          categoriaId: itemParaEditar.categoriaId || categoriaId,
          loja: itemParaEditar.loja || "",           
          linkProduto: itemParaEditar.linkProduto || "",   
          fotoUrl: itemParaEditar.fotoUrl || "",       
        });
        
        if (itemParaEditar.preco !== undefined && itemParaEditar.preco !== null) {
          setPrecoRaw(Number(itemParaEditar.preco) || 0);
        }
      } else if (!isEditing) {
        setFormData({
          ...DEFAULT_FORM_DATA,
          categoriaId: categoriaId,
        });
        resetPrice();
        resetValidation();
      }
      
      // Foco no input nome ao abrir
      setTimeout(() => {
        if (nomeInputRef.current) {
          nomeInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, isEditing, itemParaEditar, categoriaId, resetValidation, setPrecoRaw, resetPrice]);

  // Previne scroll do body quando o modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    resetValidation();
    resetPrice();
    onClose();
  };

  // Atalho ESC para fechar modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleSelectProductItem = (item) => {
    setFormData((prev) => ({
      ...prev,
      nome: item.nome,
      marca: item.marca,
      preco: item.preco,
      loja: item.loja || "",           
      linkProduto: item.linkProduto || "",    
      fotoUrl: item.fotoUrl || "",      
    }));

    setPrecoRaw(item.preco);
    handleChange("preco", item.preco, true);
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    handleChange(fieldName, value, touched[fieldName]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
  };

  const handleQuantidadeChange = (delta) => {
    const newQuantidade = Math.max(1, Math.min(999999, (formData.quantidade || 1) + delta));
    handleFieldChange("quantidade", newQuantidade);
  };

  const handlePrecoChange = (e) => {
    const result = hookPriceChange(e);
    if (result && result.raw !== undefined) {
      setFormData((prev) => ({ ...prev, preco: result.raw }));
      handleChange("preco", result.raw, touched.preco);
    }
  };

  const handlePrecoBlur = () => {
    handlePriceBlur();
    handleBlur("preco", formData.preco);
  };

  const handleImageError = (e) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marca todos os campos como touched
    const allTouched = {
      nome: true,
      marca: true,
      preco: true,
      quantidade: true,
    };
    setTouched(allTouched);

    // Validação do formulário
    const novosErros = validarFormulario(formData, precoFormatado);
    setErrors(novosErros);

    // Verifica se há erros
    const hasErrors = Object.values(novosErros).some(erro => erro && erro !== "");
    
    // Validação extra para preço
    if (formData.preco <= 0) {
      setErrors((prev) => ({
        ...prev,
        preco: "Preço deve ser maior que zero",
      }));
      showToast.error("Preço deve ser maior que zero", theme);
      return;
    }

    if (hasErrors) {
      showToast.error("Por favor, corrija os erros no formulário", theme);
      return;
    }

    setLoading(true);
    try {
      const dadosParaEnvio = {
        nome: formData.nome?.trim() || "",
        marca: formData.marca?.trim() || "",
        preco: Number(formData.preco),
        quantidade: Number(formData.quantidade),
        pagamento: formData.pagamento || "normal",
        prioridade: formData.prioridade || "normal",
        categoriaId: formData.categoriaId,
        loja: formData.loja?.trim() || "",
        linkProduto: formData.linkProduto?.trim() || "",
        fotoUrl: formData.fotoUrl?.trim() || "",
      };

      // Se for edição, inclui o ID
      if (isEditing && formData.id) {
        dadosParaEnvio.id = formData.id;
      }

      await onSave(dadosParaEnvio);
      
      showToast.success(
        isEditing ? `Item "${formData.nome}" atualizado!` : `Item "${formData.nome}" adicionado!`,
        theme
      );
      
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      if (error.response?.status === 400) {
        showToast.error('Dados inválidos. Verifique as informações.', theme);
      } else if (error.response?.status === 401) {
        showToast.error('Sessão expirada. Faça login novamente.', theme);
      } else {
        showToast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} item. Tente novamente.`, theme);
      }
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <Overlay theme={theme} onClick={handleClose}>
      <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
        <SheetHandle theme={theme} />
        <Header theme={theme}>
          <h2>{isEditing ? '✏️ Editar Item' : '➕ Adicionar Item'}</h2>
          <CloseButton onClick={handleClose} theme={theme} aria-label="Fechar">✕</CloseButton>
        </Header>

        <ScrollContent>
          <Form onSubmit={handleSubmit}>
            {formData.fotoUrl && (
              <ImageContainer>
                <Image 
                  src={formData.fotoUrl} 
                  alt={`Foto de ${formData.nome || 'item'}`}
                  theme={theme}
                  onError={handleImageError}
                />
              </ImageContainer>
            )}

            {/* Nome do Item - Campo principal */}
            <FormGroup>
              <Label theme={theme}>Nome do item *</Label>
              <Input
                ref={nomeInputRef}
                type="text"
                name="nome"
                value={formData.nome || ""}
                onChange={handleInputChange}
                onBlur={() => handleBlur('nome', formData.nome)}
                placeholder="Ex: iPhone 15, Camisa Polo, Livro..."
                theme={theme}
                style={{ borderColor: errors.nome && touched.nome ? '#dc3545' : undefined }}
                maxLength={100}
                disabled={loading}
                autoComplete="off"
              />
              {errors.nome && touched.nome && <ErrorMessage theme={theme}>{errors.nome}</ErrorMessage>}
            </FormGroup>

            {/* Marca e Preço */}
            <TwoColumnGrid>
              <FormGroup>
                <Label theme={theme}>Marca</Label>
                <Input
                  type="text"
                  name="marca"
                  value={formData.marca || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('marca', formData.marca)}
                  placeholder="Ex: Apple, Nike, Amazon"
                  theme={theme}
                  maxLength={50}
                  disabled={loading}
                  autoComplete="off"
                />
                {errors.marca && touched.marca && <ErrorMessage theme={theme}>{errors.marca}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Preço *</Label>
                <Input
                  type="tel"
                  name="preco"
                  value={precoFormatado}
                  onChange={handlePrecoChange}
                  onBlur={handlePrecoBlur}
                  placeholder="R$ 0,00"
                  theme={theme}
                  style={{ borderColor: errors.preco && touched.preco ? '#dc3545' : undefined }}
                  disabled={loading}
                  inputMode="decimal"
                />
                {errors.preco && touched.preco && <ErrorMessage theme={theme}>{errors.preco}</ErrorMessage>}
              </FormGroup>
            </TwoColumnGrid>

            {/* Quantidade com botões + e - */}
            <FormGroup>
              <Label theme={theme}>Quantidade</Label>
              <QuantidadeWrapper>
                <QuantidadeButton 
                  type="button"
                  onClick={() => handleQuantidadeChange(-1)}
                  disabled={loading || formData.quantidade <= 1}
                  theme={theme}
                >
                  −
                </QuantidadeButton>
                <QuantidadeInput
                  type="number"
                  name="quantidade"
                  value={formData.quantidade || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    handleFieldChange("quantidade", Math.max(1, Math.min(999999, val)));
                  }}
                  onBlur={() => handleBlur('quantidade', formData.quantidade)}
                  min="1"
                  max="999999"
                  step="1"
                  theme={theme}
                  disabled={loading}
                />
                <QuantidadeButton 
                  type="button"
                  onClick={() => handleQuantidadeChange(1)}
                  disabled={loading}
                  theme={theme}
                >
                  +
                </QuantidadeButton>
              </QuantidadeWrapper>
              {errors.quantidade && touched.quantidade && <ErrorMessage theme={theme}>{errors.quantidade}</ErrorMessage>}
            </FormGroup>

            {/* Loja */}
            <FormGroup>
              <Label theme={theme}>Loja</Label>
              <Input
                type="text"
                name="loja"
                value={formData.loja || ""}
                onChange={handleInputChange}
                onBlur={() => handleBlur('loja', formData.loja)}
                placeholder="Onde comprou? Ex: Mercado Livre, Amazon, Shopee"
                theme={theme}
                maxLength={100}
                disabled={loading}
                autoComplete="off"
              />
              {errors.loja && touched.loja && <ErrorMessage theme={theme}>{errors.loja}</ErrorMessage>}
            </FormGroup>

            {/* Painel de Pesquisa */}
            <PainelPesquisaPrecos
              nome={formData.nome}
              marca={formData.marca}
              onSelectItem={handleSelectProductItem}
              onSelectPrice={(price) => {
                handleFieldChange("preco", price);
                setPrecoRaw(price);
              }}
              theme={theme}
            />

            {/* Pagamento e Prioridade */}
            <TwoColumnGrid>
              <FormGroup>
                <Label theme={theme}>Pagamento</Label>
                <Select
                  value={formData.pagamento || "normal"}
                  onChange={(e) => handleFieldChange("pagamento", e.target.value)}
                  theme={theme}
                  disabled={loading}
                >
                  <option value="normal">💵 Normal</option>
                  <option value="vr">🍽️ VR/VA</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Prioridade</Label>
                <Select
                  value={formData.prioridade || "normal"}
                  onChange={(e) => handleFieldChange("prioridade", e.target.value)}
                  theme={theme}
                  disabled={loading}
                >
                  <option value="urgente">🔴 Urgente</option>
                  <option value="normal">🟡 Normal</option>
                  <option value="pode_esperar">🟢 Pode esperar</option>
                </Select>
              </FormGroup>
            </TwoColumnGrid>

            {/* Botões */}
            <ModalButtons>
              <CancelarButton 
                type="button" 
                onClick={handleClose} 
                disabled={loading} 
                theme={theme}
              >
                Cancelar
              </CancelarButton>
              <SalvarButton 
                type="submit" 
                disabled={loading || !formData.nome?.trim()} 
                theme={theme}
              >
                {loading ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar' : 'Adicionar')}
              </SalvarButton>
            </ModalButtons>
          </Form>
        </ScrollContent>
      </ModalContainer>
    </Overlay>
  );

  if (!isOpen) return null;

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ItemFormModal;