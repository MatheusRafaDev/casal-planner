
import React from 'react';
import { Heart } from 'lucide-react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: ${(props) => props.theme.surface};
  border-top: 2px solid ${(props) => props.theme.border};
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
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

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${(props) => props.theme.primary};
  }
  
  span {
    color: ${(props) => props.theme.text};
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const Copyright = styled.div`
  color: ${(props) => props.theme.textSoft};
  font-size: 0.9rem;
`;

const HeartIcon = styled(Heart)`
  color: ${(props) => props.theme.accent};
  fill: ${(props) => props.theme.accent};
  margin: 0 0.25rem;
`;

const LoveText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${(props) => props.theme.textSoft};
  font-size: 0.9rem;
`;

const FooterSimple = ({ theme }) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer theme={theme}>
      <FooterContent>
        <LogoSection>
          <Heart size={20} />
          <span>CasalPlanner</span>
        </LogoSection>
        
        <Copyright theme={theme}>
          © {currentYear} Todos os direitos reservados
        </Copyright>
        
        <LoveText theme={theme}>
          Feito com <HeartIcon size={14} /> para casais
        </LoveText>
      </FooterContent>
    </FooterContainer>
  );
};

export default FooterSimple;