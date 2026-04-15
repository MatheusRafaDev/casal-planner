import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Container,
  WelcomeCard,
  WelcomeTitle,
  WelcomeSub,
  WelcomeBtn,
  SectionTitle,
  CardsGrid,
  StatCard,
  StatIcon,
  StatLabel,
  StatValue,
  StatSub,
  CatGrid,
  CatRow,
  CatEmoji,
  CatInfo,
  CatChip,
  CatTotal,
  CatBar,
  CatBarFill,
  InfoCard,
  InfoRow,
  InfoLabel,
  InfoValue,
  ProgressBar,
  ProgressFill,
  ProgressLabel,
  QuickActions,
  ActionCard,
  ActionIcon,
  ActionText,
  SkeletonLine,
  HeartAnim,
  TipCard,
  TipContent,
  TipIcon,
  TipTitle,
  TipText
} from '../styles/pages/InicioStyles';

/* ── Componente ─────────────────────────────────────────────────────────────── */
const Inicio = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { theme } = useTheme();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens]           = useState([]);
  const [loading, setLoading]       = useState(true);

  // ✅ Função para obter o nome do usuário
  const getNome = useCallback(() => {
    if (!usuario) return 'Usuário';

    const isCasalAccount = usuario.isCasal || usuario.tipoConta === 'Casal' || usuario.tipoConta === 1;
    
    if (isCasalAccount) {
      const info = usuario.casalInfo || {};
      const pessoaLogada = usuario.pessoaQueLogou || 'pessoa1';
      const nomeCompleto = pessoaLogada === 'pessoa1'
        ? (info.nomeCompletoPessoa1 || 'Usuário')
        : (info.nomeCompletoPessoa2 || 'Usuário');
      return nomeCompleto.split(' ')[0];
    }
    
    return (usuario.nomeCompleto || 'Usuário').split(' ')[0];
  }, [usuario]);

  // ✅ Função para saudação baseada na hora
  const getHora = useCallback(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  // ✅ Verificar se é conta de casal
  const isCasal = usuario?.isCasal || usuario?.tipoConta === 'Casal' || usuario?.tipoConta === 1;

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
      <TipCard theme={theme}>
        <TipContent>
          <TipIcon><Sparkles size={17} color={theme.primary} /></TipIcon>
          <div>
            <TipTitle theme={theme}>💡 Dica</TipTitle>
            <TipText theme={theme}>
              Organize seus itens por cômodo e marque o tipo de pagamento para saber quanto usar do VR/VA e quanto pagar no crédito.
            </TipText>
          </div>
        </TipContent>
      </TipCard>
    </Container>
  );
};

export default Inicio;