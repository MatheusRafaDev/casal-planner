import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import { Heart, ShoppingCart, Users, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

// Import dos estilos
import {
  Container,
  Hero,
  Badge,
  Title,
  Description,
  HeroButtonGroup,
  HeroButton,
  Features,
  FeaturesGrid,
  FeatureCard,
  Footer,
  FooterContent
} from '../styles/pages/HomeStyles';

const Home = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, theme } = useTheme();

  const features = [
    { icon: ShoppingCart, title: 'Lista Inteligente', desc: 'Organize itens por categoria com preços e quantidades' },
    { icon: Users, title: 'Conta Casal', desc: 'Compartilhe listas em tempo real com seu parceiro(a)' },
    { icon: BarChart3, title: 'Controle Financeiro', desc: 'Acompanhe gastos separados por VR/VA e cartão normal' },
    { icon: CheckCircle, title: 'Marcar Comprados', desc: 'Risque itens da lista e veja o progresso das compras' },
  ];

  return (
    <Container theme={theme}>
      {/* Header */}
      <Header 
        darkMode={isDarkMode}
        toggleTheme={toggleTheme}
        theme={theme}
      />

      {/* Hero Section */}
      <Hero>
        <Badge theme={theme}>
          <Heart size={16} />
          Planejamento doméstico para casais
        </Badge>
        
        <Title theme={theme}>
          Organize a casa <span>a dois</span>
        </Title>
        
        <Description theme={theme}>
          Listas de compras compartilhadas, controle de gastos por categoria 
          e acompanhamento financeiro — tudo em um só lugar.
        </Description>

        <HeroButtonGroup>
          <HeroButton primary onClick={() => navigate('/login')} theme={theme}>
            Começar grátis <ArrowRight size={16} />
          </HeroButton>
          <HeroButton onClick={() => navigate('/login')} theme={theme}>
            Já tenho conta
          </HeroButton>
        </HeroButtonGroup>
      </Hero>

      {/* Features Section */}
      <Features>
        <FeaturesGrid>
          {features.map(({ icon: Icon, title, desc }) => (
            <FeatureCard key={title} theme={theme}>
              <div className="icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </Features>

      {/* Footer */}
      <Footer theme={theme}>
        <FooterContent theme={theme}>
          <div>
            <Heart size={14} />
            <span>CasalPlanner</span>
          </div>
          <span>Feito com ❤️ para casais</span>
        </FooterContent>
      </Footer>
    </Container>
  );
};

export default Home;