import styled, { css, keyframes } from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes fadeIn {
    from { opacity: 0; backdrop-filter: blur(0px); }
    to { opacity: 1; backdrop-filter: blur(8px); }
  }

  @media (max-width: 600px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const ModalContainer = styled.div`
  background: ${props => props.theme?.surface};
  border: 1px solid ${props => props.theme?.border};
  border-radius: 20px;
  box-shadow: ${props => props.theme?.shadowHover || '0 20px 40px -10px rgba(0,0,0,0.5)'};
  width: 100%;
  max-width: 720px;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes scaleIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 600px) {
    border-radius: 24px 24px 0 0;
    max-width: 100%;
    max-height: 90dvh;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  }
`;

export const SheetHandle = styled.div`
  display: none;
  @media (max-width: 600px) {
    display: block;
    width: 48px;
    height: 5px;
    background: ${props => props.theme?.borderLight};
    border-radius: 3px;
    margin: 12px auto 4px;
    opacity: 0.6;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 16px;
  flex-shrink: 0;
  position: relative;
  border-bottom: 1px solid ${props => props.theme?.border};

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.theme?.text};
    margin: 0;
    letter-spacing: -0.02em;
  }
`;

export const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  background: ${props => props.theme?.surface2};
  border: 1px solid ${props => props.theme?.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.textSoft};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${props => props.theme?.error + '20'};
    color: ${props => props.theme?.error};
    border-color: ${props => props.theme?.error + '50'};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { 
    background: ${props => props.theme?.border}; 
    border-radius: 6px; 
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme?.textSoft}; 
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 28px;
  
  @media (max-width: 600px) {
    padding: 20px;
    gap: 16px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${props => props.theme?.textSoft};
  margin-bottom: 2px;
`;

const inputStyles = css`
  background: ${props => props.theme?.surface2};
  border: 1.5px solid ${props => props.theme?.border};
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.theme?.text};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &::placeholder {
    color: ${props => props.theme?.textLight};
    font-weight: 400;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme?.primary};
    background: ${props => props.theme?.surface};
    box-shadow: 0 0 0 3px ${props => props.theme?.primary + '30'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${props => props.theme?.surface3};
  }
`;

export const Input = styled.input`
  ${inputStyles}
`;

export const Select = styled.select`
  ${inputStyles}
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 40px;
`;

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const SingleColumnGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 540px) {
    gap: 12px;
  }
`;

export const SectionDivider = styled.div`
  height: 1px;
  background: ${props => props.theme?.border};
  margin: 24px 0;
`;

export const QuantidadeWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${props => props.theme?.surface2 || "#212124"};
  border: 1.5px solid ${props => props.theme?.borderLight || props.theme?.border || "#3f3f46"};
  border-radius: 10px;
  overflow: hidden;
  max-width: 150px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus-within {
    border-color: ${props => props.theme?.primary || "#8b5cf6"};
    box-shadow: 0 0 0 3px ${props => props.theme?.primary ? props.theme.primary + '30' : 'rgba(139,92,246,0.2)'};
  }
`;

export const QuantidadeButton = styled.button`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.textSoft || "#a1a1aa"};
  font-size: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.theme?.surface3 || "#2a2a2e"};
    color: ${props => props.theme?.primary || "#8b5cf6"};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const QuantidadeInput = styled.input`
  flex: 1;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
  border: none;
  color: ${props => props.theme?.text || "#fff"};
  border-left: 1px solid ${props => props.theme?.border || "#2a2a2e"};
  border-right: 1px solid ${props => props.theme?.border || "#2a2a2e"};
  height: 44px;
  padding: 0;

  &:focus { outline: none; }
  &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  &[type=number] { -moz-appearance: textfield; }
`;

export const ModalButtons = styled.div`
  padding: 24px 28px;
  background: ${props => props.theme?.surface || "#18181b"};
  border-top: 1px solid ${props => props.theme?.border || "#2a2a2e"};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: sticky;
  bottom: 0;
  z-index: 10;
  
  @media (max-width: 600px) {
    padding: 20px;
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
`;

export const CancelarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  background: transparent;
  border: 1.5px solid ${props => props.theme?.borderLight || props.theme?.border || "#3f3f46"};
  color: ${props => props.theme?.textSoft || "#d4d4d8"};
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover:not(:disabled) {
    background: ${props => props.theme?.surface2 || "#212124"};
    color: ${props => props.theme?.text || "#fff"};
    border-color: ${props => props.theme?.textSoft || "#a1a1aa"};
  }
  
  &:active:not(:disabled) {
    transform: scale(0.97);
  }
`;

export const SalvarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  background: linear-gradient(135deg, ${props => props.theme?.primary || "#8b5cf6"} 0%, ${props => props.theme?.primaryDark || "#7c3aed"} 100%);
  border: none;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px ${props => props.theme?.primary ? props.theme.primary + '40' : 'rgba(139,92,246,0.25)'};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    box-shadow: 0 6px 16px ${props => props.theme?.primary ? props.theme.primary + '60' : 'rgba(139,92,246,0.35)'};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: scale(0.97) translateY(0);
    box-shadow: 0 2px 8px ${props => props.theme?.primary ? props.theme.primary + '40' : 'rgba(139,92,246,0.25)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${props => props.theme?.surface3 || "#2a2a2e"};
    box-shadow: none;
    color: ${props => props.theme?.textSoft || "#a1a1aa"};
  }
`;

export const ErrorMessage = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.theme?.error || '#ef4444'};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '⚠️';
    font-size: 0.7rem;
  }
`;

export const RowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const ImageContainer = styled.div`
  display: none;
`;

export const Image = styled.img`
  display: none;
`;

export const OptionGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const OptionBtn = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 12px;
  border: 1.5px solid ${p => p.$active ? p.$color || p.theme?.primary : (p.theme?.border || '#3f3f46')};
  background: ${p => p.$active 
    ? (p.$color ? p.$color + '15' : p.theme?.primary + '15') 
    : (p.theme?.surface2 || '#212124')};
  color: ${p => p.$active ? (p.$color || p.theme?.primary) : (p.theme?.textSoft || '#a1a1aa')};
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: normal;
  text-align: center;
  line-height: 1.2;

  svg {
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  ${p => p.$active && `
    box-shadow: inset 0 0 0 1px ${p.$color || p.theme?.primary};
    transform: translateY(-1px);
    
    svg {
      transform: scale(1.1);
    }
  `}

  &:hover:not(:disabled) {
    border-color: ${p => p.$color || p.theme?.primary};
    color: ${p => p.$color || p.theme?.primary};
    background: ${p => (p.$color || p.theme?.primary) + '0A'};
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    filter: grayscale(1);
  }
`;