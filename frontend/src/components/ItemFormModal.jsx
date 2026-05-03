import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// ─── helpers ─────────────────────────────────────────────────────────────────

const PRIORIDADE_LABEL = {
  urgente:      { label: "Urgente",       emoji: "🔴", color: "#ef4444", bg: "#ef444418" },
  normal:       { label: "Normal",        emoji: "🟡", color: "#f59e0b", bg: "#f59e0b18" },
  pode_esperar: { label: "Pode esperar",  emoji: "🟢", color: "#22c55e", bg: "#22c55e18" },
};

const PAGAMENTO_LABEL = {
  normal: { label: "Normal", emoji: "💵", color: "#3b82f6", bg: "#3b82f618" },
  vr:     { label: "VR/VA",  emoji: "🍽️", color: "#f59e0b", bg: "#f59e0b18" },
};

const fmtData = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// ─── ReadOnlyBadge ────────────────────────────────────────────────────────────
const ReadOnlyBadge = ({ children, color, bg, emoji }) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.3rem 0.7rem",
    borderRadius: "999px",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: color || "#555",
    background: bg || "#f3f4f6",
    border: `1px solid ${color ? color + "40" : "#e5e7eb"}`,
    whiteSpace: "nowrap",
  }}>
    {emoji && <span>{emoji}</span>}
    {children}
  </span>
);

// ─── ReadOnlyField ────────────────────────────────────────────────────────────
// Label + um ou mais badges
const ReadOnlyField = ({ label, theme, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
    <span style={{
      fontSize: "0.78rem",
      fontWeight: 600,
      color: theme?.textSoft || "#888",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    }}>
      {label}
    </span>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
      {children}
    </div>
  </div>
);

// ─── EditModeHeader ──────────────────────────────────────────────────────────
// Bloco de resumo visual que substitui os campos bloqueados na edição
const EditModeHeader = ({ formData, theme }) => {
  const prio = PRIORIDADE_LABEL[formData.prioridade] || PRIORIDADE_LABEL.normal;
  const pag  = PAGAMENTO_LABEL[formData.pagamento]   || PAGAMENTO_LABEL.normal;

  return (
    <div style={{
      background: theme?.surface || "#f8fafc",
      border: `1px solid ${theme?.border || "#e5e7eb"}`,
      borderRadius: "1rem",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      marginBottom: "0.25rem",
    }}>

      {/* Foto + Nome + Marca */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {formData.fotoUrl && (
          <img
            src={formData.fotoUrl}
            alt={formData.nome}
            style={{
              width: 56, height: 56,
              objectFit: "cover",
              borderRadius: "0.6rem",
              border: `1px solid ${theme?.border || "#e5e7eb"}`,
              flexShrink: 0,
            }}
            onError={e => { e.target.style.display = "none"; }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: theme?.text || "#111",
            wordBreak: "break-word",
            lineHeight: 1.3,
          }}>
            {formData.nome || "—"}
          </div>
          {formData.marca && (
            <div style={{
              fontSize: "0.78rem",
              color: theme?.textSoft || "#888",
              marginTop: "0.2rem",
            }}>
              {formData.marca}
            </div>
          )}
        </div>
      </div>

      {/* Linha de badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {/* Prioridade */}
        <ReadOnlyBadge color={prio.color} bg={prio.bg} emoji={prio.emoji}>
          {prio.label}
        </ReadOnlyBadge>

        {/* Pagamento */}
        <ReadOnlyBadge color={pag.color} bg={pag.bg} emoji={pag.emoji}>
          {pag.label}
        </ReadOnlyBadge>

        {/* Quantidade */}
        <ReadOnlyBadge color="#6366f1" bg="#6366f118" emoji="📦">
          {formData.quantidade}x
        </ReadOnlyBadge>

        {/* Data de inclusão */}
        {formData.createdAt && (
          <ReadOnlyBadge color="#64748b" bg="#64748b12" emoji="📅">
            {fmtData(formData.createdAt)}
          </ReadOnlyBadge>
        )}

        {/* Loja */}
        {formData.loja && (
          <ReadOnlyBadge color="#0ea5e9" bg="#0ea5e912" emoji="🏪">
            {formData.loja}
          </ReadOnlyBadge>
        )}
      </div>

      {/* Aviso somente leitura */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.72rem",
        color: theme?.textSoft || "#999",
        borderTop: `1px solid ${theme?.border || "#e5e7eb"}`,
        paddingTop: "0.6rem",
      }}>
        <span>🔒</span>
        <span>Informações do produto. Apenas o preço pode ser alterado.</span>
      </div>
    </div>
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
  categoriaId = null
}) => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionRef = useRef(false);
  const nomeInputRef = useRef(null);
  const mountedRef = useRef(true);

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
    setFormData(prev => ({
      ...prev,
      nome: item.nome, marca: item.marca, preco: item.preco,
      loja: item.loja || "", linkProduto: item.linkProduto || "", fotoUrl: item.fotoUrl || "",
    }));
    setPrecoRaw(item.preco);
    handleChange("preco", item.preco, true);
  }, [isSubmitting, loading, setPrecoRaw, handleChange]);

  const handleFieldChange = useCallback((fieldName, value) => {
    if (isSubmitting || loading) return;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
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

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting || loading || submissionRef.current) return;

    const allTouched = { nome: true, marca: true, preco: true, quantidade: true };
    setTouched(allTouched);

    const novosErros = validarFormulario(formData, precoFormatado);
    setErrors(novosErros);

    if (formData.preco <= 0) {
      setErrors(prev => ({ ...prev, preco: "Preço deve ser maior que zero" }));
      showToast.error("Preço deve ser maior que zero", theme);
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

  const handleButtonClick = useCallback((e) => {
    if (isSubmitting || loading || submissionRef.current) e.preventDefault();
  }, [isSubmitting, loading]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const modalContent = (
    <Overlay theme={theme} onClick={handleClose}>
      <ModalContainer theme={theme} onClick={e => e.stopPropagation()}>
        <SheetHandle theme={theme} />
        <Header theme={theme}>
          <h2>{isEditing ? '✏️ Editar Item' : '➕ Adicionar Item'}</h2>
          <CloseButton onClick={handleClose} theme={theme} aria-label="Fechar" disabled={isSubmitting || loading}>✕</CloseButton>
        </Header>

        <ScrollContent>
          <Form onSubmit={handleSubmit}>

            {/* Formulário idêntico em ambos os modos.
                No modo edição: foto + data aparecem como badge no topo,
                todos os outros campos permanecem editáveis. */}
            <>
              {/* ── Cabeçalho visual (foto + data de inclusão) — sempre visível ── */}
              {(formData.fotoUrl || (isEditing && formData.createdAt)) && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  background: theme?.surface || "#f8fafc",
                  border: `1px solid ${theme?.border || "#e5e7eb"}`,
                  borderRadius: "0.75rem",
                  marginBottom: "0.25rem",
                }}>
                  {formData.fotoUrl && (
                    <img
                      src={formData.fotoUrl}
                      alt={formData.nome}
                      style={{
                        width: 52, height: 52, objectFit: "cover",
                        borderRadius: "0.5rem",
                        border: `1px solid ${theme?.border || "#e5e7eb"}`,
                        flexShrink: 0,
                      }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {formData.nome && (
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: theme?.text || "#111", marginBottom: "0.3rem", wordBreak: "break-word" }}>
                        {formData.nome}
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                      {isEditing && formData.createdAt && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "0.2rem 0.55rem", borderRadius: "999px",
                          fontSize: "0.72rem", fontWeight: 600,
                          color: "#64748b", background: "#64748b12",
                          border: "1px solid #64748b30",
                        }}>
                          📅 Adicionado em {new Date(formData.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Nome */}
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
                  disabled={loading || isSubmitting}
                  autoComplete="off"
                />
                {errors.nome && touched.nome && <ErrorMessage theme={theme}>{errors.nome}</ErrorMessage>}
              </FormGroup>

              {/* Marca + Preço */}
              <TwoColumnGrid>
                <FormGroup>
                  <Label theme={theme}>Marca</Label>
                  <Input
                    type="text" name="marca" value={formData.marca || ""}
                    onChange={handleInputChange} onBlur={() => handleBlur('marca', formData.marca)}
                    placeholder="Ex: Apple, Nike, Amazon" theme={theme}
                    maxLength={50} disabled={loading || isSubmitting} autoComplete="off"
                  />
                  {errors.marca && touched.marca && <ErrorMessage theme={theme}>{errors.marca}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label theme={theme}>Preço *</Label>
                  <Input
                    type="tel" name="preco" value={precoFormatado}
                    onChange={handlePrecoChange} onBlur={handlePrecoBlur}
                    placeholder="R$ 0,00" theme={theme}
                    style={{ borderColor: errors.preco && touched.preco ? '#dc3545' : undefined }}
                    disabled={loading || isSubmitting} inputMode="decimal"
                  />
                  {errors.preco && touched.preco && <ErrorMessage theme={theme}>{errors.preco}</ErrorMessage>}
                </FormGroup>
              </TwoColumnGrid>

              {/* Quantidade */}
              <FormGroup>
                <Label theme={theme}>Quantidade</Label>
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

              {/* Loja */}
              <FormGroup>
                <Label theme={theme}>Loja</Label>
                <Input
                  type="text" name="loja" value={formData.loja || ""}
                  onChange={handleInputChange} onBlur={() => handleBlur('loja', formData.loja)}
                  placeholder="Onde comprou? Ex: Mercado Livre, Amazon, Shopee" theme={theme}
                  maxLength={100} disabled={loading || isSubmitting} autoComplete="off"
                />
                {errors.loja && touched.loja && <ErrorMessage theme={theme}>{errors.loja}</ErrorMessage>}
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
                  <Label theme={theme}>Pagamento</Label>
                  <Select value={formData.pagamento || "normal"} onChange={e => handleFieldChange("pagamento", e.target.value)}
                    theme={theme} disabled={loading || isSubmitting}>
                    <option value="normal">💵 Normal</option>
                    <option value="vr">🍽️ VR/VA</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label theme={theme}>Prioridade</Label>
                  <Select value={formData.prioridade || "normal"} onChange={e => handleFieldChange("prioridade", e.target.value)}
                    theme={theme} disabled={loading || isSubmitting}>
                    <option value="urgente">🔴 Urgente</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="pode_esperar">🟢 Pode esperar</option>
                  </Select>
                </FormGroup>
              </TwoColumnGrid>
            </>

            {/* Botões */}
            <ModalButtons>
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