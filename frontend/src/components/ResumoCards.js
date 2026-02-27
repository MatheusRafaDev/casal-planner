import React from 'react';
import styled from 'styled-components';

const ResumoCards = ({ resumo }) => {
  const formatarPreco = (valor) => {
    return valor?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0,00';
  };

  const maxTotal = Math.max(resumo?.totalGeral || 1, 1);

  return (
    <ResumoGrid>
      <ResumoCard>
        <ResumoHeader>
          <span>💰</span> Total Geral
        </ResumoHeader>
        <ResumoValor>
          R$ {formatarPreco(resumo?.totalGeral)}
        </ResumoValor>
        <ProgressBar>
          <ProgressFill style={{ width: '100%' }} />
        </ProgressBar>
      </ResumoCard>

      <ResumoCard>
        <ResumoHeader>
          <span>🍽️</span> VR/VA
        </ResumoHeader>
        <ResumoValor>
          R$ {formatarPreco(resumo?.totalVR)}
        </ResumoValor>
        <ProgressBar>
          <ProgressFill 
            style={{ 
              width: `${((resumo?.totalVR || 0) / maxTotal) * 100}%`,
              background: '#2980b9'
            }}
          />
        </ProgressBar>
      </ResumoCard>

      <ResumoCard>
        <ResumoHeader>
          <span>💵</span> Normal
        </ResumoHeader>
        <ResumoValor>
          R$ {formatarPreco(resumo?.totalNormal)}
        </ResumoValor>
        <ProgressBar>
          <ProgressFill 
            style={{ 
              width: `${((resumo?.totalNormal || 0) / maxTotal) * 100}%`,
              background: '#e67e22'
            }}
          />
        </ProgressBar>
      </ResumoCard>

      <ResumoCard>
        <ResumoHeader>
          <span>✅</span> Comprados
        </ResumoHeader>
        <ResumoValor>
          {resumo?.totalComprados || 0}/{resumo?.totalItens || 0}
        </ResumoValor>
        <ProgressBar>
          <ProgressFill 
            style={{ 
              width: `${((resumo?.totalComprados || 0) / Math.max(resumo?.totalItens || 1, 1)) * 100}%`
            }}
          />
        </ProgressBar>
      </ResumoCard>
    </ResumoGrid>
  );
};

// Styled Components
const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
`;

const ResumoCard = styled.div`
  background: ${props => props.theme?.darkMode ? '#2d3748' : 'white'};
  border: 1px solid ${props => props.theme?.darkMode ? '#4a5568' : '#ecf0f1'};
  border-radius: 24px;
  padding: 1.2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ResumoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme?.darkMode ? '#a0aec0' : '#7f8c8d'};
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
`;

const ResumoValor = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme?.darkMode ? '#e2e8f0' : '#2c3e50'};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${props => props.theme?.darkMode ? '#4a5568' : '#ecf0f1'};
  border-radius: 20px;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #27ae60;
  border-radius: 20px;
  transition: width 0.3s;
`;

export default ResumoCards;