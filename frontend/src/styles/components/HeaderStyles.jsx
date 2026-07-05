import styled from 'styled-components';

/* ─── Container ────────────────────────────────────────── */
export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  border-bottom: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.surface};
  flex-shrink: 0;
  gap: 16px;
  transition: background 0.3s ease, border-color 0.3s ease;

  @media (max-width: 768px) {
    position: sticky;
    top: 0;
    z-index: 90;
    padding: 12px 16px;
    /* CORREÇÃO iPhone: safe area inset para notch/dynamic island */
    padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    backdrop-filter: blur(12px) saturate(180%);
  }
`;

/* ─── Page title (desktop) ─────────────────────────────── */
export const TopbarTitle = styled.div`
  h1 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.4px;
    color: ${p => p.theme.text};
    transition: color 0.3s ease;
  }

  p {
    font-size: 12.5px;
    color: ${p => p.theme.textLight};
    margin-top: 2px;
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

/* ─── Mobile logo (only on mobile) ─────────────────────── */
export const MobileLogo = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;

    img {
      width: 28px;
      height: 28px;
    }

    span {
      font-weight: 700;
      font-size: 16px;
      color: ${p => p.theme.text};
    }
  }
`;

/* ─── Actions (right side) ─────────────────────────────── */
export const TopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

/* ─── Search box (desktop only) ────────────────────────── */
export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${p => p.theme.hover || p.theme.card};
  border: 1px solid ${p => p.theme.border};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: ${p => p.theme.textLight};
  cursor: text;
  transition: border-color 0.15s, background 0.3s ease;
  min-width: 200px;

  &:hover {
    border-color: ${p => p.theme.primary};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: ${p => p.theme.textLight};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Kbd = styled.span`
  background: ${p => p.theme.card};
  border-radius: 5px;
  padding: 2px 6px;
  font-size: 11px;
  color: ${p => p.theme.textLight};
  margin-left: auto;
`;

/* ─── Mobile icon buttons ──────────────────────────────── */
export const MobileIconBtn = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    width: 38px;
    height: 38px;
    background: ${p => p.theme.hover || p.theme.card};
    border: 1px solid ${p => p.theme.border};
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    color: ${p => p.theme.textLight};
    cursor: pointer;
    border: 1px solid ${p => p.theme.border};
    transition: background 0.15s, color 0.15s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:active {
      transform: scale(0.93);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

/* ─── Desktop user section (kept for unauth header) ────── */
export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) { gap: 8px; }
`;

export const Button = styled.button`
  padding: 0 16px;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${p => p.theme.border};
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;

  &:active { transform: scale(0.96); }

  ${p => p.primary ? `
    background: ${p.theme.primary};
    border-color: ${p.theme.primary};
    color: white;
    &:hover { background: ${p.theme.primaryDark || p.theme.primary}; }
  ` : `
    background: transparent;
    color: ${p.theme.text};
    &:hover { background: ${p.theme.border}; }
  `}

  @media (max-width: 480px) {
    padding: 0 12px;
    font-size: 13px;
    height: 40px;
  }
`;

/* ─── Unauth header logo ───────────────────────────────── */
export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 4px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  min-height: 44px;

  svg {
    width: 28px;
    height: 28px;
    @media (max-width: 768px) {
      width: 24px;
      height: 24px;
    }
  }

  span {
    font-weight: 700;
    font-size: 18px;
    color: ${p => p.theme.text};
    @media (max-width: 480px) { font-size: 16px; }
    @media (max-width: 380px) { display: none; }
  }
`;

export const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    height: 52px;
    padding: 0 12px;
  }
`;

/* ─── Kept for backwards compat (no longer used by logged-in header) ── */
export const NavLinks = styled.div`
  display: none;
`;

export const NavButton = styled.button`
  display: none;
`;

export const UserMenu = styled.button`
  display: none;
`;

export const UserAvatar = styled.div`
  display: none;
`;

export const UserName = styled.span`
  display: none;
`;

export const DropdownMenu = styled.div`
  display: none;
`;

export const DropdownItem = styled.button`
  display: none;
`;