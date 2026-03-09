import React, { useState } from "react";
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { useItemActions } from "../hooks/useItemActions";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { formatarMoeda, getPaymentIcon } from "../utils/formatters";
import * as S from "../styles/components/CategoriaCardStyles";

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

  const { handleToggleComprado, handleDeleteItem, handleEditItem } =
    useItemActions(theme, onToggleComprado, onUpdateItem, onDeleteItem);

  const { handleDeleteCategoria, handleEditCategoria } = useCategoryActions(
    categoria,
    itens,
    theme,
    onDeleteCategoria,
    onEditCategoria,
  );

  const totalCategoria = itens.reduce(
    (acc, item) => acc + (item.preco * item.quantidade || 0),
    0,
  );
  const itensComprados = itens.filter((item) => item.comprado).length;
  const progresso = itens.length > 0 ? (itensComprados / itens.length) * 100 : 0;


  const handleItemDragStart = (e, itemId) => {
    e.stopPropagation();
    onItemDragStart(itemId);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
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
    
    const itemId = e.dataTransfer.getData('text/plain');
    
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

          <S.DragHandle 
            theme={theme} 
            className="category-drag-handle"
          />
          <S.Icon theme={theme}>{categoria.icon}</S.Icon>
          <S.TitleSection>
            <S.Title theme={theme}>{categoria.nome}</S.Title>
            <S.Subtitle theme={theme}>
              <S.ItemsCount>
                {itens.length} {itens.length === 1 ? "item" : "itens"}
              </S.ItemsCount>
              <S.TotalValue>{formatarMoeda(totalCategoria)}</S.TotalValue>
            </S.Subtitle>
          </S.TitleSection>
        </S.HeaderLeft>

        <S.HeaderActions>
          <S.IconButton onClick={() => onAddItem(categoria.id)} theme={theme}>
            <Plus size={18} />
          </S.IconButton>
          <S.IconButton onClick={handleEditCategoria} theme={theme}>
            <Pencil size={16} />
          </S.IconButton>
          {!categoria.isPadrao && (
            <S.IconButton danger onClick={handleDeleteCategoria} theme={theme}>
              <Trash2 size={16} />
            </S.IconButton>
          )}
          <S.ExpandButton onClick={() => setIsExpanded(!isExpanded)} theme={theme}>
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
                    style={{ opacity: draggedItemId === item.id ? 0.5 : 1 }}
                  >
                    <S.ItemLeft>

                      <span 
                        className="item-drag-handle"
                        style={{ 
                          cursor: 'grab', 
                          marginRight: '8px',
                          padding: '0 4px',
                          color: theme?.textSoft || '#666'
                        }}
                      >
                        ⋮⋮
                      </span>

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

                      <S.ItemContent>
                        <S.ItemInfo>
                          <S.ItemName $purchased={item.comprado} theme={theme}>
                            {item.nome}
                          </S.ItemName>
                          {item.marca && (
                            <S.ItemBrand theme={theme}>{item.marca}</S.ItemBrand>
                          )}
                        </S.ItemInfo>

                        <S.ItemMeta>
                          <S.ItemMetaInfo theme={theme}>
                            <S.ItemQuantity>{item.quantidade}x</S.ItemQuantity>
                            <S.ItemPrice>{formatarMoeda(item.preco)}</S.ItemPrice>
                            <S.PaymentBadge $type={item.pagamento} theme={theme}>
                              {getPaymentIcon(item.pagamento)}
                              <span>{item.pagamento === "vr" ? "VR" : "Normal"}</span>
                            </S.PaymentBadge>
                          </S.ItemMetaInfo>
                        </S.ItemMeta>
                      </S.ItemContent>
                    </S.ItemLeft>

                    <S.ItemActions>
                      <S.ActionGroup>
                        <S.ItemActionButton
                          onClick={() => handleEditItem(item)}
                          theme={theme}
                          variant="edit"
                        >
                          <Pencil size={14} />
                        </S.ItemActionButton>
                        <S.ItemActionButton
                          variant="delete"
                          onClick={() => handleDeleteItem(item)}
                          theme={theme}
                        >
                          <Trash2 size={14} />
                        </S.ItemActionButton>
                      </S.ActionGroup>
                      <S.ItemTotal theme={theme}>
                        <S.ItemTotalValue>
                          {formatarMoeda(item.preco * item.quantidade)}
                        </S.ItemTotalValue>
                      </S.ItemTotal>
                    </S.ItemActions>
                  </S.ItemRow>
                ))}
              </S.ItemsList>
            )}

            {itens.length === 0 && (
              <S.EmptyState>
                <S.EmptyText theme={theme}>Nenhum item adicionado</S.EmptyText>
                <S.AddButton onClick={() => onAddItem(categoria.id)} theme={theme}>
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
            <span>Itens comprados:</span>
            <strong>{itensComprados}/{itens.length}</strong>
          </S.StatItem>
          <S.StatItem theme={theme}>
            <span>Progresso:</span>
            <strong>{progresso.toFixed(0)}%</strong>
          </S.StatItem>
        </S.CategoryStats>
      </S.CategoryFooter>
    </S.CardContainer>
  );
};

export default CategoriaCard;