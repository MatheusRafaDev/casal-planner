import styled from 'styled-components';

export const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
    padding-top: 1.5rem;
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const ResumoCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 18px;
  padding: 1.6rem;
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
  color: ${({ theme }) => theme.text};

  @media (max-width: 640px) {
    min-width: 160px;
    max-width: 160px;
    flex-shrink: 0;
    padding: 1rem;
    border-radius: 14px;
    scroll-snap-align: start;
  }

  @media (max-width: 380px) {
    min-width: 148px;
    max-width: 148px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 18px 18px 0 0;
    background: ${({ $color }) => $color};
    opacity: 0.9;
  }

  &:hover {
    transform: translateY(-6px) scale(1.015);
    box-shadow: ${({ theme }) => theme.shadowHover};
    border-color: ${({ $color }) => `${$color}50`};
  }

  @media (max-width: 640px) {
    &:hover {
      transform: none;
    }
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    margin-bottom: 0.625rem;
  }
`;

export const CardIcon = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: ${({ $color }) => `${$color}18`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  transition: all 0.3s ease;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  ${ResumoCard}:hover & {
    transform: scale(1.1);
    background: ${({ $color }) => `${$color}28`};
  }
`;

export const CardBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${({ $color }) => `${$color}18`};
  color: ${({ $color }) => $color};
  letter-spacing: 0.3px;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const CardContent = styled.div`
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    margin-bottom: 0;
  }
`;

export const CardTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.text};

  @media (max-width: 640px) {
    font-size: 0.7rem;
    font-weight: 500;
    margin-bottom: 0.2rem;
    color: ${({ theme }) => theme.textSoft};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const CardDescription = styled.p`
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.textSoft};

  @media (max-width: 640px) {
    display: none;
  }
`;

export const CardValue = styled.div`
  font-size: 1.9rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  letter-spacing: -0.5px;

  @media (max-width: 640px) {
    font-size: 1.2rem;
    letter-spacing: -0.3px;
  }

  @media (max-width: 380px) {
    font-size: 1.05rem;
  }
`;

export const CardFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border};
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const TrendIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  width: fit-content;

  background: ${({ theme, $trend, $stable }) => {
    if ($stable) return theme.border;
    return $trend === 'up' ? `${theme.success}25` : `${theme.error}25`;
  }};

  color: ${({ theme, $trend, $stable }) => {
    if ($stable) return theme.textSoft;
    return $trend === 'up' ? theme.success : theme.error;
  }};
`;

export const CompareText = styled.span`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.textSoft};
`;

/* ── Filtro pago / não pago ── */
export const FiltroBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

export const FiltroButton = styled.button`
  padding: 0.35rem 0.9rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid
    ${({ $active, $color }) => ($active ? $color : 'transparent')};
  background: ${({ $active, $color }) =>
    $active ? `${$color}18` : 'transparent'};
  color: ${({ $active, $color, theme }) =>
    $active ? $color : theme?.textSoft || '#888'};

  /* outline via border para não quebrar layout */
  outline: none;

  &:hover {
    background: ${({ $color }) => `${$color}12`};
    color: ${({ $color }) => $color};
    border-color: ${({ $color }) => `${$color}60`};
  }
`;

/* ── Bolinhas de paginação — só mobile ── */
export const ScrollDots = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
`;

export const ScrollDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme, $active }) =>
    $active ? theme?.primary || '#27ae60' : theme?.border || '#444'};
  transition: all 0.25s ease;
  transform: ${({ $active }) => ($active ? 'scale(1.4)' : 'scale(1)')};
`;