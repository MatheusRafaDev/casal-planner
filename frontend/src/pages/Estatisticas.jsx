import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { itensService } from "../services/itensService";
import { categoriasService } from "../services/categoriasService";
import {
  TrendingUp, ShoppingCart, CheckCircle, Coffee, DollarSign,
  Sparkles
} from "lucide-react";
import {
  formatarMoeda
} from "../utils/formatters";

import {
  EstatisticasContainer, HeaderSection, Title, Subtitle,
  DonutCard, DonutWrapper, DonutLabel, DonutSublabel, DonutValue,
  LegendRow, LegendItem, LegendDot,
  StatsGrid, StatCard, StatIcon, StatLabel, StatValue, StatSub,
  SectionTitle, ProgressCard, ProgressHeader, ProgressLabel, ProgressPercent,
  ProgressBarBg, ProgressBarFill,
  PaymentRow, PaymentCard,
  PriorityItem, PriorityHeader, PriorityLabel, PriorityValue,
  PriorityTotals, PrioridadePaid, PrioridadePending,
  CategoryCard, CategoryHeader, CategoryIcon, CategoryInfo,
  CategoryName, CategoryMeta, CategoryTotal,
  AICard, AISparkle, AIContent, AITitle, AIInsight,
  EmptyState, EmptyIcon, EmptyTitle, EmptyText,
} from "../styles/pages/EstatisticasStyles";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const StyledProgressBar = ({ percent, color = "#a78bfa", height = 8 }) => (
  <ProgressBarBg $height={height}>
    <ProgressBarFill $percent={Math.min(percent, 100)} $color={color} />
  </ProgressBarBg>
);

const DonutChart = ({ percentage, label, sublabel, color = "#a78bfa" }) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (circumference * clamped) / 100;

  return (
    <DonutWrapper style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3f3f46"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
        />
      </svg>
      <DonutLabel>
        <DonutSublabel>{sublabel}</DonutSublabel>
        <DonutValue>{label}</DonutValue>
      </DonutLabel>
    </DonutWrapper>
  );
};

function LoadingSkeleton() {
  return (
    <EstatisticasContainer>
      <div style={{ padding: "0 16px" }}>
        <div style={{ width: "120px", height: "12px", background: "#3f3f46", borderRadius: "6px", marginBottom: "8px" }} />
        <div style={{ width: "220px", height: "28px", background: "#3f3f46", borderRadius: "8px", marginBottom: "28px" }} />
        <div style={{ width: "100%", height: "280px", background: "#27272a", borderRadius: "32px", marginBottom: "20px" }} />
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          {[1, 2].map(i => (
            <div key={i} style={{ flex: 1, height: "100px", background: "#27272a", borderRadius: "20px" }} />
          ))}
        </div>
      </div>
    </EstatisticasContainer>
  );
}

export default function Estatisticas() {
  const { theme } = useTheme();
  const { usuario } = useAuth();

  const [itens, setItens] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const [its, cats] = await Promise.all([
        itensService.getAll().catch(() => []),
        categoriasService.listarDoUsuario().catch(() => []),
      ]);
      setItens(its || []);
      setCategorias(cats || []);
    } catch (e) {
      console.error("Erro estatisticas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) carregarDados();
  }, [usuario]);

  if (loading) return <LoadingSkeleton />;

  const calcTotal = (arr) => arr.reduce((a, i) => a + (Number(i.preco) || 0) * (Number(i.quantidade) || 0), 0);

  const totalGeral = calcTotal(itens);
  const totalPago = calcTotal(itens.filter(i => i.comprado));
  const totalFalta = totalGeral - totalPago;
  const totalVR = calcTotal(itens.filter(i => i.pagamento === "vr"));
  const totalNormal = calcTotal(itens.filter(i => i.pagamento === "normal"));
  const vrPago = calcTotal(itens.filter(i => i.pagamento === "vr" && i.comprado));
  const normalPago = calcTotal(itens.filter(i => i.pagamento === "normal" && i.comprado));
  const totalItens = itens.length;
  const totalComprados = itens.filter(i => i.comprado).length;
  const pctComprados = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;
  const pctPago = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;

  const prioridades = {
    urgente: { total: 0, pago: 0 },
    normal: { total: 0, pago: 0 },
    pode_esperar: { total: 0, pago: 0 },
  };
  itens.forEach(item => {
    const valor = (Number(item.preco) || 0) * (Number(item.quantidade) || 0);
    const p = item.prioridade;
    const key = p === "urgente" ? "urgente" : p === "pode_esperar" ? "pode_esperar" : "normal";
    prioridades[key].total += valor;
    if (item.comprado) prioridades[key].pago += valor;
  });

  const catBreakdown = categorias
    .map(cat => {
      const catItens = itens.filter(i => i.categoriaId === cat.id);
      const total = calcTotal(catItens);
      const pago = calcTotal(catItens.filter(i => i.comprado));
      return { ...cat, total, pago, qtd: catItens.length };
    })
    .filter(c => c.qtd > 0)
    .sort((a, b) => b.total - a.total);

  const insight =
    pctComprados >= 100 ? "🏆 Parabéns! Você já comprou tudo que planejou!" :
    pctComprados >= 70  ? "🌟 Excelente! Vocês estão com ótimo controle financeiro!" :
    pctComprados >= 50  ? "📈 Bom progresso! Mais da metade já foi comprada." :
    pctComprados >= 25  ? "⚡ Continue assim! Ainda há bastante pela frente." :
                        "🎯 Vamos lá! Ainda há muito a comprar.";

  return (
    <EstatisticasContainer>
      <HeaderSection>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          <TrendingUp size={14} color="#a78bfa" />
          <Subtitle>Insights Financeiros</Subtitle>
        </div>
        <Title>Análise de Gastos</Title>
      </HeaderSection>

      <DonutCard style={{ animation: `${fadeUp} 0.5s ease-out` }}>
        <DonutChart
          percentage={pctPago}
          label={`${pctComprados}%`}
          sublabel="PAGO"
          color="#a78bfa"
        />
        <LegendRow>
          <LegendItem>
            <LegendDot $color="#a78bfa" />
            Pago: {formatarMoeda(totalPago)}
          </LegendItem>
          <LegendItem>
            <LegendDot $color="#3f3f46" />
            Falta: {formatarMoeda(totalFalta)}
          </LegendItem>
        </LegendRow>
      </DonutCard>

      <StatsGrid>
        <StatCard>
          <StatIcon><ShoppingCart size={16} color="#a78bfa" /></StatIcon>
          <StatLabel>Total</StatLabel>
          <StatValue>{formatarMoeda(totalGeral)}</StatValue>
          <StatSub>{totalItens} itens</StatSub>
        </StatCard>
        <StatCard>
          <StatIcon><CheckCircle size={16} color="#22c55e" /></StatIcon>
          <StatLabel>Comprados</StatLabel>
          <StatValue>{totalComprados}</StatValue>
          <StatSub>de {totalItens} itens</StatSub>
        </StatCard>
      </StatsGrid>

      <ProgressCard style={{ animation: `${fadeUp} 0.7s ease-out` }}>
        <div style={{ marginBottom: 14 }}>
          <ProgressHeader>
            <ProgressLabel>Valor pago</ProgressLabel>
            <ProgressPercent>{pctPago.toFixed(1)}%</ProgressPercent>
          </ProgressHeader>
          <StyledProgressBar percent={pctPago} color="#a78bfa" height={8} />
        </div>
        <div>
          <ProgressHeader>
            <ProgressLabel>Itens comprados</ProgressLabel>
            <ProgressPercent $color="#22c55e">{pctComprados}%</ProgressPercent>
          </ProgressHeader>
          <StyledProgressBar percent={pctComprados} color="#22c55e" height={8} />
        </div>
      </ProgressCard>

      <SectionTitle>💳 Por tipo de pagamento</SectionTitle>
      <PaymentRow>
        <PaymentCard $color="#fbbf24">
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <Coffee size={18} color="#fbbf24" />
            <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: 16, marginLeft: 8 }}>
              {formatarMoeda(totalVR)}
            </span>
          </div>
          <StatLabel style={{ color: "#fbbf24" }}>VR / VA</StatLabel>
          <div style={{ fontSize: 10, color: "#71717a", marginBottom: 8 }}>
            ✅ {formatarMoeda(vrPago)}
          </div>
          <div style={{ fontSize: 10, color: "#eab308", marginBottom: 8 }}>
            ⚠️ {formatarMoeda(totalVR - vrPago)}
          </div>
          <StyledProgressBar percent={totalVR > 0 ? (vrPago / totalVR) * 100 : 0} color="#fbbf24" height={4} />
        </PaymentCard>
        <PaymentCard $color="#a78bfa">
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <DollarSign size={18} color="#a78bfa" />
            <span style={{ color: "#a78bfa", fontWeight: 900, fontSize: 16, marginLeft: 8 }}>
              {formatarMoeda(totalNormal)}
            </span>
          </div>
          <StatLabel style={{ color: "#a78bfa" }}>Normal</StatLabel>
          <div style={{ fontSize: 10, color: "#71717a", marginBottom: 8 }}>
            ✅ {formatarMoeda(normalPago)}
          </div>
          <div style={{ fontSize: 10, color: "#eab308", marginBottom: 8 }}>
            ⚠️ {formatarMoeda(totalNormal - normalPago)}
          </div>
          <StyledProgressBar percent={totalNormal > 0 ? (normalPago / totalNormal) * 100 : 0} color="#a78bfa" height={4} />
        </PaymentCard>
      </PaymentRow>

      {(prioridades.urgente.total > 0 || prioridades.normal.total > 0 || prioridades.pode_esperar.total > 0) && (
        <>
          <SectionTitle>🎯 Por prioridade</SectionTitle>
          {[
            { key: "urgente", label: "🔴 Urgente", color: "#ef4444" },
            { key: "normal", label: "🟡 Normal", color: "#a78bfa" },
            { key: "pode_esperar", label: "🟢 Pode esperar", color: "#22c55e" },
          ]
            .filter(p => prioridades[p.key].total > 0)
            .map(p => {
              const d = prioridades[p.key];
              const pct = d.total > 0 ? (d.pago / d.total) * 100 : 0;
              return (
                <PriorityItem key={p.key}>
                  <PriorityHeader>
                    <PriorityLabel>{p.label}</PriorityLabel>
                    <PriorityValue $color={p.color}>{pct.toFixed(0)}% pago</PriorityValue>
                  </PriorityHeader>
                  <div style={{ color: "#ffffff", fontWeight: 900, fontSize: 18, marginBottom: 6, letterSpacing: -0.3 }}>
                    {formatarMoeda(d.total)}
                  </div>
                  <PriorityTotals>
                    <PrioridadePaid>✅ {formatarMoeda(d.pago)}</PrioridadePaid>
                    <PrioridadePending>⚠️ {formatarMoeda(d.total - d.pago)}</PrioridadePending>
                  </PriorityTotals>
                  <StyledProgressBar percent={pct} color={p.color} height={5} />
                </PriorityItem>
              );
            })}
        </>
      )}

      {catBreakdown.length > 0 && (
        <>
          <SectionTitle>📊 Por categoria</SectionTitle>
          {catBreakdown.map(cat => {
            const pct = cat.total > 0 ? (cat.pago / cat.total) * 100 : 0;
            const pctTotal = totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0;
            return (
              <CategoryCard key={cat.id}>
                <CategoryHeader>
                  <CategoryIcon $color={cat.cor || "#a78bfa"}>
                    {cat.icone || "📦"}
                  </CategoryIcon>
                  <CategoryInfo>
                    <CategoryName>{cat.nome}</CategoryName>
                    <CategoryMeta>
                      {cat.qtd} itens • {pctTotal.toFixed(0)}% do orçamento • {pct.toFixed(0)}% pago
                    </CategoryMeta>
                  </CategoryInfo>
                  <CategoryTotal>{formatarMoeda(cat.total)}</CategoryTotal>
                </CategoryHeader>
                <StyledProgressBar percent={pct} color={cat.cor || "#a78bfa"} height={5} />
                <div style={{ color: "#52525b", fontSize: 9, marginTop: 4 }}>
                  Pago: {formatarMoeda(cat.pago)} de {formatarMoeda(cat.total)}
                </div>
              </CategoryCard>
            );
          })}
        </>
      )}

      <AICard>
        <AISparkle><Sparkles size={22} /></AISparkle>
        <AIContent>
          <AITitle>Análise IA</AITitle>
          <AIInsight>{insight}</AIInsight>
        </AIContent>
      </AICard>

      {itens.length === 0 && (
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <EmptyTitle>Sem dados ainda</EmptyTitle>
          <EmptyText>Adicione itens no Planejamento para ver suas estatísticas.</EmptyText>
        </EmptyState>
      )}
    </EstatisticasContainer>
  );
}