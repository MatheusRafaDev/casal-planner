
import React, { useMemo } from 'react';
import { TrendingUp, Coffee, DollarSign, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import * as S from '../styles/components/ResumoCardsStyles';

const ResumoCards = ({ resumo = {}, comparativo = {}, theme }) => {

  const formatarPreco = (valor = 0) =>
    valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const getTrend = (valor = 0) => {
    if (valor > 0) return 'up';
    if (valor < 0) return 'down';
    return null;
  };

  const cards = useMemo(() => [
    {
      id: 'totalGeral',
      label: 'Total Geral',
      descricao: 'Valor total de todos os itens',
      value: resumo.totalGeral,
      icon: TrendingUp,
      color: theme.primary,
      prefix: 'R$ ',
      badge: 'Visão Geral'
    },
    {
      id: 'totalVR',
      label: 'VR / Vale Alimentação',
      descricao: 'Total em benefícios',
      value: resumo.totalVR,
      icon: Coffee,
      color: theme.vrva,
      prefix: 'R$ ',
      badge: 'Benefícios'
    },
    {
      id: 'totalNormal',
      label: 'Pagamento Normal',
      descricao: 'Total em dinheiro/cartão',
      value: resumo.totalNormal,
      icon: DollarSign,
      color: theme.secondary,
      prefix: 'R$ ',
      badge: 'À vista'
    },
    {
      id: 'totalComprados',
      label: 'Itens Comprados',
      descricao: 'Total de itens já adquiridos',
      value: resumo.totalComprados,
      icon: CheckCircle,
      color: theme.success,
      suffix: ' itens',
      badge: 'Realizados',
      formatter: (val) => val || 0
    }
  ], [resumo, theme]);

  return (
    <S.ResumoGrid>
      {cards.map((card) => {
        const Icon = card.icon;
        const trendValue = comparativo[card.id] || 0;
        const trend = getTrend(trendValue);

        const formattedValue = card.formatter
          ? card.formatter(card.value)
          : formatarPreco(card.value);

        return (
          <S.ResumoCard key={card.id} $color={card.color}>
            <S.CardHeader>
              <S.CardIcon $color={card.color}>
                <Icon size={18} />
              </S.CardIcon>
              <S.CardBadge $color={card.color}>
                {card.badge}
              </S.CardBadge>
            </S.CardHeader>

            <S.CardContent>
              <S.CardTitle>{card.label}</S.CardTitle>
              <S.CardDescription>{card.descricao}</S.CardDescription>

              <S.CardValue $color={card.color}>
                {card.prefix && <span>{card.prefix}</span>}
                {formattedValue}
                {card.suffix && <span>{card.suffix}</span>}
              </S.CardValue>
            </S.CardContent>

            <S.CardFooter>

            </S.CardFooter>
          </S.ResumoCard>
        );
      })}
    </S.ResumoGrid>
  );
};

export default ResumoCards;
