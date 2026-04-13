import styled from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: 1.1rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.35rem;
  color: ${(p) => p.theme.textSoft};
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.01em;
`;

export const Input = styled.input`
  width: 100%;
  /* Padding maior em mobile para facilitar toque */
  padding: 0.875rem 1rem;
  border: 2px solid ${(p) => p.theme.border};
  border-radius: 12px;
  font-size: 1rem; /* Mantém ≥16px para não acionar zoom iOS */
  line-height: 1.5;
  background: ${(p) => p.theme.surface};
  color: ${(p) => p.theme.text};
  transition: border-color 0.18s, box-shadow 0.18s;
  /* Altura mínima de 48px para WCAG touch targets */
  min-height: 48px;
  /* Remove aparência nativa iOS/Android */
  -webkit-appearance: none;
  appearance: none;

  &::placeholder {
    color: ${(p) => p.theme.textLight};
    opacity: 0.7;
  }

  /* Autofill com tema correto */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 40px ${(p) => p.theme.surface} inset !important;
    -webkit-text-fill-color: ${(p) => p.theme.text} !important;
    transition: background-color 9999s ease-in-out 0s;
  }

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.primary}33;
  }

  &.error {
    border-color: ${(p) => p.theme.error || '#dc3545'};
    &:focus { box-shadow: 0 0 0 3px ${(p) => p.theme.error || '#dc3545'}33; }
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: ${(p) => p.theme.background};
  }

  /* Spinner de número — oculta no iOS/mobile pois o inputMode já cuida disso */
  &[type="number"] {
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  border: 2px solid ${(p) => p.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  min-height: 48px;
  background: ${(p) => p.theme.surface};
  color: ${(p) => p.theme.text};
  cursor: pointer;
  /* Seta customizada */
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  transition: border-color 0.18s;

  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.primary};
    box-shadow: 0 0 0 3px ${(p) => p.theme.primary}33;
  }

  option {
    background: ${(p) => p.theme.surface};
    color: ${(p) => p.theme.text};
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.75rem;

  /* Em telas pequenas: botão de salvar primeiro (mais importante) */
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 0.625rem;
  }
`;

const BaseButton = styled.button`
  flex: 1;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  /* Touch target mínimo */
  min-height: 52px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const CancelarButton = styled(BaseButton)`
  background: ${(p) => p.theme.border};
  color: ${(p) => p.theme.text};

  &:hover:not(:disabled) {
    opacity: 0.8;
  }
`;

export const SalvarButton = styled(BaseButton)`
  background: ${(p) => p.theme.primary};
  color: white;

  &:hover:not(:disabled) {
    filter: brightness(1.06);
  }
`;

export const ErrorMessage = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: ${(p) => p.theme.error || '#dc3545'};
  font-size: 0.8rem;
  margin-top: 0.3rem;
  font-weight: 500;

  &::before {
    content: '⚠';
    font-size: 0.75rem;
  }
`;
