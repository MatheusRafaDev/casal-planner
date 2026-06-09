import React from 'react';
import logoPng from '../assets/logo.png';
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
          <LogoIcon src={logoPng} alt="CasalPlanner" />
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
