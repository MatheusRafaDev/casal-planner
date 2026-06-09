import styled from 'styled-components';
import { Heart } from 'lucide-react';

export const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.surface};
  border-top: 2px solid ${({ theme }) => theme.border};
  padding: 2rem 0;
  margin-top: auto;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const LogoIcon = styled.img`
  width: 30px;
  height: 30px;
`;

export const LogoText = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 1.1rem;
`;

export const Copyright = styled.div`
  color: ${({ theme }) => theme.textSoft};
  font-size: 0.9rem;
`;

export const HeartIcon = styled(Heart)`
  color: ${({ theme }) => theme.accent};
  fill: ${({ theme }) => theme.accent};
  margin: 0 0.25rem;
`;

export const LoveText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.textSoft};
  font-size: 0.9rem;
`;
