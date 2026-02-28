import styled from 'styled-components';
import { TrendingUp, Coffee, DollarSign, CheckCircle } from 'lucide-react';

export const ResumoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  background: ${props => props.theme.surface};
  border-radius: 1rem;
  padding: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const ResumoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.5rem;

  .icon {
    margin-bottom: 0.5rem;
  }

  .label {
    font-size: 0.8rem;
    color: ${props => props.theme.textSoft};
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.color || props.theme.text};
  }
`;