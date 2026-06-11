import styled from 'styled-components';

export const Sidebar = styled.aside`
  width: 260px;
  height: 100vh;
  background: ${props => props.theme.background};
  border-right: 1px solid ${props => props.theme.border};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, ${props => props.theme.background} 0%, ${props => props.theme.surface} 100%);

  @media (max-width: 1200px) {
    width: 240px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const SidebarHeader = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

export const LogoIcon = styled.div`
  font-size: 32px;
  filter: drop-shadow(0 2px 8px rgba(167, 139, 250, 0.3));
`;

export const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const SidebarNav = styled.nav`
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: ${props => props.$active ? `linear-gradient(135deg, ${props.theme.primary}20 0%, ${props.theme.secondary}20 100%)` : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${props => props.$active ? `linear-gradient(135deg, ${props.theme.primary}30 0%, ${props.theme.secondary}30 100%)` : `${props.theme.hover}`};
    transform: translateX(4px);
  }

  &:active {
    transform: translateX(2px);
  }
`;

export const NavIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$active ? `linear-gradient(135deg, ${props.theme.primary} 0%, ${props.theme.secondary} 100%)` : 'transparent'};
  color: ${props => props.$active ? '#fff' : props.theme.textSoft};
  transition: all 0.2s ease;
`;

export const NavLabel = styled.span`
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  color: ${props => props.$active ? props.theme.primary : props.theme.text};
`;

export const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${props => props.theme.border};
  background: linear-gradient(180deg, transparent 0%, ${props => props.theme.primary}08 100%);
`;

export const QuickSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SummaryTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.theme.textSoft};
  margin: 0;
`;

export const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SummaryIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, ${props => props.theme.primary}20 0%, ${props => props.theme.secondary}20 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.primary};
`;

export const SummaryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SummaryLabel = styled.span`
  font-size: 11px;
  color: ${props => props.theme.textSoft};
`;

export const SummaryValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.text};
`;
