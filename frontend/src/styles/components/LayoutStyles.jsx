import styled from 'styled-components';

export const LayoutContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
`;

export const Header = styled.header`
  background: ${props => props.theme.surface};
  border-bottom: 1px solid ${props => props.theme.border};
  padding: 0.5rem 1rem;
  position: sticky;
  top: 0;
  z-index: 90;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.primary};
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.border};
  }
`;

export const Logo = styled.div`
  h1 {
    font-size: 1.25rem;
    background: ${props => props.theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

export const UserInfo = styled.div`
  color: ${props => props.theme.textSoft};
  font-size: 0.875rem;
  font-weight: 500;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
`;

export const MenuContent = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: ${props => props.theme.surface};
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  @media (max-width: 768px) {
    width: 85%;
  }
`;

export const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};

  h2 {
    font-size: 1.25rem;
    background: ${props => props.theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.textSoft};
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.border};
    color: ${props => props.theme.error};
  }
`;

export const MenuUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.card};
`;

export const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.theme.gradient};
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 0.25rem;
`;

export const UserEmail = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.textSoft};
`;

export const MenuNav = styled.nav`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => (props.active ? props.theme.primary + '20' : 'transparent')};
  cursor: pointer;
  color: ${props => (props.active ? props.theme.primary : props.theme.textSoft)};
  font-size: 0.875rem;
  text-align: left;
  transition: all 0.2s;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;

  &:hover {
    background: ${props => props.theme.border};
    color: ${props => props.theme.primary};
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
  }
`;

export const MenuFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.card};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ThemeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 0.5rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.border};
  }
`;

export const LogoutButton = styled(ThemeButton)`
  &:hover {
    border-color: ${props => props.theme.error};
    color: ${props => props.theme.error};
  }
`;

export const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  min-height: calc(100vh - 70px);

  @media (min-width: 768px) {
    padding: 2rem 1rem;
  }
`;