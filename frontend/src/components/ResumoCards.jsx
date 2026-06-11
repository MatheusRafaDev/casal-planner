import React from 'react';
import * as S from '../styles/components/ResumoCardsStyles';

const ResumoCards = ({ resumo = {}, theme = {} }) => {
  // Helper para formatar moeda
  const fmt = (valor = 0) => {
    return valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Extrair valores do resumo
  const totalVR = resumo.totalVR ?? 0;
  const vrPago = resumo.vrPago ?? 0;
  const vrRestante = resumo.vrRestante ?? totalVR - vrPago;

  const totalNormal = resumo.totalNormal ?? 0;
  const normalPago = resumo.normalPago ?? 0;
  const normalRestante = resumo.normalRestante ?? totalNormal - normalPago;

  const totalGeral = resumo.totalGeral ?? totalVR + totalNormal;
  const totalPago = resumo.totalPago ?? vrPago + normalPago;
  const totalRestante = resumo.totalRestante ?? totalGeral - totalPago;
  const totalComprados = resumo.totalComprados ?? 0;

  // Extrair valores do enxoval
  const enxoval = resumo.enxoval ?? {};
  const percentualConcluido = enxoval.percentualConcluido ?? 0;
  const totalEconomizado = enxoval.totalEconomizado ?? 0;
  const porOrigem = enxoval.porOrigem ?? {};

  // Cores do tema (com fallbacks)
  const colors = {
    vr: theme.vrva ?? '#f59e0b',
    dinheiro: theme.secondary ?? '#3b82f6',
    primary: theme.primary ?? '#6366f1',
    success: theme.success ?? '#10b981',
    warning: theme.warning ?? '#f59e0b',
    info: theme.info ?? '#8b5cf6',
  };

  // Ícones em SVG
  const IconCoffee = () => (
    <S.IconSm viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 12h12M12 8v8M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M6 8h.01M18 8h.01M6 16h.01M18 16h.01" />
    </S.IconSm>
  );

  const IconDollar = () => (
    <S.IconSm viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </S.IconSm>
  );

  const IconTrending = () => (
    <S.IconSm viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9h-4m-7 9A9 9 0 0 1 3 12m9 9v-4M3 12a9 9 0 0 1 9-9m-9 9h4m7-9a9 9 0 0 1 9 9" />
    </S.IconSm>
  );

  const IconCheck = () => (
    <S.IconSm viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </S.IconSm>
  );

  const IconProgress = () => (
    <S.IconSm viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </S.IconSm>
  );

  const IconGift = () => (
    <S.IconSm viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12v10H4V12" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </S.IconSm>
  );

  const IconBox = () => (
    <S.IconSm viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </S.IconSm>
  );

  return (
    <S.Grid>
      {/* Card VR */}
      <S.Card $color={colors.vr}>
        <S.CardTitle>
          <IconCoffee />
          Vale Refeição
          <S.Badge $color={colors.vr}>Benefício</S.Badge>
        </S.CardTitle>
        
        <S.MainValue $color={colors.vr}>
          <span>R$ </span>{fmt(totalVR)}
        </S.MainValue>
        
        <S.Divider />
        
        <S.InfoRow>
          <S.InfoLabel>
            <IconCheck />
            Pago
          </S.InfoLabel>
          <S.InfoValue $color={colors.success}>
            R$ {fmt(vrPago)}
          </S.InfoValue>
        </S.InfoRow>
        
        <S.InfoRow>
          <S.InfoLabel>⏱️ Restante</S.InfoLabel>
          <S.InfoValue $color={colors.vr}>
            R$ {fmt(vrRestante)}
          </S.InfoValue>
        </S.InfoRow>
      </S.Card>

      {/* Card Dinheiro/Cartão */}
      <S.Card $color={colors.dinheiro}>
        <S.CardTitle>
          <IconDollar />
          Dinheiro / Cartão
          <S.Badge $color={colors.dinheiro}>À vista</S.Badge>
        </S.CardTitle>
        
        <S.MainValue $color={colors.dinheiro}>
          <span>R$ </span>{fmt(totalNormal)}
        </S.MainValue>
        
        <S.Divider />
        
        <S.InfoRow>
          <S.InfoLabel>
            <IconCheck />
            Pago
          </S.InfoLabel>
          <S.InfoValue $color={colors.success}>
            R$ {fmt(normalPago)}
          </S.InfoValue>
        </S.InfoRow>
        
        <S.InfoRow>
          <S.InfoLabel>⏱️ Restante</S.InfoLabel>
          <S.InfoValue $color={colors.dinheiro}>
            R$ {fmt(normalRestante)}
          </S.InfoValue>
        </S.InfoRow>
      </S.Card>

      {/* Card Resumo Geral */}
      <S.CardFull $color={colors.primary}>
        <S.CardTitle>
          <IconTrending />
          Resumo Geral
        </S.CardTitle>
        
        <S.InfoRow>
          <S.InfoLabel>Total da lista</S.InfoLabel>
          <S.InfoValue $color={colors.primary}>
            R$ {fmt(totalGeral)}
          </S.InfoValue>
        </S.InfoRow>
        
        <S.InfoRow>
          <S.InfoLabel>
            <IconCheck />
            Total pago
          </S.InfoLabel>
          <S.InfoValue $color={colors.success}>
            R$ {fmt(totalPago)}
          </S.InfoValue>
        </S.InfoRow>
        
        <S.InfoRow>
          <S.InfoLabel>⚠️ Falta pagar</S.InfoLabel>
          <S.InfoValue $color={colors.warning}>
            R$ {fmt(totalRestante)}
          </S.InfoValue>
        </S.InfoRow>
        
        <S.InfoRow>
          <S.InfoLabel>📦 Itens comprados</S.InfoLabel>
          <S.InfoValue $color={colors.info}>
            {totalComprados} itens
          </S.InfoValue>
        </S.InfoRow>
      </S.CardFull>

      {/* Card Progresso */}
      <S.Card $color={colors.primary}>
        <S.CardTitle>
          <IconProgress />
          Progresso
          <S.Badge $color={colors.primary}>Enxoval</S.Badge>
        </S.CardTitle>

        <S.MainValue $color={colors.primary}>
          <span>{fmt(percentualConcluido)}%</span>
        </S.MainValue>

        <S.Divider />

        <S.InfoRow>
          <S.InfoLabel>Concluído</S.InfoLabel>
          <S.InfoValue $color={colors.success}>
            {fmt(percentualConcluido)}%
          </S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel>⏱️ Restante</S.InfoLabel>
          <S.InfoValue $color={colors.warning}>
            {fmt(100 - percentualConcluido)}%
          </S.InfoValue>
        </S.InfoRow>
      </S.Card>

      {/* Card Economia */}
      <S.Card $color={colors.success}>
        <S.CardTitle>
          <IconGift />
          Economia
          <S.Badge $color={colors.success}>Presentes</S.Badge>
        </S.CardTitle>

        <S.MainValue $color={colors.success}>
          <span>R$ </span>{fmt(totalEconomizado)}
        </S.MainValue>

        <S.Divider />

        <S.InfoRow>
          <S.InfoLabel>🎁 Economizado</S.InfoLabel>
          <S.InfoValue $color={colors.success}>
            R$ {fmt(totalEconomizado)}
          </S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel>📊 Origem</S.InfoLabel>
          <S.InfoValue $color={colors.info}>
            {porOrigem.presente ? porOrigem.presente.quantidade : 0} presentes
          </S.InfoValue>
        </S.InfoRow>
      </S.Card>

    </S.Grid>
  );
};

export default ResumoCards;