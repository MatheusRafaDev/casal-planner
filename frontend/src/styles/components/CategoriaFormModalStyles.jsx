import styled, { keyframes } from 'styled-components';

// ================= ANIMAÇÕES =================
const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulseScale = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.97); }
`;

// ================= OVERLAY =================
export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
  
  /* iOS otimizações */
  -webkit-tap-highlight-color: transparent;
  touch-action: pan-x;
  
  /* Safe-area support */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) 
           env(safe-area-inset-bottom) env(safe-area-inset-left);
  
  @media (min-width: 768px) {
    align-items: center;
    background: rgba(0, 0, 0, 0.6);
  }
`;

// ================= MODAL CONTAINER =================
export const ModalContainer = styled.div`
  background: ${(props) => props.theme?.background || '#fff'};
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  
  /* iOS scroll otimization */
  -webkit-overflow-scrolling: touch;
  
  @media (min-width: 768px) {
    border-radius: 24px;
    max-height: 85vh;
    margin: 20px;
  }
`;

// ================= SHEET HANDLE =================
export const SheetHandle = styled.div`
  width: 40px;
  height: 5px;
  background: ${(props) => props.theme?.border || '#e5e7eb'};
  border-radius: 3px;
  margin: 12px auto 8px;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

// ================= HEADER =================
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${(props) => props.theme?.border || '#e5e7eb'};
  background: ${(props) => props.theme?.background || '#fff'};
  
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: ${(props) => props.theme?.text || '#111'};
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    
    h2 {
      font-size: 1.125rem;
    }
  }
`;

// ================= CLOSE BUTTON =================
export const CloseButton = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme?.textSoft || '#666'};
  transition: all 0.2s;
  
  /* iOS tap target size */
  min-height: 44px;
  
  /* Prevenir zoom em double-tap */
  touch-action: manipulation;
  
  &:active {
    background: ${(props) => props.theme?.border || '#e5e7eb'};
    transform: scale(0.95);
  }
  
  &:hover {
    background: ${(props) => props.theme?.border || '#e5e7eb'};
  }
`;

// ================= FORM =================
export const Form = styled.form`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
  /* iOS smooth scroll */
  -webkit-overflow-scrolling: touch;
  
  /* Prevenir bounce no scroll */
  overscroll-behavior: contain;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// ================= FORM GROUP =================
export const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-of-type {
    margin-bottom: 16px;
  }
`;

// ================= LABEL =================
export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${(props) => props.theme?.text || '#111'};
  
  @media (max-width: 768px) {
    font-size: 0.8125rem;
    margin-bottom: 6px;
  }
`;

// ================= INPUT =================
export const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  border: 1.5px solid ${(props) => props.theme?.border || '#e5e7eb'};
  border-radius: 12px;
  background: ${(props) => props.theme?.surface || '#fafafa'};
  color: ${(props) => props.theme?.text || '#111'};
  transition: all 0.2s;
  
  /* iOS otimizações */
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
  
  /* Tap target size */
  min-height: 48px;
  
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme?.primary || '#3b82f6'};
    box-shadow: 0 0 0 3px ${(props) => props.theme?.primary ? `${props.theme.primary}20` : '#3b82f620'};
  }
  
  &:disabled {
    opacity: 0.5;
    background: ${(props) => props.theme?.border || '#e5e7eb'};
  }
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 0.9375rem;
  }
`;

// ================= ICONS GRID =================
export const IconsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 10px;
  max-height: 180px;
  overflow-y: auto;
  padding: 4px 2px;
  
  /* iOS scroll */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 8px;
    max-height: 160px;
  }
`;

// ================= ICON BUTTON =================
export const IconButton = styled.button`
  width: 100%;
  aspect-ratio: 1;
  min-width: 48px;
  min-height: 48px;
  font-size: 1.5rem;
  border: 2px solid ${(props) => 
    props.$active 
      ? (props.theme?.primary || '#3b82f6') 
      : (props.theme?.border || '#e5e7eb')
  };
  border-radius: 16px;
  background: ${(props) => 
    props.$active 
      ? `${props.theme?.primary || '#3b82f6'}10` 
      : (props.theme?.surface || '#fafafa')
  };
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  /* iOS tap target */
  touch-action: manipulation;
  
  &:active {
    transform: scale(0.95);
    animation: ${pulseScale} 0.1s ease;
  }
  
  &:hover {
    transform: scale(1.02);
  }
  
  &:disabled {
    opacity: 0.5;
    transform: none;
  }
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    border-radius: 14px;
  }
`;

// ================= COLORS GRID =================
export const ColorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
  gap: 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 8px;
  }
`;

// ================= COLOR BUTTON =================
export const ColorButton = styled.button`
  width: 100%;
  aspect-ratio: 1;
  min-width: 48px;
  min-height: 48px;
  border-radius: 16px;
  border: 3px solid ${(props) => 
    props.$active 
      ? (props.theme?.primary || '#3b82f6') 
      : 'transparent'
  };
  cursor: pointer;
  transition: all 0.2s;
  
  /* iOS tap target */
  touch-action: manipulation;
  
  /* Shadow para melhor visualização */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:active {
    transform: scale(0.95);
  }
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    transform: none;
  }
  
  @media (max-width: 768px) {
    border-radius: 14px;
  }
`;

// ================= ERROR MESSAGE =================
export const ErrorMessage = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #dc3545;
  margin-top: 6px;
  padding-left: 4px;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin-top: 4px;
  }
`;

// ================= MODAL BUTTONS =================
export const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 8px;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-top: 20px;
  }
`;

// ================= BUTTON BASE =================
const BaseButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  /* iOS tap target */
  min-height: 52px;
  touch-action: manipulation;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    transform: none;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.9375rem;
    min-height: 48px;
  }
`;

// ================= CANCEL BUTTON =================
export const CancelarButton = styled(BaseButton)`
  background: transparent;
  color: ${(props) => props.theme?.textSoft || '#666'};
  border: 1.5px solid ${(props) => props.theme?.border || '#e5e7eb'};
  
  &:active:not(:disabled) {
    background: ${(props) => props.theme?.border || '#e5e7eb'};
  }
  
  &:hover:not(:disabled) {
    background: ${(props) => props.theme?.border || '#e5e7eb'};
  }
`;

// ================= CREATE BUTTON =================
export const CriarButton = styled(BaseButton)`
  background: ${(props) => props.theme?.primary || '#3b82f6'};
  color: white;
  box-shadow: 0 2px 8px ${(props) => props.theme?.primary ? `${props.theme.primary}40` : '#3b82f640'};
  
  &:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow: 0 1px 4px ${(props) => props.theme?.primary ? `${props.theme.primary}40` : '#3b82f640'};
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${(props) => props.theme?.primary ? `${props.theme.primary}50` : '#3b82f650'};
  }
`;

// ================= HELPERS =================
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