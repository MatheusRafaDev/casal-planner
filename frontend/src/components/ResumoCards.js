import React from 'react';
import './ResumoCards.css';

const ResumoCards = ({ resumo }) => {
  const formatarPreco = (valor) => {
    return valor?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) || '0,00';
  };

  const maxTotal = Math.max(resumo?.totalGeral || 1, 1);

  return (
    <div className="resumo-grid">
      <div className="resumo-card">
        <div className="resumo-header">
          <span>💰</span> Total Geral
        </div>
        <div className="resumo-valor">
          R$ {formatarPreco(resumo?.totalGeral)}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '100%' }}></div>
        </div>
      </div>

      <div className="resumo-card">
        <div className="resumo-header">
          <span>🍽️</span> VR/VA
        </div>
        <div className="resumo-valor">
          R$ {formatarPreco(resumo?.totalVR)}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${((resumo?.totalVR || 0) / maxTotal) * 100}%`,
              background: '#2980b9'
            }}
          ></div>
        </div>
      </div>

      <div className="resumo-card">
        <div className="resumo-header">
          <span>💵</span> Normal
        </div>
        <div className="resumo-valor">
          R$ {formatarPreco(resumo?.totalNormal)}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${((resumo?.totalNormal || 0) / maxTotal) * 100}%`,
              background: '#e67e22'
            }}
          ></div>
        </div>
      </div>

      <div className="resumo-card">
        <div className="resumo-header">
          <span>✅</span> Comprados
        </div>
        <div className="resumo-valor">
          {resumo?.totalComprados || 0}/{resumo?.totalItens || 0}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${((resumo?.totalComprados || 0) / Math.max(resumo?.totalItens || 1, 1)) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ResumoCards;