import styled, { keyframes } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Layout ──────────────────────────────────────────────────────────────────

export const PerfilContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${p => p.theme.background};
  padding: 2rem 1.5rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeUp} 0.4s ease both;

  @media (max-width: 768px) { padding: 1.25rem 1rem 5.5rem; }
  @media (max-width: 640px) { padding: 1rem 0.875rem 5.5rem; }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: ${p => p.theme.text};
    margin: 0;
    letter-spacing: -0.02em;
  }

  @media (max-width: 480px) { h1 { font-size: 1.4rem; } }
`;

export const EditarButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: ${p => p.$primary ? p.theme.primary : 'transparent'};
  color: ${p => p.$primary ? '#fff' : p.theme.text};
  border: 2px solid ${p => p.$primary ? p.theme.primary : p.theme.border};
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${p => p.theme.primary}30;
    background: ${p => p.$primary ? p.theme.primaryDark : p.theme.hover};
  }
`;

// ─── Mensagens ────────────────────────────────────────────────────────────────

export const MensagemSucesso = styled.div`
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.875rem 1.25rem;
  background: ${p => p.theme.success}18;
  border: 1px solid ${p => p.theme.success}40;
  border-radius: 0.875rem;
  color: ${p => p.theme.success};
  font-size: 0.9rem; font-weight: 500;
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.3s ease;
`;

export const MensagemErro = styled.div`
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.875rem 1.25rem;
  background: ${p => p.theme.error}12;
  border: 1px solid ${p => p.theme.error}35;
  border-radius: 0.875rem;
  color: ${p => p.theme.error};
  font-size: 0.9rem; font-weight: 500;
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.3s ease;
`;

// ─── Cards ────────────────────────────────────────────────────────────────────

export const PerfilCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.75rem;
  margin-bottom: 1.25rem;
  transition: box-shadow 0.2s ease;

  &:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

  @media (max-width: 640px) { padding: 1.25rem; border-radius: 1rem; }
`;

// ─── Avatar Section ───────────────────────────────────────────────────────────

export const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${p => p.theme.border};

  @media (max-width: 480px) { flex-direction: column; text-align: center; gap: 1rem; }
`;

export const Avatar = styled.div`
  width: 88px; height: 88px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
`;

export const AvatarPlaceholder = styled.div`
  width: 100%; height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, ${p => p.theme.primary}, ${p => p.theme.secondary || p.theme.primaryLight});
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  text-transform: uppercase;
  box-shadow: 0 4px 20px ${p => p.theme.primary}40;
`;

export const UserInfo = styled.div`
  flex: 1;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0 0 0.35rem;
  }

  p {
    font-size: 0.875rem;
    color: ${p => p.theme.textSoft};
    margin: 0;
  }
`;

export const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  background: ${p => p.theme.primary}16;
  color: ${p => p.theme.primary};
  border: 1px solid ${p => p.theme.primary}30;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
`;

// ─── Info Display ─────────────────────────────────────────────────────────────

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const InfoMembro = styled.div`
  background: ${p => p.theme.background};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
    background: ${p => p.theme.primary};
    border-radius: 4px 0 0 4px;
  }

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0 0 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
`;

export const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const InfoRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$half ? '1fr 1fr' : '1fr'};
  gap: 1rem;
  margin-bottom: 0.875rem;

  @media (max-width: 480px) { grid-template-columns: 1fr; gap: 0.75rem; }
`;

export const Label = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${p => p.theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const Valor = styled.span`
  font-size: 0.9375rem;
  color: ${p => p.theme.text};
  font-weight: 500;
  word-break: break-word;

  &.destaque {
    color: ${p => p.theme.primary};
    font-weight: 700;
    font-size: 1rem;
  }
`;

export const RendaTotalCard = styled.div`
  background: linear-gradient(135deg, ${p => p.theme.primary}14, ${p => p.theme.primary}08);
  border: 1px solid ${p => p.theme.primary}25;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;

  ${Label} { font-size: 0.8rem; color: ${p => p.theme.primary}; text-transform: none; font-weight: 600; }
  ${Valor} { font-size: 1.375rem; font-weight: 800; color: ${p => p.theme.primary}; }
`;

export const DataCriacao = styled.div`
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid ${p => p.theme.border};
  font-size: 0.78rem;
  color: ${p => p.theme.textSoft};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

// ─── Forms ────────────────────────────────────────────────────────────────────

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
  width: 100%;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${p => p.theme.background};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: ${p => p.theme.text};
  transition: all 0.18s ease;
  box-sizing: border-box;

  &::placeholder { color: ${p => p.theme.textSoft}; opacity: 0.6; }

  &:focus {
    outline: none;
    border-color: ${p => p.theme.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.primary}20;
    background: ${p => p.theme.surface};
  }

  &:disabled, &.disabled {
    background: ${p => p.theme.hover};
    color: ${p => p.theme.textSoft};
    cursor: not-allowed;
    opacity: 0.75;
  }
`;

export const Small = styled.small`
  font-size: 0.75rem;
  color: ${p => p.theme.textSoft};
`;

export const Divider = styled.hr`
  margin: 1.75rem 0;
  border: none;
  border-top: 1px solid ${p => p.theme.border};
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${p => p.theme.border};

  @media (max-width: 480px) { flex-direction: column-reverse; }
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const CancelarButton = styled.button`
  padding: 0.7rem 1.5rem;
  background: transparent;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 0.75rem;
  color: ${p => p.theme.text};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.18s ease;

  &:hover:not(:disabled) {
    background: ${p => p.theme.hover};
    border-color: ${p => p.theme.textSoft};
  }

  @media (max-width: 480px) { width: 100%; }
`;

export const SalvarButton = styled.button`
  padding: 0.7rem 1.75rem;
  background: ${p => p.theme.primary};
  border: none;
  border-radius: 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.18s ease;
  box-shadow: 0 2px 12px ${p => p.theme.primary}30;

  &:hover:not(:disabled) {
    background: ${p => p.theme.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${p => p.theme.primary}40;
  }

  @media (max-width: 480px) { width: 100%; }
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${p => p.theme.border};
`;

export const AlterarSenhaButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: ${p => p.$danger ? p.theme.error + '10' : p.theme.hover};
  border: 1.5px solid ${p => p.$danger ? p.theme.error + '35' : p.theme.border};
  border-radius: 0.875rem;
  color: ${p => p.$danger ? p.theme.error : p.theme.text};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    background: ${p => p.$danger ? p.theme.error + '1e' : p.theme.border};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;

// ─── Loading ──────────────────────────────────────────────────────────────────

export const LoadingSpinner = styled.div`
  width: 40px; height: 40px;
  border: 3px solid ${p => p.theme.border};
  border-top-color: ${p => p.theme.primary};
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
  margin: 0 auto;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  p { color: ${p => p.theme.textSoft}; font-size: 0.9rem; margin: 0; }
`;

// ─── Modal (Excluir) ──────────────────────────────────────────────────────────

export const Modal = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.18s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

export const ModalContent = styled.div`
  background: ${p => p.theme.surface};
  border-radius: 1.25rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  border: 1px solid ${p => p.theme.border};
  animation: slideUp 0.25s cubic-bezier(0.34,1.2,0.64,1);
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid ${p => p.theme.border};

  h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0;
  }
`;

export const ModalBody = styled.div`
  padding: 1.75rem;

  p {
    margin: 0 0 0.875rem;
    color: ${p => p.theme.textSoft};
    line-height: 1.6;
    font-size: 0.9375rem;

    &:last-child { margin-bottom: 0; }
    &.warning {
      color: ${p => p.theme.error};
      font-weight: 600;
      background: ${p => p.theme.error}10;
      border: 1px solid ${p => p.theme.error}25;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
    }
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  border-top: 1px solid ${p => p.theme.border};
`;

export const FecharButton = styled.button`
  background: ${p => p.theme.hover};
  border: none;
  color: ${p => p.theme.textSoft};
  font-size: 1.1rem;
  cursor: pointer;
  width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.18s;

  &:hover {
    background: ${p => p.theme.border};
    color: ${p => p.theme.text};
  }
`;

export const ConfirmarButton = styled.button`
  padding: 0.7rem 1.5rem;
  background: ${p => p.$danger ? p.theme.error : p.theme.primary};
  border: none;
  border-radius: 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.18s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.9);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }
`;

// ─── Legacy / unused exports (keep for compatibility) ─────────────────────────
export const InputIcon = styled.span``;
export const InputWithIcon = styled.input``;
