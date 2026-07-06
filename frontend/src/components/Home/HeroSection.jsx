
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import Button from '../ui/button';
import {
  Hero,
  Badge,
  Title,
  Description,
  HeroButtonGroup
} from '../../styles/pages/HomeStyles';
import { HERO_CONTENT } from '../../constants/homeConstants';

const HeroSection = ({ theme }) => {
  const navigate = useNavigate();

  const handleNavigate = (modo) => {
    navigate('/login', { state: { modo } });
  };

  return (
    <Hero>
      <Badge theme={theme}>

        {HERO_CONTENT.badge}
      </Badge>
      
      <Title theme={theme}>
        Organize a casa <span>a dois</span>
      </Title>
      
      <Description theme={theme}>
        {HERO_CONTENT.description}
      </Description>

      <HeroButtonGroup>
        <Button 
          primary 
          onClick={() => handleNavigate('registro')} 
          theme={theme}
        >
          {HERO_CONTENT.primaryButton} <ArrowRight size={16} />
        </Button>
        <Button 
          onClick={() => handleNavigate('login')} 
          theme={theme}
        >
          {HERO_CONTENT.secondaryButton}
        </Button>
      </HeroButtonGroup>
    </Hero>
  );
};

export default HeroSection;