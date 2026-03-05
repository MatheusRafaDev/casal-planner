import styled from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.3rem;
  color: ${(props) => props.theme.textSoft};
  font-weight: 500;
  font-size: 0.9rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  transition: 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${(props) => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

export const CancelarButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${(props) => props.theme.border};
  color: ${(props) => props.theme.text};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${(props) => props.theme.textLight};
  }
`;

export const SalvarButton = styled(CancelarButton)`
  background: ${(props) => props.theme.primary};
  color:  ${({ theme }) => theme.text};

  &:hover {
    background: ${(props) => props.theme.primary}cc;
  }
`;