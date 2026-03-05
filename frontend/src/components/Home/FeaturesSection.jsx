// src/components/Home/FeaturesSection.jsx
import React from 'react';
import { ShoppingCart, Users, BarChart3, CheckCircle } from 'lucide-react';
import {
  Features,
  FeaturesGrid,
  FeatureCard
} from '../../styles/pages/HomeStyles';

// Dados das features em constante separada
const FEATURES = [
  { 
    icon: ShoppingCart, 
    title: 'Lista Inteligente', 
    desc: 'Organize itens por categoria com preços e quantidades' 
  },
  { 
    icon: Users, 
    title: 'Conta Casal', 
    desc: 'Compartilhe listas em tempo real com seu parceiro(a)' 
  },
  { 
    icon: BarChart3, 
    title: 'Controle Financeiro', 
    desc: 'Acompanhe gastos separados por VR/VA e cartão normal' 
  },
  { 
    icon: CheckCircle, 
    title: 'Marcar Comprados', 
    desc: 'Risque itens da lista e veja o progresso das compras' 
  },
];

const FeatureItem = ({ icon: Icon, title, desc, theme }) => (
  <FeatureCard theme={theme}>
    <div className="icon">
      <Icon size={20} />
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </FeatureCard>
);

const FeaturesSection = ({ theme }) => {
  return (
    <Features>
      <FeaturesGrid>
        {FEATURES.map((feature) => (
          <FeatureItem 
            key={feature.title} 
            {...feature} 
            theme={theme} 
          />
        ))}
      </FeaturesGrid>
    </Features>
  );
};

export default FeaturesSection;