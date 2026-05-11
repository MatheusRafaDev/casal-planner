import styled, { keyframes, css } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const EstatisticasContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${p => p.theme.background};
  color: ${p => p.theme.text};
  padding: 80px 16px 100px;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

export const HeaderSection = styled.div`
  margin-bottom: 24px;
  animation: ${fadeUp} 0.4s ease-out;
`;

export const Title = styled.h1`
  color: #ffffff;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.8px;
  margin: 0;
`;

export const Subtitle = styled.p`
  color: #a1a1aa;
  font-size: 14px;
  font-weight: 500;
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const DonutCard = styled.div`
  background: #27272a;
  border-radius: 32px;
  padding: 28px;
  border: 1px solid #3f3f46;
  margin-bottom: 20px;
  animation: ${fadeUp} 0.5s ease-out;
`;

export const DonutWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
`;

export const DonutLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

export const DonutSublabel = styled.div`
  color: #a1a1aa;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
`;

export const DonutValue = styled.div`
  color: #ffffff;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -1;
`;

export const LegendRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #a1a1aa;
`;

export const LegendDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: ${p => p.$color || '#a78bfa'};
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
  animation: ${fadeUp} 0.6s ease-out;
`;

export const StatCard = styled.div`
  background: #27272a;
  border-radius: 20px;
  padding: 14px;
  border: 1px solid #3f3f46;
`;

export const StatIcon = styled.div`
  margin-bottom: 8px;
  color: ${p => p.$color || '#a78bfa'};
`;

export const StatLabel = styled.div`
  color: #a1a1aa;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 3px;
`;

export const StatValue = styled.div`
  color: #ffffff;
  font-weight: 900;
  font-size: 15px;
  letter-spacing: -0.3px;
  margin-bottom: 2px;
`;

export const StatSub = styled.div`
  color: #71717a;
  font-size: 10px;
  font-weight: 600;
`;

export const SectionTitle = styled.h2`
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ProgressCard = styled.div`
  background: #27272a;
  border-radius: 24px;
  padding: 18px;
  border: 1px solid #3f3f46;
  margin-bottom: 12px;
  animation: ${fadeUp} 0.7s ease-out;
`;

export const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`;

export const ProgressLabel = styled.span`
  color: #a1a1aa;
  font-size: 12px;
  font-weight: 600;
`;

export const ProgressPercent = styled.span`
  color: ${p => p.$color || '#a78bfa'};
  font-weight: 800;
  font-size: 12px;
`;

export const ProgressBarBg = styled.div`
  height: ${p => p.$height || 8}px;
  background: #3f3f46;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;
`;

export const ProgressBarFill = styled.div`
  height: 100%;
  width: ${p => p.$percent || 0}%;
  background: ${p => p.$color || '#a78bfa'};
  border-radius: 4px;
  transition: width 0.5s ease-out;
`;

export const PaymentCard = styled.div`
  background: #27272a;
  border-radius: 20px;
  padding: 14px;
  border: 1px solid #3f3f46;
  border-left: 3px solid ${p => p.$color || '#a78bfa'};
`;

export const PaymentRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
`;

export const PriorityItem = styled.div`
  background: #27272a;
  border-radius: 20px;
  padding: 14px;
  border: 1px solid #3f3f46;
  margin-bottom: 10px;
`;

export const PriorityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const PriorityLabel = styled.span`
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
`;

export const PriorityValue = styled.span`
  color: ${p => p.$color || '#a78bfa'};
  font-weight: 800;
  font-size: 12px;
`;

export const PriorityTotals = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  font-size: 11px;
`;

export const PrioridadePaid = styled.span`
  color: #71717a;
`;

export const PrioridadePending = styled.span`
  color: #eab308;
`;

export const CategoryCard = styled.div`
  background: #27272a;
  border-radius: 20px;
  padding: 14px;
  border: 1px solid #3f3f46;
  margin-bottom: 10px;
`;

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const CategoryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${p => p.$color || '#a78bfa'}25;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
`;

export const CategoryInfo = styled.div`
  flex: 1;
`;

export const CategoryName = styled.div`
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
`;

export const CategoryMeta = styled.div`
  color: #71717a;
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
`;

export const CategoryTotal = styled.span`
  color: #a78bfa;
  font-weight: 900;
  font-size: 14px;
`;

export const AICard = styled.div`
  background: #a78bfa15;
  border-radius: 24px;
  padding: 20px;
  border: 1px solid #a78bfa30;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  animation: ${fadeUp} 0.8s ease-out;
`;

export const AISparkle = styled.div`
  background: #a78bfa20;
  padding: 14px;
  border-radius: 18px;
  color: #a78bfa;
`;

export const AIContent = styled.div`
  flex: 1;
`;

export const AITitle = styled.div`
  color: #ffffff;
  font-weight: 800;
  font-size: 15px;
  margin-bottom: 6px;
`;

export const AIInsight = styled.div`
  color: #a1a1aa;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
`;

export const EmptyState = styled.div`
  text-align: center;
  margin-top: 40px;
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const EmptyTitle = styled.h3`
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
`;

export const EmptyText = styled.p`
  color: #71717a;
  font-size: 14px;
`;