import styled from 'styled-components';

export const InicioContainer = styled.div`
  .cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: ${(props) => props.theme.textSoft};
  }
`;

export const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  padding: 2rem;
  background: ${(props) => props.theme.gradientSoft};
  border-radius: 24px;
  color: ${(props) => props.theme.text};

  h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${(props) => props.theme.textSoft};
    font-size: 1rem;
  }
`;