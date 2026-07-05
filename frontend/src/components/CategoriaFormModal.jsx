import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as Styled from '../styles/components/CategoriaFormModalStyles';
import { categoriasService } from '../services/categoriasService';
import { showToast } from '../utils/toastUtils';
import DynamicIcon from './DynamicIcon';
import { ICONS, EMOJI_TO_LUCIDE_MAP, getAvailableColor, hslToHex } from '../constants/categoryConstants';

// Paleta de cores disponíveis para a categoria (hex)
const COLOR_PALETTE = [
  '#ef4444', // vermelho
  '#f97316', // laranja
  '#f59e0b', // âmbar
  '#84cc16', // verde-limão
  '#22c55e', // verde
  '#14b8a6', // teal
  '#3b82f6', // azul
  '#6366f1', // índigo
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#64748b', // slate
  '#a16207', // marrom
];

const hslStringToHex = (hsl) => {
  if (!hsl) return '#8b5cf6';
  if (hsl.startsWith('#')) return hsl;
  const match = hsl.match(/(\d+)\s*(\d+)%\s*(\d+)%/);
  if (!match) return '#8b5cf6';
  return hslToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
};

const hexToHslString = (hex) => {
  if (!hex || !hex.startsWith('#')) return hex || '240 70% 50%';
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0,2),16)/255;
  let g = parseInt(hex.substring(2,4),16)/255;
  let b = parseInt(hex.substring(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max===min) { h=s=0; } else {
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      default: h=(r-g)/d+4; break;
    }
    h/=6;
  }
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
};

const formatPrice = (value) => {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const parsePrice = (value) => {
  if (!value) return null;
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

const CategoriaFormModal = ({
  isOpen,
  onClose,
  onCategoryAdded,
  onDeleteCategoria,
  theme,
  categoriaParaEditar = null,
  isEditing = false,
  existingCategories = [],
  itensDaCategoria = [],
}) => {
  const [name, setName]                 = useState('');
  const [icon, setIcon]                 = useState('Home');
  const [color, setColor]               = useState(COLOR_PALETTE[6]); // azul padrão
  const [metaOrcamento, setMetaOrcamento] = useState('');
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState({});
  const [touched, setTouched]           = useState({});

  const firstInputRef = useRef(null);

  /* ── Fechar / Reset ── */
  const handleClose = () => { resetForm(); onClose(); };

  const resetForm = () => {
    setName('');
    setIcon('Home');
    setColor(COLOR_PALETTE[6]);
    setMetaOrcamento('');
    setErrors({});
    setTouched({});
    setLoading(false);
  };

  /* ── Preencher ao abrir em edição ── */
  useEffect(() => {
    if (isOpen && isEditing && categoriaParaEditar) {
      setName(categoriaParaEditar.nome || '');
      const rawIcon = categoriaParaEditar.icon || categoriaParaEditar.icone || 'Home';
      setIcon(EMOJI_TO_LUCIDE_MAP[rawIcon] || (ICONS.includes(rawIcon) ? rawIcon : 'Home'));
      const hexColor = hslStringToHex(categoriaParaEditar.bg);
      const palette = COLOR_PALETTE.includes(hexColor) ? hexColor : COLOR_PALETTE[6];
      setColor(palette);
      const metaValue = categoriaParaEditar.metaOrcamento != null ? categoriaParaEditar.metaOrcamento : '';
      setMetaOrcamento(metaValue ? formatPrice(metaValue) : '');
    } else if (isOpen && !isEditing) {
      resetForm();
      // Escolher cor automática baseada nas existentes
      const autoHsl = getAvailableColor(existingCategories);
      const autoHex = hslStringToHex(autoHsl);
      const nearest = COLOR_PALETTE.find(c => c === autoHex) || COLOR_PALETTE[0];
      setColor(nearest);
    }
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 120);
    }
  }, [isOpen, isEditing, categoriaParaEditar]);

  /* ── Travar scroll do body ── */
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  /* ── Validações ── */
  const validateNome = () => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, nome: 'Nome é obrigatório' }));
      return false;
    }
    setErrors(prev => ({ ...prev, nome: '' }));
    return true;
  };

  const validateMeta = () => {
    const metaValue = parsePrice(metaOrcamento);
    if (metaValue !== null && metaValue <= 0) {
      setErrors(prev => ({ ...prev, metaOrcamento: 'Meta deve ser maior que zero' }));
      return false;
    }
    setErrors(prev => ({ ...prev, metaOrcamento: '' }));
    return true;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'nome') validateNome();
    if (field === 'metaOrcamento') validateMeta();
  };

  const handleMetaChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') { setMetaOrcamento(''); return; }
    const number = parseFloat(value) / 100;
    if (!isNaN(number)) setMetaOrcamento(formatPrice(number));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nome: true, metaOrcamento: true });
    const isNomeValid = validateNome();
    const isMetaValid = validateMeta();
    if (!isNomeValid) { showToast.error('Por favor, preencha o nome da categoria', theme); return; }
    if (!isMetaValid) { showToast.error('Meta de orçamento deve ser maior que zero', theme); return; }

    setLoading(true);
    try {
      const metaValue = metaOrcamento && metaOrcamento !== '' ? parsePrice(metaOrcamento) : null;
      const bgHsl = hexToHslString(color);

      const categoriaData = {
        nome: name.trim(),
        icon,
        bg: bgHsl,
        text: '#ffffff',
        metaOrcamento: metaValue,
      };

      let resultado;
      if (isEditing) {
        const res = await categoriasService.update(categoriaParaEditar.id, categoriaData);
        resultado = res?.categoria ?? res;
        showToast.success(`Categoria "${name}" atualizada!`, theme);
      } else {
        resultado = await categoriasService.create(categoriaData);
        showToast.success(`Categoria "${name}" criada!`, theme);
      }

      if (onCategoryAdded) {
        onCategoryAdded({
          ...(isEditing ? categoriaParaEditar : {}),
          ...categoriaData,
          ...resultado,
          icon,
          bg: bgHsl,
        }, isEditing);
      }
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      showToast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} categoria. Tente novamente.`, theme);
    } finally {
      setLoading(false);
    }
  };

  /* ── Exclusão via modal ── */
  const handleDelete = () => {
    if (onDeleteCategoria && categoriaParaEditar) {
      handleClose();
      onDeleteCategoria(categoriaParaEditar.id, categoriaParaEditar.nome);
    }
  };

  /* ── Cores derivadas para preview ── */
  const previewBg  = color + '22';
  const previewTxt = color;

  const metaNum = parsePrice(metaOrcamento);

  if (!isOpen) return null;

  const modalContent = (
    <Styled.Overlay theme={theme} onClick={handleClose}>
      <Styled.ModalContainer
        onClick={(e) => e.stopPropagation()}
        theme={theme}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Styled.SheetHandle theme={theme} />

        <Styled.Header theme={theme}>
          <h2 id="modal-title">{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <Styled.CloseButton onClick={handleClose} theme={theme} aria-label="Fechar">✕</Styled.CloseButton>
        </Styled.Header>

        {/* Preview dinâmico */}
        <Styled.CategoryPreview theme={theme}>
          <Styled.PreviewIconWrap $bgColor={previewBg} $iconColor={previewTxt} theme={theme}>
            <DynamicIcon name={icon} size={22} color={previewTxt} />
          </Styled.PreviewIconWrap>
          <Styled.PreviewInfo theme={theme}>
            <strong>{name.trim() || 'Nome da categoria'}</strong>
            <span>
              {isEditing ? `${itensDaCategoria.length} iten${itensDaCategoria.length !== 1 ? 's' : ''}` : 'Nova categoria'}
              {metaNum ? ` • Meta: ${formatPrice(metaNum)}` : ''}
            </span>
          </Styled.PreviewInfo>
          <Styled.PreviewBadge $bgColor={previewBg} $textColor={previewTxt} theme={theme}>
            Preview
          </Styled.PreviewBadge>
        </Styled.CategoryPreview>

        <Styled.Form onSubmit={handleSubmit}>
          {/* Nome */}
          <Styled.FormGroup>
            <Styled.Label htmlFor="cat-nome" theme={theme}>Nome *</Styled.Label>
            <Styled.Input
              id="cat-nome"
              ref={firstInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('nome')}
              placeholder="Ex: Quarto do Bebê, Cozinha..."
              theme={theme}
              style={{ borderColor: errors.nome && touched.nome ? '#ef4444' : undefined }}
              maxLength={30}
              disabled={loading}
              autoComplete="off"
            />
            {errors.nome && touched.nome && (
              <Styled.ErrorMessage theme={theme} role="alert">! {errors.nome}</Styled.ErrorMessage>
            )}
          </Styled.FormGroup>

          {/* Cor */}
          <Styled.FormGroup>
            <Styled.Label theme={theme}>Cor da Categoria</Styled.Label>
            <Styled.ColorsRow>
              {COLOR_PALETTE.map(c => (
                <Styled.ColorDot
                  key={c}
                  type="button"
                  $color={c}
                  $active={color === c}
                  theme={theme}
                  onClick={() => setColor(c)}
                  disabled={loading}
                  aria-label={`Cor ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </Styled.ColorsRow>
          </Styled.FormGroup>

          {/* Ícone */}
          <Styled.FormGroup>
            <Styled.Label theme={theme}>Ícone</Styled.Label>
            <Styled.IconsGrid>
              {ICONS.map(ic => (
                <Styled.IconButton
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  selected={icon === ic}
                  theme={theme}
                  disabled={loading}
                  aria-label={`Ícone ${ic}`}
                  aria-pressed={icon === ic}
                >
                  <DynamicIcon name={ic} size={18} color={icon === ic ? '#fff' : (theme?.textSoft || '#666')} />
                </Styled.IconButton>
              ))}
            </Styled.IconsGrid>
          </Styled.FormGroup>

          {/* Meta de Orçamento */}
          <Styled.FormGroup>
            <Styled.Label htmlFor="cat-meta" theme={theme}>Meta de Orçamento (opcional)</Styled.Label>
            <Styled.Input
              id="cat-meta"
              type="text"
              inputMode="decimal"
              value={metaOrcamento}
              onChange={handleMetaChange}
              onBlur={() => handleBlur('metaOrcamento')}
              placeholder="R$ 0,00"
              theme={theme}
              disabled={loading}
              autoComplete="off"
            />
            {errors.metaOrcamento && touched.metaOrcamento && (
              <Styled.ErrorMessage theme={theme} role="alert">! {errors.metaOrcamento}</Styled.ErrorMessage>
            )}
          </Styled.FormGroup>

          {/* Zona de Perigo – apenas em modo edição */}
          {isEditing && (
            <Styled.DangerZone>
              <Styled.DangerInfo theme={theme}>
                <strong>Excluir categoria</strong>
                <span>
                  {itensDaCategoria.length > 0
                    ? `${itensDaCategoria.length} iten${itensDaCategoria.length !== 1 ? 's' : ''} será${itensDaCategoria.length !== 1 ? 'o' : ''} apagado${itensDaCategoria.length !== 1 ? 's' : ''} permanentemente.`
                    : 'Nenhum item será afetado.'}
                </span>
              </Styled.DangerInfo>
              <Styled.DangerButton
                type="button"
                onClick={handleDelete}
                disabled={loading}
              >
                Excluir
              </Styled.DangerButton>
            </Styled.DangerZone>
          )}

          {/* Botões de ação */}
          <Styled.ModalButtons>
            <Styled.CancelarButton type="button" onClick={handleClose} disabled={loading} theme={theme}>
              Cancelar
            </Styled.CancelarButton>
            <Styled.CriarButton
              type="submit"
              disabled={loading || !name.trim() || !!errors.nome}
              theme={theme}
            >
              {loading
                ? (isEditing ? 'Salvando...' : 'Criando...')
                : (isEditing ? 'Salvar Alterações' : '+ Criar Categoria')}
            </Styled.CriarButton>
          </Styled.ModalButtons>
        </Styled.Form>

        <Styled.VisuallyHidden aria-live="polite" role="status">
          {loading && (isEditing ? 'Salvando categoria...' : 'Criando categoria...')}
        </Styled.VisuallyHidden>
      </Styled.ModalContainer>
    </Styled.Overlay>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CategoriaFormModal;