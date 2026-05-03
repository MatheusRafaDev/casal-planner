import styled from 'styled-components';

/* ─────────────────────────────────────────────
   Grid principal
───────────────────────────────────────────── */
export const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 640px) {
    display: flex;
    flex-direction: row;
    gap: 0.6rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
    padding-top: 0.25rem;
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

/* ─────────────────────────────────────────────
   Card base
───────────────────────────────────────────── */
export const ResumoCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 14px;
  padding: 1rem 1.1rem;
  border: 1px solid ${({ theme }) => theme.border};
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  color: ${({ theme }) => theme.text};

  /* destaque lateral esquerdo */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    border-radius: 14px 0 0 14px;
    background: ${({ $color }) => $color};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadowHover};
    border-color: ${({ $color }) => `${$color}40`};
  }

  /* ── Card de destaque (falta pagar) ── */
  &[data-destaque='true'] {
    background: ${({ $color }) => `${$color}10`};
    border-color: ${({ $color }) => `${$color}35`};

    &::before {
      width: 4px;
    }
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    min-width: 148px;
    max-width: 148px;
    flex-shrink: 0;
    padding: 0.85rem 0.9rem;
    border-radius: 14px;
    scroll-snap-align: start;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  @media (max-width: 380px) {
    min-width: 136px;
    max-width: 136px;
  }
`;

/* ─────────────────────────────────────────────
   Header do card
───────────────────────────────────────────── */
export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
`;

export const CardIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: ${({ $color }) => `${$color}18`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  flex-shrink: 0;

  ${ResumoCard}:hover & {
    transform: scale(1.05);
    background: ${({ $color }) => `${$color}28`};
  }

  @media (max-width: 640px) {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
`;

export const CardBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
  background: ${({ $color }) => `${$color}18`};
  color: ${({ $color }) => $color};
  letter-spacing: 0.2px;
  white-space: nowrap;

  @media (max-width: 640px) {
    display: none;
  }
`;

/* ─────────────────────────────────────────────
   Conteúdo
───────────────────────────────────────────── */
export const CardContent = styled.div``;

export const CardTitle = styled.h4`
  font-size: 0.72rem;
  font-weight: 500;
  margin-bottom: 0.15rem;
  color: ${({ theme }) => theme.textSoft};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.1px;
`;

export const CardDescription = styled.p`
  font-size: 0.68rem;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const CardValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  letter-spacing: -0.5px;
  line-height: 1.1;

  span {
    font-size: 0.75em;
    font-weight: 600;
  }

  /* destaque = valor maior */
  ${ResumoCard}[data-destaque='true'] & {
    font-size: 1.65rem;
  }

  @media (max-width: 640px) {
    font-size: 1.15rem;

    ${ResumoCard}[data-destaque='true'] & {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 380px) {
    font-size: 1rem;

    ${ResumoCard}[data-destaque='true'] & {
      font-size: 1.1rem;
    }
  }
`;

/* ─────────────────────────────────────────────
   Sub-linha: breakdown pago vs restante
───────────────────────────────────────────── */
export const CardFooter = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.45rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  gap: 0.6rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const FooterStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
`;

export const FooterLabel = styled.span`
  font-size: 0.6rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  opacity: 0.7;
`;

export const FooterValue = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

/* ─────────────────────────────────────────────
   Bolinhas de scroll — só mobile
───────────────────────────────────────────── */
export const ScrollDots = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 0.2rem;
    margin-bottom: 0.5rem;
  }
`;

export const ScrollDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ theme, $active }) =>
    $active ? theme?.primary || '#27ae60' : theme?.border || '#444'};
  transition: all 0.2s ease;
  transform: ${({ $active }) => ($active ? 'scale(1.5)' : 'scale(1)')};
`;

/* ─────────────────────────────────────────────
   Filtro pago / não pago
───────────────────────────────────────────── */
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
  outline: none;

  &:hover {
    background: ${({ $color }) => `${$color}12`};
    color: ${({ $color }) => $color};
    border-color: ${({ $color }) => `${$color}60`};
  }
`;

/* ─────────────────────────────────────────────
   Componentes auxiliares
───────────────────────────────────────────── */
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