import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @media (min-width: 600px) {
    align-items: center;
    padding: 1rem;
  }
`;

export const ModalContainer = styled.div`
  position: relative;
  background: ${props => props.theme.surface};
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 1.25rem 1.5rem 0;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  width: 100%;
  max-height: 92dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 -4px 32px rgba(0,0,0,0.18);
  border: 1px solid ${props => props.theme.border};
  animation: sheetUp 0.28s cubic-bezier(0.32, 0.72, 0, 1);

  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;
  }

  @media (min-width: 600px) {
    border-radius: 1.5rem;
    max-width: 35rem;
    max-height: 90dvh;
    padding: 2rem;
    animation: slideUp 0.25s ease;

    @keyframes slideUp {
      from { transform: translateY(24px) scale(0.97); opacity: 0; }
      to   { transform: translateY(0)    scale(1);    opacity: 1; }
    }
  }
`;

export const SheetHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: ${props => props.theme.border};
  margin: 0 auto 1.25rem;

  @media (min-width: 600px) { display: none; }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.border};

  h2 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.theme.text};
    margin: 0;
  }
`;

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  color: ${props => props.theme.textSoft};
  background: ${props => props.theme.border};
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;

  &:active { transform: scale(0.92); }
  &:hover  { background: ${props => props.theme.textLight}; }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const Label = styled.label`
  color: ${props => props.theme.textSoft};
  font-weight: 600;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 16px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
  -webkit-appearance: none;
  appearance: none;

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px ${props => props.theme.surface} inset !important;
    -webkit-text-fill-color: ${props => props.theme.text} !important;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &::placeholder { color: ${props => props.theme.textLight}; }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 16px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: border-color 0.2s;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  -webkit-appearance: none;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }
  &::placeholder { color: ${props => props.theme.textLight}; }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 16px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: border-color 0.2s;
  font-family: inherit;
  cursor: pointer;
  /* Remove seta padrão iOS */
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 2.5rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => `${props.theme.primary}20`};
  }
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  padding: 1rem;
  background: ${props => props.theme.borderLight};
  border-radius: 12px;
`;

export const Image = styled.img`
  max-width: 100%;
  max-height: 180px;
  border-radius: 8px;
  object-fit: contain;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.surface};
`;

export const ImageFallback = styled.div`
  max-height: 180px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.textLight};
  font-size: 14px;
  padding: 20px;
  width: 100%;
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  background: ${props => props.theme.border};
  color: ${props => props.theme.text};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 50px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  font-size: 0.95rem;

  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

export const SalvarButton = styled(CancelarButton)`
  background: ${props => props.theme.primary};
  color: white;

  &:hover:not(:disabled) { background: ${props => props.theme.primaryDark}; }
  &:disabled { opacity: 0.5; }
`;

export const ErrorMessage = styled.span`
  color: ${props => props.theme?.error || '#dc3545'};
  font-size: 0.75rem;
  margin-top: 0.2rem;
  display: block;
`;

export const RowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.$comprado ? '#28a74520' : '#ffc10720'};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${props => props.$comprado ? '#28a745' : '#ffc107'};
  margin-bottom: 0.75rem;
`;

export const StyledLink = styled.a`
  color: ${props => props.theme.primary};
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  &:hover { text-decoration: underline; }
`;
