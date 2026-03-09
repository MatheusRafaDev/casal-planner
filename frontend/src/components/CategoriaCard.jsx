import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { useItemActions } from "../hooks/useItemActions";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { formatarMoeda, getPaymentIcon } from "../utils/formatters";
import {
  CardContainer,
  CardHeader,
  HeaderLeft,
  DragHandle,
  Icon,
  TitleSection,
  Title,
  Subtitle,
  HeaderActions,
  IconButton,
  ItemsList,
  ItemRow,
  ItemLeft,
  ItemDragHandle,
  CheckboxButton,
  CheckIcon,
  ItemInfo,
  ItemName,
  ItemBrand,
  PaymentBadge,
  ItemActions,
  ItemActionButton,
  ItemContent,
  ItemQuantity,
  ItemPrice,
  ItemTotal,
  ItemTotalValue,
  ItemMeta,
  ItemMetaInfo,
  EmptyState,
  EmptyText,
  AddButton,
  ActionGroup,
  CategoryProgress,
  ProgressBar,
  ProgressFill,
  CategoryFooter,
  CategoryStats,
  StatItem,
  ExpandButton,
  ItemsCount,
  TotalValue,
  CardContent,
} from "../styles/components/CategoriaCardStyles";

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
  draggedItem,
  theme,
  onToggleComprado,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);


  const { handleToggleComprado, handleDeleteItem, handleEditItem } =
  useItemActions(
    theme, 
    onToggleComprado, 
    onUpdateItem,     
    onDeleteItem
  );

  const { handleDeleteCategoria: onDeleteCategoriaClick } = useCategoryActions(
    categoria,
    itens,
    theme,
    onDeleteCategoria,
    onEditCategoria,
  );

  const totalCategoria = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0,
  );
  const itensComprados = itens.filter((item) => item.comprado).length;
  const progresso =
    itens.length > 0 ? (itensComprados / itens.length) * 100 : 0;

  useEffect(() => {
    return () => {
      if (isDragging && onItemDragEnd) {
        onItemDragEnd();
      }
    };
  }, [isDragging, onItemDragEnd]);

  const handleDragStart = (e, itemId) => {
    if (e.target.closest(".drag-handle")) {
      setIsDragging(true);
      onItemDragStart(itemId);
    } else {
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onItemDragEnd();
  };

  const handleEditCategoriaClick = () => {
    if (onEditCategoria) {
      onEditCategoria(categoria);
    }
  };

  return (
    <CardContainer theme={theme}>
      <CardHeader color={categoria.bg} theme={theme}>
        <HeaderLeft>
          <DragHandle theme={theme} className="drag-handle">
            <span>⋮⋮</span>
          </DragHandle>
          <Icon theme={theme}>{categoria.icon}</Icon>
          <TitleSection>
            <Title theme={theme}>{categoria.nome}</Title>
            <Subtitle theme={theme}>
              <ItemsCount>
                {itens.length} {itens.length === 1 ? "item" : "itens"}
              </ItemsCount>
              <TotalValue>{formatarMoeda(totalCategoria)}</TotalValue>
            </Subtitle>
          </TitleSection>
        </HeaderLeft>

        <HeaderActions>
          <IconButton
            onClick={() => onAddItem(categoria.id)}
            theme={theme}
            title="Adicionar item"
          >
            <Plus size={18} />
          </IconButton>

          <IconButton
            onClick={handleEditCategoriaClick}
            theme={theme}
            title="Editar categoria"
          >
            <Pencil size={16} />
          </IconButton>

          {!categoria.isPadrao && (
            <IconButton
              danger
              onClick={onDeleteCategoriaClick}
              theme={theme}
              title="Excluir categoria"
            >
              <Trash2 size={16} />
            </IconButton>
          )}

          <ExpandButton
            onClick={() => setIsExpanded(!isExpanded)}
            theme={theme}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </ExpandButton>
        </HeaderActions>
      </CardHeader>

      <CategoryProgress>
        <ProgressBar theme={theme}>
          <ProgressFill
            theme={theme}
            style={{ width: `${progresso}%` }}
            color={categoria.bg}
          />
        </ProgressBar>
      </CategoryProgress>

      <CardContent>
        {isExpanded && (
          <>
            {itens.length > 0 && (
              <ItemsList $hasItems={itens.length > 0}>
                {itens.map((item) => (
                  <ItemRow
                    key={item.id}
                    $purchased={item.comprado}
                    theme={theme}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    style={{ opacity: draggedItem === item.id ? 0.5 : 1 }}
                  >
                    <ItemLeft>
                      <ItemDragHandle className="drag-handle" theme={theme}>
                        <span>⋮</span>
                      </ItemDragHandle>

                      <CheckboxButton
                        $checked={item.comprado}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleToggleComprado(item.id, item.comprado);
                        }}
                        theme={theme}
                      >
                        {item.comprado && <CheckIcon>✓</CheckIcon>}
                      </CheckboxButton>

                      <ItemContent>
                        <ItemInfo>
                          <ItemName $purchased={item.comprado} theme={theme}>
                            {item.nome}
                          </ItemName>
                          {item.marca && (
                            <ItemBrand theme={theme}>{item.marca}</ItemBrand>
                          )}
                        </ItemInfo>

                        <ItemMeta>
                          <ItemMetaInfo theme={theme}>
                            <ItemQuantity>{item.quantidade}x</ItemQuantity>
                            <ItemPrice>{formatarMoeda(item.preco)}</ItemPrice>
                            <PaymentBadge $type={item.pagamento} theme={theme}>
                              {getPaymentIcon(item.pagamento)}
                              <span>
                                {item.pagamento === "vr" ? "VR" : "Normal"}
                              </span>
                            </PaymentBadge>
                          </ItemMetaInfo>
                        </ItemMeta>
                      </ItemContent>
                    </ItemLeft>

                    <ItemActions>
                      <ActionGroup>
                        <ItemActionButton
                          onClick={() => handleEditItem(item)}
                          theme={theme}
                          variant="edit"
                          title="Editar item"
                        >
                          <Pencil size={16} />
                        </ItemActionButton>
                        <ItemActionButton
                          variant="delete"
                          onClick={() => handleDeleteItem(item)}
                          theme={theme}
                          title="Excluir item"
                        >
                          <Trash2 size={16} />
                        </ItemActionButton>
                      </ActionGroup>
                      <ItemTotal theme={theme}>
                        <ItemTotalValue>
                          {formatarMoeda(item.preco * item.quantidade)}
                        </ItemTotalValue>
                      </ItemTotal>
                    </ItemActions>
                  </ItemRow>
                ))}
              </ItemsList>
            )}

            {itens.length === 0 && (
              <EmptyState>
                <EmptyText theme={theme}>Nenhum item adicionado</EmptyText>
                <AddButton
                  onClick={() => onAddItem(categoria.id)}
                  theme={theme}
                >
                  <Plus size={18} />
                  Adicionar primeiro item
                </AddButton>
              </EmptyState>
            )}
          </>
        )}
      </CardContent>

      <CategoryFooter theme={theme}>
        <CategoryStats>
          <StatItem theme={theme}>
            <span>Itens comprados:</span>
            <strong>
              {itensComprados}/{itens.length}
            </strong>
          </StatItem>
          <StatItem theme={theme}>
            <span>Progresso:</span>
            <strong>{progresso.toFixed(0)}%</strong>
          </StatItem>
        </CategoryStats>
      </CategoryFooter>
    </CardContainer>
  );
};

export default CategoriaCard;
