// CategoriaCard.jsx — versão final com seu ItemFormModal
import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Store,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  Filter,
  X,
  MoreHorizontal,
} from "lucide-react";
import { formatarMoeda, getPaymentIcon } from "../utils/formatters";
import storeLogoService from "../services/storeLogoService";
import ItemFormModal from "./ItemFormModal"; // ✅ Importa seu modal existente
import * as S from "../styles/components/CategoriaCardStyles";

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const PRIORIDADE_CONFIG = {
  urgente: {
    label: "Urgente",
    emoji: "🔴",
    color: "#ef4444",
    bgColor: "#ef444418",
    icon: AlertCircle,
  },
  normal: {
    label: "Normal",
    emoji: "🟡",
    color: "#f59e0b",
    bgColor: "#f59e0b18",
    icon: Clock,
  },
  pode_esperar: {
    label: "Pode esperar",
    emoji: "🟢",
    color: "#22c55e",
    bgColor: "#22c55e18",
    icon: CheckCircle,
  },
};

const DATA_FILTROS = {
  todos: { label: "Todos", emoji: "📅", dias: null },
  hoje: { label: "Hoje", emoji: "🌅", dias: 0 },
  ultimos7: { label: "Últimos 7 dias", emoji: "📆", dias: 7 },
  ultimos30: { label: "Últimos 30 dias", emoji: "📅", dias: 30 },
  esteMes: { label: "Este mês", emoji: "📊", tipo: "mes" },
};

const isAddedInRange = (createdAt, filtro) => {
  if (!createdAt || filtro === "todos") return true;
  if (filtro === "esteMes") {
    const data = new Date(createdAt);
    const agora = new Date();
    return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
  }
  if (DATA_FILTROS[filtro]?.dias !== undefined && DATA_FILTROS[filtro].dias !== null) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date(hoje);
    limite.setDate(hoje.getDate() - DATA_FILTROS[filtro].dias);
    const dataItem = new Date(createdAt);
    dataItem.setHours(0, 0, 0, 0);
    return dataItem >= limite;
  }
  return true;
};

const isAddedToday = (createdAt) => {
  if (!createdAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const added = new Date(createdAt);
  added.setHours(0, 0, 0, 0);
  return added.getTime() === today.getTime();
};

// ─── MenuItem ────────────────────────────────────────────────────────────────
const MenuItem = memo(({ icon: Icon, label, onClick, color, hoverBg, theme }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        cursor: "pointer",
        transition: "background 0.2s ease",
        background: isHovered ? hoverBg : "transparent",
        color: color,
        fontSize: "14px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );
});

// ─── ContextMenu ─────────────────────────────────────────────────────────────
const ContextMenu = memo(({ anchorRef, item, onClose, onEdit, onDelete, onOpenLink, theme }) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x: -9999, y: -9999 });
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useRef(isMobileDevice());

  const calculatePosition = useCallback(() => {
    if (!anchorRef?.current || !menuRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spacing = 8;
    const edgePadding = 8;

    let x = anchorRect.right + spacing;
    let y = anchorRect.top;

    if (x + menuRect.width > viewportWidth - edgePadding) {
      x = anchorRect.left - menuRect.width - spacing;
    }

    if (y + menuRect.height > viewportHeight - edgePadding) {
      y = viewportHeight - menuRect.height - edgePadding;
    }

    if (y < edgePadding) {
      y = anchorRect.bottom + spacing;
    }

    x = Math.max(edgePadding, Math.min(x, viewportWidth - menuRect.width - edgePadding));
    y = Math.max(edgePadding, y);

    setPosition({ x, y });
  }, [anchorRef]);

  useEffect(() => {
    if (!anchorRef?.current) return;
    const timer = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, [anchorRef, calculatePosition]);

  useEffect(() => {
    if (!isVisible) return;
    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, calculatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const delay = isMobile.current ? 100 : 0;

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, delay);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible, onClose, anchorRef]);

  const isDark = theme?.mode === "dark" || theme?.background === "#1a1a2e";

  const colors = {
    background: isDark ? "#2d2d3a" : (theme?.surface || "#ffffff"),
    border: isDark ? "#4a4a5a" : (theme?.border || "#e5e7eb"),
    text: isDark ? "#e5e5e5" : (theme?.text || "#374151"),
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    hover: isDark ? "#3d3d4a" : (theme?.border || "#f3f4f6"),
    danger: "#ef4444",
    dangerHover: isDark ? "#ef444428" : "#ef444418",
    divider: isDark ? "#40404f" : "#e5e7eb",
  };

  const menuItems = [
    {
      icon: Pencil,
      label: "Editar item",
      onClick: () => {
        onEdit();
        setTimeout(onClose, 0);
      },
      color: colors.text,
      hoverBg: colors.hover,
    },
    {
      icon: Trash2,
      label: "Excluir item",
      onClick: () => {
        onDelete();
        setTimeout(onClose, 0);
      },
      color: colors.danger,
      hoverBg: colors.dangerHover,
    },
  ];

  if (item.linkProduto) {
    menuItems.push({
      icon: ExternalLink,
      label: "Abrir link",
      onClick: () => {
        onOpenLink();
        setTimeout(onClose, 0);
      },
      color: colors.text,
      hoverBg: colors.hover,
    });
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 10000,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.95)",
        transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
        visibility: position.x !== -9999 ? "visible" : "hidden",
      }}
    >
      <div
        style={{
          background: colors.background,
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          padding: "8px 0",
          minWidth: isMobile.current ? "180px" : "160px",
          maxWidth: "280px",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((menuItem) => (
          <MenuItem
            key={menuItem.label}
            icon={menuItem.icon}
            label={menuItem.label}
            onClick={menuItem.onClick}
            color={menuItem.color}
            hoverBg={menuItem.hoverBg}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
});

// ─── StoreLogo ───────────────────────────────────────────────────────────────
const StoreLogo = memo(({ storeName, size = "small" }) => {
  const [error, setError] = useState(false);
  const iconSize = size === "small" ? 12 : 16;

  if (!storeName || error) {
    return (
      <S.StoreIconFallback size={size} theme={{}}>
        <Store size={iconSize} />
      </S.StoreIconFallback>
    );
  }

  const logoUrl = storeLogoService.getLogoUrl(storeName, size === "small" ? 16 : 32);

  return (
    <S.StoreLogoImage
      src={logoUrl}
      alt={storeName}
      size={size}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
});

// ─── ItemCard ─────────────────────────────────────────────────────────────────
const ItemCard = memo(
  ({
    item,
    isLoading,
    isSaving,
    draggedItemId,
    onToggleComprado,
    onEditItem,
    onDeleteItem,
    onDragStart,
    onDragEnd,
    theme,
  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuButtonRef = useRef(null);

    const prioridadeConfig = PRIORIDADE_CONFIG[item.prioridade] || PRIORIDADE_CONFIG.normal;
    const disabled = isLoading || isSaving;

    const formatarData = (dataISO) => {
      if (!dataISO) return null;
      const data = new Date(dataISO);
      return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    };

    const handleOpenLink = useCallback(() => {
      if (item.linkProduto) window.open(item.linkProduto, "_blank", "noopener,noreferrer");
    }, [item.linkProduto]);

    const handleCloseMenu = useCallback(() => {
      setIsMenuOpen(false);
    }, []);

    const handleEditClick = useCallback(() => {
      onEditItem(item);
    }, [onEditItem, item]);

    const handleDeleteClick = useCallback(() => {
      onDeleteItem(item.id);
    }, [onDeleteItem, item.id]);

    const handleDragStart = useCallback(
      (e) => {
        if (disabled) { e.preventDefault(); return; }
        e.stopPropagation();
        const itemId = String(item.id);
        e.dataTransfer.setData("text/plain", itemId);
        e.dataTransfer.effectAllowed = "move";

        if (e.dataTransfer.setDragImage) {
          const dragIcon = document.createElement("div");
          dragIcon.textContent = "📦";
          dragIcon.style.position = "absolute";
          dragIcon.style.top = "-1000px";
          document.body.appendChild(dragIcon);
          e.dataTransfer.setDragImage(dragIcon, 0, 0);
          setTimeout(() => document.body.removeChild(dragIcon), 0);
        }

        onDragStart(itemId);
      },
      [disabled, item.id, onDragStart],
    );

    const handleDragEnd = useCallback(
      (e) => { e.stopPropagation(); onDragEnd(); },
      [onDragEnd],
    );

    const toggleMenu = useCallback((e) => {
      e.stopPropagation();
      setIsMenuOpen((prev) => !prev);
    }, []);

    return (
      <>
        <S.ItemRow
          $purchased={item.comprado}
          $priority={item.prioridade}
          theme={theme}
          $isDragging={draggedItemId === String(item.id)}
          draggable={!disabled}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <S.ItemMainRow>
            <S.CheckboxButton
              $checked={item.comprado}
              onClick={(e) => { e.stopPropagation(); onToggleComprado(item.id); }}
              theme={theme}
              disabled={disabled}
            >
              {item.comprado && <S.CheckIcon />}
            </S.CheckboxButton>

            <S.ItemName $purchased={item.comprado} theme={theme}>
              {item.nome}
            </S.ItemName>

            <S.ItemTotalCompact>
              <S.ItemTotalValueCompact theme={theme}>
                {formatarMoeda(item.preco * item.quantidade)}
              </S.ItemTotalValueCompact>
            </S.ItemTotalCompact>

            {/* Botões para DESKTOP */}
            <S.ItemActionsDesktop>
              {item.linkProduto && (
                <S.ItemActionButton
                  onClick={handleOpenLink}
                  theme={theme}
                  variant="link"
                  disabled={disabled}
                  title="Abrir link"
                >
                  <ExternalLink size={13} />
                </S.ItemActionButton>
              )}
              <S.ItemActionButton
                onClick={handleEditClick}
                theme={theme}
                variant="edit"
                disabled={disabled}
                title="Editar"
              >
                <Pencil size={13} />
              </S.ItemActionButton>
              <S.ItemActionButton
                variant="delete"
                onClick={handleDeleteClick}
                theme={theme}
                disabled={disabled}
                title="Excluir"
              >
                <Trash2 size={13} />
              </S.ItemActionButton>
            </S.ItemActionsDesktop>

            {/* Botão de menu para MOBILE */}
            <S.ItemActionsMobile>
              <S.ItemActionButton
                ref={menuButtonRef}
                onClick={toggleMenu}
                theme={theme}
                variant="menu"
                disabled={disabled}
                title="Menu"
              >
                <MoreHorizontal size={16} />
              </S.ItemActionButton>
            </S.ItemActionsMobile>
          </S.ItemMainRow>

          <S.ItemDetailsRow>
            <S.PriorityBadgeFull
              $color={prioridadeConfig.color}
              $bgColor={prioridadeConfig.bgColor}
              theme={theme}
            >
              {prioridadeConfig.emoji} {prioridadeConfig.label}
            </S.PriorityBadgeFull>

            {item.createdAt && (
              <S.DateBadge theme={theme}>
                <Calendar size={10} />
                {formatarData(item.createdAt)}
              </S.DateBadge>
            )}

            {isAddedToday(item.createdAt) && <S.NewBadge>Novo</S.NewBadge>}

            <S.ItemQuantityBadge theme={theme}>
              <ShoppingBag size={10} />
              {item.quantidade}x
            </S.ItemQuantityBadge>

            <S.ItemPriceBadge theme={theme}>
              {formatarMoeda(item.preco)}/un
            </S.ItemPriceBadge>

            {item.loja && (
              <S.StoreBadge theme={theme}>
                <StoreLogo storeName={item.loja} size="small" />
                <S.StoreName theme={theme}>
                  {item.loja.length > 16 ? item.loja.substring(0, 16) + "…" : item.loja}
                </S.StoreName>
              </S.StoreBadge>
            )}

            <S.PaymentBadge $type={item.pagamento} theme={theme}>
              {getPaymentIcon(item.pagamento)}
              {item.pagamento === "vr" ? " VR/VA" : " Normal"}
            </S.PaymentBadge>

            {item.marca && <S.ItemBrand theme={theme}>{item.marca}</S.ItemBrand>}
          </S.ItemDetailsRow>
        </S.ItemRow>

        {isMenuOpen && (
          <ContextMenu
            anchorRef={menuButtonRef}
            item={item}
            onClose={handleCloseMenu}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onOpenLink={handleOpenLink}
            theme={theme}
          />
        )}
      </>
    );
  },
);

// ─── CategoriaCard ────────────────────────────────────────────────────────────
const CategoriaCard = ({
  categoria,
  itens,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onDeleteCategoria,
  onEditCategoria,
  onItemDragStart,
  onItemDragEnd,
  onItemDrop,
  draggedItemId,
  theme,
  onToggleComprado,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sortBy, setSortBy] = useState("preco");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isSaving, setIsSaving] = useState(false);
  const [dataFiltro, setDataFiltro] = useState("todos");
  const [showFiltroData, setShowFiltroData] = useState(false);
  
  // Estados para o modal de item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const handleDeleteCategoria = useCallback(async () => {
    if (isLoading || isSaving) return;
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      await onDeleteCategoria(categoria.id);
    }
  }, [categoria.id, categoria.nome, isLoading, isSaving, onDeleteCategoria]);

  const handleEditCategoria = useCallback(async () => {
    if (isLoading || isSaving) return;
    await onEditCategoria(categoria.id);
  }, [categoria.id, isLoading, isSaving, onEditCategoria]);

  // Função para abrir modal de edição de item
  const handleEditItem = useCallback((item) => {
    setEditingItem(item);
    setIsEditingMode(true);
    setIsItemModalOpen(true);
  }, []);

  // Função para abrir modal de criação de item
  const handleAddItemClick = useCallback(async () => {
    if (isLoading || isSaving) return;
    setEditingItem(null);
    setIsEditingMode(false);
    setIsItemModalOpen(true);
  }, [isLoading, isSaving]);

  // Função para fechar o modal
  const handleCloseItemModal = useCallback(() => {
    setIsItemModalOpen(false);
    setEditingItem(null);
    setIsEditingMode(false);
  }, []);

  // Função para salvar o item (criação ou edição)
  const handleSaveItem = useCallback(async (dadosParaEnvio) => {
    if (isEditingMode && editingItem) {
      // Edição: passa o ID e os dados
      await onUpdateItem(editingItem.id, dadosParaEnvio);
    } else {
      // Criação: passa o ID da categoria e os dados
      await onAddItem(categoria.id, dadosParaEnvio);
    }
  }, [isEditingMode, editingItem, onUpdateItem, onAddItem, categoria.id]);

  // Função para deletar item com confirmação
  const handleDeleteItemLocal = useCallback(async (itemId) => {
    if (isLoading || isSaving) return;
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      await onDeleteItem(itemId);
    }
  }, [isLoading, isSaving, onDeleteItem]);

  // Função para alternar comprado
  const handleToggleCompradoLocal = useCallback(async (itemId) => {
    if (isLoading || isSaving) return;
    const item = itens.find(i => i.id === itemId);
    if (item) {
      await onToggleComprado(itemId, !item.comprado);
    }
  }, [isLoading, isSaving, itens, onToggleComprado]);

  const itensFiltradosPorData = useMemo(() => {
    if (dataFiltro === "todos") return itens;
    return itens.filter((item) => isAddedInRange(item.createdAt, dataFiltro));
  }, [itens, dataFiltro]);

  const itensOrdenados = useMemo(() => {
    const sorted = [...itensFiltradosPorData];
    const prioridadeOrdem = { urgente: 0, normal: 1, pode_esperar: 2 };

    if (sortBy === "prioridade") {
      sorted.sort((a, b) => {
        const d = (prioridadeOrdem[a.prioridade] ?? 1) - (prioridadeOrdem[b.prioridade] ?? 1);
        return sortOrder === "asc" ? d : -d;
      });
    } else if (sortBy === "preco") {
      sorted.sort((a, b) => {
        const d = a.preco * a.quantidade - b.preco * b.quantidade;
        return sortOrder === "asc" ? d : -d;
      });
    } else if (sortBy === "nome") {
      sorted.sort((a, b) => {
        const d = a.nome.toLowerCase().localeCompare(b.nome.toLowerCase());
        return sortOrder === "asc" ? d : -d;
      });
    } else if (sortBy === "data") {
      sorted.sort((a, b) => {
        const dataA = new Date(a.createdAt || 0);
        const dataB = new Date(b.createdAt || 0);
        return sortOrder === "asc" ? dataA - dataB : dataB - dataA;
      });
    }

    return sorted;
  }, [itensFiltradosPorData, sortBy, sortOrder]);

  const totalCategoria = useMemo(
    () => itens.reduce((acc, i) => acc + (i.preco * i.quantidade || 0), 0),
    [itens],
  );

  const totalFiltrado = useMemo(
    () => itensFiltradosPorData.reduce((acc, i) => acc + (i.preco * i.quantidade || 0), 0),
    [itensFiltradosPorData],
  );

  const itensComprados = itens.filter((i) => i.comprado).length;
  const progresso = itens.length > 0 ? (itensComprados / itens.length) * 100 : 0;
  const totalGasto = useMemo(
    () => itens.filter((i) => i.comprado).reduce((acc, i) => acc + (i.preco * i.quantidade || 0), 0),
    [itens],
  );
  const percentMeta = categoria.metaOrcamento > 0 ? (totalCategoria / categoria.metaOrcamento) * 100 : 0;
  const excedeuMeta = totalCategoria > categoria.metaOrcamento;
  const proximoLimite = !excedeuMeta && percentMeta >= 80;

  const handleSort = useCallback(
    (field) => {
      if (isLoading || isSaving) return;
      setSortBy((prev) => {
        if (prev === field) {
          setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
          return prev;
        }
        setSortOrder("asc");
        return field;
      });
    },
    [isLoading, isSaving],
  );

  const handleClearSort = useCallback(() => {
    if (isLoading || isSaving) return;
    setSortBy("preco");
    setSortOrder("asc");
  }, [isLoading, isSaving]);

  const hasActiveSort = sortBy !== "preco" || sortOrder !== "asc";

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const itemId = e.dataTransfer.getData("text/plain");
      if (itemId) onItemDrop(categoria.id, itemId);
    },
    [onItemDrop, categoria.id],
  );

  const disabled = isLoading || isSaving;
  const hasFiltroAtivo = dataFiltro !== "todos";
  const itensFiltradosCount = itensFiltradosPorData.length;

  return (
    <>
      <S.CardContainer
        theme={theme}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $isDragOver={isDragOver}
      >
        <S.CardHeader color={categoria.bg} theme={theme}>
          <S.HeaderLeft>
            <S.DragHandle theme={theme} />
            <S.Icon>{categoria.icon}</S.Icon>
            <S.TitleSection>
              <S.Title theme={theme}>{categoria.nome}</S.Title>
              <S.Subtitle>
                <S.ItemsCount theme={theme}>
                  {itens.length} {itens.length === 1 ? "item" : "itens"}
                </S.ItemsCount>
                <S.TotalValue theme={theme}>{formatarMoeda(totalCategoria)}</S.TotalValue>
                {categoria.metaOrcamento > 0 && (
                  <S.MetaBadge
                    $excedeu={excedeuMeta}
                    $proximo={proximoLimite}
                    theme={theme}
                    title={
                      excedeuMeta
                        ? `Excedeu ${formatarMoeda(totalCategoria - categoria.metaOrcamento)}`
                        : `Restam ${formatarMoeda(categoria.metaOrcamento - totalCategoria)}`
                    }
                  >
                    🎯 {formatarMoeda(categoria.metaOrcamento)}
                  </S.MetaBadge>
                )}
              </S.Subtitle>
            </S.TitleSection>
          </S.HeaderLeft>

          <S.HeaderActions>
            <div style={{ position: "relative" }}>
              <S.IconButton
                onClick={() => setShowFiltroData(!showFiltroData)}
                theme={theme}
                title="Filtrar por data"
                disabled={disabled}
                $active={hasFiltroAtivo}
              >
                <Filter size={18} />
              </S.IconButton>

              {showFiltroData && (
                <S.FiltroDataDropdown theme={theme}>
                  <S.FiltroHeader>
                    <span>Filtrar por data</span>
                    <button onClick={() => setShowFiltroData(false)}>
                      <X size={14} />
                    </button>
                  </S.FiltroHeader>
                  {Object.entries(DATA_FILTROS).map(([key, config]) => (
                    <S.FiltroOption
                      key={key}
                      $active={dataFiltro === key}
                      onClick={() => {
                        setDataFiltro(key);
                        setShowFiltroData(false);
                      }}
                      theme={theme}
                    >
                      <span>{config.emoji}</span>
                      {config.label}
                    </S.FiltroOption>
                  ))}
                  {hasFiltroAtivo && (
                    <S.FiltroClear
                      onClick={() => {
                        setDataFiltro("todos");
                        setShowFiltroData(false);
                      }}
                    >
                      Limpar filtro
                    </S.FiltroClear>
                  )}
                </S.FiltroDataDropdown>
              )}
            </div>

            <S.IconButton onClick={handleAddItemClick} theme={theme} title="Adicionar item" disabled={disabled}>
              <Plus size={18} />
            </S.IconButton>
            <S.IconButton onClick={handleEditCategoria} theme={theme} title="Editar categoria" disabled={disabled}>
              <Pencil size={16} />
            </S.IconButton>
            <S.IconButton danger onClick={handleDeleteCategoria} theme={theme} title="Excluir categoria" disabled={disabled}>
              <Trash2 size={16} />
            </S.IconButton>
            <S.ExpandButton onClick={() => setIsExpanded((p) => !p)} theme={theme}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </S.ExpandButton>
          </S.HeaderActions>
        </S.CardHeader>

        <S.CardContent>
          {isExpanded && (
            <>
              {hasFiltroAtivo && (
                <S.FiltroAtivoBadge theme={theme}>
                  <Calendar size={12} />
                  {DATA_FILTROS[dataFiltro]?.label}
                  <button onClick={() => setDataFiltro("todos")}>
                    <X size={12} />
                  </button>
                </S.FiltroAtivoBadge>
              )}

              {itens.length > 0 && (
                <S.SortBar theme={theme}>
                  <S.SortLabel theme={theme}>Ordenar:</S.SortLabel>
                  <S.SortButtonsGroup>
                    {[
                      { field: "preco", label: "Preço", emoji: "💰" },
                      { field: "nome", label: "Nome", emoji: "📝" },
                      { field: "prioridade", label: "Prioridade", emoji: "🎯" },
                      { field: "data", label: "Data", emoji: "📅" },
                    ].map(({ field, label, emoji }) => (
                      <S.SortButton
                        key={field}
                        $active={sortBy === field}
                        onClick={() => handleSort(field)}
                        disabled={disabled}
                        theme={theme}
                      >
                        {emoji} {label}
                        {sortBy === field && (
                          <S.SortIcon>
                            {sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          </S.SortIcon>
                        )}
                      </S.SortButton>
                    ))}
                  </S.SortButtonsGroup>

                  {hasActiveSort && (
                    <S.SortClearButton onClick={handleClearSort} disabled={disabled} theme={theme}>
                      <X size={12} />
                      Limpar
                    </S.SortClearButton>
                  )}
                </S.SortBar>
              )}

              <S.CategoryProgress theme={theme}>
                <S.ProgressBar theme={theme}>
                  <S.ProgressFill theme={theme} style={{ width: `${progresso}%` }} color={categoria.bg} />
                </S.ProgressBar>
              </S.CategoryProgress>

              {hasFiltroAtivo && itensFiltradosCount !== itens.length && (
                <S.FiltroInfo theme={theme}>
                  Mostrando {itensFiltradosCount} de {itens.length} itens
                  {totalFiltrado !== totalCategoria && ` · Total: ${formatarMoeda(totalFiltrado)}`}
                </S.FiltroInfo>
              )}

              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <S.ItemSkeletonWrapper key={n}>
                    <S.ItemSkeleton theme={theme} />
                  </S.ItemSkeletonWrapper>
                ))
              ) : itensOrdenados.length > 0 ? (
                <S.ItemsList>
                  {itensOrdenados.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isLoading={isLoading}
                      isSaving={isSaving}
                      draggedItemId={draggedItemId}
                      onToggleComprado={handleToggleCompradoLocal}
                      onEditItem={handleEditItem}
                      onDeleteItem={handleDeleteItemLocal}
                      onDragStart={onItemDragStart}
                      onDragEnd={onItemDragEnd}
                      theme={theme}
                    />
                  ))}
                </S.ItemsList>
              ) : (
                <S.EmptyState>
                  <S.EmptyIcon>{hasFiltroAtivo ? "🔍" : "📦"}</S.EmptyIcon>
                  <S.EmptyText theme={theme}>
                    {hasFiltroAtivo ? "Nenhum item neste período" : "Nenhum item adicionado"}
                  </S.EmptyText>
                  {!hasFiltroAtivo && (
                    <S.AddButton onClick={handleAddItemClick} theme={theme} disabled={disabled}>
                      <Plus size={16} />
                      Adicionar primeiro item
                    </S.AddButton>
                  )}
                  {hasFiltroAtivo && (
                    <S.AddButton onClick={() => setDataFiltro("todos")} theme={theme}>
                      <X size={16} />
                      Limpar filtro
                    </S.AddButton>
                  )}
                </S.EmptyState>
              )}
            </>
          )}
        </S.CardContent>

        <S.CategoryFooter theme={theme}>
          <S.CategoryStats>
            <S.StatItem theme={theme}>
              <span>📦</span>
              <strong>{itensComprados}/{itens.length}</strong>
              <span>comprados</span>
            </S.StatItem>
            <S.StatItem theme={theme}>
              <span>📊</span>
              <strong>{progresso.toFixed(0)}%</strong>
            </S.StatItem>
            <S.StatItem theme={theme}>
              <span>💰</span>
              <strong>{formatarMoeda(totalGasto)}</strong>
            </S.StatItem>
          </S.CategoryStats>
        </S.CategoryFooter>
      </S.CardContainer>

      {/* Modal de Item - Usando seu componente existente */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        theme={theme}
        itemParaEditar={editingItem}
        isEditing={isEditingMode}
        categoriaId={categoria.id}
      />
    </>
  );
};

export default memo(CategoriaCard);