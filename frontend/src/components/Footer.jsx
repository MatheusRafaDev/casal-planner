import React from 'react';
import {
  FooterContainer,
  FooterContent,
  LogoSection,
  LogoIcon,
  LogoText,
  Copyright,
  LoveText,
  HeartIcon
} from '../styles/components/FooterStyles';

const FooterSimple = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <LogoSection>
          <LogoIcon />
          <LogoText>CasalPlanner</LogoText>
        </LogoSection>

        <Copyright>
          © {currentYear} Todos os direitos reservados
        </Copyright>

        <LoveText>
          Feito com <HeartIcon size={14} /> para casais
        </LoveText>
      </FooterContent>
    </FooterContainer>
  );
};

export default FooterSimple;
