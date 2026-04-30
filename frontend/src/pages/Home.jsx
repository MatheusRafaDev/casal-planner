import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Heart, ArrowRight, ShoppingCart, Users, BarChart3, CheckCircle,
  Star, Shield, Zap, Target, Gift, TrendingUp, Clock, Sparkles,
  ChevronDown, Quote, Smartphone, Globe, Lock
} from 'lucide-react';
import styled, { keyframes, css } from 'styled-components';
// ─── Animações ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-12px) rotate(2deg); }
  66%       { transform: translateY(-6px) rotate(-1deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.05); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.15); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.1); }
  70%       { transform: scale(1); }
`;

// ─── Utilitário de animate-on-scroll ──────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Styled Components ────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${p => p.theme.background};
  color: ${p => p.theme.text};
  overflow-x: hidden;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

// HERO
const HeroWrapper = styled.section`
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 7rem 1.5rem 5rem;
  text-align: center;
  overflow: hidden;
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 700px; height: 700px;
    background: radial-gradient(circle, ${p => p.theme.primary}22 0%, transparent 70%);
    top: -200px; left: -200px;
    border-radius: 50%;
    animation: ${pulse} 8s ease-in-out infinite;
  }
  &::after {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, ${p => p.theme.primary}15 0%, transparent 70%);
    bottom: -100px; right: -100px;
    border-radius: 50%;
    animation: ${pulse} 10s ease-in-out infinite reverse;
  }
`;

const FloatingOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  background: ${p => p.theme.primary}${p => p.$opacity || '18'};
  width: ${p => p.$size || '80px'};
  height: ${p => p.$size || '80px'};
  top: ${p => p.$top || 'auto'};
  left: ${p => p.$left || 'auto'};
  right: ${p => p.$right || 'auto'};
  bottom: ${p => p.$bottom || 'auto'};
  animation: ${float} ${p => p.$duration || '6s'} ease-in-out infinite;
  animation-delay: ${p => p.$delay || '0s'};
  filter: blur(1px);
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 2;
  max-width: 780px;
  animation: ${fadeUp} 0.8s ease both;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${p => p.theme.primary}18;
  border: 1px solid ${p => p.theme.primary}30;
  color: ${p => p.theme.primary};
  padding: 0.4rem 1.1rem;
  border-radius: 2rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 1.75rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: ${p => p.theme.text};
  letter-spacing: -0.02em;

  em {
    font-style: normal;
    background: linear-gradient(135deg, ${p => p.theme.primary}, #ff6eb4, ${p => p.theme.primary});
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const HeroSub = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: ${p => p.theme.textSoft};
  max-width: 560px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
`;

const HeroCTA = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const BtnPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.95rem 2rem;
  background: ${p => p.theme.primary};
  color: #fff;
  border: none;
  border-radius: 0.875rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
  box-shadow: 0 4px 20px ${p => p.theme.primary}40;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px ${p => p.theme.primary}55;
    filter: brightness(1.07);
  }
  &:active { transform: translateY(-1px); }
`;

const BtnSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.95rem 2rem;
  background: transparent;
  color: ${p => p.theme.text};
  border: 2px solid ${p => p.theme.border};
  border-radius: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s ease;

  &:hover {
    border-color: ${p => p.theme.primary}60;
    background: ${p => p.theme.primary}0a;
    transform: translateY(-2px);
  }
`;

const HeroStats = styled.div`
  display: flex;
  gap: 2.5rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const StatPill = styled.div`
  text-align: center;

  strong {
    display: block;
    font-size: 1.75rem;
    font-weight: 800;
    color: ${p => p.theme.primary};
    line-height: 1;
  }
  span {
    font-size: 0.8125rem;
    color: ${p => p.theme.textSoft};
    font-weight: 500;
  }
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: ${p => p.theme.textSoft};
  font-size: 0.75rem;
  animation: ${fadeUp} 1.2s 1s ease both;

  svg { animation: ${float} 2s ease-in-out infinite; }
`;

// SECTION WRAPPER
const Section = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
`;

const SectionLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${p => p.theme.primary}14;
  color: ${p => p.theme.primary};
  border: 1px solid ${p => p.theme.primary}25;
  padding: 0.3rem 0.9rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${p => p.theme.text};
  margin-bottom: 1rem;
  line-height: 1.15;

  em {
    font-style: normal;
    color: ${p => p.theme.primary};
  }
`;

const SectionDesc = styled.p`
  font-size: 1.0625rem;
  color: ${p => p.theme.textSoft};
  line-height: 1.7;
  max-width: 520px;
  margin-bottom: 3rem;
`;

const AnimatedBlock = styled.div`
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: ${p => p.$delay || '0s'};

  ${p => p.$visible && css`
    opacity: 1;
    transform: translateY(0);
  `}
`;

// FEATURES GRID
const FeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
`;

const FeatCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.75rem;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${p => p.$color || p.theme.primary}, ${p => p.$color || p.theme.primary}80);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    border-color: ${p => p.theme.primary}30;

    &::before { transform: scaleX(1); }
  }
`;

const FeatIcon = styled.div`
  width: 48px; height: 48px;
  border-radius: 0.875rem;
  background: ${p => p.$bg || p.theme.primary}18;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: ${p => p.$color || p.theme.primary};
`;

const FeatTitle = styled.h3`
  font-size: 1.0625rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 0.5rem;
`;

const FeatDesc = styled.p`
  font-size: 0.875rem;
  color: ${p => p.theme.textSoft};
  line-height: 1.6;
`;

// HOW IT WORKS
const StepsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 24px; left: 10%; right: 10%;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${p => p.theme.primary}40, transparent);
    @media (max-width: 640px) { display: none; }
  }
`;

const StepCard = styled.div`
  text-align: center;
  padding: 1.5rem 1rem;
`;

const StepNum = styled.div`
  width: 48px; height: 48px;
  border-radius: 50%;
  background: ${p => p.theme.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 800;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 16px ${p => p.theme.primary}40;
`;

const StepTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: ${p => p.theme.text};
  margin-bottom: 0.5rem;
`;

const StepDesc = styled.p`
  font-size: 0.85rem;
  color: ${p => p.theme.textSoft};
  line-height: 1.6;
`;

// TESTIMONIALS
const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const TestCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.75rem;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
`;

const QuoteIcon = styled.div`
  color: ${p => p.theme.primary}50;
  margin-bottom: 1rem;
`;

const TestText = styled.p`
  font-size: 0.9375rem;
  color: ${p => p.theme.textSoft};
  line-height: 1.7;
  margin-bottom: 1.25rem;
  font-style: italic;
`;

const TestAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TestAvatar = styled.div`
  width: 40px; height: 40px;
  border-radius: 50%;
  background: ${p => p.$bg || p.theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const TestName = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  color: ${p => p.theme.text};
`;

const TestRole = styled.div`
  font-size: 0.78rem;
  color: ${p => p.theme.textSoft};
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 1rem;
  color: #f59e0b;
`;

// CTA SECTION
const CTASection = styled.section`
  padding: 5rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const CTABg = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, ${p => p.theme.primary}12, ${p => p.theme.primary}06, transparent);
  border-top: 1px solid ${p => p.theme.primary}20;
  border-bottom: 1px solid ${p => p.theme.primary}20;
`;

const CTAInner = styled.div`
  position: relative;
  z-index: 2;
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: ${p => p.theme.text};
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
`;

const CTADesc = styled.p`
  font-size: 1.0625rem;
  color: ${p => p.theme.textSoft};
  margin-bottom: 2rem;
  line-height: 1.7;
`;

const HeartAnim = styled.span`
  display: inline-block;
  animation: ${heartbeat} 2s ease-in-out infinite;
`;

// TRUSTBAR
const TrustBar = styled.div`
  background: ${p => p.theme.surface};
  border-top: 1px solid ${p => p.theme.border};
  border-bottom: 1px solid ${p => p.theme.border};
  padding: 1.25rem 1.5rem;
`;

const TrustInner = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${p => p.theme.textSoft};

  svg { color: ${p => p.theme.primary}; }
`;

// ─── Dados ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: ShoppingCart, title: 'Lista de Compras Inteligente', desc: 'Adicione itens com preço, marca, loja e link. Ordene por prioridade, nome ou valor.', color: '#e91e8c' },
  { icon: Users, title: 'Conta Compartilhada a Dois', desc: 'Ambos veem e editam em tempo real. Sem conflitos, sem duplicatas.', color: '#7c3aed' },
  { icon: BarChart3, title: 'Controle por VR/VA e Cartão', desc: 'Separe automaticamente gastos em vale-refeição/alimentação e pagamento normal.', color: '#2563eb' },
  { icon: Target, title: 'Metas por Categoria', desc: 'Defina orçamento por categoria e acompanhe quando está próximo do limite.', color: '#16a34a' },
  { icon: CheckCircle, title: 'Progresso de Compras', desc: 'Marque itens comprados e veja o progresso visual com barra de andamento.', color: '#f59e0b' },
  { icon: Zap, title: 'Prioridade de Itens', desc: 'Classifique como urgente, normal ou pode esperar. Nunca esqueça o essencial.', color: '#ef4444' },
  { icon: TrendingUp, title: 'Resumo Financeiro', desc: 'Painel com total geral, gastos por forma de pagamento e comparativo mensal.', color: '#06b6d4' },
  { icon: Gift, title: 'Links de Produto', desc: 'Salve o link da loja online diretamente no item para comparar preços facilmente.', color: '#8b5cf6' },
];

const STEPS = [
  { n: '1', title: 'Crie sua conta', desc: 'Cadastre-se individualmente ou como casal em menos de 1 minuto.' },
  { n: '2', title: 'Monte as categorias', desc: 'Crie categorias como Mercado, Eletrodomésticos, Higiene e muito mais.' },
  { n: '3', title: 'Adicione os itens', desc: 'Inclua preço, marca, loja, prioridade e link de produto para cada item.' },
  { n: '4', title: 'Compre e marque', desc: 'Na hora das compras, marque os itens conforme vai colocando no carrinho.' },
];

const TESTIMONIALS = [
  { text: 'Finalmente conseguimos organizar as compras de casa sem brigar sobre o que comprar primeiro. O CasalPlanner mudou nossa rotina!', name: 'Ana & Pedro', role: 'Casal, 2 anos', avatar: 'AP', bg: '#e91e8c' },
  { text: 'A separação por VR e cartão normal é incrível. Agora sei exatamente quanto gasto de cada forma de pagamento todo mês.', name: 'Juliana Costa', role: 'Usuária individual', avatar: 'JC', bg: '#7c3aed' },
  { text: 'Conseguimos economizar muito ao perceber o quanto estávamos gastando por categoria. As metas de orçamento são perfeitas!', name: 'Rafael & Camila', role: 'Casal, 6 meses', avatar: 'RC', bg: '#2563eb' },
];

// ─── Componente Principal ─────────────────────────────────────────────────────

const Home = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [featRef, featVisible] = useInView();
  const [stepsRef, stepsVisible] = useInView();
  const [testRef, testVisible] = useInView();
  const [ctaRef, ctaVisible] = useInView();

  const go = (modo) => navigate('/login', { state: { modo } });

  return (
    <Page theme={theme}>
      <Header />

      {/* ── HERO ── */}
      <HeroWrapper>
        <HeroBg theme={theme} />
        <FloatingOrb theme={theme} $size="120px" $top="15%" $left="5%" $duration="7s" $delay="0s" $opacity="10" />
        <FloatingOrb theme={theme} $size="80px"  $top="30%" $right="8%" $duration="9s" $delay="2s" $opacity="12" />
        <FloatingOrb theme={theme} $size="60px"  $bottom="20%" $left="12%" $duration="8s" $delay="1s" $opacity="08" />
        <FloatingOrb theme={theme} $size="100px" $bottom="15%" $right="5%" $duration="11s" $delay="3s" $opacity="10" />

        <HeroInner>
          <HeroBadge theme={theme}>
            <Heart size={14} fill="currentColor" />
            Para casais que planejam juntos
          </HeroBadge>

          <HeroTitle theme={theme}>
            Organize a casa<br />
            <em>a dois, com amor</em>
          </HeroTitle>

          <HeroSub theme={theme}>
            Listas de compras compartilhadas, controle de gastos por categoria,
            metas de orçamento e acompanhamento financeiro — tudo em um só lugar.
          </HeroSub>

          <HeroCTA>
            <BtnPrimary theme={theme} onClick={() => go('registro')}>
              Começar grátis <ArrowRight size={18} />
            </BtnPrimary>
            <BtnSecondary theme={theme} onClick={() => go('login')}>
              Já tenho conta
            </BtnSecondary>
          </HeroCTA>

        </HeroInner>

        <ScrollHint theme={theme}>
          <span>Rolar para ver mais</span>
          <ChevronDown size={18} />
        </ScrollHint>
      </HeroWrapper>

      {/* ── TRUST BAR ── */}
      <TrustBar theme={theme}>
        <TrustInner>
          {[
            { icon: Shield, text: 'Dados seguros e privados' },
            { icon: Smartphone, text: 'Funciona no celular' },
            { icon: Globe, text: 'Acesso de qualquer lugar' },
            { icon: Lock, text: 'Conta exclusiva do casal' },
            { icon: Zap, text: 'Atualizações em tempo real' },
          ].map(({ icon: Icon, text }) => (
            <TrustItem key={text} theme={theme}>
              <Icon size={15} />
              {text}
            </TrustItem>
          ))}
        </TrustInner>
      </TrustBar>

      {/* ── FEATURES ── */}
      <Section ref={featRef}>
        <AnimatedBlock $visible={featVisible}>
          <SectionLabel theme={theme}><Sparkles size={13} /> Funcionalidades</SectionLabel>
          <SectionTitle theme={theme}>Tudo que vocês <em>precisam</em></SectionTitle>
          <SectionDesc theme={theme}>
            Do mercado semanal ao planejamento de grandes compras, o CasalPlanner cobre tudo.
          </SectionDesc>
        </AnimatedBlock>
        <FeatGrid>
          {FEATURES.map((f, i) => (
            <AnimatedBlock key={f.title} $visible={featVisible} $delay={`${0.1 + i * 0.07}s`}>
              <FeatCard theme={theme} $color={f.color}>
                <FeatIcon theme={theme} $color={f.color} $bg={f.color}>
                  <f.icon size={22} />
                </FeatIcon>
                <FeatTitle theme={theme}>{f.title}</FeatTitle>
                <FeatDesc theme={theme}>{f.desc}</FeatDesc>
              </FeatCard>
            </AnimatedBlock>
          ))}
        </FeatGrid>
      </Section>

      {/* ── COMO FUNCIONA ── */}
      <Section ref={stepsRef} style={{ paddingTop: '2rem' }}>
        <AnimatedBlock $visible={stepsVisible}>
          <SectionLabel theme={theme}><Clock size={13} /> Como funciona</SectionLabel>
          <SectionTitle theme={theme}>Comece em <em>4 passos</em></SectionTitle>
          <SectionDesc theme={theme}>
            Simples, rápido e sem complicação. Em minutos vocês já estão planejando juntos.
          </SectionDesc>
        </AnimatedBlock>
        <StepsRow theme={theme}>
          {STEPS.map((s, i) => (
            <AnimatedBlock key={s.n} $visible={stepsVisible} $delay={`${i * 0.12}s`}>
              <StepCard>
                <StepNum theme={theme}>{s.n}</StepNum>
                <StepTitle theme={theme}>{s.title}</StepTitle>
                <StepDesc theme={theme}>{s.desc}</StepDesc>
              </StepCard>
            </AnimatedBlock>
          ))}
        </StepsRow>
      </Section>


      <Footer theme={theme} />
    </Page>
  );
};

export default Home;
