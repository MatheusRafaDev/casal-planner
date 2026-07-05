import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);   }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  animation: ${fadeIn} 0.2s ease;
  padding: 16px;

  @media (max-width: 600px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalContainer = styled.div`
  background: ${p => p.theme?.surface || '#fff'};
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0,0,0,0.12);
  animation: ${scaleIn} 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
  border: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  overflow: hidden;

  @media (max-width: 600px) {
    width: 100%;
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 88dvh;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    animation: ${slideUp} 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
`;

export const SheetHandle = styled.div`
  display: none;

  @media (max-width: 600px) {
    display: block;
    width: 36px;
    height: 4px;
    background: ${p => p.theme?.border || '#e5e7eb'};
    border-radius: 2px;
    margin: 10px auto 0;
    flex-shrink: 0;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
  background: ${p => p.theme?.surface || '#fff'};
  border-bottom: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  flex-shrink: 0;

  h2 {
    font-size: 16px;
    font-weight: 700;
    color: ${p => p.theme?.text || '#111'};
    margin: 0;
    letter-spacing: -0.2px;
  }
`;

export const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  background: ${p => p.theme?.surface2 || '#f1f5f9'};
  border: 1px solid ${p => p.theme?.border || '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${p => p.theme?.textSoft || '#666'};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${p => p.theme?.border || '#e5e7eb'};
    color: ${p => p.theme?.text || '#111'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

/* ── Preview dinâmico da categoria ── */
export const CategoryPreview = styled.div`
  margin: 16px 20px 4px;
  padding: 14px 16px;
  background: ${p => p.theme?.background || '#f8fafc'};
  border: 1.5px solid ${p => p.theme?.border || '#e5e7eb'};
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.25s ease;
  flex-shrink: 0;
`;

export const PreviewIconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${p => p.$bgColor || p.theme?.primary + '22'};
  color: ${p => p.$iconColor || p.theme?.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
`;

export const PreviewInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: ${p => p.theme?.text || '#111'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  span {
    font-size: 12px;
    color: ${p => p.theme?.textSoft || '#666'};
    font-weight: 500;
  }
`;

export const PreviewBadge = styled.div`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  background: ${p => p.$bgColor || p.theme?.primary + '15'};
  color: ${p => p.$textColor || p.theme?.primary};
  white-space: nowrap;
`;

/* ── Formulário ── */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px 20px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${p => p.theme?.border || '#e5e7eb'};
    border-radius: 4px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.theme?.textSoft || '#666'};
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 11px 14px;
  background: ${p => p.theme?.background || '#f8fafc'};
  border: 1.5px solid ${p => p.theme?.border || '#e5e7eb'};
  border-radius: 12px;
  font-size: 15px;
  color: ${p => p.theme?.text || '#111'};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: ${p => p.theme?.textLight || '#9ca3af'};
  }

  &:focus {
    outline: none;
    border-color: ${p => p.theme?.primary || '#8b5cf6'};
    background: ${p => p.theme?.surface || '#fff'};
    box-shadow: 0 0 0 3px ${p => (p.theme?.primary || '#8b5cf6')}18;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

/* ── Seleção de Cor ── */
export const ColorsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ColorDot = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${p => p.$color};
  border: 3px solid ${p => p.$active ? (p.theme?.text || '#111') : 'transparent'};
  box-shadow: ${p => p.$active ? `0 0 0 2px ${p.theme?.surface || '#fff'}, 0 0 0 4px ${p.$color}` : '0 1px 3px rgba(0,0,0,0.15)'};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 3px 10px ${p => p.$color}60;
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ── Grid de Ícones ── */
export const IconsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

export const IconButton = styled.button`
  aspect-ratio: 1;
  background: ${p => p.selected ? (p.theme?.primary || '#8b5cf6') : (p.theme?.background || '#f8fafc')};
  border: 2px solid ${p => p.selected ? (p.theme?.primary || '#8b5cf6') : (p.theme?.border || '#e5e7eb')};
  border-radius: 10px;
  color: ${p => p.selected ? '#fff' : (p.theme?.textSoft || '#666')};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  box-shadow: ${p => p.selected ? `0 2px 8px ${(p.theme?.primary || '#8b5cf6')}40` : 'none'};

  &:hover {
    transform: scale(1.08);
    border-color: ${p => p.theme?.primary || '#8b5cf6'};
    background: ${p => p.selected ? (p.theme?.primary || '#8b5cf6') : (p.theme?.primary || '#8b5cf6') + '10'};
    color: ${p => p.selected ? '#fff' : (p.theme?.primary || '#8b5cf6')};
  }

  &:active { transform: scale(0.92); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ── Botões ── */
export const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 13px;
  background: ${p => p.theme?.surface2 || '#f1f5f9'};
  border: 1.5px solid ${p => p.theme?.border || '#e5e7eb'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${p => p.theme?.text || '#111'};
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;

  &:hover { background: ${p => p.theme?.border || '#e5e7eb'}; }
  &:active { transform: scale(0.98); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CriarButton = styled.button`
  flex: 1.6;
  padding: 13px;
  background: linear-gradient(135deg, ${p => p.theme?.primary || '#8b5cf6'} 0%, ${p => p.theme?.primaryDark || '#7c3aed'} 100%);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  box-shadow: 0 4px 12px ${p => (p.theme?.primary || '#8b5cf6')}40;

  &:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px ${p => (p.theme?.primary || '#8b5cf6')}50;
  }

  &:active:not(:disabled) { transform: scale(0.98); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

/* ── Zona de Perigo (Edição) ── */
export const DangerZone = styled.div`
  margin-top: 4px;
  padding: 14px 16px;
  background: #ef444408;
  border: 1.5px solid #ef444420;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
`;

export const DangerInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #ef4444;
    margin-bottom: 2px;
  }

  span {
    font-size: 12px;
    color: ${p => p.theme?.textSoft || '#666'};
    line-height: 1.4;
  }
`;

export const DangerButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1.5px solid #ef4444;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #ef4444;
    color: white;
  }

  &:active { transform: scale(0.96); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Mensagem de Erro ── */
export const ErrorMessage = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const VisuallyHidden = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

/* ── Componentes de compatibilidade (mantidos para outros usos) ── */
export const ColorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
`;

export const ColorButton = styled.button`
  aspect-ratio: 1;
  background: ${p => p.$bgColor};
  border: 2px solid ${p => p.$active ? (p.theme?.primary || '#8b5cf6') : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  }
`;

export const CategoriesScrollContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 8px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

export const CategoryButton = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$active ? (p.theme?.primary || '#8b5cf6') : (p.theme?.border || '#e5e7eb')};
  background: ${p => p.$active ? (p.theme?.primary || '#8b5cf6') : 'transparent'};
  color: ${p => p.$active ? '#fff' : (p.theme?.text || '#111')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
`;

export const AddCategoryButton = styled(CategoryButton)`
  color: ${p => p.theme?.primary || '#8b5cf6'};
  border-color: ${p => p.theme?.primary || '#8b5cf6'};
  border-style: dashed;
`;