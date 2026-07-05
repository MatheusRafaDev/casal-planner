import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { itensService } from '../services/itensService';
import { groqService } from '../services/groqService';
import { useItemValidation } from '../hooks/useItemValidation';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { showToast } from '../utils/toastUtils';
import PainelPesquisaPrecos from "./PainelPesquisaPrecos";
import { AlertCircle, AlertTriangle, CheckCircle, CreditCard, Wallet, ShoppingCart, Gift, ExternalLink, Tag, Box, DollarSign, Package, Calendar, Store, Zap, Clock, Hourglass, Banknote, UtensilsCrossed } from "lucide-react";

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
  TwoColumnGrid, SingleColumnGrid, SectionDivider,
  ScrollContent,
  OptionGroup,
  OptionBtn
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
  parcelas: 1,
  origem: "comprado",
};

const PRIORIDADE_LABEL = {
  urgente:      { label: "Primeira necessidade", color: "#ef4444", bg: "#ef444418", icon: <AlertCircle size={14} /> },
  normal:       { label: "Próximas compras",      color: "#f59e0b", bg: "#f59e0b18", icon: <AlertTriangle size={14} /> },
  pode_esperar: { label: "Mais para frente",    color: "#22c55e", bg: "#22c55e18", icon: <CheckCircle size={14} /> },
};

const PAGAMENTO_LABEL = {
  normal: { label: "Normal", color: "#3b82f6", bg: "#3b82f618", icon: <CreditCard size={14} /> },
  vr:     { label: "VR/VA",  color: "#f59e0b", bg: "#f59e0b18", icon: <Wallet size={14} /> },
};

const fmtData = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const ReadOnlyBadge = ({ children, color, bg, icon }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "0.3rem",
    padding: "0.3rem 0.7rem", borderRadius: "999px",
    fontSize: "0.82rem", fontWeight: 600,
    color: color || "#555", background: bg || "#f3f4f6",
    border: `1px solid ${color ? color + "40" : "#e5e7eb"}`,
    whiteSpace: "nowrap",
  }}>
    {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
    {children}
  </span>
);

// ─── ProductHero — foto grande com overlay de informações ────────────────────
const ProductHero = ({ formData, theme, isEditing }) => {
  const [imgError, setImgError] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const hasFoto = formData.fotoUrl && !imgError;

  const prio = PRIORIDADE_LABEL[formData.prioridade] || PRIORIDADE_LABEL.normal;
  const pag  = PAGAMENTO_LABEL[formData.pagamento]   || PAGAMENTO_LABEL.normal;

  if (!hasFoto && !isEditing) return null;
  if (!hasFoto) return null;

  return (
    <>
      {/* Hero banner */}
      <div
        onClick={() => setLightbox(true)}
        style={{
          position: "relative",
          width: "100%",
          height: "220px",
          borderRadius: "1rem",
          overflow: "hidden",
          cursor: "zoom-in",
          marginBottom: "0.25rem",
          background: theme?.border || "#f1f5f9",
          flexShrink: 0,
        }}
      >
        {/* Imagem de fundo desfocada (blur fill) */}
        <img
          src={formData.fotoUrl}
          alt=""
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "blur(18px) brightness(0.55) saturate(1.4)",
            transform: "scale(1.15)",
            pointerEvents: "none",
          }}
        />

        {/* Imagem principal centralizada */}
        <img
          src={formData.fotoUrl}
          alt={formData.nome}
          onError={() => setImgError(true)}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "contain",
            padding: "12px",
          }}
        />

        {/* Gradiente bottom para legibilidade dos badges */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "80px",
          background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
          pointerEvents: "none",
        }}/>

        {/* Badges na parte inferior da foto */}
        <div style={{
          position: "absolute", bottom: "10px", left: "12px", right: "12px",
          display: "flex", flexWrap: "wrap", gap: "6px",
        }}>

          {isEditing && formData.createdAt && (
            <span style={{
              padding: "3px 10px", borderRadius: "999px",
              fontSize: "0.72rem", fontWeight: 700,
              background: "rgba(0,0,0,0.45)", color: "#fff",
            }}>
              📅 {fmtData(formData.createdAt)}
            </span>
          )}
        </div>

      </div>

      {/* Lightbox portal */}
      {lightbox && ReactDOM.createPortal(
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px", cursor: "zoom-out",
            animation: "lbIn .15s ease-out",
          }}
        >
          <style>{`@keyframes lbIn{from{opacity:0}to{opacity:1}}`}</style>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh", cursor: "default" }}>
            <img
              src={formData.fotoUrl}
              alt={formData.nome}
              style={{ maxWidth: "100%", maxHeight: "100vh", objectFit: "contain", borderRadius: "12px", display: "block", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
            />
            <button
              onClick={() => setLightbox(false)}
              style={{
                position: "absolute", top: "-14px", right: "-14px",
                width: "34px", height: "34px", borderRadius: "50%",
                background: "#fff", border: "none", cursor: "pointer",
                fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
              }}
            >✕</button>
            <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: "10px", fontSize: "0.8rem" }}>
              {formData.nome} · clique fora ou ✕ para fechar
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// ─── ItemFormModal ────────────────────────────────────────────────────────────
const ItemFormModal = ({
  isOpen,
  onClose,
  onSave,
  theme,
  itemParaEditar = null,
  isEditing = false,
  categoriaId = null,
  categorias = []
}) => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef(false);
  const nomeInputRef = useRef(null);
  const mountedRef = useRef(true);
  const [duplicataAlert, setDuplicataAlert] = useState(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const debounceRef = useRef(null);

  const {
    errors, touched, validarFormulario, handleBlur,
    handleChange, resetValidation, setErrors, setTouched,
  } = useItemValidation();

  const {
    formattedValue: precoFormatado,
    handlePriceChange: hookPriceChange,
    handlePriceBlur,
    setPrice: setPrecoRaw,
    resetPrice,
  } = usePriceFormat(formData?.preco || 0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      submissionRef.current = false;

      if (isEditing && itemParaEditar) {
        setFormData({
          id:          itemParaEditar.id || null,
          nome:        itemParaEditar.nome || "",
          marca:       itemParaEditar.marca || "",
          preco:       itemParaEditar.preco || 0,
          quantidade:  itemParaEditar.quantidade || 1,
          pagamento:   itemParaEditar.pagamento || "normal",
          prioridade:  itemParaEditar.prioridade || "normal",
          categoriaId: itemParaEditar.categoriaId || categoriaId,
          loja:        itemParaEditar.loja || "",
          linkProduto: itemParaEditar.linkProduto || "",
          fotoUrl:     itemParaEditar.fotoUrl || "",
          createdAt:   itemParaEditar.createdAt || null,
          origem:      itemParaEditar.origem || "comprado",
          origemDescricao: itemParaEditar.origemDescricao || "",
          variantes:   itemParaEditar.variantes || [],
          varianteSelecionadaId: itemParaEditar.varianteSelecionadaId || null,
          parcelas:    itemParaEditar.pagamento === 'vr' ? 1 : (itemParaEditar.parcelas || 1),
        });
        if (itemParaEditar.preco !== undefined && itemParaEditar.preco !== null) {
          setPrecoRaw(Number(itemParaEditar.preco) || 0);
        }
      } else if (!isEditing) {
        setFormData({ ...DEFAULT_FORM_DATA, categoriaId });
        resetPrice();
        resetValidation();
      }

      setTimeout(() => {
        if (nomeInputRef.current && mountedRef.current) nomeInputRef.current.focus();
      }, 100);
    }
  }, [isOpen, isEditing, itemParaEditar, categoriaId, resetValidation, setPrecoRaw, resetPrice]);

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

  const handleClose = useCallback(() => {
    if (isSubmitting || loading) return;
    resetValidation();
    resetPrice();
    setIsSubmitting(false);
    submissionRef.current = false;
    onClose();
  }, [resetValidation, resetPrice, onClose, isSubmitting, loading]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting && !loading) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, handleClose, isSubmitting, loading]);

  const handleSelectProductItem = useCallback((item) => {
    if (isSubmitting || loading) return;
    // Ao editar, não substitui foto já existente no item
    const manterFoto = isEditing && itemParaEditar?.fotoUrl;
    setFormData(prev => ({
      ...prev,
      nome: item.nome || prev.nome,
      marca: item.marca || prev.marca,
      preco: item.preco || prev.preco,
      loja: item.loja || prev.loja || "",
      linkProduto: item.linkProduto || prev.linkProduto || "",
      fotoUrl: manterFoto ? prev.fotoUrl : (item.fotoUrl || prev.fotoUrl || ""),
    }));
    setPrecoRaw(item.preco);
    handleChange("preco", item.preco, true);
  }, [isSubmitting, loading, isEditing, itemParaEditar, setPrecoRaw, handleChange]);

  const handleFieldChange = useCallback((fieldName, value) => {
    if (isSubmitting || loading) return;
    setFormData(prev => {
      const next = { ...prev, [fieldName]: value };
      if (fieldName === 'pagamento' && value === 'vr') {
        next.parcelas = 1;
      }
      return next;
    });
    handleChange(fieldName, value, touched[fieldName]);
  }, [isSubmitting, loading, handleChange, touched]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
  }, [handleFieldChange]);

  const handleQuantidadeChange = useCallback((delta) => {
    if (isSubmitting || loading) return;
    const newQtd = Math.max(1, Math.min(999999, (formData.quantidade || 1) + delta));
    handleFieldChange("quantidade", newQtd);
  }, [isSubmitting, loading, formData.quantidade, handleFieldChange]);

  const handlePrecoChange = useCallback((e) => {
    if (isSubmitting || loading) return;
    const result = hookPriceChange(e);
    if (result && result.raw !== undefined) {
      setFormData(prev => ({ ...prev, preco: result.raw }));
      handleChange("preco", result.raw, touched.preco);
    }
  }, [isSubmitting, loading, hookPriceChange, handleChange, touched.preco]);

  const handlePrecoBlur = useCallback(() => {
    if (isSubmitting || loading) return;
    handlePriceBlur();
    handleBlur("preco", formData.preco);
  }, [isSubmitting, loading, handlePriceBlur, handleBlur, formData.preco]);

  const handleNomeChange = useCallback((e) => {
    const value = e.target.value;
    handleInputChange(e);
    setDuplicataAlert(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (value.trim().length >= 3) {
        try {
          const result = await groqService.detectarDuplicata(value.trim());
          if (result && result.detectado) {
            setDuplicataAlert({
              message: result.mensagem || `Possível duplicata: ${result.itemSimilar}`,
              itemSimilar: result.itemSimilar
            });
          }
        } catch (err) {
          console.error("Erro ao detectar duplicata:", err);
        }
      }
    }, 800);
  }, [handleInputChange]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting || loading || submissionRef.current) return;

    const allTouched = { nome: true, marca: true, preco: true, quantidade: true, categoriaId: true };
    setTouched(allTouched);

    const novosErros = validarFormulario(formData, precoFormatado);
    setErrors(novosErros);

    if (formData.preco <= 0) {
      setErrors(prev => ({ ...prev, preco: "Preço deve ser maior que zero" }));
      showToast.error("Preço deve ser maior que zero", theme);
      return;
    }

    if (!formData.categoriaId) {
      setErrors(prev => ({ ...prev, categoriaId: "Selecione uma categoria" }));
      showToast.error("Selecione uma categoria para o item", theme);
      return;
    }

    if (Object.values(novosErros).some(e => e && e !== "")) {
      showToast.error("Por favor, corrija os erros no formulário", theme);
      return;
    }

    setIsSubmitting(true);
    submissionRef.current = true;
    setLoading(true);

    try {
      const dadosParaEnvio = {
        nome:        formData.nome?.trim() || "",
        marca:       formData.marca?.trim() || "",
        preco:       Number(formData.preco),
        quantidade:  Number(formData.quantidade),
        pagamento:   formData.pagamento || "normal",
        prioridade:  formData.prioridade || "normal",
        categoriaId: formData.categoriaId,
        loja:        formData.loja?.trim() || "",
        linkProduto: formData.linkProduto?.trim() || "",
        fotoUrl:     formData.fotoUrl?.trim() || "",
        parcelas:    Number(formData.parcelas) || 1,
        origem:      formData.origem || "comprado",
      };
      if (isEditing && formData.id) dadosParaEnvio.id = formData.id;

      await onSave(dadosParaEnvio);

      if (mountedRef.current) {
        showToast.success(
          isEditing ? `Item "${formData.nome}" atualizado!` : `Item "${formData.nome}" adicionado!`,
          theme
        );
        handleClose();
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      if (mountedRef.current) {
        if (error.response?.status === 400)      showToast.error('Dados inválidos. Verifique as informações.', theme);
        else if (error.response?.status === 401) showToast.error('Sessão expirada. Faça login novamente.', theme);
        else showToast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} item. Tente novamente.`, theme);
      }
      submissionRef.current = false;
    } finally {
      if (mountedRef.current) { setLoading(false); setIsSubmitting(false); }
    }
  }, [isSubmitting, loading, formData, precoFormatado, setTouched, validarFormulario, setErrors, theme, onSave, isEditing, handleClose]);

  const handleKeyDownForm = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
    }
  };

  const handleButtonClick = useCallback((e) => {
    if (isSubmitting || loading || submissionRef.current) e.preventDefault();
  }, [isSubmitting, loading]);

  const [linksTemp, setLinksTemp] = useState({ linkProduto: "", fotoUrl: "" });

  const openLinksModal = () => {
    setLinksTemp({ linkProduto: formData.linkProduto || "", fotoUrl: formData.fotoUrl || "" });
    setShowLinksModal(true);
  };

  const saveLinksModal = () => {
    handleFieldChange("linkProduto", linksTemp.linkProduto);
    handleFieldChange("fotoUrl", linksTemp.fotoUrl);
    setShowLinksModal(false);
  };

  const modalContent = (
    <Overlay theme={theme}>
      {showLinksModal && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 999999, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }} onClick={() => setShowLinksModal(false)}>
          <div style={{
            background: theme?.surface || "#fff", width: "100%", maxWidth: "400px", borderRadius: "16px",
            padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px 0", color: theme?.text }}>Links e Mídia</h3>
            
            <FormGroup>
              <Label theme={theme}>Link do produto</Label>
              <Input
                type="url" value={linksTemp.linkProduto}
                onChange={e => setLinksTemp(p => ({...p, linkProduto: e.target.value}))}
                placeholder="https://..." theme={theme}
                style={{ marginBottom: "16px" }}
              />
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>URL da foto</Label>
              <Input
                type="url" value={linksTemp.fotoUrl}
                onChange={e => setLinksTemp(p => ({...p, fotoUrl: e.target.value}))}
                placeholder="https://..." theme={theme}
                style={{ marginBottom: "16px" }}
              />
              {linksTemp.fotoUrl && (
                <div style={{ marginTop: "12px", width: "100%", height: "120px", borderRadius: "8px", overflow: "hidden", background: theme?.surface2 || "#f3f4f6" }}>
                  <img src={linksTemp.fotoUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </FormGroup>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
              <button type="button" onClick={() => setShowLinksModal(false)} style={{
                padding: "10px 16px", borderRadius: "8px", border: `1px solid ${theme?.border || "#e5e7eb"}`,
                background: "transparent", color: theme?.text, cursor: "pointer", fontWeight: 600
              }}>
                Cancelar
              </button>
              <button type="button" onClick={saveLinksModal} style={{
                padding: "10px 16px", borderRadius: "8px", border: "none",
                background: theme?.primary || "#3b82f6", color: "#fff", cursor: "pointer", fontWeight: 600
              }}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalContainer theme={theme} onClick={e => e.stopPropagation()}>
        <SheetHandle theme={theme} />
        <Header theme={theme}>
          <h2>{isEditing ? 'Editar Item' : 'Adicionar Item'}</h2>
          <CloseButton onClick={handleClose} theme={theme} aria-label="Fechar" disabled={isSubmitting || loading}>✕</CloseButton>
        </Header>

        <ScrollContent>
          <Form onSubmit={handleSubmit} onKeyDown={handleKeyDownForm}>

            {/* ── Foto grande (hero) — só aparece quando há fotoUrl ── */}
            <ProductHero formData={formData} theme={theme} isEditing={isEditing} />

            {/* Nome */}
            <FormGroup>
              <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><Tag size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Nome do item *</Label>
              <Input
                ref={nomeInputRef}
                type="text" name="nome" value={formData.nome || ""}
                onChange={handleNomeChange}
                onBlur={() => handleBlur('nome', formData.nome)}
                placeholder=""
                theme={theme}
                style={{ borderColor: errors.nome && touched.nome ? '#dc3545' : undefined }}
                maxLength={300} disabled={loading || isSubmitting} autoComplete="off"
              />
              {errors.nome && touched.nome && <ErrorMessage theme={theme}>{errors.nome}</ErrorMessage>}
              {duplicataAlert && (
                <div style={{
                  marginTop: "0.5rem",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "0.4rem",
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  fontSize: "0.85rem",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}>
                  <AlertTriangle size={18} />
                  <span>{duplicataAlert.message}</span>
                </div>
              )}
            </FormGroup>

            {/* Marca + Loja */}
            <TwoColumnGrid>
              <FormGroup>
                <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><Box size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Marca</Label>
                <Input
                  type="text" name="marca" value={formData.marca || ""}
                  onChange={handleInputChange} onBlur={() => handleBlur('marca', formData.marca)}
                  placeholder="" theme={theme}
                  maxLength={50} disabled={loading || isSubmitting} autoComplete="off"
                />
                {errors.marca && touched.marca && <ErrorMessage theme={theme}>{errors.marca}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><Store size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Loja</Label>
                <Input
                  type="text" name="loja" value={formData.loja || ""}
                  onChange={handleInputChange} onBlur={() => handleBlur('loja', formData.loja)}
                  placeholder="" theme={theme}
                  maxLength={100} disabled={loading || isSubmitting} autoComplete="off"
                />
                {errors.loja && touched.loja && <ErrorMessage theme={theme}>{errors.loja}</ErrorMessage>}
              </FormGroup>
            </TwoColumnGrid>

            {/* Preço + Quantidade */}
            <TwoColumnGrid>
              <FormGroup>
                <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><DollarSign size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Preço Unitário *</Label>
                <Input
                  type="tel" name="preco" value={precoFormatado}
                  onChange={handlePrecoChange} onBlur={handlePrecoBlur}
                  placeholder="" theme={theme}
                  style={{ borderColor: errors.preco && touched.preco ? '#dc3545' : undefined }}
                  disabled={loading || isSubmitting} inputMode="decimal"
                />
                {errors.preco && touched.preco && <ErrorMessage theme={theme}>{errors.preco}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label theme={theme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <Package size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Quantidade
                  </span>
                </Label>
                <QuantidadeWrapper>
                  <QuantidadeButton type="button" onClick={() => handleQuantidadeChange(-1)}
                    disabled={loading || isSubmitting || formData.quantidade <= 1} theme={theme}>−</QuantidadeButton>
                  <QuantidadeInput
                    type="number" name="quantidade" value={formData.quantidade || 1}
                    onChange={e => { const v = parseInt(e.target.value) || 1; handleFieldChange("quantidade", Math.max(1, Math.min(999999, v))); }}
                    onBlur={() => handleBlur('quantidade', formData.quantidade)}
                    min="1" max="999999" step="1" theme={theme} disabled={loading || isSubmitting}
                  />
                  <QuantidadeButton type="button" onClick={() => handleQuantidadeChange(1)}
                    disabled={loading || isSubmitting} theme={theme}>+</QuantidadeButton>
                </QuantidadeWrapper>
                {errors.quantidade && touched.quantidade && <ErrorMessage theme={theme}>{errors.quantidade}</ErrorMessage>}
              </FormGroup>
            </TwoColumnGrid>

            {/* Categoria */}
            <FormGroup>
              <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><Box size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Categoria</Label>
              <Select
                name="categoriaId"
                value={formData.categoriaId || ""}
                onChange={e => handleFieldChange("categoriaId", e.target.value)}
                theme={theme} disabled={loading || isSubmitting}
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categorias?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </Select>
            </FormGroup>

            {/* Parcelas */}
            <FormGroup>
              <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><Calendar size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Parcelas</Label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Select
                  value={formData.parcelas || 1}
                  onChange={e => handleFieldChange("parcelas", parseInt(e.target.value) || 1)}
                  theme={theme} disabled={loading || isSubmitting || formData.pagamento === 'vr'}
                  style={{ flex: 1 }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(num => (
                    <option key={num} value={num}>
                      {num === 1 ? 'À vista (1x)' : `${num}x`}
                    </option>
                  ))}
                </Select>
                {formData.parcelas > 1 && formData.preco > 0 && (
                  <div style={{ fontSize: "0.85rem", color: theme?.textLight, flex: 1 }}>
                    {formData.parcelas}x de R$ {((formData.preco * (formData.quantidade || 1)) / formData.parcelas).toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            </FormGroup>



            {/* Origem */}
            <FormGroup>
              <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><ShoppingCart size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Origem</Label>
              <OptionGroup>
                <OptionBtn
                  type="button"
                  theme={theme}
                  $active={formData.origem === 'comprado'}
                  $color="#6366f1"
                  disabled={loading || isSubmitting}
                  onClick={() => handleFieldChange('origem', 'comprado')}
                >
                  <ShoppingCart size={15} />
                  Comprado
                </OptionBtn>
                <OptionBtn
                  type="button"
                  theme={theme}
                  $active={formData.origem === 'presente'}
                  $color="#ec4899"
                  disabled={loading || isSubmitting}
                  onClick={() => handleFieldChange('origem', 'presente')}
                >
                  <Gift size={15} />
                  Presente
                </OptionBtn>
              </OptionGroup>
            </FormGroup>



            {/* Pesquisa de preços */}
            <PainelPesquisaPrecos
              nome={formData.nome} marca={formData.marca}
              onSelectItem={handleSelectProductItem}
              onSelectPrice={price => {
                if (!isSubmitting && !loading) { handleFieldChange("preco", price); setPrecoRaw(price); }
              }}
              theme={theme}
            />

            {/* Pagamento + Prioridade */}
            <TwoColumnGrid>
              <FormGroup>
                <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><CreditCard size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Pagamento</Label>
                <OptionGroup>
                  <OptionBtn
                    type="button"
                    theme={theme}
                    $active={(formData.pagamento || 'normal') === 'normal'}
                    $color="#10b981"
                    disabled={loading || isSubmitting}
                    onClick={() => handleFieldChange('pagamento', 'normal')}
                  >
                    <Banknote size={15} />
                    Normal (Dinheiro/Cartão)
                  </OptionBtn>
                  <OptionBtn
                    type="button"
                    theme={theme}
                    $active={formData.pagamento === 'vr'}
                    $color="#f59e0b"
                    disabled={loading || isSubmitting}
                    onClick={() => handleFieldChange('pagamento', 'vr')}
                  >
                    <UtensilsCrossed size={15} />
                    VR / VA
                  </OptionBtn>
                </OptionGroup>
              </FormGroup>

              <FormGroup>
                <Label theme={theme} style={{ display: 'flex', alignItems: 'center' }}><AlertCircle size={16} style={{ marginRight: '6px', opacity: 0.7 }} /> Prioridade</Label>
                <OptionGroup>
                  <OptionBtn
                    type="button"
                    theme={theme}
                    $active={formData.prioridade === 'urgente'}
                    $color="#ef4444"
                    disabled={loading || isSubmitting}
                    onClick={() => handleFieldChange('prioridade', 'urgente')}
                  >
                    <Zap size={15} />
                    Primeira necessidade
                  </OptionBtn>
                  <OptionBtn
                    type="button"
                    theme={theme}
                    $active={(formData.prioridade || 'normal') === 'normal'}
                    $color="#f59e0b"
                    disabled={loading || isSubmitting}
                    onClick={() => handleFieldChange('prioridade', 'normal')}
                  >
                    <Clock size={15} />
                    Próximas compras
                  </OptionBtn>
                  <OptionBtn
                    type="button"
                    theme={theme}
                    $active={formData.prioridade === 'pode_esperar'}
                    $color="#22c55e"
                    disabled={loading || isSubmitting}
                    onClick={() => handleFieldChange('prioridade', 'pode_esperar')}
                  >
                    <Hourglass size={15} />
                    Mais para frente
                  </OptionBtn>
                </OptionGroup>
              </FormGroup>
            </TwoColumnGrid>


            {/* Botões */}
            <ModalButtons>
              {formData.preco > 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', fontSize: '1.1rem', fontWeight: 700, color: theme?.text || '#111' }}>
                  Total: R$ {((formData.preco * (formData.quantidade || 1))).toFixed(2).replace('.', ',')}
                </div>
              )}
              <CancelarButton type="button" onClick={handleClose} disabled={loading || isSubmitting} theme={theme}>
                Cancelar
              </CancelarButton>
              <SalvarButton
                type="submit" onClick={handleButtonClick}
                disabled={loading || isSubmitting || !formData.nome?.trim()}
                theme={theme}
              >
                {(loading || isSubmitting)
                  ? (isEditing ? 'Salvando...' : 'Adicionando...')
                  : (isEditing ? 'Salvar' : 'Adicionar')}
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