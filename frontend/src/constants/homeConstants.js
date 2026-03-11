
import { ShoppingCart, Users, BarChart3, CheckCircle } from 'lucide-react';

export const FEATURES = [
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

export const HERO_CONTENT = {
  badge: 'Planejamento doméstico para casais',
  title: 'Organize a casa a dois',
  description: 'Listas de compras compartilhadas, controle de gastos por categoria e acompanhamento financeiro — tudo em um só lugar.',
  primaryButton: 'Começar grátis',
  secondaryButton: 'Já tenho conta'
};