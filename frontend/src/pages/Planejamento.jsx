import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Edit2, MoreVertical, Plus, Image as ImageIcon, Box, Trash2, ExternalLink, Store, Search, ArrowUpDown, Settings2, X, CreditCard, Coffee, Filter, Heart } from "lucide-react";
import CasalPlannerLogo from "../assets/logo.png";

import CategoriaFormModal from "../components/CategoriaFormModal";
import ItemFormModal from "../components/ItemFormModal";
import DynamicIcon from "../components/DynamicIcon";
import CategoryManagementModal from "../components/CategoriaAdministrarModal";
import PlanejamentoFiltros from "../components/PlanejamentoFiltros";

import { categoriasService } from "../services/categoriasService";
import { itensService } from "../services/itensService";
import storeLogoService from "../services/storeLogoService";
import { showToast } from "../utils/toastUtils";
import {
  PlanejamentoContainer,
  StatsRow, StatCard, StatIcon, StatInfo,
  ContentArea, PanelCategories, PanelHead, CategoriesList, CatItem, CatIconWrap, CatName, CatCount, CatPrice, CatColorDot, CatAddBtn, IconBtn,
  PanelItems, ItemsHead, ItemsCountLabel, FilterTabs, FilterTab, TabDot, ItemList,
  ItemRow, Checkbox, ItemThumb, ItemInfo, ItemTitleRow, ItemName, ItemMeta, BrandLogo, BrandBadge, CategoryBadge, ItemStore, Badge, ItemPriceCol, ItemPrice, QtyVal, CheckedIcon,
  MobileLayout, MobileHeader, MobileFilterBar, MobileFilterChips, MobileFilterChip,
  MobileItemsHeader, MobileItemsContainer,
  MobileSummaryGrid, MobileStat, MobileStatLabel, MobileStatValue, MobileCategoriesScroll, MobileCatBtn, MobileFab,
  EmptyStateContainer, EmptyStateIcon, EmptyStateTitle, EmptyStateButton,
  SkeletonPanelCategories, SkeletonPanelItems, SkeletonLine, SkeletonItemRow,
  ItemActions, ActionMenu, ActionMenuItem, MenuButton,
  SearchSortBar, SearchInputWrap, SortSelectWrap,
  CatSummaryBanner, CatSummaryStat, CatSummaryLabel, CatSummaryValue, CatProgressBar, CatProgressTrack, CatProgressFill, CatProgressLabels, ClearSearchBtn
} from "../styles/pages/PlanejamentoStyles";

// Converte string HSL (ex: '240 70% 50%') para hex
const hslStringToHex = (hsl) => {
  if (!hsl) return '#8b5cf6';
  if (hsl.startsWith('#')) return hsl;
  const m = hsl.match(/(\d+)\s*(\d+)%?\s*(\d+)%?/);
  if (!m) return '#8b5cf6';
  const h = parseInt(m[1]), s = parseInt(m[2]) / 100, l = parseInt(m[3]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * color).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
};

const FORM_DATA_VAZIO = {
  nome:"", marca:"", preco:0, quantidade:1,
  pagamento:"normal", prioridade:"normal",
  loja:"", fotoUrl: "",
};

const StoreLogo = React.memo(({ storeName, size="small", theme }) => {
  const [err, setErr] = useState(false);
  const sz = size==="small" ? 14 : 16;
  if (!storeName) return <Store size={sz} color={theme?.textSoft || "#666"} />;
  
  if (err) {
    return <Store size={sz} color={theme?.textSoft || "#666"} />;
  }
  
  return <img src={storeLogoService.getLogoUrl(storeName, size==="small"?16:32)} alt={storeName} style={{ width: sz, height: sz, borderRadius: 2 }} loading="lazy" onError={()=>setErr(true)} />;
});

const ConfirmModal = ({ isOpen, theme, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:99999, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background: theme?.surface || '#fff', borderRadius:'16px', padding:'28px 24px', maxWidth:'380px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', border:`1px solid ${theme?.border || '#e5e7eb'}` }}>
        <div style={{ fontSize:'24px', marginBottom:'12px' }}>!</div>
        <h3 style={{ margin:'0 0 8px', fontSize:'16px', fontWeight:700, color: theme?.text }}>{title}</h3>
        <p style={{ margin:'0 0 24px', fontSize:'14px', color: theme?.textSoft, lineHeight:1.5 }}>{message}</p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'8px 18px', borderRadius:'10px', border:`1.5px solid ${theme?.border}`, background: theme?.surface, color: theme?.text, cursor:'pointer', fontWeight:600, fontSize:'14px' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ padding:'8px 18px', borderRadius:'10px', border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:600, fontSize:'14px' }}>Excluir</button>
        </div>
      </div>
    </div>
  );
};

const Planejamento = () => {
  const { theme } = useTheme();
  const { usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openCatMenuId, setOpenCatMenuId] = useState(null);
  
  // States do Master-Detail
  const [activeCategoryIds, setActiveCategoryIds] = useState([]);
  const [filter, setFilter] = useState("all"); // all, essencial, futuro, planejado
  const [statusFilter, setStatusFilter] = useState("all"); // all, comprado, pendente
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent"); // recent, nameAsc, priceDesc, priceAsc
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [paymentFilter, setPaymentFilter] = useState('all'); // all, vr, normal

  const [itemModal, setItemModal] = useState({ isOpen:false, categoriaId:null, itemId:null });
  const [categoriaModal, setCategoriaModal] = useState({ isOpen:false, categoria:null, isEditing:false });
  const [manageCatsModal, setManageCatsModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen:false, title:'', message:'', onConfirm: null });

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setOpenCatMenuId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Load ---
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, its] = await Promise.all([categoriasService.listar(), itensService.getAll()]);
      // Sort by ordem first, then by name to keep related categories together
      const sortedCats = (cats||[]).sort((a,b)=>{
        const ordemA = a.ordem || 0;
        const ordemB = b.ordem || 0;
        if (ordemA !== ordemB) return ordemA - ordemB;
        return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
      });
      setCategorias(sortedCats);
      setItens(Array.isArray(its)?its:[]);

      // Auto-selecionar a primeira categoria no Desktop se não houver nenhuma
      if (sortedCats.length > 0 && activeCategoryIds.length === 0 && window.innerWidth > 900) {
        setActiveCategoryIds([]); // mantemos vazio para significar "Todas" como padrão
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (usuario) loadData(); }, [usuario, loadData]);

  // --- Dados Derivados ---
  
  const activeCategory = activeCategoryIds.length === 1 
    ? categorias.find(c => c.id === activeCategoryIds[0]) 
    : null;

  const itensFiltrados = useMemo(() => {
    let result = itens;

    // Filtro de categorias múltiplas
    if (activeCategoryIds.length > 0) {
      result = result.filter(i => activeCategoryIds.includes(i.categoriaId));
    }

    // Filtro de abas
    if (filter === "essencial") result = result.filter(i => i.prioridade === "urgente");
    if (filter === "futuro")    result = result.filter(i => i.prioridade === "pode_esperar");
    if (filter === "planejado") result = result.filter(i => i.prioridade === "normal" || !i.prioridade);

    // Filtro de status
    if (statusFilter === "comprado") result = result.filter(i => i.comprado);
    if (statusFilter === "pendente") result = result.filter(i => !i.comprado);

    // Filtro de data
    if (dateRange.start) {
      const start = new Date(dateRange.start);
      start.setHours(0, 0, 0, 0);
      result = result.filter(i => new Date(i.createdAt) >= start);
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      result = result.filter(i => new Date(i.createdAt) <= end);
    }

    // Filtro de pagamento
    if (paymentFilter === 'vr') result = result.filter(i => i.pagamento === 'vr');
    if (paymentFilter === 'normal') result = result.filter(i => !i.pagamento || i.pagamento === 'normal');

    // Filtro de pesquisa
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.nome.toLowerCase().includes(q) || 
        (i.loja && i.loja.toLowerCase().includes(q)) || 
        (i.marca && i.marca.toLowerCase().includes(q))
      );
    }

    // Ordenação
    result = [...result];
    if (sortOrder === "nameAsc") {
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortOrder === "priceDesc") {
      result.sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade));
    } else if (sortOrder === "priceAsc") {
      result.sort((a, b) => (a.preco * a.quantidade) - (b.preco * b.quantidade));
    } else if (sortOrder === "category") {
      result.sort((a, b) => {
        const catA = categorias.find(c => c.id === a.categoriaId);
        const catB = categorias.find(c => c.id === b.categoriaId);
        const nomeA = catA ? catA.nome : "ZZZ";
        const nomeB = catB ? catB.nome : "ZZZ";
        if (nomeA === nomeB) return a.nome.localeCompare(b.nome);
        return nomeA.localeCompare(nomeB);
      });
    } else {
      // recent
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [itens, activeCategoryIds, filter, statusFilter, searchQuery, sortOrder, dateRange, paymentFilter, categorias]);

  // Resumo Financeiro Global (Stats)
  const stats = useMemo(() => {
    const totalGeral = itens.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
    const totalComprado = itens.filter(i => i.comprado).reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
    const perc = totalGeral > 0 ? Math.round((totalComprado / totalGeral) * 100) : 0;
    const qtdComprados = itens.filter(i => i.comprado).reduce((acc, i) => acc + i.quantidade, 0);
    const qtdTotal = itens.reduce((acc, i) => acc + i.quantidade, 0);

    // Gastos por tipo de pagamento
    const totalVr = itens.filter(i => i.comprado && i.pagamento === 'vr').reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
    const totalNormal = itens.filter(i => i.comprado && (!i.pagamento || i.pagamento === 'normal')).reduce((acc, i) => acc + (i.preco * i.quantidade), 0);

    return { totalGeral, totalComprado, perc, qtdComprados, qtdTotal, totalVr, totalNormal };
  }, [itens]);

  const fmt = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // --- Actions ---
  
  const handleToggleComprado = async (itemId, e) => {
    e.stopPropagation();
    const itemAtual = itens.find(i => i.id === itemId);
    if (!itemAtual) return;
    const novoEstado = !itemAtual.comprado;
    setItens(prev => prev.map(i => i.id===itemId ? {...i, comprado:novoEstado} : i));
    try {
      await itensService.updateComprado(itemId, novoEstado);
    } catch {
      setItens(prev => prev.map(i => i.id===itemId ? {...i, comprado:itemAtual.comprado} : i));
    }
  };

  const handleDeleteItem = async (itemId, e) => {
    if (e) e.stopPropagation();
    setOpenMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Excluir item',
      message: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, isOpen: false }));
        try {
          await itensService.delete(itemId);
          setItens(prev => prev.filter(i => i.id !== itemId));
        } catch (err) {
          console.error('Erro ao excluir item:', err);
        }
      }
    });
  };

  const handleDeleteCategoria = async (catId, catNome) => {
    setOpenCatMenuId(null);
    setConfirmModal({
      isOpen: true,
      title: 'Excluir categoria',
      message: `Tem certeza que deseja excluir "${catNome || 'esta categoria'}"? Todos os itens dela serão apagados permanentemente.`,
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, isOpen: false }));
        try {
          await categoriasService.delete(catId);
          setCategorias(prev => prev.filter(c => c.id !== catId));
          if (activeCategoryIds.includes(catId)) setActiveCategoryIds(prev => prev.filter(id => id !== catId));
          setItens(prev => prev.filter(i => i.categoriaId !== catId));
        } catch (err) {
          console.error('Erro ao excluir categoria:', err);
        }
      }
    });
  };


  const handleAddItem = useCallback(() => {
    // Se estiver em "Todas as categorias", passamos null, e o modal pedirá a categoria
    setItemModal({ isOpen:true, categoriaId: activeCategoryIds.length === 1 ? activeCategoryIds[0] : null, itemId:null });
  }, [activeCategoryIds]);

  useEffect(() => {
    if (location.search.includes('add=true')) {
      handleAddItem();
      navigate('/planejamento', { replace: true });
    }

    const onOpenAddModal = () => handleAddItem();
    window.addEventListener('openAddItemModal', onOpenAddModal);
    
    return () => window.removeEventListener('openAddItemModal', onOpenAddModal);
  }, [location.search, navigate, handleAddItem]);

  const handleEditItem = (itemId, e) => {
    if(e) e.stopPropagation();
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    setItemModal({ isOpen:true, categoriaId:item.categoriaId, itemId });
  };

  const handleSaveItem = async (dados) => {
    try {
      const payload = { ...dados, categoriaId: dados.categoriaId || (activeCategoryIds.length === 1 ? activeCategoryIds[0] : null) };
      if (!payload.categoriaId) {
        showToast.error('Selecione uma categoria para o item', theme);
        return;
      }
      if (itemModal.itemId) {
        const atualizado = await itensService.update(itemModal.itemId, payload);
        setItens(prev => prev.map(i => i.id === itemModal.itemId ? atualizado : i));
      } else {
        const novo = await itensService.create(payload);
        setItens(prev => [novo, ...prev]);
      }
    } catch (err) {
      console.error('Erro ao salvar item:', err);
      showToast.error('Erro ao salvar item. Tente novamente.', theme);
    }
  };

  const handleCategoryAdded = (res, isEditing) => {
    if (isEditing) setCategorias(prev => prev.map(c => c.id===res.id ? {...c,...res} : c));
    else setCategorias(prev => [...prev, res]);
  };

  // --- Renders ---

  // Props compartilhadas para o componente PlanejamentoFiltros
  const hasActiveFilters = filter !== 'all' || statusFilter !== 'all' || sortOrder !== 'recent' || dateRange.start || dateRange.end || paymentFilter !== 'all' || searchQuery;
  const filtersProps = {
    theme,
    searchQuery,
    onSearchChange: setSearchQuery,
    statusFilter,
    onStatusChange: setStatusFilter,
    filter,
    onFilterChange: setFilter,
    paymentFilter,
    onPaymentChange: setPaymentFilter,
    sortOrder,
    onSortChange: setSortOrder,
    dateRange,
    onDateChange: (field, value) => setDateRange(prev => ({ ...prev, [field]: value })),
    hasActiveFilters: !!hasActiveFilters,
    onClearAll: () => { setFilter('all'); setStatusFilter('all'); setSortOrder('recent'); setDateRange({ start: '', end: '' }); setPaymentFilter('all'); setSearchQuery(''); },
  };

  const renderItemBadge = (item) => {
    const priority = {
      urgente: { color: '#ef4444', label: 'Primeira necessidade' },
      normal: { color: '#f59e0b', label: 'Próximas compras' },
      pode_esperar: { color: '#22c55e', label: 'Mais para frente' },
    }[item.prioridade || 'normal'];
    return <span style={{ fontSize: '10px', fontWeight: 700, color: priority.color, background: priority.color + '18', padding: '2px 7px', borderRadius: '6px', border: `1px solid ${priority.color}30`, whiteSpace: 'nowrap' }}>{priority.label}</span>;
  };

  const renderStats = (isMobile = false) => {
    if (isMobile) {
      return (
        <div style={{ padding: '16px 20px', background: theme?.surface, borderBottom: `1px solid ${theme?.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', color: theme?.textSoft, fontWeight: 600 }}>Total Planejado</span>
              <strong style={{ fontSize: '16px', color: theme?.text, fontWeight: 800 }}>R$ {fmt(stats.totalGeral)}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', color: theme?.textSoft, fontWeight: 600 }}>Total Gasto</span>
              <strong style={{ fontSize: '16px', color: '#10b981', fontWeight: 800 }}>R$ {fmt(stats.totalComprado)}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '11px', color: theme?.textSoft, fontWeight: 600 }}>VR/VA</span>
              <strong style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 700 }}>R$ {fmt(stats.totalVr)}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '11px', color: theme?.textSoft, fontWeight: 600 }}>Normal</span>
              <strong style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 700 }}>R$ {fmt(stats.totalNormal)}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: theme?.textSoft, fontWeight: 600 }}>Progresso</span>
              <span style={{ fontSize: '12px', color: theme?.text, fontWeight: 700 }}>{stats.perc}% ({stats.qtdComprados}/{stats.qtdTotal})</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: theme?.surface2 || '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.perc}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <StatsRow theme={theme} style={{ padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: theme?.textSoft, fontWeight: 600 }}>Total Planejado</span>
            <strong style={{ fontSize: '18px', color: theme?.text, fontWeight: 800 }}>R$ {fmt(stats.totalGeral)}</strong>
          </div>
          <div style={{ width: '1px', height: '32px', background: theme?.border }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: theme?.textSoft, fontWeight: 600 }}>Total Gasto</span>
            <strong style={{ fontSize: '18px', color: '#10b981', fontWeight: 800 }}>R$ {fmt(stats.totalComprado)}</strong>
          </div>
          <div style={{ width: '1px', height: '32px', background: theme?.border }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: theme?.textSoft, fontWeight: 600 }}>VR/VA</span>
            <strong style={{ fontSize: '18px', color: '#f59e0b', fontWeight: 800 }}>R$ {fmt(stats.totalVr)}</strong>
          </div>
          <div style={{ width: '1px', height: '32px', background: theme?.border }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: theme?.textSoft, fontWeight: 600 }}>Normal</span>
            <strong style={{ fontSize: '18px', color: '#3b82f6', fontWeight: 800 }}>R$ {fmt(stats.totalNormal)}</strong>
          </div>
          <div style={{ width: '1px', height: '32px', background: theme?.border }} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: theme?.textSoft, fontWeight: 600 }}>Progresso</span>
              <span style={{ fontSize: '13px', color: theme?.text, fontWeight: 700 }}>{stats.perc}% ({stats.qtdComprados} de {stats.qtdTotal} comprados)</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: theme?.surface2 || '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.perc}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </div>
      </StatsRow>
    );
  };

  const renderCatSummary = () => {
    if (!activeCategory) return null;
    
    const itemsCat = itens.filter(i => i.categoriaId === activeCategory.id);
    const totalPlanned = itemsCat.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
    const totalSpent = itemsCat.filter(i => i.comprado).reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
    const meta = activeCategory.metaOrcamento || 0;
    
    const targetValue = meta > 0 ? meta : totalPlanned;
    const isExceeded = targetValue > 0 && totalSpent > targetValue;
    const pctSpent = targetValue > 0 ? (totalSpent / targetValue) * 100 : 0;
    const remaining = targetValue - totalSpent;

    return (
      <CatSummaryBanner theme={theme}>
        <CatSummaryStat>
          <CatSummaryLabel theme={theme}>Total Gasto</CatSummaryLabel>
          <CatSummaryValue theme={theme} $color={theme?.primary}>R$ {fmt(totalSpent)}</CatSummaryValue>
        </CatSummaryStat>

        {meta > 0 && (
          <CatSummaryStat>
            <CatSummaryLabel theme={theme}>Meta</CatSummaryLabel>
            <CatSummaryValue theme={theme}>R$ {fmt(meta)}</CatSummaryValue>
          </CatSummaryStat>
        )}

        {meta === 0 && totalPlanned > 0 && (
          <CatSummaryStat>
            <CatSummaryLabel theme={theme}>Planejado</CatSummaryLabel>
            <CatSummaryValue theme={theme}>R$ {fmt(totalPlanned)}</CatSummaryValue>
          </CatSummaryStat>
        )}

        {targetValue > 0 && (
          <CatProgressBar>
            <CatProgressLabels theme={theme}>
              <span>Progresso</span>
              <span style={{ color: isExceeded ? '#ef4444' : 'inherit' }}>
                {pctSpent.toFixed(0)}% {isExceeded ? '(Excedido)' : ''}
              </span>
            </CatProgressLabels>
            <CatProgressTrack theme={theme}>
              <CatProgressFill theme={theme} $pct={pctSpent} $exceeded={isExceeded} />
            </CatProgressTrack>
          </CatProgressBar>
        )}

        {remaining > 0 && targetValue > 0 && (
          <CatSummaryStat style={{marginLeft: 'auto'}}>
            <CatSummaryLabel theme={theme}>Disponível</CatSummaryLabel>
            <CatSummaryValue theme={theme} $color="#10b981">R$ {fmt(remaining)}</CatSummaryValue>
          </CatSummaryStat>
        )}
        
        {remaining < 0 && (
          <CatSummaryStat style={{marginLeft: 'auto'}}>
            <CatSummaryLabel theme={theme}>Excedeu em</CatSummaryLabel>
            <CatSummaryValue theme={theme} $color="#ef4444">R$ {fmt(Math.abs(remaining))}</CatSummaryValue>
          </CatSummaryStat>
        )}
      </CatSummaryBanner>
    );
  };

  const renderItemRow = (item, isMobile = false) => {
    const cat = categorias.find(c => c.id === item.categoriaId);
    
    return (
      <ItemRow
        key={item.id}
        $checked={item.comprado}
        $menuOpen={openMenuId === item.id}
        theme={theme}
        onClick={(e) => handleEditItem(item.id, e)}
        style={{ alignItems: 'flex-start', gap: '10px', padding: '12px 14px' }}
      >
        {/* Checkbox */}
        <Checkbox
          $checked={item.comprado}
          onClick={(e) => handleToggleComprado(item.id, e)}
          theme={theme}
          style={{ marginTop: '2px', flexShrink: 0 }}
        >
          <Check />
        </Checkbox>

        {/* Thumbnail */}
        <ItemThumb
          theme={theme}
          style={{
            width: 48, height: 48, borderRadius: 10,
            border: `1px solid ${theme?.border}`,
            background: theme?.surface2,
            flexShrink: 0, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            alignSelf: 'flex-start',
          }}
        >
          {item.fotoUrl
            ? <img src={item.fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <ImageIcon size={22} />}
        </ItemThumb>

        {/* Info principal — ocupa todo espaço horizontal disponível */}
        <ItemInfo style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>

          {/* Linha 1: nome + preço lado a lado */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%', minWidth: 0 }}>
            <ItemName
              $checked={item.comprado}
              theme={theme}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: 1.4,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {item.nome}
            </ItemName>

            <ItemPriceCol style={{ flexShrink: 0, minWidth: 90, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <ItemPrice theme={theme} style={{ fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                R$ {fmt(item.preco * item.quantidade)}
              </ItemPrice>
              <QtyVal theme={theme} style={{ fontSize: '11px', fontWeight: 500, color: theme?.textSoft, whiteSpace: 'nowrap' }}>
                {item.quantidade}x R$ {fmt(item.preco)}
              </QtyVal>
            </ItemPriceCol>
          </div>

          {/* Linha 2: badge prioridade + categoria + loja + VR — todos inline */}
          <ItemMeta theme={theme} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '5px', rowGap: '4px', marginTop: '1px' }}>
            {/* Status Comprado */}
            {item.comprado && (
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', background: '#10b98118', padding: '2px 7px', borderRadius: '6px', border: '1px solid #10b98130', whiteSpace: 'nowrap' }}>
                Comprado
              </span>
            )}

            {/* Badge de prioridade */}
            {renderItemBadge(item)}

            {/* Badge categoria */}
            {cat && (() => {
              const catHex = hslStringToHex(cat.bg);
              return (
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  color: catHex, background: catHex + '18',
                  padding: '2px 7px', borderRadius: '6px',
                  border: `1px solid ${catHex}30`,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  whiteSpace: 'nowrap',
                }}>
                  {(cat.icone || cat.icon) &&
                    <DynamicIcon name={cat.icone || cat.icon} size={10} color="currentColor" />
                  }
                  {cat.nome}
                </span>
              );
            })()}

            {/* Marca */}
            {item.marca && (
              <span style={{ fontSize: '11px', color: theme?.textSoft, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {item.marca}
              </span>
            )}

            {/* Loja */}
            {item.loja && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: theme?.textSoft, whiteSpace: 'nowrap' }}>
                <StoreLogo storeName={item.loja} theme={theme} size="small" />
                {item.loja}
              </div>
            )}

            {/* VR/VA */}
            {item.pagamento === 'vr' && (
              <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700, background: '#f59e0b18', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                VR/VA
              </span>
            )}

            {/* Dinheiro */}
            {(!item.pagamento || item.pagamento === 'normal') && (
              <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 700, background: '#3b82f618', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                Dinheiro
              </span>
            )}
          </ItemMeta>
        </ItemInfo>

        {/* Menu ⋮ */}
        <ItemActions style={{ alignSelf: 'center', marginLeft: 0, flexShrink: 0 }}>
          <MenuButton
            theme={theme}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === item.id ? null : item.id);
            }}
          >
            <MoreVertical size={18} />
          </MenuButton>

          {openMenuId === item.id && (
            <ActionMenu theme={theme}>
              <ActionMenuItem theme={theme} onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleEditItem(item.id, e); }}>
                <Edit2 size={14} /> Editar
              </ActionMenuItem>
              {item.linkProduto && (
                <ActionMenuItem theme={theme} onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); window.open(item.linkProduto, '_blank'); }}>
                  <ExternalLink size={14} /> Abrir Link
                </ActionMenuItem>
              )}
              <ActionMenuItem theme={theme} $danger onClick={(e) => handleDeleteItem(item.id, e)}>
                <Trash2 size={14} /> Excluir
              </ActionMenuItem>
            </ActionMenu>
          )}
        </ItemActions>
      </ItemRow>
    );
  };

  // --- View ---

  if (loading) {
    return (
      <PlanejamentoContainer theme={theme}>
        <StatsRow theme={theme}>
          {[1,2,3,4].map(n => <StatCard key={n} theme={theme}><SkeletonLine h="40px" w="40px"/><div style={{flex:1}}><SkeletonLine w="80%" mb="8px"/><SkeletonLine w="50%" h="10px"/></div></StatCard>)}
        </StatsRow>
        <ContentArea>
          <SkeletonPanelCategories theme={theme}>
             {[1,2,3,4,5].map(n => <SkeletonLine key={n} h="40px" mb="10px"/>)}
          </SkeletonPanelCategories>
          <SkeletonPanelItems>
             {[1,2,3,4].map(n => <SkeletonItemRow key={n} theme={theme}><div className="thumb"/><div className="info"><SkeletonLine w="40%" mb="8px"/><SkeletonLine w="20%" h="10px"/></div></SkeletonItemRow>)}
          </SkeletonPanelItems>
        </ContentArea>
      </PlanejamentoContainer>
    );
  }

  return (
    <PlanejamentoContainer theme={theme}>
      
      {renderStats(false)}

      {/* --- DESKTOP LAYOUT (Master-Detail) --- */}
      <ContentArea>
        <PanelCategories theme={theme}>
          <PanelHead theme={theme}>
            <h3>Categorias</h3>
            <div style={{display:'flex', gap:'6px'}}>
              
              <IconBtn theme={theme} onClick={() => setCategoriaModal({isOpen:true, categoria:null, isEditing:false})} title="Nova Categoria">
                <Plus size={16} />
              </IconBtn>
            </div>
          </PanelHead>
          <CategoriesList theme={theme}>
            <PlanejamentoFiltros variant="sidebar" {...filtersProps} />

            {/* Category label */}
            <span style={{ fontSize: '11px', fontWeight: 700, color: theme?.textSoft, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px 6px' }}>Categorias</span>

            <CatItem $active={activeCategoryIds.length === 0} theme={theme} onClick={() => setActiveCategoryIds([])}>
              <CatIconWrap $active={activeCategoryIds.length === 0} theme={theme}><Box size={16} /></CatIconWrap>
              <CatName $active={activeCategoryIds.length === 0} theme={theme}>Todas</CatName>
              <CatCount theme={theme}>{itens.length}</CatCount>
            </CatItem>
            
            {categorias.map(cat => {
              const itemsCat = itens.filter(i => i.categoriaId === cat.id);
              const isAct = activeCategoryIds.includes(cat.id);
              const valorCat = itemsCat.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
              const catHex = hslStringToHex(cat.bg);
              
              return (
                <CatItem key={cat.id} $active={isAct} $menuOpen={openCatMenuId === cat.id} theme={theme} onClick={() => {
                  if (activeCategoryIds.includes(cat.id)) {
                    setActiveCategoryIds(activeCategoryIds.filter(id => id !== cat.id));
                  } else {
                    setActiveCategoryIds([...activeCategoryIds, cat.id]);
                  }
                }}>
                  <CatIconWrap $active={isAct} theme={theme} style={isAct ? {} : { background: catHex + '20', color: catHex }}>
                    <DynamicIcon name={cat.icon || cat.icone} size={16} color="currentColor" />
                  </CatIconWrap>
                  <CatName $active={isAct} theme={theme}>{cat.nome}</CatName>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'2px'}}>
                    <CatCount theme={theme}>{itemsCat.length}</CatCount>
                    {valorCat > 0 && <CatPrice theme={theme}>R$ {fmt(valorCat)}</CatPrice>}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <MenuButton 
                      theme={theme} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setOpenCatMenuId(openCatMenuId === cat.id ? null : cat.id); 
                      }}
                      style={{ padding: '4px', marginLeft: '4px' }}
                    >
                      <MoreVertical size={16} />
                    </MenuButton>
                    
                    {openCatMenuId === cat.id && (
                      <ActionMenu theme={theme} style={{ right: 0, top: '100%', marginTop: '4px' }}>
                        <ActionMenuItem theme={theme} onClick={(e) => { 
                          e.stopPropagation(); 
                          setOpenCatMenuId(null); 
                          setCategoriaModal({isOpen:true, categoria:cat, isEditing:true}); 
                        }}>
                          <Edit2 size={14} /> Editar
                        </ActionMenuItem>
                        <ActionMenuItem theme={theme} $danger onClick={(e) => {
                          e.stopPropagation();
                          setOpenCatMenuId(null);
                          handleDeleteCategoria(cat.id, cat.nome);
                        }}>
                          <Trash2 size={14} /> Excluir
                        </ActionMenuItem>
                      </ActionMenu>
                    )}
                  </div>
                </CatItem>
              );
            })}
            <CatAddBtn theme={theme} style={{ margin: '12px 4px 0' }} onClick={() => setCategoriaModal({isOpen:true, categoria:null, isEditing:false})}>
              <Plus size={16} /> Nova Categoria
            </CatAddBtn>
          </CategoriesList>
        </PanelCategories>

        <PanelItems theme={theme}>
          <ItemsHead theme={theme}>
            <div>
              <h3>{activeCategory ? activeCategory.nome : activeCategoryIds.length > 1 ? `${activeCategoryIds.length} categorias` : 'Todos os itens'}</h3>
              <ItemsCountLabel theme={theme}>{itensFiltrados.length} {itensFiltrados.length === 1 ? 'item' : 'itens'}</ItemsCountLabel>
            </div>
            <CatAddBtn theme={theme} onClick={handleAddItem} style={{ padding: '8px 16px', background: theme?.primary, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}>
              <Plus size={16} /> Novo Item
            </CatAddBtn>
          </ItemsHead>

          {renderCatSummary()}

          <ItemList theme={theme}>
            {itensFiltrados.length === 0 ? (
              <EmptyStateContainer>
                <EmptyStateTitle>Nenhum item encontrado</EmptyStateTitle>
                <EmptyStateButton onClick={handleAddItem} theme={theme}>Adicionar Item</EmptyStateButton>
              </EmptyStateContainer>
            ) : (
              itensFiltrados.map(item => renderItemRow(item, false))
            )}
          </ItemList>
        </PanelItems>
      </ContentArea>

      {/* --- MOBILE LAYOUT --- */}
      <MobileLayout theme={theme}>

        {/* ── 1. HEADER: Resumo financeiro compacto ── */}
        <MobileHeader theme={theme}>
          {/* ── Logo ── */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}
          >
            <Heart size={16} fill={theme?.primary} color={theme?.primary} />
            <img src={CasalPlannerLogo} alt="CasalPlanner" width={32} height={32} style={{ borderRadius: 8 }} />
            <span style={{ fontWeight: 800, fontSize: '16px', color: theme?.text, letterSpacing: '-0.3px' }}>CasalPlanner</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: theme?.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Planejado</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: theme?.text, letterSpacing: '-0.5px' }}>R$ {fmt(stats.totalGeral)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: theme?.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Gasto</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981', letterSpacing: '-0.5px' }}>R$ {fmt(stats.totalComprado)}</div>
            </div>
            <button
              onClick={handleAddItem}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: `linear-gradient(135deg, ${theme?.primary}, #a855f7)`, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: `0 4px 14px ${theme?.primary}40`, flexShrink: 0 }}
            >
              <Plus size={16} /> Novo
            </button>
          </div>
          {/* Barra de progresso */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: theme?.textSoft }}>Progresso</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: theme?.text }}>{stats.perc}% · {stats.qtdComprados}/{stats.qtdTotal} itens</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: theme?.surface2 || '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.perc}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </MobileHeader>

        {/* ── 2. CATEGORIAS: scroll horizontal com ações ── */}
        <div style={{ background: theme?.surface, borderBottom: `1px solid ${theme?.border}`, padding: '10px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: theme?.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Categorias</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setCategoriaModal({isOpen:true, categoria:null, isEditing:false})} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: theme?.primary, background: theme?.primary + '15', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}>
                <Plus size={12} /> Nova
              </button>
              <button onClick={() => setManageCatsModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: theme?.textSoft, background: theme?.surface2 || '#f1f5f9', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}>
                <Settings2 size={12} /> Gerenciar
              </button>
            </div>
          </div>

          <MobileCategoriesScroll theme={theme}>
            <MobileCatBtn $active={activeCategoryIds.length === 0} theme={theme} onClick={() => setActiveCategoryIds([])}>
              <span style={{width:6,height:6,borderRadius:'50%',background:activeCategoryIds.length === 0 ? '#fff' : theme?.textSoft,display:'inline-block',flexShrink:0}} />
              Todas <span style={{ opacity: 0.7, fontSize: '11px' }}>({itens.length})</span>
            </MobileCatBtn>
            {categorias.map(cat => {
              const catHex = hslStringToHex(cat.bg);
              const isAct = activeCategoryIds.includes(cat.id);
              return (
                <div key={cat.id} style={{ position: 'relative', flexShrink: 0 }}>
                  <MobileCatBtn
                    $active={isAct}
                    theme={theme}
                    onClick={() => {
                      if (isAct) setActiveCategoryIds(activeCategoryIds.filter(id => id !== cat.id));
                      else setActiveCategoryIds([...activeCategoryIds, cat.id]);
                    }}
                    style={!isAct ? { borderColor: catHex + '60' } : {}}
                  >
                    <span style={{width:6,height:6,borderRadius:'50%',background: isAct ? '#fff' : catHex,display:'inline-block',flexShrink:0}} />
                    {cat.nome}
                    <span style={{ opacity: 0.7, fontSize: '11px' }}>({itens.filter(i => i.categoriaId === cat.id).length})</span>
                  </MobileCatBtn>
                  {/* Long-press hint: tap MoreVertical to edit/delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenCatMenuId(openCatMenuId === cat.id ? null : cat.id); }}
                    style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', borderRadius: '50%', background: theme?.surface, border: `1px solid ${theme?.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                  >
                    <MoreVertical size={9} color={theme?.textSoft} />
                  </button>
                  {openCatMenuId === cat.id && (
                    <ActionMenu theme={theme} style={{ right: 0, top: '110%', zIndex: 200 }}>
                      <ActionMenuItem theme={theme} onClick={(e) => { e.stopPropagation(); setOpenCatMenuId(null); setCategoriaModal({isOpen:true, categoria:cat, isEditing:true}); }}>
                        <Edit2 size={13} /> Editar
                      </ActionMenuItem>
                      <ActionMenuItem theme={theme} $danger onClick={(e) => { e.stopPropagation(); setOpenCatMenuId(null); handleDeleteCategoria(cat.id, cat.nome); }}>
                        <Trash2 size={13} /> Excluir
                      </ActionMenuItem>
                    </ActionMenu>
                  )}
                </div>
              );
            })}
          </MobileCategoriesScroll>
        </div>

        {/* ── 3. SUMÁRIO DA CATEGORIA SELECIONADA ── */}
        {activeCategory && renderCatSummary()}

        {/* ── 4. FILTROS E PESQUISA ── */}
        <PlanejamentoFiltros variant="mobile" {...filtersProps} />

        {/* ── 5. CABEÇALHO DOS ITENS ── */}
        <MobileItemsHeader theme={theme}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: theme?.text }}>
              {activeCategory ? activeCategory.nome : activeCategoryIds.length > 1 ? `${activeCategoryIds.length} categorias` : 'Todos os itens'}
            </div>
            <div style={{ fontSize: '12px', color: theme?.textSoft, fontWeight: 500 }}>
              {itensFiltrados.length} {itensFiltrados.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </MobileItemsHeader>

        {/* ── 6. LISTA DE ITENS ── */}
        <MobileItemsContainer theme={theme}>
          {itensFiltrados.length === 0 ? (
            <EmptyStateContainer style={{ minHeight: '30vh', border: 'none', background: 'transparent', boxShadow: 'none' }}>
              <EmptyStateTitle theme={theme}>Nenhum item</EmptyStateTitle>
              <EmptyStateButton onClick={handleAddItem} theme={theme}>Adicionar Item</EmptyStateButton>
            </EmptyStateContainer>
          ) : (
            itensFiltrados.map(item => renderItemRow(item, true))
          )}
        </MobileItemsContainer>

        {/* ── 7. FAB: Adicionar Item ── */}
        <MobileFab theme={theme} onClick={handleAddItem}>
          <Plus size={24} />
        </MobileFab>

      </MobileLayout>

      {/* Modais */}
      <ItemFormModal
        isOpen={itemModal.isOpen}
        onClose={() => setItemModal({isOpen:false, categoriaId:null, itemId:null})}
        onSave={handleSaveItem}
        isEditing={!!itemModal.itemId}
        theme={theme}
        categoriaId={itemModal.categoriaId}
        itemParaEditar={itemModal.itemId ? itens.find(i => i.id === itemModal.itemId) : null}
        categorias={categorias}
      />

      <CategoriaFormModal
        isOpen={categoriaModal.isOpen}
        onClose={() => setCategoriaModal({isOpen:false, categoria:null, isEditing:false})}
        onCategoryAdded={handleCategoryAdded}
        onDeleteCategoria={handleDeleteCategoria}
        categoriaParaEditar={categoriaModal.categoria}
        isEditing={categoriaModal.isEditing}
        theme={theme}
        existingCategories={categorias}
        itensDaCategoria={categoriaModal.categoria ? itens.filter(i => i.categoriaId === categoriaModal.categoria.id) : []}
      />

      <CategoryManagementModal
        isOpen={manageCatsModal}
        onClose={() => setManageCatsModal(false)}
        categories={categorias}
        onCategoryAdded={handleCategoryAdded}
        onDeleteCategory={handleDeleteCategoria}
        itens={itens}
        theme={theme}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        theme={theme}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(m => ({ ...m, isOpen: false }))}
      />
    </PlanejamentoContainer>

  );
};

export default Planejamento;