import styled, { keyframes } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── Shimmer Effect ──────────────────────────────────────────────────────────

export const Shimmer = styled.div`
  background: linear-gradient(
    90deg,
    ${p => p.theme.skeleton} 0%,
    ${p => p.theme.skeletonShimmer} 50%,
    ${p => p.theme.skeleton} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

// ─── Skeleton Components ─────────────────────────────────────────────────────

export const SkeletonAvatar = styled(Shimmer)`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const SkeletonText = styled(Shimmer)`
  width: ${p => p.width || '100%'};
  height: ${p => p.height || '16px'};
  border-radius: 8px;
  margin: ${p => p.margin || '0'};
  ${p => p.style && `style: ${p.style}`};
`;

export const SkeletonLine = styled(Shimmer)`
  width: ${p => p.width || '100%'};
  height: ${p => p.height || '14px'};
  border-radius: ${p => p.borderRadius || '8px'};
  margin: ${p => p.margin || '0'};
`;

export const SkeletonCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.75rem;
  margin-bottom: 1.25rem;
  transition: box-shadow 0.2s ease;

  @media (max-width: 640px) { 
    padding: 1.25rem; 
    border-radius: 1rem; 
  }
`;

export const SkeletonBadge = styled(Shimmer)`
  width: 80px;
  height: 24px;
  border-radius: 2rem;
  margin-top: 0.5rem;
`;

// ─── Layout ──────────────────────────────────────────────────────────────────

export const PerfilContainer = styled.div`
  /* CORREÇÃO iPhone: sequência completa de fallback para viewport height */
  min-height: 100vh;
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  background: ${p => p.theme.background};
  padding: 2rem 1.5rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeUp} 0.4s ease both;

  @media (max-width: 768px) { 
    /* CORREÇÃO iPhone: safe area inset para conteúdo mobile com BottomNav */
    padding: 1.25rem 1rem calc(60px + env(safe-area-inset-bottom, 16px) + 1.25rem); 
  }
  @media (max-width: 640px) { 
    /* CORREÇÃO iPhone: safe area inset para conteúdo mobile com BottomNav */
    padding: 1rem 0.875rem calc(60px + env(safe-area-inset-bottom, 16px) + 1rem); 
  }
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

  @media (max-width: 480px) { 
    h1 { font-size: 1.4rem; } 
  }
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

  @media (max-width: 640px) { 
    padding: 1.25rem; 
    border-radius: 1rem; 
  }
`;

// ─── Avatar Section ───────────────────────────────────────────────────────────

export const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${p => p.theme.border};

  @media (max-width: 480px) { 
    flex-direction: column; 
    text-align: center; 
    gap: 1rem; 
  }
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

  @media (max-width: 480px) { 
    grid-template-columns: 1fr; 
    gap: 0.75rem; 
  }
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
  flex-wrap: wrap;
  gap: 0.75rem;

  ${Label} { 
    font-size: 0.8rem; 
    color: ${p => p.theme.primary}; 
    text-transform: none; 
    font-weight: 600; 
  }
  ${Valor} { 
    font-size: 1.375rem; 
    font-weight: 800; 
    color: ${p => p.theme.primary};
    
    @media (max-width: 480px) {
      font-size: 1.125rem;
    }
  }
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
  flex-wrap: wrap;
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

  @media (max-width: 640px) { 
    grid-template-columns: 1fr; 
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: ${p => p.theme.background};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 0.75rem;
  /* CORREÇÃO iPhone: font-size 16px evita zoom automático no iOS */
  font-size: 16px !important;
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

  &:disabled {
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

  @media (max-width: 480px) { 
    flex-direction: column-reverse;
    
    button {
      width: 100%;
    }
  }
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

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 0.75rem;
  }
`;

// ─── Toggle Switch ────────────────────────────────────────────────────────────

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const ToggleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ToggleLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${p => p.theme.text};
`;

export const ToggleSwitch = styled.button`
  width: 52px;
  height: 28px;
  border-radius: 34px;
  background: ${p => p.$isDark 
    ? 'linear-gradient(135deg, #4a5568, #2d3748)'
    : 'linear-gradient(135deg, #fbbf24, #f59e0b)'
  };
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  padding: 0;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ToggleKnob = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
  top: 2px;
  left: ${p => p.$isDark ? '26px' : '2px'};
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
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

// ─── Safe Area Bottom ─────────────────────────────────────────────────────────

export const SafeAreaBottom = styled.div`
  height: env(safe-area-inset-bottom, 0px);
`;