import React, { useState, useEffect, useCallback } from 'react';
// Removed unused useNavigate
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { categoriasService } from '../services/categoriasService';
import { itensService } from '../services/itensService';
import { groqService } from '../services/groqService';
import resumoService from '../services/resumoService';
import { formatarMoeda } from '../utils/formatters';
import { exportarParaPDF } from '../utils/pdfExport';
import {
  ShoppingCart, CheckCircle,
  AlertCircle,
  Target, Coffee, DollarSign, Download
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
  SkeletonStatCard,
  SkeletonCatRow,
  TipCard,
  TipContent,
  TipIcon,
  TipText,
  ResumoGrid,
  ResumoCard,
  PrioridadeGrid,
  PrioridadeItem,
} from '../styles/pages/InicioStyles';



/* ── Componente ─────────────────────────────────────────────────────────────── */
const Inicio = () => {

  const { usuario, isCasal, pessoaQueLogou } = useAuth();
  const { theme } = useTheme();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [resumoData, setResumoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sugestoesIA, setSugestoesIA] = useState(null);
  const [resumoNarrativo, setResumoNarrativo] = useState(null);
  const [estimativaComodo, setEstimativaComodo] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);


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
        const [resumo, cats, its] = await Promise.all([
          resumoService.getResumo(),
          categoriasService.listarDoUsuario(),
          itensService.getAll(),
        ]);
        setResumoData(resumoService.formatarDados(resumo));
        setCategorias(cats || []);
        setItens(its || []);
      } catch {
        setResumoData(null);
        setCategorias([]);
        setItens([]);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  // Load AI features after initial data is loaded
  useEffect(() => {
    if (!loading && itens.length > 0 && !loadingAI) {
      const carregarAI = async () => {
        setLoadingAI(true);
        try {
          // Get AI suggestions for the first category
          const primeiraCategoria = categorias[0];
          if (primeiraCategoria) {
            const itensNomes = itens.filter(i => i.categoriaId === primeiraCategoria.id).map(i => i.nome);
            const sugestoes = await groqService.sugerirItens(primeiraCategoria.nome);
            setSugestoesIA(sugestoes);
          }

          // Get narrative summary
          const resumo = await groqService.gerarResumoEnxoval();
          setResumoNarrativo(resumo?.resumo);

          // Get room estimate for the first category
          if (primeiraCategoria) {
            const cidade = usuario?.enderecoNovaCasa?.cidade || 'São Paulo';
            const estimativa = await groqService.estimarOrcamento(primeiraCategoria.nome, cidade);
            setEstimativaComodo(estimativa);
          }
        } catch (err) {
          console.error('Erro ao carregar recursos IA:', err);
        } finally {
          setLoadingAI(false);
        }
      };
      carregarAI();
    }
  }, [loading, itens, categorias, usuario]);

  /* ========== CÁLCULOS DETALHADOS ========== */

  // Use backend-calculated data when available, fallback to client-side calculation
  const usarBackend = resumoData?.atual;
  const totalGeral = usarBackend ? resumoData.atual.totalGeral : itens.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalVR = usarBackend ? resumoData.atual.totalVR : itens.filter(i => i.pagamento === 'vr').reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalNormal = usarBackend ? resumoData.atual.totalNormal : itens.filter(i => i.pagamento === 'normal').reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
  const totalComprados = usarBackend ? resumoData.atual.totalComprados : itens.filter(i => i.comprado).length;
  const totalItens = usarBackend ? resumoData.atual.totalItens : itens.length;
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


  /* Total por categoria - use backend data when available */
  const porCategoria = categorias
    .map(cat => {
      const id = cat.id || cat._id;
      let total, qtd, comprados, pago;

      if (usarBackend && resumoData.atual.porCategoria[id]) {
        // Use backend-calculated data
        total = resumoData.atual.porCategoria[id] || 0;
        qtd = resumoData.atual.quantidadePorCategoria[id] || 0;
        const itscat = itens.filter(i => i.categoriaId === id);
        comprados = itscat.filter(i => i.comprado).length;
        pago = itscat.filter(i => i.comprado).reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
      } else {
        // Fallback to client-side calculation
        const itscat = itens.filter(i => i.categoriaId === id);
        total = itscat.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
        qtd = itscat.length;
        comprados = itscat.filter(i => i.comprado).length;
        pago = itscat.filter(i => i.comprado).reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
      }

      return {
        ...cat,
        id,
        total,
        qtd,
        comprados,
        pago
      };
    })
    .filter(c => c.qtd > 0)
    .sort((a, b) => b.total - a.total);

  const exportarParaExcel = async () => {
    if (!itens || itens.length === 0) return;

    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Planejamento');

      // Título
      worksheet.mergeCells('A1', 'H1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'Planejamento CasalPlanner';
      titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B5CF6' } };

      // Cabeçalhos
      const headers = ['Item', 'Categoria', 'Valor Unitário', 'Quantidade', 'Total', 'Status', 'Pagamento', 'Prioridade'];
      const headerRow = worksheet.addRow(headers);
      
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C1D95' } };
        cell.alignment = { horizontal: 'center' };
      });

      // Dados ordenados do mais caro pro mais barato
      const itensOrdenados = [...itens].sort((a, b) => {
        const totalA = a.preco * (a.quantidade || 1);
        const totalB = b.preco * (b.quantidade || 1);
        return totalB - totalA;
      });

      itensOrdenados.forEach((item) => {
        const categoria = categorias.find(c => (c.id || c._id) === item.categoriaId);
        const nomeCategoria = categoria ? categoria.nome : "Sem Categoria";
        const total = item.preco * (item.quantidade || 1);
        const pago = item.comprado ? "Pago" : "Pendente";
        
        const pagamentoStr = item.pagamento === 'vr' ? 'VR/VA' : 'Normal';
        let prioridadeStr = 'Normal';
        if (item.prioridade === 'urgente') prioridadeStr = 'Urgente';
        else if (item.prioridade === 'pode_esperar') prioridadeStr = 'Pode Esperar';
        
        const row = worksheet.addRow([
          item.nome,
          nomeCategoria,
          item.preco,
          item.quantidade || 1,
          total,
          pago,
          pagamentoStr,
          prioridadeStr
        ]);

        // Formatação de valores
        row.getCell(3).numFmt = '"R$" #,##0.00';
        row.getCell(5).numFmt = '"R$" #,##0.00';
        
        // Alinhamentos
        row.getCell(4).alignment = { horizontal: 'center' };
        row.getCell(6).alignment = { horizontal: 'center' };
        row.getCell(7).alignment = { horizontal: 'center' };
        row.getCell(8).alignment = { horizontal: 'center' };

        // Cores de Status
        const statusCell = row.getCell(6);
        if (item.comprado) {
          statusCell.font = { color: { argb: 'FF10B981' }, bold: true };
        } else {
          statusCell.font = { color: { argb: 'FFF59E0B' }, bold: true };
        }

        // Cores de Prioridade
        const prioridadeCell = row.getCell(8);
        if (prioridadeStr === 'Urgente') {
          prioridadeCell.font = { color: { argb: 'FFEF4444' }, bold: true };
        } else if (prioridadeStr === 'Pode Esperar') {
          prioridadeCell.font = { color: { argb: 'FF10B981' } };
        }
      });

      // Ajustar largura das colunas
      worksheet.columns = [
        { width: 30 },
        { width: 20 },
        { width: 15 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
      ];

      // Totalizadores
      worksheet.addRow([]);
      
      const addTotalRow = (label, value, color) => {
        const r = worksheet.addRow(['', '', '', label, value, '', '', '']);
        r.getCell(4).font = { bold: true };
        r.getCell(4).alignment = { horizontal: 'right' };
        r.getCell(5).numFmt = '"R$" #,##0.00';
        r.getCell(5).font = { bold: true, color: color ? { argb: color } : undefined };
      };

      addTotalRow('TOTAL GERAL:', totalGeral);
      addTotalRow('TOTAL PAGO:', totalPago, 'FF10B981');
      addTotalRow('FALTA PAGAR:', totalFalta, 'FFF59E0B');

      // Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `planejamento_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Ocorreu um erro ao gerar o arquivo Excel.');
    }
  };

  return (
    <Container>
      {/* Saudação */}
      <SectionTitle theme={theme}>Olá, {getNome()}! 👋</SectionTitle>

      {/* Resumo financeiro - Cards principais */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle theme={theme}>Resumo do mês</SectionTitle>
        {!loading && totalItens > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => exportarParaPDF(itens, categorias, { totalGeral, totalPago, totalFalta })}
              style={{
                background: theme.primary + '20',
                color: theme.primary,
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.primary;
                e.currentTarget.style.color = theme.surface;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = theme.primary + '20';
                e.currentTarget.style.color = theme.primary;
              }}
            >
              <Download size={14} /> Exportar PDF
            </button>
            <button 
              onClick={exportarParaExcel}
              style={{
                background: theme.primary + '20',
                color: theme.primary,
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.primary;
                e.currentTarget.style.color = theme.surface;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = theme.primary + '20';
                e.currentTarget.style.color = theme.primary;
              }}
            >
              <Download size={14} /> Exportar Excel
            </button>
          </div>
        )}
      </div>
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

      {/* AI Narrative Summary */}
      {!loading && resumoNarrativo && (
        <TipCard theme={theme}>
          <TipIcon>🤖</TipIcon>
          <TipContent>
            <TipText theme={theme} style={{ fontStyle: 'italic' }}>
              {resumoNarrativo}
            </TipText>
          </TipContent>
        </TipCard>
      )}

      {/* AI Suggestions */}
      {!loading && sugestoesIA && sugestoesIA.itens && sugestoesIA.itens.length > 0 && (
        <InfoCard theme={theme}>
          <SectionTitle theme={theme} style={{ marginBottom: '0.4rem' }}>✨ Sugestões de IA</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sugestoesIA.itens.slice(0, 4).map((item, idx) => (
              <div key={idx} style={{
                padding: '0.5rem',
                background: theme.bg,
                borderRadius: '0.5rem',
                border: `1px solid ${theme.border}`,
                fontSize: '0.85rem'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.nome}</div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: theme.textLight }}>
                  <span>{item.categoria}</span>
                  <span>•</span>
                  <span>R$ {item.precoMedioEstimado?.toFixed(2) || '---'}</span>
                  <span>•</span>
                  <span>{item.prioridade}</span>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Room Estimate */}
      {!loading && estimativaComodo && (
        <InfoCard theme={theme}>
          <SectionTitle theme={theme} style={{ marginBottom: '0.4rem' }}>🏠 Estimativa por cômodo</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: theme.bg, borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem' }}>Básico</span>
              <span style={{ fontWeight: 600 }}>R$ {estimativaComodo.faixaBasica?.toFixed(2) || '---'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: theme.bg, borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem' }}>Médio</span>
              <span style={{ fontWeight: 600 }}>R$ {estimativaComodo.faixaMedia?.toFixed(2) || '---'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: theme.bg, borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem' }}>Premium</span>
              <span style={{ fontWeight: 600 }}>R$ {estimativaComodo.faixaPremium?.toFixed(2) || '---'}</span>
            </div>
            {estimativaComodo.observacao && (
              <div style={{ fontSize: '0.75rem', color: theme.textLight, fontStyle: 'italic' }}>
                {estimativaComodo.observacao}
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* Total por categoria */}
      <SectionTitle theme={theme}>📊 Total por categoria</SectionTitle>

      {loading ? (
        <CatGrid>
          <SkeletonCatRow theme={theme}>
            <div />
            <div>
              <div />
              <div><span /><span /></div>
              <div />
            </div>
            <div />
          </SkeletonCatRow>
          <SkeletonCatRow theme={theme}>
            <div />
            <div>
              <div />
              <div><span /><span /></div>
              <div />
            </div>
            <div />
          </SkeletonCatRow>
          <SkeletonCatRow theme={theme}>
            <div />
            <div>
              <div />
              <div><span /><span /></div>
              <div />
            </div>
            <div />
          </SkeletonCatRow>
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