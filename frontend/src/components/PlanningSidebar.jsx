import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, ClipboardList, ShoppingCart, BarChart3, 
  Store, Target, Settings, TrendingUp, 
  CheckCircle, DollarSign, Package
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatarMoeda } from '../utils/formatters';
import * as S from '../styles/components/PlanningSidebarStyles';

const PlanningSidebar = ({ resumo = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const navItems = [
    { path: '/inicio', icon: Home, label: 'Início' },
    { path: '/planejamento', icon: ClipboardList, label: 'Planejamento' },
    { path: '/gastos', icon: ShoppingCart, label: 'Gastos' },
    { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
    { path: '/lojas', icon: Store, label: 'Lojas' },
    { path: '/metas', icon: Target, label: 'Metas' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const totalNecessario = resumo.totalGeral || 0;
  const totalGasto = resumo.totalPago || 0;
  const percentualConcluido = totalNecessario > 0 ? (totalGasto / totalNecessario) * 100 : 0;
  const quantidadeComprada = resumo.totalComprados || 0;

  return (
    <S.Sidebar theme={theme}>
      <S.SidebarHeader>
        <S.Logo>
          <S.LogoIcon>🏠</S.LogoIcon>
          <S.LogoText>CasaPlanner</S.LogoText>
        </S.Logo>
      </S.SidebarHeader>

      <S.SidebarNav>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <S.NavItem
              key={path}
              onClick={() => navigate(path)}
              $active={isActive}
              theme={theme}
            >
              <S.NavIcon $active={isActive} theme={theme}>
                <Icon size={20} />
              </S.NavIcon>
              <S.NavLabel $active={isActive} theme={theme}>
                {label}
              </S.NavLabel>
            </S.NavItem>
          );
        })}
      </S.SidebarNav>

      <S.SidebarFooter>
        <S.QuickSummary>
          <S.SummaryTitle>Resumo rápido</S.SummaryTitle>
          <S.SummaryItem>
            <S.SummaryIcon theme={theme}>
              <DollarSign size={16} />
            </S.SummaryIcon>
            <S.SummaryContent>
              <S.SummaryLabel>Total necessário</S.SummaryLabel>
              <S.SummaryValue theme={theme}>{formatarMoeda(totalNecessario)}</S.SummaryValue>
            </S.SummaryContent>
          </S.SummaryItem>
          <S.SummaryItem>
            <S.SummaryIcon theme={theme}>
              <TrendingUp size={16} />
            </S.SummaryIcon>
            <S.SummaryContent>
              <S.SummaryLabel>Percentual concluído</S.SummaryLabel>
              <S.SummaryValue theme={theme}>{percentualConcluido.toFixed(1)}%</S.SummaryValue>
            </S.SummaryContent>
          </S.SummaryItem>
          <S.SummaryItem>
            <S.SummaryIcon theme={theme}>
              <CheckCircle size={16} />
            </S.SummaryIcon>
            <S.SummaryContent>
              <S.SummaryLabel>Total gasto</S.SummaryLabel>
              <S.SummaryValue theme={theme}>{formatarMoeda(totalGasto)}</S.SummaryValue>
            </S.SummaryContent>
          </S.SummaryItem>
          <S.SummaryItem>
            <S.SummaryIcon theme={theme}>
              <Package size={16} />
            </S.SummaryIcon>
            <S.SummaryContent>
              <S.SummaryLabel>Quantidade comprada</S.SummaryLabel>
              <S.SummaryValue theme={theme}>{quantidadeComprada}</S.SummaryValue>
            </S.SummaryContent>
          </S.SummaryItem>
        </S.QuickSummary>
      </S.SidebarFooter>
    </S.Sidebar>
  );
};

export default PlanningSidebar;
