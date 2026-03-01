import styled from 'styled-components';

// Container principal
export const Container = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

// Hero Section
export const Hero = styled.section`
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
  text-align: center;
`;

export const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.theme.primary + '20'};
  color: ${props => props.theme.primary};
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Title = styled.h1`
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  color: ${props => props.theme.text};

  span {
    background: ${props => props.theme.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

export const Description = styled.p`
  font-size: 18px;
  color: ${props => props.theme.textSoft};
  max-width: 600px;
  margin: 0 auto 30px;
  line-height: 1.6;
`;

export const HeroButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const HeroButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${props => props.theme.border};
  
  ${props => props.primary ? `
    background: ${props.theme.primary};
    border-color: ${props.theme.primary};
    color: ${props.theme.surface};
    
    &:hover {
      background: ${props.theme.primaryDark || props.theme.primary};
      border-color: ${props.theme.primaryDark || props.theme.primary};
    }
  ` : `
    background: transparent;
    color: ${props.theme.text};
    
    &:hover {
      background: ${props.theme.border};
    }
  `}

  svg {
    width: 16px;
    height: 16px;
  }
`;

// Features Section
export const Features = styled.section`
  max-width: 1000px;
  margin: 60px auto;
  padding: 0 20px;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatureCard = styled.div`
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadowHover || '0 10px 25px rgba(0,0,0,0.1)'};
  }

  .icon {
    width: 40px;
    height: 40px;
    background: ${props => props.theme.primary + '20'};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    svg {
      width: 20px;
      height: 20px;
      color: ${props => props.theme.primary};
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.theme.text};
  }

  p {
    font-size: 14px;
    color: ${props => props.theme.textSoft};
    line-height: 1.5;
  }
`;

// Footer
export const Footer = styled.footer`
  border-top: 1px solid ${props => props.theme.border};
  padding: 24px 0;
  margin-top: 60px;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: ${props => props.theme.textSoft};

  div {
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      width: 14px;
      height: 14px;
      color: ${props => props.theme.primary};
    }
  }
`;