import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { itensService } from '../services/itensService';
import { useItemValidation } from '../hooks/useItemValidation';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { showToast } from '../utils/toastUtils';
import PainelPesquisaPrecos from "./PainelPesquisaPrecos";

import {
  Overlay,
  ModalContainer,
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
  RowGrid
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
    }
  }, [isOpen, isEditing, itemParaEditar, categoriaId, resetValidation, setPrecoRaw, resetPrice]);

  // Previne scroll do body quando o modal está aberto - SEM position fixed
  useEffect(() => {
    if (!isOpen) return;
    
    // Apenas bloqueia o scroll, mantém a posição
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Remove o bloqueio, a posição permanece a mesma
      document.body.style.overflow = '';
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
    const finalValue = name === "quantidade" ? parseInt(value) || 1 : value;
    handleFieldChange(name, finalValue);
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
    <Overlay theme={theme}>
      <ModalContainer theme={theme}>
        <Header theme={theme}>
          <h2>{isEditing ? '✏️ Editar Item' : '➕ Adicionar Item'}</h2>
          <CloseButton onClick={handleClose} theme={theme}>✕</CloseButton>
        </Header>

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

          <RowGrid>
            <FormGroup>
              <Label theme={theme}>Nome *</Label>
              <Input
                type="text"
                name="nome"
                value={formData.nome || ""}
                onChange={handleInputChange}
                onBlur={() => handleBlur('nome', formData.nome)}
                placeholder="Digite o nome do item"
                autoFocus
                theme={theme}
                style={{ borderColor: errors.nome && touched.nome ? '#dc3545' : undefined }}
                maxLength={100}
                disabled={loading}
              />
              {errors.nome && touched.nome && <ErrorMessage theme={theme}>{errors.nome}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Marca</Label>
              <Input
                type="text"
                name="marca"
                value={formData.marca || ""}
                onChange={handleInputChange}
                onBlur={() => handleBlur('marca', formData.marca)}
                placeholder="Digite a marca"
                theme={theme}
                style={{ borderColor: errors.marca && touched.marca ? '#dc3545' : undefined }}
                maxLength={50}
                disabled={loading}
              />
              {errors.marca && touched.marca && <ErrorMessage theme={theme}>{errors.marca}</ErrorMessage>}
            </FormGroup>
          </RowGrid>

          <RowGrid>
            <FormGroup>
              <Label theme={theme}>Preço *</Label>
              <Input
                type="text"
                name="preco"
                value={precoFormatado}
                onChange={handlePrecoChange}
                onBlur={handlePrecoBlur}
                placeholder="0,00"
                theme={theme}
                style={{ borderColor: errors.preco && touched.preco ? '#dc3545' : undefined }}
                disabled={loading}
              />
              {errors.preco && touched.preco && <ErrorMessage theme={theme}>{errors.preco}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>Quantidade</Label>
              <Input
                type="number"
                name="quantidade"
                value={formData.quantidade || 1}
                onChange={handleInputChange}
                onBlur={() => handleBlur('quantidade', formData.quantidade)}
                min="1"
                max="999999"
                step="1"
                theme={theme}
                style={{ borderColor: errors.quantidade && touched.quantidade ? '#dc3545' : undefined }}
                disabled={loading}
              />
              {errors.quantidade && touched.quantidade && <ErrorMessage theme={theme}>{errors.quantidade}</ErrorMessage>}
            </FormGroup>
          </RowGrid>

          <FormGroup>
            <Label theme={theme}>Loja</Label>
            <Input
              type="text"
              name="loja"
              value={formData.loja || ""}
              onChange={handleInputChange}
              onBlur={() => handleBlur('loja', formData.loja)}
              placeholder="Nome da loja"
              theme={theme}
              style={{ borderColor: errors.loja && touched.loja ? '#dc3545' : undefined }}
              maxLength={100}
              disabled={loading}
            />
            {errors.loja && touched.loja && <ErrorMessage theme={theme}>{errors.loja}</ErrorMessage>}
          </FormGroup>

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

          <RowGrid>
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
          </RowGrid>

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
              disabled={loading || !formData.nome?.trim() || errors.nome} 
              theme={theme}
            >
              {loading ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Item')}
            </SalvarButton>
          </ModalButtons>
        </Form>
      </ModalContainer>
    </Overlay>
  );

  if (!isOpen) return null;

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ItemFormModal;