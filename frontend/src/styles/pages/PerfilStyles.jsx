import styled, { keyframes } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
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
  width: 90px;
  height: 90px;
  border-radius: 20px; /* Squircle */
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
  border-radius: ${p => p.theme.radiusLg || '1.25rem'};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${p => p.theme.shadowCard};

  @media (min-width: 768px) {
    padding: 2rem;
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
  flex: 1;
  width: 100%;
  background: transparent;
  padding: 1.5rem 1rem 4rem;
  max-width: 1000px;
  margin: 0 auto;
  animation: ${fadeUp} 0.5s ease-out both;

  @media (min-width: 768px) {
    padding: 2.5rem 2rem 5rem;
  }
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0;
    background: ${p => p.theme.gradient || p.theme.text};
    -webkit-background-clip: ${p => p.theme.gradient ? 'text' : 'border-box'};

    letter-spacing: -0.5px;
  }

  @media (min-width: 768px) { 
    h1 { font-size: 2.2rem; } 
  }
`;

export const EditarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: ${p => p.$primary ? p.theme.primary : 'transparent'};
  color: ${p => p.$primary ? '#ffffff' : p.theme.text};
  border: 1.5px solid ${p => p.$primary ? p.theme.primary : p.theme.border};
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${p => p.$primary ? `0 4px 12px ${p.theme.primary}40` : 'none'};
    background: ${p => p.$primary ? p.theme.primaryDark : p.theme.hover};
  }
`;

// ─── Mensagens ────────────────────────────────────────────────────────────────

export const MensagemSucesso = styled.div`
  display: flex; 
  align-items: center; 
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: ${p => p.theme.surface};
  border-left: 4px solid ${p => p.theme.success};
  border-radius: 0.5rem;
  color: ${p => p.theme.success};
  font-size: 0.95rem; 
  font-weight: 600;
  margin-bottom: 1.5rem;
  box-shadow: ${p => p.theme.shadowCard};
  animation: ${fadeUp} 0.3s ease;
`;

export const MensagemErro = styled(MensagemSucesso)`
  border-left-color: ${p => p.theme.error};
  color: ${p => p.theme.error};
`;

// ─── Cards ────────────────────────────────────────────────────────────────────

export const PerfilCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: ${p => p.theme.radiusLg || '1.25rem'};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${p => p.theme.shadowCard};
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  /* Glassmorphism Effect */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  &:hover { 
    box-shadow: ${p => p.theme.shadowHover};
  }

  @media (min-width: 768px) { 
    padding: 2rem;
  }
`;

// ─── Avatar Section ───────────────────────────────────────────────────────────

export const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid ${p => p.theme.border};

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    text-align: left;
  }
`;

export const Avatar = styled.div`
  width: 90px; 
  height: 90px;
  flex-shrink: 0;
  position: relative;
`;

export const AvatarPlaceholder = styled.div`
  width: 100%; 
  height: 100%;
  border-radius: 24px; /* Squircle Design */
  background: ${p => p.theme.gradient || `linear-gradient(135deg, ${p.theme.primary}, ${p.theme.secondary})`};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  text-transform: uppercase;
  box-shadow: 0 8px 24px ${p => p.theme.primary}40;
`;

export const UserInfo = styled.div`
  flex: 1;
  text-align: center;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0 0 0.5rem;
  }

  @media (min-width: 640px) {
    text-align: left;
  }
`;

export const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  background: ${p => p.theme.primary}15;
  color: ${p => p.theme.primary};
  border: 1px solid ${p => p.theme.primary}30;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

// ─── Info Display ─────────────────────────────────────────────────────────────

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  }

  h3 {
    font-size: 1.05rem;
    font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0 0 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const InfoRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$half ? '1fr 1fr' : '1fr'};
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 640px) { 
    grid-template-columns: 1fr; 
  }
`;

export const Label = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${p => p.theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Valor = styled.span`
  font-size: 1rem;
  color: ${p => p.theme.text};
  font-weight: 500;
  word-break: break-word;

  &.destaque {
    color: ${p => p.theme.primary};
    font-weight: 700;
    font-size: 1.1rem;
  }
`;

export const RendaTotalCard = styled.div`
  background: ${p => p.theme.gradientSoft || p.theme.surface2};
  border: 1px solid ${p => p.theme.primary}30;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;

  ${Label} { 
    font-size: 0.85rem; 
    color: ${p => p.theme.text}; 
    text-transform: none; 
  }
  ${Valor} { 
    font-size: 1.5rem; 
    font-weight: 800; 
    color: ${p => p.theme.primary};
  }
`;

export const DataCriacao = styled.div`
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${p => p.theme.border};
  font-size: 0.85rem;
  color: ${p => p.theme.textLight};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// ─── Forms ────────────────────────────────────────────────────────────────────

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  width: 100%;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;

  @media (min-width: 640px) { 
    grid-template-columns: 1fr 1fr; 
    gap: 1rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  background: ${p => p.theme.background};
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 0.75rem;
  font-size: 16px !important; /* iOS fix */
  color: ${p => p.theme.text};
  transition: all 0.2s ease;
  box-sizing: border-box;

  &::placeholder { color: ${p => p.theme.textSoft}; opacity: 0.6; }

  &:focus {
    outline: none;
    border-color: ${p => p.theme.primary};
    box-shadow: 0 0 0 3px ${p => p.theme.primary}25;
    background: ${p => p.theme.surface};
  }

  &:disabled {
    background: ${p => p.theme.surface2};
    color: ${p => p.theme.textSoft};
    cursor: not-allowed;
  }
`;

export const Small = styled.small`
  font-size: 0.8rem;
  color: ${p => p.theme.textLight};
`;

export const Divider = styled.hr`
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid ${p => p.theme.border};
`;

export const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${p => p.theme.border};

  @media (min-width: 480px) { 
    flex-direction: row;
    justify-content: flex-end;
  }
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const CancelarButton = styled.button`
  padding: 0.85rem 1.5rem;
  background: transparent;
  border: 1.5px solid ${p => p.theme.border};
  border-radius: 0.75rem;
  color: ${p => p.theme.text};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.2s ease;
  width: 100%;

  &:hover:not(:disabled) {
    background: ${p => p.theme.hover};
  }

  @media (min-width: 480px) {
    width: auto;
  }
`;

export const SalvarButton = styled.button`
  padding: 0.85rem 1.5rem;

  border: none;
  border-radius: 0.75rem;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.6 : 1};
  transition: all 0.2s ease;
  width: 100%;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${p => p.theme.primary}40;
  }

  @media (min-width: 480px) {
    width: auto;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${p => p.theme.border};
`;

export const AlterarSenhaButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  background: ${p => p.$danger ? `${p.theme.error}10` : p.theme.surface};
  border: 1px solid ${p => p.$danger ? `${p.theme.error}30` : p.theme.border};
  border-radius: 0.85rem;
  color: ${p => p.$danger ? p.theme.error : p.theme.text};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${p => p.$danger ? `${p.theme.error}20` : p.theme.hover};
    border-color: ${p => p.$danger ? p.theme.error : p.theme.primary};
  }
`;

// ─── Toggle Switch ────────────────────────────────────────────────────────────

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
`;

export const ToggleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const ToggleLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${p => p.theme.text};
`;

export const ToggleSwitch = styled.button`
  width: 56px;
  height: 30px;
  border-radius: 34px;
  background: ${p => p.$isDark 
    ? 'linear-gradient(135deg, #3f3f46, #18181b)'
    : 'linear-gradient(135deg, #fbbf24, #f59e0b)'
  };
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  padding: 0;

  &:hover {
    opacity: 0.9;
  }
`;

export const ToggleKnob = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
  top: 2px;
  left: ${p => p.$isDark ? '28px' : '2px'};
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ─── Loading ──────────────────────────────────────────────────────────────────

export const LoadingSpinner = styled.div`
  width: 44px; height: 44px;
  border: 3px solid ${p => p.theme.border};
  border-top-color: ${p => p.theme.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1.25rem;

  p { color: ${p => p.theme.textSoft}; font-size: 1rem; margin: 0; font-weight: 500; }
`;

// ─── Safe Area Bottom ─────────────────────────────────────────────────────────

export const SafeAreaBottom = styled.div`
  height: env(safe-area-inset-bottom, 0px);
`;