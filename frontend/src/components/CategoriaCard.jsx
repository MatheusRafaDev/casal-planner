// src/components/CategoriaCard.jsx (parte do container principal)
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, GripVertical, Check, DollarSign, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import {
  CategoriesGrid,
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
  ItemDetails,
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
  CardContent
} from '../styles/components/CategoriaCardStyles';

const CategoriaCard = ({ 
  categoria, 
  itens, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem,
  onDeleteCategoria,
  onItemDragStart,
  onItemDragEnd,
  onItemDrop,
  draggedItem,
  theme 
}) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const totalCategoria = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const itensComprados = itens.filter(item => item.comprado).length;
  const progresso = itens.length > 0 ? (itensComprados / itens.length) * 100 : 0;
  
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getPaymentIcon = (tipo) => {
    return tipo === 'vr' ? <DollarSign size={12} /> : <ShoppingBag size={12} />;
  };

  useEffect(() => {
    return () => {
      if (isDragging && onItemDragEnd) {
        onItemDragEnd();
      }
    };
  }, [isDragging, onItemDragEnd]);

  const handleDeleteClick = (itemId) => {
    if (confirmDelete === itemId) {
      onDeleteItem(itemId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(itemId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleDragStart = (e, itemId) => {
    if (e.target.closest('.drag-handle')) {
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

  return (
    <CardContainer theme={theme}>
      <CardHeader color={categoria.bg} theme={theme}>
        <HeaderLeft>
          <DragHandle theme={theme} className="drag-handle" />
          <Icon>{categoria.icone || '📁'}</Icon>
          <TitleSection>
            <Title theme={theme}>{categoria.nome}</Title>
            <Subtitle theme={theme}>
              <ItemsCount>
                {itens.length} {itens.length === 1 ? 'item' : 'itens'}
              </ItemsCount>
              <TotalValue>
                {formatarMoeda(totalCategoria)}
              </TotalValue>
            </Subtitle>
          </TitleSection>
        </HeaderLeft>
        
        <HeaderActions>
          <IconButton onClick={() => onAddItem(categoria.id)} theme={theme} title="Adicionar item">
            <Plus size={18} />
          </IconButton>
          {!categoria.isPadrao && (
            <IconButton 
              danger 
              onClick={() => onDeleteCategoria(categoria.id)} 
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
                {itens.map(item => (
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
                      <ItemDragHandle 
                        className="drag-handle"
                        theme={theme} 
                      />
                      <CheckboxButton
                        $checked={item.comprado}
                        onClick={() => onUpdateItem(item.id, { comprado: !item.comprado })}
                        theme={theme}
                      >
                        {item.comprado && <CheckIcon />}
                      </CheckboxButton>
                      
                      <ItemContent>
                        <ItemInfo>
                          <ItemName $purchased={item.comprado} theme={theme}>
                            {item.nome}
                          </ItemName>
                          {item.marca && (
                            <ItemBrand theme={theme}>
                              {item.marca}
                            </ItemBrand>
                          )}
                        </ItemInfo>

                        <ItemMeta>
                          <ItemMetaInfo theme={theme}>
                            <ItemQuantity>
                              {item.quantidade}x
                            </ItemQuantity>
                            <ItemPrice>
                              {formatarMoeda(item.preco)}
                            </ItemPrice>
                            <PaymentBadge $type={item.pagamento} theme={theme}>
                              {getPaymentIcon(item.pagamento)}
                              <span>{item.pagamento === 'vr' ? 'VR' : 'Normal'}</span>
                            </PaymentBadge>
                          </ItemMetaInfo>
                        </ItemMeta>
                      </ItemContent>
                    </ItemLeft>

                    <ItemActions>
                      <ActionGroup>
                        <ItemActionButton 
                          onClick={() => onUpdateItem(item.id, { edit: true })}
                          theme={theme}
                          variant="edit"
                          title="Editar item"
                        >
                          <Pencil size={16} />
                        </ItemActionButton>
                        <ItemActionButton 
                          variant="delete"
                          onClick={() => handleDeleteClick(item.id)}
                          theme={theme}
                          $confirm={confirmDelete === item.id}
                          title={confirmDelete === item.id ? "Clique novamente para confirmar" : "Excluir item"}
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
                <AddButton onClick={() => onAddItem(categoria.id)} theme={theme}>
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
            <strong>{itensComprados}/{itens.length}</strong>
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