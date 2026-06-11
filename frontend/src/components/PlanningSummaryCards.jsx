import React from 'react';
import { DollarSign, TrendingUp, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatarMoeda } from '../utils/formatters';
import * as S from '../styles/components/PlanningSummaryCardsStyles';

const PlanningSummaryCards = ({ resumo = {} }) => {
  const { theme } = useTheme();

  const totalNecessario = resumo.totalGeral || 0;
  const totalGasto = resumo.totalPago || 0;
  const percentualConcluido = totalNecessario > 0 ? (totalGasto / totalNecessario) * 100 : 0;
  const totalItens = resumo.totalItens || 0;
  const comprados = resumo.totalComprados || 0;
  const pendentes = totalItens - comprados;

  const cards = [
    {
      icon: DollarSign,
      label: 'Total necessário',
      value: formatarMoeda(totalNecessario),
      color: theme.primary,
      gradient: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
    },
    {
      icon: DollarSign,
      label: 'Total gasto',
      value: formatarMoeda(totalGasto),
      color: theme.success,
      gradient: `linear-gradient(135deg, ${theme.success} 0%, #10b981 100%)`,
    },
    {
      icon: TrendingUp,
      label: 'Percentual concluído',
      value: `${percentualConcluido.toFixed(1)}%`,
      color: theme.secondary,
      gradient: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.secondaryDark} 100%)`,
    },
    {
      icon: Package,
      label: 'Total de itens',
      value: totalItens,
      color: theme.info,
      gradient: `linear-gradient(135deg, ${theme.info} 0%, #3b82f6 100%)`,
    },
    {
      icon: CheckCircle,
      label: 'Comprados',
      value: comprados,
      color: theme.success,
      gradient: `linear-gradient(135deg, ${theme.success} 0%, #10b981 100%)`,
    },
    {
      icon: Clock,
      label: 'Pendentes',
      value: pendentes,
      color: theme.warning,
      gradient: `linear-gradient(135deg, ${theme.warning} 0%, #f59e0b 100%)`,
    },
  ];

  return (
    <S.CardsContainer>
      {cards.map((card, index) => (
        <S.Card key={index} theme={theme} $gradient={card.gradient}>
          <S.CardHeader>
            <S.CardIcon $color={card.color}>
              <card.icon size={24} />
            </S.CardIcon>
            <S.CardLabel>{card.label}</S.CardLabel>
          </S.CardHeader>
          <S.CardValue theme={theme}>{card.value}</S.CardValue>
        </S.Card>
      ))}
    </S.CardsContainer>
  );
};

export default PlanningSummaryCards;
