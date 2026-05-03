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
    </S.Grid>
  );
};

export default ResumoCards;