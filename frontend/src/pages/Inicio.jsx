import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { categoriasService } from '../services/categoriasService';
import { itensService } from '../services/itensService';
import { formatarMoeda } from '../utils/formatters';
import {
  ShoppingCart, TrendingUp, CheckCircle, CreditCard,
  ArrowRight, Heart, Sparkles, ClipboardList, AlertCircle,
  Target, Coffee, DollarSign
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
  TipText,
  ResumoGrid,
  ResumoCard,
  PrioridadeGrid,
  PrioridadeItem,
  UrgencyBadge
} from '../styles/pages/InicioStyles';

import { useScrollRestoration } from '../hooks/useScrollRestoration';

/* ── Componente ─────────────────────────────────────────────────────────────── */
const Inicio = () => {
  const navigate = useNavigate();
  const { usuario, isCasal, pessoaQueLogou } = useAuth();
  const { theme } = useTheme();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useScrollRestoration();

  // ✅ Função para obter o nome do usuário
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
      setLoading(true);
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

  /* ========== CÁLCULOS DETALHADOS ========== */
  
  // Totais gerais
  const totalGeral = itens.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalVR = itens.filter(i => i.pagamento === 'vr').reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalNormal = itens.filter(i => i.pagamento === 'normal').reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalComprados = itens.filter(i => i.comprado).length;
  const totalItens = itens.length;
  const pctComprados = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;
  
  // O que já foi pago vs falta
  const totalPago = itens
    .filter(i => i.comprado)
    .reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalFalta = totalGeral - totalPago;
  const pctFinanceiro = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;

  // Por tipo de pagamento (com valores pagos)
  const pagamentoVR = {
    total: totalVR,
    pago: itens.filter(i => i.pagamento === 'vr' && i.comprado)
      .reduce((acc, i) => acc + (i.preco * i.quantidade), 0),
    falta: totalVR - itens.filter(i => i.pagamento === 'vr' && i.comprado)
      .reduce((acc, i) => acc + (i.preco * i.quantidade), 0)
  };
  
  const pagamentoNormal = {
    total: totalNormal,
    pago: itens.filter(i => i.pagamento === 'normal' && i.comprado)
      .reduce((acc, i) => acc + (i.preco * i.quantidade), 0),
    falta: totalNormal - itens.filter(i => i.pagamento === 'normal' && i.comprado)
      .reduce((acc, i) => acc + (i.preco * i.quantidade), 0)
  };

  // Por prioridade - CORRIGIDO!
  const prioridades = {
    urgente: { total: 0, pago: 0, falta: 0, itens: [] },
    normal: { total: 0, pago: 0, falta: 0, itens: [] },
    pode_esperar: { total: 0, pago: 0, falta: 0, itens: [] }
  };

  itens.forEach(item => {
    const valor = item.preco * (item.quantidade || 1);
    const prioridadeItem = item.prioridade || 'normal';
    
    // Mapeia a prioridade do item para a chave correta
    let chave;
    if (prioridadeItem === 'urgente') {
      chave = 'urgente';
    } else if (prioridadeItem === 'normal' || prioridadeItem === 'media' || prioridadeItem === 'alta') {
      chave = 'normal';
    } else if (prioridadeItem === 'pode_esperar') {
      chave = 'pode_esperar';
    } else {
      chave = 'normal';
    }
    
    prioridades[chave].total += valor;
    if (item.comprado) {
      prioridades[chave].pago += valor;
    } else {
      prioridades[chave].falta += valor;
    }
    prioridades[chave].itens.push(item);
  });

  const urgenciaFalta = prioridades.urgente.falta;
  const urgenciaItensPendentes = prioridades.urgente.itens.filter(i => !i.comprado).length;

  // Top 3 itens urgentes
  const itensUrgentes = itens
    .filter(i => i.prioridade === 'urgente' && !i.comprado)
    .sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade))
    .slice(0, 3);

  // Itens normais pendentes (destaque)
  const itensNormaisPendentes = itens
    .filter(i => (i.prioridade === 'normal' || i.prioridade === 'media' || i.prioridade === 'alta') && !i.comprado)
    .sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade))
    .slice(0, 3);

  /* Total por categoria */
  const porCategoria = categorias
    .map(cat => {
      const id = cat.id || cat._id;
      const itscat = itens.filter(i => i.categoriaId === id);
      return {
        ...cat,
        id,
        total: itscat.reduce((acc, i) => acc + (i.preco * i.quantidade), 0),
        qtd: itscat.length,
        comprados: itscat.filter(i => i.comprado).length,
        pago: itscat.filter(i => i.comprado).reduce((acc, i) => acc + (i.preco * i.quantidade), 0)
      };
    })
    .filter(c => c.qtd > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <Container>
      {/* Saudação */}
      <SectionTitle theme={theme}>Olá, {getNome()}! 👋</SectionTitle>

      {/* Resumo financeiro - Cards principais */}
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
              <StatLabel theme={theme}>Total planejado</StatLabel>
              <StatValue theme={theme}>{formatarMoeda(totalGeral)}</StatValue>
              <StatSub theme={theme}>{`${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`}</StatSub>
            </StatCard>

            <StatCard theme={theme}>
              <StatIcon bg={theme.success + '20'} color={theme.success}><CheckCircle size={17} /></StatIcon>
              <StatLabel theme={theme}>Já pago</StatLabel>
              <StatValue theme={theme}>{formatarMoeda(totalPago)}</StatValue>
              <StatSub theme={theme}>{`${pctFinanceiro.toFixed(0)}% do total`}</StatSub>
            </StatCard>

            <StatCard theme={theme}>
              <StatIcon bg={theme.warning + '20'} color={theme.warning}><AlertCircle size={17} /></StatIcon>
              <StatLabel theme={theme}>Falta pagar</StatLabel>
              <StatValue theme={theme}>{formatarMoeda(totalFalta)}</StatValue>
              <StatSub theme={theme}>{`${(100 - pctFinanceiro).toFixed(0)}% restante`}</StatSub>
            </StatCard>

            <StatCard theme={theme}>
              <StatIcon bg={theme.vrva + '20'} color={theme.vrva}><Target size={17} /></StatIcon>
              <StatLabel theme={theme}>Progresso</StatLabel>
              <StatValue theme={theme}>{pctComprados}%</StatValue>
              <StatSub theme={theme}>{`${totalComprados}/${totalItens} itens`}</StatSub>
            </StatCard>
          </>
        )}
      </CardsGrid>

      {/* Resumo por Tipo de Pagamento */}
      {!loading && totalGeral > 0 && (
        <>
          <SectionTitle theme={theme}>💳 Por tipo de pagamento</SectionTitle>
          <ResumoGrid>
            <ResumoCard theme={theme} color={theme.vrva}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <Coffee size={20} color={theme.vrva} />
                <span style={{ fontSize: '0.7rem', background: `${theme.vrva}20`, padding: '2px 8px', borderRadius: '12px', color: theme.vrva }}>
                  VR / VA
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.vrva, marginBottom: '0.5rem' }}>
                {formatarMoeda(pagamentoVR.total)}
              </div>
              <div style={{ fontSize: '0.75rem', color: theme.textLight, marginBottom: '0.5rem' }}>
                ✅ Pago: {formatarMoeda(pagamentoVR.pago)}
              </div>
              <div style={{ fontSize: '0.75rem', color: theme.warning }}>
                ⚠️ Falta: {formatarMoeda(pagamentoVR.falta)}
              </div>
              <div style={{ width: '100%', height: '4px', background: theme.border, borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{ width: `${pagamentoVR.total > 0 ? (pagamentoVR.pago / pagamentoVR.total) * 100 : 0}%`, height: '100%', background: theme.vrva, transition: 'width 0.3s' }} />
              </div>
            </ResumoCard>

            <ResumoCard theme={theme} color={theme.secondary}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <DollarSign size={20} color={theme.secondary} />
                <span style={{ fontSize: '0.7rem', background: `${theme.secondary}20`, padding: '2px 8px', borderRadius: '12px', color: theme.secondary }}>
                  Normal
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.secondary, marginBottom: '0.5rem' }}>
                {formatarMoeda(pagamentoNormal.total)}
              </div>
              <div style={{ fontSize: '0.75rem', color: theme.textLight, marginBottom: '0.5rem' }}>
                ✅ Pago: {formatarMoeda(pagamentoNormal.pago)}
              </div>
              <div style={{ fontSize: '0.75rem', color: theme.warning }}>
                ⚠️ Falta: {formatarMoeda(pagamentoNormal.falta)}
              </div>
              <div style={{ width: '100%', height: '4px', background: theme.border, borderRadius: '2px', marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{ width: `${pagamentoNormal.total > 0 ? (pagamentoNormal.pago / pagamentoNormal.total) * 100 : 0}%`, height: '100%', background: theme.secondary, transition: 'width 0.3s' }} />
              </div>
            </ResumoCard>
          </ResumoGrid>
        </>
      )}

      {/* Prioridades - Destaque para urgências */}
      {!loading && (urgenciaFalta > 0 || prioridades.normal.total > 0 || prioridades.pode_esperar.total > 0) && (
        <>
          <SectionTitle theme={theme}>
            🎯 Resumo por prioridade
          </SectionTitle>

          <PrioridadeGrid>
            {/* Urgente */}
            {prioridades.urgente.total > 0 && (
              <PrioridadeItem key="urgente" color={theme.error}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>🔴 Urgente</span>
                  <span style={{ fontSize: '0.75rem' }}>
                    {prioridades.urgente.total > 0 
                      ? ((prioridades.urgente.pago / prioridades.urgente.total) * 100).toFixed(0) 
                      : 0}%
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {formatarMoeda(prioridades.urgente.total)}
                </div>
                <div style={{ fontSize: '0.7rem', color: theme.textLight }}>
                  ✅ Pago: {formatarMoeda(prioridades.urgente.pago)}
                </div>
                <div style={{ fontSize: '0.7rem', color: prioridades.urgente.falta > 0 ? theme.warning : theme.success }}>
                  ⚠️ Falta: {formatarMoeda(prioridades.urgente.falta)}
                </div>
                <div style={{ width: '100%', height: '3px', background: theme.border, borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${prioridades.urgente.total > 0 ? (prioridades.urgente.pago / prioridades.urgente.total) * 100 : 0}%`, 
                    height: '100%', 
                    background: theme.error, 
                    transition: 'width 0.3s' 
                  }} />
                </div>
              </PrioridadeItem>
            )}

            {/* Normal */}
            {prioridades.normal.total > 0 && (
              <PrioridadeItem key="normal" color={theme.primary}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>🟡 Normal</span>
                  <span style={{ fontSize: '0.75rem' }}>
                    {prioridades.normal.total > 0 
                      ? ((prioridades.normal.pago / prioridades.normal.total) * 100).toFixed(0) 
                      : 0}%
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {formatarMoeda(prioridades.normal.total)}
                </div>
                <div style={{ fontSize: '0.7rem', color: theme.textLight }}>
                  ✅ Pago: {formatarMoeda(prioridades.normal.pago)}
                </div>
                <div style={{ fontSize: '0.7rem', color: prioridades.normal.falta > 0 ? theme.warning : theme.success }}>
                  ⚠️ Falta: {formatarMoeda(prioridades.normal.falta)}
                </div>
                <div style={{ width: '100%', height: '3px', background: theme.border, borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${prioridades.normal.total > 0 ? (prioridades.normal.pago / prioridades.normal.total) * 100 : 0}%`, 
                    height: '100%', 
                    background: theme.primary, 
                    transition: 'width 0.3s' 
                  }} />
                </div>
              </PrioridadeItem>
            )}

            {/* Pode esperar */}
            {prioridades.pode_esperar.total > 0 && (
              <PrioridadeItem key="pode_esperar" color={theme.success}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>🟢 Pode esperar</span>
                  <span style={{ fontSize: '0.75rem' }}>
                    {prioridades.pode_esperar.total > 0 
                      ? ((prioridades.pode_esperar.pago / prioridades.pode_esperar.total) * 100).toFixed(0) 
                      : 0}%
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {formatarMoeda(prioridades.pode_esperar.total)}
                </div>
                <div style={{ fontSize: '0.7rem', color: theme.textLight }}>
                  ✅ Pago: {formatarMoeda(prioridades.pode_esperar.pago)}
                </div>
                <div style={{ fontSize: '0.7rem', color: prioridades.pode_esperar.falta > 0 ? theme.warning : theme.success }}>
                  ⚠️ Falta: {formatarMoeda(prioridades.pode_esperar.falta)}
                </div>
                <div style={{ width: '100%', height: '3px', background: theme.border, borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${prioridades.pode_esperar.total > 0 ? (prioridades.pode_esperar.pago / prioridades.pode_esperar.total) * 100 : 0}%`, 
                    height: '100%', 
                    background: theme.success, 
                    transition: 'width 0.3s' 
                  }} />
                </div>
              </PrioridadeItem>
            )}
          </PrioridadeGrid>


      
        </>
      )}

      {/* Progresso geral */}
      {!loading && totalItens > 0 && (
        <InfoCard theme={theme}>
          <SectionTitle theme={theme} style={{ marginBottom: '0.4rem' }}>Progresso de compras</SectionTitle>
          <InfoRow theme={theme}>
            <InfoLabel theme={theme}>Itens adquiridos</InfoLabel>
            <InfoValue theme={theme} color={theme.success}>{totalComprados} de {totalItens}</InfoValue>
          </InfoRow>
          <InfoRow theme={theme}>
            <InfoLabel theme={theme}>Valor já pago</InfoLabel>
            <InfoValue theme={theme}>{formatarMoeda(totalPago)} de {formatarMoeda(totalGeral)}</InfoValue>
          </InfoRow>
          <ProgressBar theme={theme}>
            <ProgressFill pct={pctFinanceiro} theme={theme} />
          </ProgressBar>
          <ProgressLabel theme={theme}>
            <span>{pctFinanceiro.toFixed(0)}% pago</span>
            <span>{pctComprados}% itens comprados</span>
          </ProgressLabel>
        </InfoCard>
      )}

      {/* Dica inteligente */}
      {!loading && totalItens > 0 && (
        <TipCard theme={theme}>
          <TipIcon>💡</TipIcon>
          <TipContent>
           
            <TipText theme={theme}>
              {urgenciaFalta > 0 
                ? `🎯 Foco total! Você ainda precisa de ${formatarMoeda(urgenciaFalta)} em itens URGENTES. Priorize essas compras primeiro!`
                : prioridades.normal.falta > 0
                  ? `📋 Continue organizando! Faltam ${formatarMoeda(prioridades.normal.falta)} em itens de prioridade normal.`
                  : totalFalta > 0
                    ? `👍 Bom progresso! Apenas ${formatarMoeda(totalFalta)} restante para completar seu planejamento.`
                    : `🏆 Parabéns! Você já pagou TUDO que planejou! 🎉`}
            </TipText>
          </TipContent>
        </TipCard>
      )}

      {/* Total por categoria */}
      <SectionTitle theme={theme}>📊 Total por categoria</SectionTitle>

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
            const pctFinanceiroCat = cat.total > 0 ? (cat.pago / cat.total) * 100 : 0;
            const pctOrcamento = totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0;
            
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
                    <CatChip theme={theme}>💰 {pctFinanceiroCat.toFixed(0)}% pago</CatChip>
                  </div>
                  <CatBar theme={theme}>
                    <CatBarFill pct={pctOrcamento} theme={theme} style={{ background: theme.primary }} />
                  </CatBar>
                  <div style={{ fontSize: '0.7rem', color: theme.textLight, marginTop: '0.25rem' }}>
                    Pago: {formatarMoeda(cat.pago)} de {formatarMoeda(cat.total)}
                  </div>
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