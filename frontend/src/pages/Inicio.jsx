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
  SkeletonCard,
  SkeletonStatCard,
  SkeletonCatRow,
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
  const { usuario, isCasal, pessoaQueLogou } = useAuth();
  const { theme } = useTheme();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens]           = useState([]);
  const [loading, setLoading]       = useState(true);

  // ✅ Função para obter o nome do usuário (usa valores do contexto)
  const getNome = useCallback(() => {
    if (!usuario) return 'Usuário';

    if (isCasal && usuario.casalInfo) {
      const pessoa = pessoaQueLogou || 'pessoa1';
      const info = usuario.casalInfo;
      const nomeCompleto = pessoa === 'pessoa1'
        ? (info.pessoa1?.nomeCompleto || info.nomeCompletoPessoa1 || 'Usuário')
        : (info.pessoa2?.nomeCompleto || info.nomeCompletoPessoa2 || 'Usuário');
      return nomeCompleto.split(' ')[0];
    }

    return (usuario.nomeCompleto || 'Usuário').split(' ')[0];
  }, [usuario, isCasal, pessoaQueLogou]);

  useEffect(() => {
    const carregar = async () => {
      setLoading(true); // Garante que loading seja true antes de carregar
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
      {/* Resumo financeiro - Cards com Skeleton */}
      <SectionTitle theme={theme}>Resumo do mês</SectionTitle>
      <CardsGrid>
        {loading ? (
          <>
            <SkeletonStatCard theme={theme} />
            <SkeletonStatCard theme={theme} />
            <SkeletonStatCard theme={theme} />
            <SkeletonStatCard theme={theme} />
          </>
        ) : (
          <>
            <StatCard theme={theme}>
              <StatIcon bg={theme.primary + '20'} color={theme.primary}><ShoppingCart size={17} /></StatIcon>
              <StatLabel theme={theme}>Total geral</StatLabel>
              <StatValue theme={theme}>{formatarMoeda(totalGeral)}</StatValue>
              <StatSub theme={theme}>{`${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`}</StatSub>
            </StatCard>

            <StatCard theme={theme}>
              <StatIcon bg={theme.success + '20'} color={theme.success}><CheckCircle size={17} /></StatIcon>
              <StatLabel theme={theme}>Comprados</StatLabel>
              <StatValue theme={theme}>{totalComprados}</StatValue>
              <StatSub theme={theme}>{`${pctComprados}% concluído`}</StatSub>
            </StatCard>

            <StatCard theme={theme}>
              <StatIcon bg={theme.vrva + '20'} color={theme.vrva}><CreditCard size={17} /></StatIcon>
              <StatLabel theme={theme}>VR / VA</StatLabel>
              <StatValue theme={theme}>{formatarMoeda(totalVR)}</StatValue>
              <StatSub theme={theme}>vale alimentação/refeição</StatSub>
            </StatCard>

            <StatCard theme={theme}>
              <StatIcon bg={theme.secondary + '20'} color={theme.secondaryDark || theme.secondary}><TrendingUp size={17} /></StatIcon>
              <StatLabel theme={theme}>Pagamento normal</StatLabel>
              <StatValue theme={theme}>{formatarMoeda(totalNormal)}</StatValue>
              <StatSub theme={theme}>dinheiro / cartão</StatSub>
            </StatCard>
          </>
        )}
      </CardsGrid>

      {/* Progresso - Skeleton integrado */}
      {loading ? (
        <SkeletonCard theme={theme} />
      ) : totalItens > 0 && (
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
          <SkeletonCatRow theme={theme} />
          <SkeletonCatRow theme={theme} />
          <SkeletonCatRow theme={theme} />
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
    </Container>
  );
};

export default Inicio;