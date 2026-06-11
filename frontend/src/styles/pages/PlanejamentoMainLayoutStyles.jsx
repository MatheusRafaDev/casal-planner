import styled from 'styled-components';

export const DesktopLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.background};

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
  max-width: calc(100vw - 260px);

  @media (max-width: 1200px) {
    margin-left: 240px;
    max-width: calc(100vw - 240px);
  }

  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 100vw;
    padding: 16px;
  }
`;

export const ContentArea = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;
