import styled from 'styled-components';

export const NavBar = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    /* CORREÇÃO iPhone: safe area inset para home indicator */
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: ${p => p.theme.surface};
    border-top: 1px solid ${p => p.theme.border};
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.08);
    z-index: 80;
    /* CORREÇÃO iPhone: efeito de blur nativo iOS */
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    backdrop-filter: blur(12px) saturate(180%);
  }
`;

export const NavInner = styled.div`
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: space-around;
`;

export const NavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 4px 6px;
  transition: background 0.15s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  /* CORREÇÃO iPhone: tap target mínimo de 44px (HIG Apple) */
  min-height: 44px;

  &:active {
    background: ${p => p.$active 
      ? p.theme.primary + '12' 
      : p.theme.border + '80'};
  }
`;

export const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: ${p => p.$active ? p.theme.primary : p.theme.textSoft};
  transition: color 0.2s, transform 0.15s;
  transform: ${p => p.$active ? 'scale(1.08)' : 'scale(1)'};
`;

export const NavLabel = styled.span`
  font-size: 10px;
  font-weight: ${p => p.$active ? '700' : '400'};
  color: ${p => p.$active ? p.theme.primary : p.theme.textSoft};
  transition: color 0.2s;
`;

export const ActiveDot = styled.div`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${p => p.theme.primary};
`;

/* ─── FAB button ───────────────────────────────────────── */
export const FabButton = styled.button`
  width: 52px;
  height: 52px;
  background: ${p => p.theme.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 16px ${p => p.theme.primary}60;
  margin-top: -20px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  flex-shrink: 0;

  &:active {
    transform: scale(0.92);
  }

  &:hover {
    box-shadow: 0 6px 24px ${p => p.theme.primary}80;
  }

  svg {
    width: 24px;
    height: 24px;
    stroke-width: 2.5;
  }
`;