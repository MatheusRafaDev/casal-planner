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
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
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
  color:  ${({ theme }) => theme.text};

  @media (max-width: 640px) {
    padding: 1rem;
    border-radius: 14px;
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

    /* Glow suave no dark */
    ${({ theme, $color }) =>
      theme.background === '#18181B' &&
      `box-shadow: 0 10px 25px ${$color}20;`}
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  
  align-items: center;
  margin-bottom: 1rem;
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
`;

export const CardContent = styled.div`
  margin-bottom: 1rem;
`;

export const CardTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
    color:  ${({ theme }) => theme.text};
`;


export const CardDescription = styled.p`
  font-size: 0.75rem;
  margin-bottom: 0.75rem;

  color: ${({ theme }) =>
    theme.background === '#18181B'
      ? '#D4D4D8'
      : theme.textSoft};
`;

export const CardValue = styled.div`
  font-size: 1.9rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  letter-spacing: -0.5px;

  @media (max-width: 640px) {
    font-size: 1.35rem;
  }
`;

export const CardFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border};
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
    return $trend === 'up'
      ? `${theme.success}25`
      : `${theme.error}25`;
  }};

  color: ${({ theme, $trend, $stable }) => {
    if ($stable)
      return theme.background === '#18181B'
        ? '#E4E4E7'
        : theme.textLight;

    return $trend === 'up'
      ? theme.success
      : theme.error;
  }};
`;

export const CompareText = styled.span`
  font-size: 0.72rem;

  color: ${({ theme }) =>
    theme.background === '#18181B'
      ? '#A1A1AA'
      : theme.textSoft};
`;
