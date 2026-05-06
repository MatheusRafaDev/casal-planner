import React from 'react';
import styled from 'styled-components';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Container = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 18px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${({ theme }) => theme.border};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const UrgencyBadge = styled.div`
  background: ${({ theme }) => `${theme.error}20`};
  color: ${({ theme }) => theme.error};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 12px;
  border-top: 3px solid ${({ $color }) => $color};
  opacity: ${({ $completed }) => ($completed ? 0.7 : 1)};
`;

const PriorityLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Valor = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0.5rem 0;
`;

const Status = styled.div`
  font-size: 0.75rem;
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.textSoft};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.border};
  border-radius: 2px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled.div`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  background: ${({ $color }) => $color};
`;

const PrioridadeResumo = ({ prioridades, theme, urgenciaFalta, urgenciaItensPendentes }) => {
  const formatMoney = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgente: theme.error,
      alta: theme.warning,
      media: theme.primary,
      baixa: theme.success,
    };
    return colors[priority] || theme.textSoft;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgente') return '🔴';
    if (priority === 'alta') return '🟠';
    if (priority === 'media') return '🟡';
    return '🟢';
  };

  const prioritiesList = [
    { key: 'urgente', label: 'Urgente', icon: '🔴' },
    { key: 'alta', label: 'Alta', icon: '🟠' },
    { key: 'media', label: 'Média', icon: '🟡' },
    { key: 'baixa', label: 'Baixa', icon: '🟢' },
  ];

  return (
    <Container theme={theme}>
      <Header>
        <Title theme={theme}>🎯 Resumo por Prioridade</Title>
        {urgenciaFalta > 0 && (
          <UrgencyBadge theme={theme}>
            <AlertCircle size={14} />
            ⚠️ {formatMoney(urgenciaFalta)} em itens urgentes • {urgenciaItensPendentes} pendentes
          </UrgencyBadge>
        )}
      </Header>

      <Grid>
        {prioritiesList.map(({ key, label, icon }) => {
          const data = prioridades[key];
          const total = data?.total || 0;
          const pago = data?.pago || 0;
          const falta = data?.falta || 0;
          const percentual = total > 0 ? (pago / total) * 100 : 0;
          const isCompleted = total > 0 && percentual >= 100;

          if (total === 0) return null;

          return (
            <Card key={key} theme={theme} $color={getPriorityColor(key)} $completed={isCompleted}>
              <PriorityLabel $color={getPriorityColor(key)}>
                {icon} {label}
              </PriorityLabel>
              
              <Valor theme={theme}>{formatMoney(total)}</Valor>
              
              <ProgressBar theme={theme}>
                <ProgressFill $percent={percentual} $color={getPriorityColor(key)} />
              </ProgressBar>
              
              <Status theme={theme}>
                <span>✅ Pago: {formatMoney(pago)}</span>
                <span>⚠️ Falta: {formatMoney(falta)}</span>
              </Status>
              
              {data?.itens?.length > 0 && (
                <Status theme={theme}>
                  <span>📦 Itens: {data.itens.length}</span>
                  <span>⏳ Pendentes: {data.itens.filter(i => !i.comprado).length}</span>
                </Status>
              )}
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
};

export default PrioridadeResumo;