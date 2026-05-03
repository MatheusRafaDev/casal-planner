import styled from 'styled-components';

// Grid principal - 2 colunas
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

// Card base
export const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 10px;
  padding: 0.7rem;
  border: 1px solid ${({ theme }) => theme.border};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: ${({ $color }) => $color};
    border-radius: 10px 0 0 10px;
  }
`;

// Card de largura total
export const CardFull = styled(Card)`
  grid-column: 1 / -1;
  margin-top: 0;
`;

// Título do card
export const CardTitle = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSoft};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

// Badge
export const Badge = styled.span`
  font-size: 0.55rem;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  margin-left: 0.3rem;
`;

// Valor principal
export const MainValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  margin-bottom: 0.6rem;
  
  span {
    font-size: 0.65rem;
    font-weight: 600;
  }
`;

// Divisor
export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border};
  margin: 0.5rem 0;
`;

// Linha de informação
export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
  font-size: 0.7rem;
`;

// Label da informação
export const InfoLabel = styled.span`
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Valor da informação
export const InfoValue = styled.span`
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

// Ícone pequeno
export const IconSm = styled.svg`
  width: 12px;
  height: 12px;
`;