import React, { useMemo, useRef, useState, useCallback } from 'react';
import { TrendingUp, Coffee, DollarSign, CheckCircle, Clock, Wallet } from 'lucide-react';
import * as S from '../styles/components/ResumoCardsStyles';

const ResumoCards = ({ resumo = {}, comparativo = {}, theme }) => {

  const gridRef    = useRef(null);
  const TOTAL_DOTS = 5; // 6 cards → 5 posições de scroll
  const [activeDot, setActiveDot] = useState(0);

  const fmt = (valor = 0) =>
    valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Valores com fallback seguro
  const totalGeral     = resumo.totalGeral     ?? 0;
  const totalPago      = resumo.totalPago       ?? 0;
  const totalRestante  = resumo.totalRestante   ?? totalGeral - totalPago;
  const totalVR        = resumo.totalVR         ?? 0;
  const vrPago         = resumo.vrPago          ?? 0;
  const vrRestante     = resumo.vrRestante      ?? totalVR - vrPago;
  const totalNormal    = resumo.totalNormal     ?? 0;
  const normalPago     = resumo.normalPago      ?? 0;
  const normalRestante = resumo.normalRestante  ?? totalNormal - normalPago;
  const totalComprados = resumo.totalComprados  ?? 0;

  const cards = useMemo(() => [
    /* 1 — DESTAQUE: falta pagar */
    {
      id: 'restante',
      label: 'Falta pagar',
      descricao: 'Total pendente descontando comprados',
      value: totalRestante,
      icon: Clock,
      color: theme.warning ?? '#f59e0b',
      prefix: 'R$ ',
      badge: 'Pendente',
      destaque: true,
      footer: null,
    },
    /* 2 — Já pago */
    {
      id: 'pago',
      label: 'Já pago',
      descricao: `${totalComprados} item${totalComprados !== 1 ? 's' : ''} comprado${totalComprados !== 1 ? 's' : ''}`,
      value: totalPago,
      icon: CheckCircle,
      color: theme.success,
      prefix: 'R$ ',
      badge: 'Pago',
      destaque: false,
      footer: null,
    },
    /* 3 — Total geral */
    {
      id: 'totalGeral',
      label: 'Total da lista',
      descricao: 'Soma de todos os itens',
      value: totalGeral,
      icon: TrendingUp,
      color: theme.primary,
      prefix: 'R$ ',
      badge: 'Geral',
      destaque: false,
      footer: null,
    },
    /* 4 — VR com breakdown */
    {
      id: 'totalVR',
      label: 'VR / Vale-refeição',
      descricao: 'Itens pagos com benefício',
      value: totalVR,
      icon: Coffee,
      color: theme.vrva,
      prefix: 'R$ ',
      badge: 'Benefícios',
      destaque: false,
      footer: {
        left:  { label: 'Pago',  value: vrPago,      color: theme.success },
        right: { label: 'Falta', value: vrRestante,   color: theme.warning ?? '#f59e0b' },
      },
    },
    /* 5 — Normal com breakdown */
    {
      id: 'totalNormal',
      label: 'Dinheiro / Cartão',
      descricao: 'Itens de pagamento comum',
      value: totalNormal,
      icon: DollarSign,
      color: theme.secondary,
      prefix: 'R$ ',
      badge: 'À vista',
      destaque: false,
      footer: {
        left:  { label: 'Pago',  value: normalPago,     color: theme.success },
        right: { label: 'Falta', value: normalRestante,  color: theme.warning ?? '#f59e0b' },
      },
    },
    /* 6 — Contagem */
    {
      id: 'totalComprados',
      label: 'Itens comprados',
      descricao: 'Quantidade já adquirida',
      value: totalComprados,
      icon: Wallet,
      color: theme.success,
      suffix: ' itens',
      badge: 'Realizados',
      destaque: false,
      footer: null,
      formatter: (v) => String(v || 0),
    },
  ], [
    totalGeral, totalPago, totalRestante,
    totalVR, vrPago, vrRestante,
    totalNormal, normalPago, normalRestante,
    totalComprados, theme,
  ]);

  const handleScroll = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const dot = Math.min(TOTAL_DOTS - 1, Math.round((el.scrollLeft / maxScroll) * (TOTAL_DOTS - 1)));
    setActiveDot(dot);
  }, []);

  const handleDotClick = useCallback((index) => {
    const el = gridRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (index / (TOTAL_DOTS - 1)) * maxScroll, behavior: 'smooth' });
    setActiveDot(index);
  }, []);

  return (
    <>
      <S.ResumoGrid ref={gridRef} onScroll={handleScroll}>
        {cards.map((card) => {
          const Icon = card.icon;
          const formattedValue = card.formatter
            ? card.formatter(card.value)
            : fmt(card.value);

          return (
            <S.ResumoCard
              key={card.id}
              $color={card.color}
              data-destaque={card.destaque ? 'true' : undefined}
            >
              <S.CardHeader>
                <S.CardIcon $color={card.color}>
                  <Icon size={15} />
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

              {card.footer && (
                <S.CardFooter>
                  <S.FooterStat>
                    <S.FooterLabel>Pago</S.FooterLabel>
                    <S.FooterValue $color={card.footer.left.color}>
                      R$ {fmt(card.footer.left.value)}
                    </S.FooterValue>
                  </S.FooterStat>
                  <S.FooterStat>
                    <S.FooterLabel>Falta</S.FooterLabel>
                    <S.FooterValue $color={card.footer.right.color}>
                      R$ {fmt(card.footer.right.value)}
                    </S.FooterValue>
                  </S.FooterStat>
                </S.CardFooter>
              )}
            </S.ResumoCard>
          );
        })}
      </S.ResumoGrid>

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