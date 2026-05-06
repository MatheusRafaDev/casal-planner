import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 18px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.border};
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  border-left: 4px solid ${({ $color }) => $color};
`;

const Label = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSoft};
  margin-bottom: 0.5rem;
`;

const Valor = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.border};
  border-radius: 3px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled.div`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

const Info = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 0.5rem;
`;

const PagamentoResumo = ({ pagamentos, theme }) => {
  const formatMoney = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Container theme={theme}>
      <Title theme={theme}>💳 Resumo por Pagamento</Title>
      <Grid>
        <Card theme={theme} $color={theme.vrva}>
          <Label theme={theme}>VR / Vale Alimentação</Label>
          <Valor $color={theme.vrva}>{formatMoney(pagamentos.vrva.total)}</Valor>
          <ProgressBar theme={theme}>
            <ProgressFill $percent={pagamentos.vrva.percentual} $color={theme.vrva} />
          </ProgressBar>
          <Info theme={theme}>
            <span>✅ Pago: {formatMoney(pagamentos.vrva.pago)}</span>
            <span>⚠️ Falta: {formatMoney(pagamentos.vrva.falta)}</span>
          </Info>
        </Card>

        <Card theme={theme} $color={theme.secondary}>
          <Label theme={theme}>Pagamento Normal</Label>
          <Valor $color={theme.secondary}>{formatMoney(pagamentos.normal.total)}</Valor>
          <ProgressBar theme={theme}>
            <ProgressFill $percent={pagamentos.normal.percentual} $color={theme.secondary} />
          </ProgressBar>
          <Info theme={theme}>
            <span>✅ Pago: {formatMoney(pagamentos.normal.pago)}</span>
            <span>⚠️ Falta: {formatMoney(pagamentos.normal.falta)}</span>
          </Info>
        </Card>
      </Grid>
    </Container>
  );
};

export default PagamentoResumo;