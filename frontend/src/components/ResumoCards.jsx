import React from 'react';
import { TrendingUp, Coffee, DollarSign, CheckCircle } from 'lucide-react';
import {
  ResumoGrid,
  ResumoItem
} from '../styles/components/ResumoCardsStyles';

const ResumoCards = ({ resumo }) => {
  const formatarPreco = (valor) => {
    return valor?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0,00';
  };

  return (
    <ResumoGrid>
      <ResumoItem>
        <TrendingUp className="icon" size={20} color="#8B5CF6" />
        <span className="label">Total Geral</span>
        <span className="value">R$ {formatarPreco(resumo?.totalGeral)}</span>
      </ResumoItem>
      
      <ResumoItem>
        <Coffee className="icon" size={20} color="#8B5CF6" />
        <span className="label">VR/VA</span>
        <span className="value" style={{ color: '#8B5CF6' }}>
          R$ {formatarPreco(resumo?.totalVR)}
        </span>
      </ResumoItem>
      
      <ResumoItem>
        <DollarSign className="icon" size={20} color="#EC4899" />
        <span className="label">Normal</span>
        <span className="value" style={{ color: '#EC4899' }}>
          R$ {formatarPreco(resumo?.totalNormal)}
        </span>
      </ResumoItem>
      
      <ResumoItem>
        <CheckCircle className="icon" size={20} color="#10B981" />
        <span className="label">Comprados</span>
        <span className="value">{resumo?.totalComprados || 0}</span>
      </ResumoItem>
    </ResumoGrid>
  );
};

export default ResumoCards;