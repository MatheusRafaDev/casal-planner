import React, { useMemo, useRef, useState, useCallback } from 'react';
import { TrendingUp, Coffee, DollarSign, CheckCircle } from 'lucide-react';
import * as S from '../styles/components/ResumoCardsStyles';

const ResumoCards = ({ resumo = {}, comparativo = {}, theme, filtro, onFiltroChange }) => {

  const gridRef = useRef(null);
  // 4 cards = 3 "viradas" de scroll (0, 1, 2)
  const TOTAL_DOTS = 3;
  const [activeDot, setActiveDot] = useState(0);

  const formatarPreco = (valor = 0) =>
    valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

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

  // 4 cards → divide em 3 grupos de scroll
  const handleScroll = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = el.scrollLeft / maxScroll;
    // mapeia 0→0, 0.5→1, 1→2
    const dot = Math.min(TOTAL_DOTS - 1, Math.round(ratio * (TOTAL_DOTS - 1)));
    setActiveDot(dot);
  }, []);

  // Clique na bolinha scrolla para a posição correspondente
  const handleDotClick = useCallback((index) => {
    const el = gridRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (index / (TOTAL_DOTS - 1)) * maxScroll, behavior: 'smooth' });
    setActiveDot(index);
  }, []);

  return (
    <>

      {/* ── Cards ── */}
      <S.ResumoGrid ref={gridRef} onScroll={handleScroll}>
        {cards.map((card) => {
          const Icon = card.icon;
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

              <S.CardFooter />
            </S.ResumoCard>
          );
        })}
      </S.ResumoGrid>

      {/* ── 3 bolinhas fixas — só aparece mobile ── */}
      <S.ScrollDots>
        {Array.from({ length: TOTAL_DOTS }).map((_, i) => (
          <S.ScrollDot
            key={i}
            $active={i === activeDot}
            onClick={() => handleDotClick(i)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </S.ScrollDots>
    </>
  );
};

export default ResumoCards;