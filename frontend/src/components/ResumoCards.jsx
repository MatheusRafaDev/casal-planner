import React from 'react';
import * as S from '../styles/components/ResumoCardsStyles';

// ─── Ícones inline (sem dependência extra) ────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (valor = 0) =>
  Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * ResumoCards — exibe cards financeiros do enxoval.
 *
 * Espera `resumo` no formato retornado por resumoService.formatarDados()
 * ou resumoService.calcularResumoManual(), ou seja:
 *   { atual: {...}, comparativo: {...}, enxoval: {...} }
 *
 * Todos os campos têm fallback para 0 / {} para evitar crashes com dados
 * parciais.
 */
const ResumoCards = ({ resumo = {}, theme = {} }) => {
  const atual = resumo.atual ?? {};
  const enxoval = resumo.enxoval ?? {};

  // Totais por tipo de pagamento
  const totalVR = atual.totalVR ?? 0;
  const totalNormal = atual.totalNormal ?? 0;
  const totalGeral = atual.totalGeral ?? totalVR + totalNormal;
  const totalComprados = atual.totalComprados ?? 0;

  // "Pago" só existe quando os itens têm flag explícita — aqui calculamos
  // a partir dos itens comprados como aproximação. Se o backend enviar
  // vrPago/normalPago futuramente, basta adicioná-los ao DTO.
  const vrPago = atual.vrPago ?? 0;
  const normalPago = atual.normalPago ?? 0;
  const totalPago = atual.totalPago ?? vrPago + normalPago;
  const vrRestante = totalVR - vrPago;
  const normalRestante = totalNormal - normalPago;
  const totalRestante = totalGeral - totalPago;

  // Progresso e economia
  const percentualConcluido = atual.percentualConcluido ?? 0;

  // Cores com fallbacks
  const colors = {
    vr: theme.vrva ?? '#f59e0b',
    dinheiro: theme.secondary ?? '#3b82f6',
    primary: theme.primary ?? '#6366f1',
    success: theme.success ?? '#10b981',
    warning: theme.warning ?? '#f59e0b',
    info: theme.info ?? '#8b5cf6',
  };

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
          <S.InfoLabel><IconCheck /> Pago</S.InfoLabel>
          <S.InfoValue $color={colors.success}>R$ {fmt(vrPago)}</S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel>Restante</S.InfoLabel>
          <S.InfoValue $color={colors.vr}>R$ {fmt(vrRestante)}</S.InfoValue>
        </S.InfoRow>
      </S.Card>

      {/* Card Dinheiro / Cartão */}
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
          <S.InfoLabel><IconCheck /> Pago</S.InfoLabel>
          <S.InfoValue $color={colors.success}>R$ {fmt(normalPago)}</S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel>Restante</S.InfoLabel>
          <S.InfoValue $color={colors.dinheiro}>R$ {fmt(normalRestante)}</S.InfoValue>
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
          <S.InfoValue $color={colors.primary}>R$ {fmt(totalGeral)}</S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel><IconCheck /> Total pago</S.InfoLabel>
          <S.InfoValue $color={colors.success}>R$ {fmt(totalPago)}</S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel>Falta pagar</S.InfoLabel>
          <S.InfoValue $color={colors.warning}>R$ {fmt(totalRestante)}</S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel>Itens comprados</S.InfoLabel>
          <S.InfoValue $color={colors.info}>{totalComprados} itens</S.InfoValue>
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
          <S.InfoValue $color={colors.success}>{fmt(percentualConcluido)}%</S.InfoValue>
        </S.InfoRow>

        <S.InfoRow>
          <S.InfoLabel>Restante</S.InfoLabel>
          <S.InfoValue $color={colors.warning}>{fmt(100 - percentualConcluido)}%</S.InfoValue>
        </S.InfoRow>
      </S.Card>
    </S.Grid>
  );
};

export default ResumoCards;