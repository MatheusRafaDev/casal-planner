import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { categoriasService } from '../services/categoriasService';
import { itensService } from '../services/itensService';
import { formatarMoeda } from '../utils/formatters';
import {
  ShoppingCart, TrendingUp, CheckCircle, CreditCard,
  ArrowRight, Heart, Sparkles, ClipboardList
} from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.06); }
`;
const shimmer = keyframes`
  0%, 100% { opacity: 0.45; }
  50%       { opacity: 0.9; }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 0 4rem;
  animation: ${fadeUp} 0.4s ease both;
`;

const WelcomeCard = styled.div`
  background: ${p => p.theme.gradient};
  border-radius: 1.5rem;
  padding: 2.25rem 2rem;
  margin-bottom: 1.75rem;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
    top: -60px; right: -60px;
  }
  &::after {
    content: '';
    position: absolute;
    width: 120px; height: 120px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
    bottom: -30px; left: 40px;
  }
`;
const WelcomeTitle = styled.h1`
  font-size: 1.7rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.4rem;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const WelcomeSub = styled.p`
  font-size: 0.95rem;
  color: rgba(255,255,255,0.82);
  margin: 0 0 1.5rem;
`;
const WelcomeBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  background: rgba(255,255,255,0.18);
  color: #fff;
  border: 1.5px solid rgba(255,255,255,0.35);
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  &:hover { background: rgba(255,255,255,0.28); transform: translateY(-2px); }
`;

const SectionTitle = styled.h2`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${p => p.theme.textSoft};
  text-transform: uppercase;
  letter-spacing: 0.09em;
  margin: 0 0 0.85rem;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const StatCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: ${p => p.theme.shadowHover || '0 8px 24px rgba(0,0,0,0.15)'}; transform: translateY(-2px); }
`;
const StatIcon = styled.div`
  width: 36px; height: 36px;
  border-radius: 0.75rem;
  background: ${p => p.bg};
  display: flex; align-items: center; justify-content: center;
  color: ${p => p.color};
  margin-bottom: 0.3rem;
`;
const StatLabel = styled.span`
  font-size: 0.72rem; font-weight: 700;
  color: ${p => p.theme.textLight};
  text-transform: uppercase; letter-spacing: 0.06em;
`;
const StatValue = styled.span`
  font-size: 1.35rem; font-weight: 800;
  color: ${p => p.theme.text}; letter-spacing: -0.03em;
`;
const StatSub = styled.span`
  font-size: 0.76rem; color: ${p => p.theme.textLight};
`;

/* Categorias */
const CatGrid = styled.div`
  display: flex; flex-direction: column; gap: 0.6rem;
  margin-bottom: 1.75rem;
`;
const CatRow = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1rem;
  padding: 0.85rem 1rem;
  display: flex; align-items: center; gap: 0.85rem;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: ${p => p.theme.shadowCard}; transform: translateX(3px); }
`;
const CatEmoji = styled.div`
  width: 38px; height: 38px;
  border-radius: 0.75rem;
  background: ${p => p.bg || p.theme.border};
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
`;
const CatInfo = styled.div`
  flex: 1; min-width: 0;
  h3 {
    font-size: 0.87rem; font-weight: 700;
    color: ${p => p.theme.text};
    margin: 0 0 0.15rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  div { display: flex; gap: 0.6rem; flex-wrap: wrap; }
`;
const CatChip = styled.span`
  font-size: 0.7rem; color: ${p => p.theme.textLight};
`;
const CatTotal = styled.span`
  font-size: 0.92rem; font-weight: 800;
  color: ${p => p.theme.primary}; white-space: nowrap;
`;
const CatBar = styled.div`
  width: 100%; height: 3px;
  background: ${p => p.theme.border};
  border-radius: 999px; margin-top: 0.45rem; overflow: hidden;
`;
const CatBarFill = styled.div`
  height: 100%; width: ${p => p.pct}%;
  background: ${p => p.theme.gradient};
  border-radius: 999px; transition: width 0.5s ease;
`;

/* Progresso */
const InfoCard = styled.div`
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  padding: 1.25rem;
  margin-bottom: 1.75rem;
`;
const InfoRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${p => p.theme.border};
  &:last-child { border-bottom: none; }
`;
const InfoLabel = styled.span`font-size: 0.84rem; color: ${p => p.theme.textSoft};`;
const InfoValue = styled.span`font-size: 0.87rem; font-weight: 700; color: ${p => p.color || p.theme.text};`;
const ProgressBar = styled.div`
  width: 100%; height: 7px;
  background: ${p => p.theme.border};
  border-radius: 999px; margin-top: 0.75rem; overflow: hidden;
`;
const ProgressFill = styled.div`
  height: 100%; width: ${p => Math.min(p.pct, 100)}%;
  background: ${p => p.theme.gradient};
  border-radius: 999px; transition: width 0.6s ease;
`;
const ProgressLabel = styled.div`
  display: flex; justify-content: space-between;
  margin-top: 0.4rem; font-size: 0.74rem; color: ${p => p.theme.textLight};
`;

/* Ações */
const QuickActions = styled.div`display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.75rem;`;
const ActionCard = styled.button`
  display: flex; align-items: center; gap: 0.9rem;
  padding: 1rem 1.1rem;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.border};
  border-radius: 1.25rem;
  cursor: pointer; text-align: left; width: 100%;
  transition: all 0.2s;
  &:hover { border-color: ${p => p.theme.primary}60; box-shadow: 0 4px 16px ${p => p.theme.primary}15; transform: translateX(4px); }
`;
const ActionIcon = styled.div`
  width: 42px; height: 42px; border-radius: 0.9rem;
  background: ${p => p.bg}; display: flex; align-items: center; justify-content: center;
  color: ${p => p.color}; flex-shrink: 0;
`;
const ActionText = styled.div`
  flex: 1;
  h3 { font-size: 0.91rem; font-weight: 700; color: ${p => p.theme.text}; margin: 0 0 0.1rem; }
  p { font-size: 0.77rem; color: ${p => p.theme.textLight}; margin: 0; }
`;

const SkeletonLine = styled.div`
  height: ${p => p.h || '0.85rem'};
  width: ${p => p.w || '100%'};
  border-radius: 0.5rem;
  background: ${p => p.theme.border};
  animation: ${shimmer} 1.4s ease infinite;
`;

const HeartAnim = styled.span`
  display: inline-flex;
  animation: ${pulse} 1.8s ease-in-out infinite;
  color: #F9A8D4;
`;

/* ── Componente ─────────────────────────────────────────────────────────────── */
const Inicio = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { theme } = useTheme();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens]           = useState([]);
  const [loading, setLoading]       = useState(true);

  const isCasal      = usuario?.isCasal || usuario?.tipoConta === 1;
  const pessoaLogada = usuario?.pessoaQueLogou;

  const getNome = () => {
    if (!usuario) return 'Usuário';
    if (isCasal) {
      const info = usuario.casalInfo || {};
      return pessoaLogada === 'pessoa1'
        ? (info.nomeCompletoPessoa1 || 'Usuário').split(' ')[0]
        : (info.nomeCompletoPessoa2 || 'Usuário').split(' ')[0];
    }
    return (usuario.nomeCompleto || 'Usuário').split(' ')[0];
  };

  const getHora = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        const [cats, its] = await Promise.all([
          categoriasService.listarDoUsuario(),
          itensService.getAll(),
        ]);
        setCategorias(cats || []);
        setItens(its || []);
      } catch {
        setCategorias([]);
        setItens([]);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  /* Totais gerais */
  const totalGeral     = itens.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalVR        = itens.filter(i => i.pagamento === 'vr').reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalNormal    = itens.filter(i => i.pagamento === 'normal').reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalComprados = itens.filter(i => i.comprado).length;
  const totalItens     = itens.length;
  const pctComprados   = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;

  /* Total por categoria */
  const porCategoria = categorias
    .map(cat => {
      const id    = cat.id || cat._id;
      const itscat = itens.filter(i => i.categoriaId === id);
      return {
        ...cat,
        id,
        total:    itscat.reduce((acc, i) => acc + (i.preco * i.quantidade), 0),
        qtd:      itscat.length,
        comprados: itscat.filter(i => i.comprado).length,
      };
    })
    .filter(c => c.qtd > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <Container>
      {/* Boas-vindas */}
      <WelcomeCard theme={theme}>
        <WelcomeTitle>
          {getHora()}, {getNome()}! <HeartAnim><Heart size={20} fill="currentColor" /></HeartAnim>
        </WelcomeTitle>
        <WelcomeSub>
          {isCasal ? 'Planejando o lar juntos, passo a passo 🏠' : 'Seu organizador pessoal de compras domésticas 🛒'}
        </WelcomeSub>
        <WelcomeBtn onClick={() => navigate('/planejamento')}>
          <ClipboardList size={16} /> Ver planejamento <ArrowRight size={15} />
        </WelcomeBtn>
      </WelcomeCard>

      {/* Resumo financeiro */}
      <SectionTitle theme={theme}>Resumo do mês</SectionTitle>
      <CardsGrid>
        <StatCard theme={theme}>
          <StatIcon bg={theme.primary + '20'} color={theme.primary}><ShoppingCart size={17} /></StatIcon>
          <StatLabel theme={theme}>Total geral</StatLabel>
          <StatValue theme={theme}>{loading ? '—' : formatarMoeda(totalGeral)}</StatValue>
          <StatSub theme={theme}>{loading ? '—' : `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`}</StatSub>
        </StatCard>

        <StatCard theme={theme}>
          <StatIcon bg={theme.success + '20'} color={theme.success}><CheckCircle size={17} /></StatIcon>
          <StatLabel theme={theme}>Comprados</StatLabel>
          <StatValue theme={theme}>{loading ? '—' : totalComprados}</StatValue>
          <StatSub theme={theme}>{loading ? '—' : `${pctComprados}% concluído`}</StatSub>
        </StatCard>

        <StatCard theme={theme}>
          <StatIcon bg={theme.vrva + '20'} color={theme.vrva}><CreditCard size={17} /></StatIcon>
          <StatLabel theme={theme}>VR / VA</StatLabel>
          <StatValue theme={theme}>{loading ? '—' : formatarMoeda(totalVR)}</StatValue>
          <StatSub theme={theme}>vale alimentação/refeição</StatSub>
        </StatCard>

        <StatCard theme={theme}>
          <StatIcon bg={theme.secondary + '20'} color={theme.secondaryDark || theme.secondary}><TrendingUp size={17} /></StatIcon>
          <StatLabel theme={theme}>Pagamento normal</StatLabel>
          <StatValue theme={theme}>{loading ? '—' : formatarMoeda(totalNormal)}</StatValue>
          <StatSub theme={theme}>dinheiro / cartão</StatSub>
        </StatCard>
      </CardsGrid>

      {/* Progresso */}
      {!loading && totalItens > 0 && (
        <InfoCard theme={theme}>
          <SectionTitle theme={theme} style={{ marginBottom: '0.4rem' }}>Progresso de compras</SectionTitle>
          <InfoRow theme={theme}>
            <InfoLabel theme={theme}>Itens adquiridos</InfoLabel>
            <InfoValue theme={theme} color={theme.success}>{totalComprados} de {totalItens}</InfoValue>
          </InfoRow>
          <InfoRow theme={theme}>
            <InfoLabel theme={theme}>Valor total planejado</InfoLabel>
            <InfoValue theme={theme}>{formatarMoeda(totalGeral)}</InfoValue>
          </InfoRow>
          <ProgressBar theme={theme}>
            <ProgressFill pct={pctComprados} theme={theme} />
          </ProgressBar>
          <ProgressLabel theme={theme}>
            <span>{pctComprados}% concluído</span>
            <span>{100 - pctComprados}% restante</span>
          </ProgressLabel>
        </InfoCard>
      )}

      {/* Total por categoria */}
      <SectionTitle theme={theme}>Total por categoria</SectionTitle>

      {loading ? (
        <CatGrid>
          {[1,2,3].map(n => (
            <CatRow key={n} theme={theme}>
              <CatEmoji theme={theme} bg={theme.border}>&nbsp;</CatEmoji>
              <CatInfo theme={theme}>
                <SkeletonLine theme={theme} w="55%" h="0.8rem" />
                <div style={{ marginTop: '0.35rem' }}>
                  <SkeletonLine theme={theme} w="38%" h="0.62rem" />
                </div>
              </CatInfo>
              <SkeletonLine theme={theme} w="4.5rem" h="0.9rem" />
            </CatRow>
          ))}
        </CatGrid>
      ) : porCategoria.length === 0 ? (
        <InfoCard theme={theme} style={{ textAlign: 'center', color: theme.textLight, fontSize: '0.88rem' }}>
          Nenhum item adicionado ainda. Vá em <strong style={{ color: theme.primary }}>Planejamento</strong> para começar!
        </InfoCard>
      ) : (
        <CatGrid>
          {porCategoria.map(cat => {
            const pct = totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0;
            return (
              <CatRow key={cat.id} theme={theme}>
                <CatEmoji bg={cat.cor || cat.corFundo || theme.primary + '25'} theme={theme}>
                  {cat.icone || cat.emoji || '📦'}
                </CatEmoji>
                <CatInfo theme={theme}>
                  <h3>{cat.nome}</h3>
                  <div>
                    <CatChip theme={theme}>{cat.qtd} {cat.qtd === 1 ? 'item' : 'itens'}</CatChip>
                    <CatChip theme={theme}>✓ {cat.comprados} comprado{cat.comprados !== 1 ? 's' : ''}</CatChip>
                  </div>
                  <CatBar theme={theme}><CatBarFill pct={pct} theme={theme} /></CatBar>
                </CatInfo>
                <CatTotal theme={theme}>{formatarMoeda(cat.total)}</CatTotal>
              </CatRow>
            );
          })}
        </CatGrid>
      )}

      {/* Ações rápidas */}
      <SectionTitle theme={theme}>Ações rápidas</SectionTitle>
      <QuickActions>
        <ActionCard theme={theme} onClick={() => navigate('/planejamento')}>
          <ActionIcon bg={theme.primary + '20'} color={theme.primary}><ClipboardList size={20} /></ActionIcon>
          <ActionText theme={theme}>
            <h3>Ver planejamento</h3>
            <p>Gerencie categorias e itens de compra</p>
          </ActionText>
          <ArrowRight size={16} color={theme.textLight} />
        </ActionCard>

        <ActionCard theme={theme} onClick={() => navigate('/perfil')}>
          <ActionIcon bg={theme.secondary + '20'} color={theme.secondaryDark || theme.secondary}><Sparkles size={20} /></ActionIcon>
          <ActionText theme={theme}>
            <h3>Meu perfil</h3>
            <p>Edite seus dados e preferências de tema</p>
          </ActionText>
          <ArrowRight size={16} color={theme.textLight} />
        </ActionCard>
      </QuickActions>

      {/* Dica */}
      <InfoCard theme={theme} style={{ borderLeft: `4px solid ${theme.primary}` }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Sparkles size={17} color={theme.primary} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.87rem', color: theme.text }}>💡 Dica</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.81rem', color: theme.textSoft, lineHeight: 1.5 }}>
              Organize seus itens por cômodo e marque o tipo de pagamento para saber quanto usar do VR/VA e quanto pagar no crédito.
            </p>
          </div>
        </div>
      </InfoCard>
    </Container>
  );
};

export default Inicio;
