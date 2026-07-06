import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { calcularDashboard } from '../utils/dashboardCalculations';
import { 
  Wallet, 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import {
  DashboardContainer,
  HeaderSection,
  GridCards,
  GlassCard,
  CardIconWrapper,
  CardTitle,
  CardValue,
  CardSubtext,
  SectionTitle,
  ProgressSection,
  ProgressBarWrapper,
  ProgressFill,
  ProgressLabels,
  CategoryGrid,
  CategoryCard,
  CategoryHeader,
  CategoryStats,
  PriorityWrapper,
  PriorityCard,
  SkeletonBox
} from '../styles/pages/InicioStyles';

// Formatador de Moeda
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
};

const Inicio = () => {
  const { theme } = useTheme();
  const { itens, categorias, resumoData, loading } = useDashboardData();

  // Calcular dashboard com utils importado
  const dashboard = calcularDashboard(itens, categorias, resumoData);
  
  const {
    totalGeral,
    totalPago,
    totalComprados,
    totalItens,
    pctFinanceiro,
    pctComprados,
    prioridades,
    porCategoria
  } = dashboard;

  if (loading) {
    return (
      <DashboardContainer>
        <HeaderSection>
          <SkeletonBox $width="250px" $height="40px" theme={theme} />
          <SkeletonBox $width="350px" $height="20px" theme={theme} />
        </HeaderSection>
        <GridCards>
          {[1, 2, 3, 4].map(i => (
            <GlassCard key={i} theme={theme}>
              <SkeletonBox $width="40px" $height="40px" $radius="50%" theme={theme} />
              <SkeletonBox $width="100px" $height="15px" theme={theme} />
              <SkeletonBox $width="150px" $height="30px" theme={theme} />
            </GlassCard>
          ))}
        </GridCards>
        <ProgressSection theme={theme}>
          <SkeletonBox $width="200px" $height="25px" theme={theme} />
          <SkeletonBox $width="100%" $height="12px" $radius="999px" theme={theme} style={{ marginTop: '1rem' }} />
        </ProgressSection>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Cabeçalho */}
      <HeaderSection theme={theme}>
        <h1>Olá, bem-vindos!</h1>
        <p>Acompanhe o progresso do planejamento de vocês.</p>
      </HeaderSection>

      {/* Cartões de Resumo Rápidos */}
      <GridCards>
        <GlassCard theme={theme} $highlight>
          <CardIconWrapper theme={theme}>
            <Wallet size={20} />
          </CardIconWrapper>
          <div>
            <CardTitle theme={theme}>Orçamento Total</CardTitle>
            <CardValue theme={theme}>{formatarMoeda(totalGeral)}</CardValue>
          </div>
        </GlassCard>

        <GlassCard theme={theme}>
          <CardIconWrapper theme={theme} $color={theme.success}>
            <TrendingUp size={20} />
          </CardIconWrapper>
          <div>
            <CardTitle theme={theme}>Valor Pago</CardTitle>
            <CardValue theme={theme} $color={theme.success}>
              {formatarMoeda(totalPago)}
            </CardValue>
            <CardSubtext theme={theme}>
              {pctFinanceiro.toFixed(0)}% do orçamento
            </CardSubtext>
          </div>
        </GlassCard>

        <GlassCard theme={theme}>
          <CardIconWrapper theme={theme} $color={theme.info}>
            <ShoppingBag size={20} />
          </CardIconWrapper>
          <div>
            <CardTitle theme={theme}>Itens Adquiridos</CardTitle>
            <CardValue theme={theme} $color={theme.info}>
              {totalComprados} / {totalItens}
            </CardValue>
            <CardSubtext theme={theme}>
              {pctComprados}% da lista completa
            </CardSubtext>
          </div>
        </GlassCard>
      </GridCards>

      {/* Progresso Geral */}
      <ProgressSection theme={theme}>
        <SectionTitle theme={theme} style={{ marginTop: 0 }}>
          Progresso Financeiro
        </SectionTitle>
        <ProgressBarWrapper theme={theme}>
          <ProgressFill theme={theme} $pct={pctFinanceiro > 100 ? 100 : pctFinanceiro} />
        </ProgressBarWrapper>
        <ProgressLabels theme={theme}>
          <span>{formatarMoeda(totalPago)} pago</span>
          <span>Faltam {formatarMoeda(Math.max(0, totalGeral - totalPago))}</span>
        </ProgressLabels>
      </ProgressSection>

      {/* Prioridades Financeiras */}
      <SectionTitle theme={theme}>Atenção às Prioridades</SectionTitle>
      <PriorityWrapper>
        <PriorityCard theme={theme} $borderColor={theme.error}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.error }}>
            <AlertCircle size={20} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Primeira necessidade</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: theme.textLight }}>
            Falta pagar: <strong style={{ color: theme.text }}>{formatarMoeda(prioridades.urgente.falta)}</strong>
          </p>
          <div style={{ fontSize: '0.8rem', color: theme.textSoft }}>
            Total planejado: {formatarMoeda(prioridades.urgente.total)}
          </div>
        </PriorityCard>

        <PriorityCard theme={theme} $borderColor={theme.warning}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.warning }}>
            <Clock size={20} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Próximas compras</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: theme.textLight }}>
            Falta pagar: <strong style={{ color: theme.text }}>{formatarMoeda(prioridades.normal.falta)}</strong>
          </p>
          <div style={{ fontSize: '0.8rem', color: theme.textSoft }}>
            Total planejado: {formatarMoeda(prioridades.normal.total)}
          </div>
        </PriorityCard>

        <PriorityCard theme={theme} $borderColor={theme.success}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.success }}>
            <CheckCircle2 size={20} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Mais para frente</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: theme.textLight }}>
            Falta pagar: <strong style={{ color: theme.text }}>{formatarMoeda(prioridades.pode_esperar.falta)}</strong>
          </p>
          <div style={{ fontSize: '0.8rem', color: theme.textSoft }}>
            Total planejado: {formatarMoeda(prioridades.pode_esperar.total)}
          </div>
        </PriorityCard>
      </PriorityWrapper>

      {/* Visão por Categorias */}
      {porCategoria.length > 0 && (
        <>
          <SectionTitle theme={theme}>Visão por Categorias</SectionTitle>
          <CategoryGrid>
            {porCategoria.map(cat => {
              const pctCatFinanceiro = cat.total > 0 ? (cat.pago / cat.total) * 100 : 0;
              return (
                <CategoryCard key={cat.id} theme={theme}>
                  <CategoryHeader theme={theme}>
                    <h4>{cat.nome}</h4>
                    <span>{formatarMoeda(cat.total)}</span>
                  </CategoryHeader>
                  
                  <ProgressBarWrapper theme={theme} style={{ margin: '0.25rem 0', height: '6px' }}>
                    <ProgressFill 
                      theme={theme} 
                      $pct={pctCatFinanceiro > 100 ? 100 : pctCatFinanceiro} 
                      $color={cat.cor || theme.primary} 
                    />
                  </ProgressBarWrapper>
                  
                  <CategoryStats theme={theme}>
                    <span>
                      <strong>{cat.comprados}</strong> / {cat.qtd} itens
                    </span>
                    <span>
                      <strong>{formatarMoeda(cat.pago)}</strong> pago
                    </span>
                  </CategoryStats>
                </CategoryCard>
              );
            })}
          </CategoryGrid>
        </>
      )}
    </DashboardContainer>
  );
};

export default Inicio;
