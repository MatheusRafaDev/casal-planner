// CategoriaCard.jsx - VERSÃO COM SERVIÇO DE LOGO

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Store,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import { useItemActions } from "../hooks/useItemActions";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { formatarMoeda, getPaymentIcon } from "../utils/formatters";
import storeLogoService from "../services/storeLogoService";
import * as S from "../styles/components/CategoriaCardStyles";

const isAddedToday = (createdAt) => {
  if (!createdAt) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addedDate = new Date(createdAt);
  addedDate.setHours(0, 0, 0, 0);

  return addedDate.getTime() === today.getTime();
};

const StoreLogo = ({ storeName, size = "small" }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLogo = async () => {
      if (!storeName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const url = await storeLogoService.getLogoUrl(
          storeName,
          size === "small" ? 16 : 32,
        );
        if (isMounted && url) {
          setLogoUrl(url);
        } else if (isMounted) {
          setError(true);
        }
      } catch (err) {
        console.error("Erro ao carregar logo:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadLogo();

    return () => {
      isMounted = false;
    };
  }, [storeName, size]);

  if (loading) {
    return (
      <S.StoreIconFallback size={size}>
        <Store size={size === "small" ? 12 : 16} />
      </S.StoreIconFallback>
    );
  }

  if (error || !logoUrl) {
    return (
      <S.StoreIconFallback size={size}>
        <Store size={size === "small" ? 12 : 16} />
      </S.StoreIconFallback>
    );
  }

  return (
    <S.StoreLogoImage
      src={logoUrl}
      alt={storeName}
      size={size}
      onError={() => setError(true)}
    />
  );
};

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
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const { handleToggleComprado, handleDeleteItem, handleEditItem } =
    useItemActions(theme, onToggleComprado, onUpdateItem, onDeleteItem);

  const { handleDeleteCategoria, handleEditCategoria } = useCategoryActions(
    categoria,
    itens,
    theme,
    onDeleteCategoria,
    onEditCategoria,
  );

  const totalCategoria = useMemo(
    () =>
      itens.reduce((acc, item) => acc + (item.preco * item.quantidade || 0), 0),
    [itens],
  );

  const itensComprados = itens.filter((item) => item.comprado).length;
  const progresso =
    itens.length > 0 ? (itensComprados / itens.length) * 100 : 0;

  const totalGasto = useMemo(
    () =>
      itens
        .filter((item) => item.comprado)
        .reduce((acc, item) => acc + (item.preco * item.quantidade || 0), 0),
    [itens],
  );

  const handleOpenProductLink = (e, linkProduto) => {
    e.stopPropagation();
    if (linkProduto) {
      window.open(linkProduto, "_blank", "noopener,noreferrer");
    }
  };

  const handleItemDragStart = (e, itemId) => {
    e.stopPropagation();
    onItemDragStart(itemId);
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleItemDragEnd = () => {
    onItemDragEnd();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) {
      onItemDrop(categoria.id);
    }
  };

  return (
    <S.CardContainer
      theme={theme}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      $isDragOver={isDragOver}
    >
      <S.CardHeader color={categoria.bg} theme={theme}>
        <S.HeaderLeft>
          <S.DragHandle theme={theme}>
            <GripVertical size={16} />
          </S.DragHandle>
          <S.Icon theme={theme}>{categoria.icon}</S.Icon>
          <S.TitleSection>
            <S.Title theme={theme} title={categoria.nome}>
              {categoria.nome}
            </S.Title>
            <S.Subtitle>
              <S.ItemsCount theme={theme}>
                {itens.length} {itens.length === 1 ? "item" : "itens"}
              </S.ItemsCount>
              <S.TotalValue theme={theme}>
                {formatarMoeda(totalCategoria)}
              </S.TotalValue>
            </S.Subtitle>
          </S.TitleSection>
        </S.HeaderLeft>

        <S.HeaderActions>
          <S.IconButton
            onClick={() => onAddItem(categoria.id)}
            theme={theme}
            title="Adicionar item"
          >
            <Plus size={18} />
          </S.IconButton>
          <S.IconButton
            onClick={handleEditCategoria}
            theme={theme}
            title="Editar categoria"
          >
            <Pencil size={16} />
          </S.IconButton>
          {!categoria.isPadrao && (
            <S.IconButton
              danger
              onClick={handleDeleteCategoria}
              theme={theme}
              title="Excluir categoria"
            >
              <Trash2 size={16} />
            </S.IconButton>
          )}
          <S.ExpandButton
            onClick={() => setIsExpanded(!isExpanded)}
            theme={theme}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </S.ExpandButton>
        </S.HeaderActions>
      </S.CardHeader>

      <S.CategoryProgress>
        <S.ProgressBar theme={theme}>
          <S.ProgressFill
            theme={theme}
            style={{ width: `${progresso}%` }}
            color={categoria.bg}
          />
        </S.ProgressBar>
      </S.CategoryProgress>

      <S.CardContent>
        {isExpanded && (
          <>
            {itens.length > 0 && (
              <S.ItemsList>
                {itens.map((item) => (
                  <S.ItemRow
                    key={item.id}
                    $purchased={item.comprado}
                    theme={theme}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, item.id)}
                    onDragEnd={handleItemDragEnd}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    $isDragging={draggedItemId === item.id}
                    $isHovered={hoveredItemId === item.id}
                  >
                    <S.ItemMainRow>
                      <S.DragHandleItem
                        className="item-drag-handle"
                        theme={theme}
                      >
                        <GripVertical size={14} />
                      </S.DragHandleItem>

                      <S.CheckboxButton
                        $checked={item.comprado}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComprado(item.id, item.comprado);
                        }}
                        theme={theme}
                      >
                        {item.comprado && <S.CheckIcon />}
                      </S.CheckboxButton>

                      <S.ItemNameSection>
                        <S.ItemName
                          $purchased={item.comprado}
                          theme={theme}
                          title={item.nome}
                        >
                          {item.nome}
                        </S.ItemName>
                        {isAddedToday(item.createdAt) && (
                          <S.NewBadge>Novo</S.NewBadge>
                        )}
                        {item.marca && (
                          <S.ItemBrand theme={theme} title={item.marca}>
                            {item.marca}
                          </S.ItemBrand>
                        )}
                      </S.ItemNameSection>

                      <S.ItemTotalCompact>
                        <S.ItemTotalValueCompact theme={theme}>
                          {formatarMoeda(item.preco * item.quantidade)}
                        </S.ItemTotalValueCompact>
                      </S.ItemTotalCompact>
                    </S.ItemMainRow>

                    <S.ItemDetailsRow>
                      <S.ItemDetailsLeft>
                        <S.ItemQuantityBadge theme={theme}>
                          <ShoppingBag size={12} />
                          <span>{item.quantidade}x</span>
                        </S.ItemQuantityBadge>

                        <S.ItemPriceBadge theme={theme}>
                          {formatarMoeda(item.preco)}/un
                        </S.ItemPriceBadge>

                        {item.loja && (
                          <S.StoreBadge theme={theme}>
                            <StoreLogo storeName={item.loja} size="small" />
                            <S.StoreName theme={theme} title={item.loja}>
                              {item.loja.length > 25
                                ? item.loja.substring(0, 25) + "..."
                                : item.loja}
                            </S.StoreName>
                          </S.StoreBadge>
                        )}

                        <S.PaymentBadge $type={item.pagamento} theme={theme}>
                          {getPaymentIcon(item.pagamento)}
                          <span>
                            {item.pagamento === "vr" ? "VR/VA" : "Normal"}
                          </span>
                        </S.PaymentBadge>
                      </S.ItemDetailsLeft>

                      <S.ItemActions>
                        {item.linkProduto && (
                          <S.ItemActionButton
                            onClick={(e) =>
                              handleOpenProductLink(e, item.linkProduto)
                            }
                            theme={theme}
                            variant="link"
                            title="Ver na loja"
                          >
                            <ExternalLink size={14} />
                          </S.ItemActionButton>
                        )}

                        <S.ItemActionButton
                          onClick={() => handleEditItem(item)}
                          theme={theme}
                          variant="edit"
                          title="Editar item"
                        >
                          <Pencil size={14} />
                        </S.ItemActionButton>

                        <S.ItemActionButton
                          variant="delete"
                          onClick={() => handleDeleteItem(item)}
                          theme={theme}
                          title="Excluir item"
                        >
                          <Trash2 size={14} />
                        </S.ItemActionButton>
                      </S.ItemActions>
                    </S.ItemDetailsRow>
                  </S.ItemRow>
                ))}
              </S.ItemsList>
            )}

            {itens.length === 0 && (
              <S.EmptyState>
                <S.EmptyIcon>📦</S.EmptyIcon>
                <S.EmptyText theme={theme}>Nenhum item adicionado</S.EmptyText>
                <S.AddButton
                  onClick={() => onAddItem(categoria.id)}
                  theme={theme}
                >
                  <Plus size={18} />
                  Adicionar primeiro item
                </S.AddButton>
              </S.EmptyState>
            )}
          </>
        )}
      </S.CardContent>

      <S.CategoryFooter theme={theme}>
        <S.CategoryStats>
          <S.StatItem theme={theme}>
            <span>📦 Comprados:</span>
            <strong>
              {itensComprados}/{itens.length}
            </strong>
          </S.StatItem>
          <S.StatItem theme={theme}>
            <span>📊 Progresso:</span>
            <strong>{progresso.toFixed(0)}%</strong>
          </S.StatItem>
          <S.StatItem theme={theme}>
            <span>💰 Gasto:</span>
            <strong>{formatarMoeda(totalGasto)}</strong>
          </S.StatItem>
        </S.CategoryStats>
      </S.CategoryFooter>
    </S.CardContainer>
  );
};

export default CategoriaCard;
