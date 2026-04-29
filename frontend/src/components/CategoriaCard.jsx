// CategoriaCard.jsx — layout mobile corrigido, texto completo, sem fundos pretos

import React, { useState, useMemo, useCallback, memo } from "react";
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
} from "lucide-react";
import { useItemActions } from "../hooks/useItemActions";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { formatarMoeda, getPaymentIcon } from "../utils/formatters";
import storeLogoService from "../services/storeLogoService";
import * as S from "../styles/components/CategoriaCardStyles";

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

const isAddedToday = (createdAt) => {
  if (!createdAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const added = new Date(createdAt);
  added.setHours(0, 0, 0, 0);
  return added.getTime() === today.getTime();
};

// StoreLogo — síncrono, sem loading state
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

// Item individual memoizado
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
    const prioridadeConfig =
      PRIORIDADE_CONFIG[item.prioridade] || PRIORIDADE_CONFIG.normal;
    const disabled = isLoading || isSaving;

    const handleOpenLink = useCallback(
      (e) => {
        e.stopPropagation();
        if (item.linkProduto)
          window.open(item.linkProduto, "_blank", "noopener,noreferrer");
      },
      [item.linkProduto],
    );

    const handleDragStart = useCallback(
      (e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
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
      (e) => {
        e.stopPropagation();
        onDragEnd();
      },
      [onDragEnd],
    );

    return (
      <S.ItemRow
        $purchased={item.comprado}
        $priority={item.prioridade}
        theme={theme}
        $isDragging={draggedItemId === String(item.id)}
        draggable={!disabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ── Linha 1: checkbox · nome · preço · ações ── */}
        <S.ItemMainRow>
          <S.CheckboxButton
            $checked={item.comprado}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComprado(item.id);
            }}
            theme={theme}
            disabled={disabled}
          >
            {item.comprado && <S.CheckIcon />}
          </S.CheckboxButton>

          {/* FIX: texto completo, sem title/truncate */}
          <S.ItemName $purchased={item.comprado} theme={theme}>
            {item.nome}
          </S.ItemName>

          <S.ItemTotalCompact>
            <S.ItemTotalValueCompact theme={theme}>
              {formatarMoeda(item.preco * item.quantidade)}
            </S.ItemTotalValueCompact>
          </S.ItemTotalCompact>

          <S.ItemActions>
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
              onClick={() => onEditItem(item)}
              theme={theme}
              variant="edit"
              disabled={disabled}
              title="Editar"
            >
              <Pencil size={13} />
            </S.ItemActionButton>
            <S.ItemActionButton
              variant="delete"
              onClick={() => onDeleteItem(item)}
              theme={theme}
              disabled={disabled}
              title="Excluir"
            >
              <Trash2 size={13} />
            </S.ItemActionButton>
          </S.ItemActions>
        </S.ItemMainRow>

        {/* ── Linha 2: badges em flex-wrap — sem campos pretos ── */}
        <S.ItemDetailsRow>
          {/* prioridade */}
          <S.PriorityBadgeFull
            $color={prioridadeConfig.color}
            $bgColor={prioridadeConfig.bgColor}
            theme={theme}
          >
            {prioridadeConfig.emoji} {prioridadeConfig.label}
          </S.PriorityBadgeFull>

          {/* badge novo */}
          {isAddedToday(item.createdAt) && <S.NewBadge>Novo</S.NewBadge>}

          {/* quantidade */}
          <S.ItemQuantityBadge theme={theme}>
            <ShoppingBag size={10} />
            {item.quantidade}x
          </S.ItemQuantityBadge>

          {/* preço unitário */}
          <S.ItemPriceBadge theme={theme}>
            {formatarMoeda(item.preco)}/un
          </S.ItemPriceBadge>

          {/* loja */}
          {item.loja && (
            <S.StoreBadge theme={theme}>
              <StoreLogo storeName={item.loja} size="small" />
              <S.StoreName theme={theme}>
                {item.loja.length > 16 ? item.loja.substring(0, 16) + "…" : item.loja}
              </S.StoreName>
            </S.StoreBadge>
          )}

          {/* pagamento */}
          <S.PaymentBadge $type={item.pagamento} theme={theme}>
            {getPaymentIcon(item.pagamento)}
            {item.pagamento === "vr" ? " VR/VA" : " Normal"}
          </S.PaymentBadge>

          {/* marca */}
          {item.marca && (
            <S.ItemBrand theme={theme}>{item.marca}</S.ItemBrand>
          )}
        </S.ItemDetailsRow>
      </S.ItemRow>
    );
  },
);

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

  const { handleToggleComprado, handleDeleteItem, handleEditItem } =
    useItemActions(theme, onToggleComprado, onUpdateItem, onDeleteItem);
  const { handleDeleteCategoria, handleEditCategoria } = useCategoryActions(
    categoria,
    itens,
    theme,
    onDeleteCategoria,
    onEditCategoria,
  );

  const itensOrdenados = useMemo(() => {
    const sorted = [...itens];
    const prioridadeOrdem = { urgente: 0, normal: 1, pode_esperar: 2 };
    if (sortBy === "prioridade") {
      sorted.sort((a, b) => {
        const d =
          (prioridadeOrdem[a.prioridade] ?? 1) -
          (prioridadeOrdem[b.prioridade] ?? 1);
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
    }
    return sorted;
  }, [itens, sortBy, sortOrder]);

  const totalCategoria = useMemo(
    () => itens.reduce((acc, i) => acc + (i.preco * i.quantidade || 0), 0),
    [itens],
  );
  const itensComprados = itens.filter((i) => i.comprado).length;
  const progresso = itens.length > 0 ? (itensComprados / itens.length) * 100 : 0;
  const totalGasto = useMemo(
    () =>
      itens
        .filter((i) => i.comprado)
        .reduce((acc, i) => acc + (i.preco * i.quantidade || 0), 0),
    [itens],
  );
  const percentMeta =
    categoria.metaOrcamento > 0
      ? (totalCategoria / categoria.metaOrcamento) * 100
      : 0;
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

  const handleAddItem = useCallback(async () => {
    if (isLoading || isSaving) return;
    setIsSaving(true);
    try {
      await onAddItem(categoria.id);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [isLoading, isSaving, onAddItem, categoria.id]);

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
      if (itemId) onItemDrop(categoria.id);
    },
    [onItemDrop, categoria.id],
  );

  const disabled = isLoading || isSaving;

  return (
    <S.CardContainer
      theme={theme}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      $isDragOver={isDragOver}
    >
      {/* ── Header ── */}
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
              <S.TotalValue theme={theme}>
                {formatarMoeda(totalCategoria)}
              </S.TotalValue>
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
          <S.IconButton
            onClick={handleAddItem}
            theme={theme}
            title="Adicionar item"
            disabled={disabled}
          >
            <Plus size={18} />
          </S.IconButton>
          <S.IconButton
            onClick={handleEditCategoria}
            theme={theme}
            title="Editar categoria"
            disabled={disabled}
          >
            <Pencil size={16} />
          </S.IconButton>
          <S.IconButton
            danger
            onClick={handleDeleteCategoria}
            theme={theme}
            title="Excluir categoria"
            disabled={disabled}
          >
            <Trash2 size={16} />
          </S.IconButton>
          <S.ExpandButton
            onClick={() => setIsExpanded((p) => !p)}
            theme={theme}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </S.ExpandButton>
        </S.HeaderActions>
      </S.CardHeader>

      {/* ── Conteúdo ── */}
      <S.CardContent>
        {isExpanded && (
          <>
            {/* Sort bar */}
            {itens.length > 0 && (
              <S.SortBar theme={theme}>
                <S.SortLabel theme={theme}>Ordenar:</S.SortLabel>
                <S.SortButtonsGroup>
                  {[
                    { field: "preco", label: "Preço", emoji: "💰" },
                    { field: "nome", label: "Nome", emoji: "📝" },
                    { field: "prioridade", label: "Prioridade", emoji: "🎯" },
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
                          {sortOrder === "asc" ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )}
                        </S.SortIcon>
                      )}
                    </S.SortButton>
                  ))}
                </S.SortButtonsGroup>
              </S.SortBar>
            )}

            {/* Progress bar */}
            <S.CategoryProgress theme={theme}>
              <S.ProgressBar theme={theme}>
                <S.ProgressFill
                  theme={theme}
                  style={{ width: `${progresso}%` }}
                  color={categoria.bg}
                />
              </S.ProgressBar>
            </S.CategoryProgress>

            {/* Lista ou skeleton ou vazio */}
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
                    onToggleComprado={handleToggleComprado}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    onDragStart={onItemDragStart}
                    onDragEnd={onItemDragEnd}
                    theme={theme}
                  />
                ))}
              </S.ItemsList>
            ) : (
              <S.EmptyState>
                <S.EmptyIcon>📦</S.EmptyIcon>
                <S.EmptyText theme={theme}>Nenhum item adicionado</S.EmptyText>
                <S.AddButton onClick={handleAddItem} theme={theme} disabled={disabled}>
                  <Plus size={16} />
                  Adicionar primeiro item
                </S.AddButton>
              </S.EmptyState>
            )}
          </>
        )}
      </S.CardContent>

      {/* ── Footer ── */}
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
  );
};

export default memo(CategoriaCard);