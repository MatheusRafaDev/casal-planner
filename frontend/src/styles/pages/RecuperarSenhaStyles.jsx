// RecuperarSenhaStyles.js
import styled, { keyframes } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0.6; transform: scale(1); }
`;

// ─── Layout ──────────────────────────────────────────────────────────────────

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.theme.background};
  padding: 1.5rem;
  animation: ${fadeUp} 0.4s ease both;

  @media (max-width: 640px) {
    align-items: flex-start;
    padding-top: 2rem;
  }
`;

export const Card = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.5rem;
  width: 100%;
  max-width: 520px;
  transition: all 0.2s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1.25rem;
  }
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${p => p.theme.text};
  margin: 0 0 0.5rem;
  text-align: center;
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${p => p.theme.textSoft};
  text-align: center;
  margin: 0 0 1.75rem;
  line-height: 1.5;
`;

// ─── Progress / Steps ─────────────────────────────────────────────────────────

export const ProgressContainer = styled.div`
  margin-bottom: 2rem;
`;

export const StepsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  position: relative;
`;

export const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  z-index: 2;
`;

export const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.2s ease;
  background: ${p => {
    if (p.completed) return p.theme.primary;
    if (p.active) return p.theme.primary + '20';
    return p.theme.borderLight;
  }};
  color: ${p => {
    if (p.completed) return '#fff';
    if (p.active) return p.theme.primary;
    return p.theme.textSoft;
  }};
  border: 2px solid ${p => {
    if (p.completed) return p.theme.primary;
    if (p.active) return p.theme.primary;
    return 'transparent';
  }};

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 480px) {
    width: 34px;
    height: 34px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const StepLabel = styled.span`
  font-size: 0.7rem;
  font-weight: ${p => (p.active || p.completed) ? '600' : '400'};
  color: ${p => {
    if (p.completed) return p.theme.primary;
    if (p.active) return p.theme.text;
    return p.theme.textSoft;
  }};
  text-transform: uppercase;
  letter-spacing: 0.04em;

  @media (max-width: 480px) {
    font-size: 0.6rem;
  }
`;

export const ProgressBarWrapper = styled.div`
  background: ${p => p.theme.borderLight};
  border-radius: 999px;
  height: 6px;
  overflow: hidden;
  margin: 0.25rem 0;
`;

export const ProgressFill = styled.div`
  background: ${p => p.theme.primary};
  border-radius: 999px;
  height: 100%;
  width: ${p => p.width}%;
  transition: width 0.3s ease;
`;

// ─── Form Elements ────────────────────────────────────────────────────────────

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${p => p.theme.text};
  text-transform: uppercase;
  letter-spacing: 0.04em;

  svg {
    color: ${p => p.theme.primary};
    width: 14px;
    height: 14px;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${p => p.theme.background};
  border: 1.5px solid ${p => p.error ? p.theme.error : p.theme.border};
  border-radius: 0.875rem;
  font-size: 0.9375rem;
  color: ${p => p.theme.text};
  transition: all 0.18s ease;
  box-sizing: border-box;

  &::placeholder {
    color: ${p => p.theme.textSoft};
    opacity: 0.5;
  }

  &:focus {
    outline: none;
    border-color: ${p => p.error ? p.theme.error : p.theme.primary};
    box-shadow: 0 0 0 3px ${p => p.error ? p.theme.error + '20' : p.theme.primary + '20'};
    background: ${p => p.theme.surface};
  }

  /* Remove spin buttons from number input */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`;

export const CodeInput = styled(Input)`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.25rem;
  font-family: monospace;

  @media (max-width: 480px) {
    font-size: 1.25rem;
    letter-spacing: 0.15rem;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${p => p.theme.textSoft};
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.18s ease;

  &:hover {
    color: ${p => p.theme.primary};
    background: ${p => p.theme.borderLight};
  }
`;

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: ${p => p.theme.error};
  margin-top: 0.25rem;
  padding-left: 0.5rem;
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: ${p => p.theme.primary};
  border: none;
  border-radius: 0.875rem;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.18s ease;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${p => p.theme.primary}40;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const ResendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 0.875rem;
  color: ${p => p.theme.text};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.5 : 1};
  transition: all 0.18s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.borderLight};
    border-color: ${p => p.theme.primary};
    color: ${p => p.theme.primary};
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover:not(:disabled) svg {
    transform: rotate(180deg);
  }

  &:disabled {
    cursor: not-allowed;
    animation: ${p => p.disabled && p.children?.includes('Reenviar em') ? pulse : 'none'} 1.5s ease infinite;
  }
`;

export const BackLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.875rem;
  color: ${p => p.theme.textSoft};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
  margin-top: 1rem;

  &:hover {
    color: ${p => p.theme.primary};
    background: ${p => p.theme.borderLight};
  }

  svg {
    transition: transform 0.18s ease;
  }

  &:hover svg {
    transform: translateX(-3px);
  }
`;

// ─── Divider ──────────────────────────────────────────────────────────────────

export const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 0.5rem 0 0.25rem;
  font-size: 0.75rem;
  color: ${p => p.theme.textSoft};

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${p => p.theme.border};
  }

  &::before {
    margin-right: 1rem;
  }

  &::after {
    margin-left: 1rem;
  }

  span {
    font-size: 0.75rem;
  }
`;

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
  display: inline-block;
`;

// ─── Toast Custom Styles (opcional) ───────────────────────────────────────────

export const ToastContainer = styled.div`
  .toast-success {
    background: ${p => p.theme.success};
    color: #fff;
  }
  .toast-error {
    background: ${p => p.theme.error};
    color: #fff;
  }
`;

// Adicione estes novos componentes no final do arquivo RecuperarSenhaStyles.js

export const FieldError = styled.p`
  font-size: 0.7rem;
  color: ${p => p.theme.textSoft};
  margin-top: 0.25rem;
  padding-left: 0.5rem;
`;

export const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${p => p.theme.warning || '#f59e0b'};
  background: ${p => (p.theme.warning || '#f59e0b') + '10'};
  border: 1px solid ${p => (p.theme.warning || '#f59e0b') + '30'};
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  margin-top: 0.5rem;

  button {
    background: none;
    border: none;
    color: ${p => p.theme.primary};
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 0.25rem;
    text-decoration: underline;
    transition: opacity 0.18s;

    &:hover {
      opacity: 0.8;
    }
  }

  svg {
    flex-shrink: 0;
  }
`;