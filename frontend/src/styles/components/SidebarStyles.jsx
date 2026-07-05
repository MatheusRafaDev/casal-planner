import styled from 'styled-components';

/* ─── Desktop container ─────────────────────────────────── */
export const SidebarContainer = styled.aside`
  width: 220px;
  min-width: 220px;
  background: ${p => p.theme.surface};
  border-right: 1px solid ${p => p.theme.border};
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background 0.25s ease, border-color 0.25s ease;

  /* Hide sidebar on mobile — bottom nav takes over */
  @media (max-width: 768px) {
    display: none;
  }
`;

/* ─── Brand / Logo ─────────────────────────────────────── */
export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 18px;
  border-bottom: 1px solid ${p => p.theme.border};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.25s ease;
`;

export const BrandLogo = styled.span`
  width: 32px;
  height: 32px;
  background: ${p => p.theme.primary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const BrandName = styled.span`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${p => p.theme.text};
  transition: color 0.25s ease;
`;

/* ─── Navigation ───────────────────────────────────────── */
export const SidebarNav = styled.nav`
  flex: 1;
  padding: 10px 8px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 11px;
  border-radius: 8px;
  color: ${p => p.$active ? p.theme.primary : p.theme.textLight};
  background: ${p => p.$active ? p.theme.primary + '15' : 'transparent'};
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: left;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${p => p.$active ? p.theme.primary + '20' : p.theme.hover};
    color: ${p => p.$active ? p.theme.primary : p.theme.textSoft};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: ${p => p.$active ? p.theme.primary : p.theme.textLight};
    transition: color 0.15s;
  }
`;

export const NavDivider = styled.div`
  height: 1px;
  background: ${p => p.theme.border};
  margin: 6px 10px;
`;

/* ─── Footer actions (theme toggle & logout) ────────────── */
export const SidebarFooterAction = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 11px;
  border-radius: 8px;
  color: ${p => p.$danger ? p.theme.error : p.theme.textLight};
  font-size: 12.5px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${p => p.$danger ? p.theme.error + '12' : p.theme.hover};
    color: ${p => p.$danger ? p.theme.error : p.theme.textSoft};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

/* ─── Mobile bottom navigation ──────────────────────────── */
/*
 *  KEY FIX: padding-bottom uses env(safe-area-inset-bottom) so the
 *  tabs never hide behind the iPhone home indicator / gesture bar.
 *
 *  Requires <meta name="viewport" content="viewport-fit=cover"> in index.html
 */
export const BottomNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: ${p => p.theme.surface};
    border-top: 1px solid ${p => p.theme.border};

    /* Safe area: shifts content above the home indicator on iPhone */
    padding-bottom: env(safe-area-inset-bottom, 12px);
    padding-bottom: max(env(safe-area-inset-bottom), 8px);

    /* Backdrop blur for a native feel */
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    backdrop-filter: blur(20px) saturate(1.8);
    background: ${p => p.theme.surface}e6;
  }
`;

export const BottomNavItem = styled.button`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 0 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  color: ${p => p.$active ? p.theme.primary : p.theme.textLight};
  transition: color 0.15s;

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    transition: color 0.15s, transform 0.15s;
  }

  span {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  &:active svg {
    transform: scale(0.88);
  }
`;