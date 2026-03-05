// src/components/CategoriaCard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, DollarSign, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../context/ConfirmContext';
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
  const { showConfirm } = useConfirm();
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

  // Função para confirmar exclusão de item usando ConfirmModal
  const handleDeleteItemClick = (item) => {
    showConfirm({
      title: 'Excluir Item',
      itemName: item.nome,
      itemType: 'item',
      message: `Tem certeza que deseja excluir o item "${item.nome}"?`,
      onConfirm: async () => {
        await onDeleteItem(item.id);
        // O toast de sucesso será mostrado pelo ConfirmModal
      }
    });
  };

  // Função para confirmar exclusão de categoria
  const handleDeleteCategoriaClick = () => {
    if (categoria.isPadrao) {
      toast.error('Categoria padrão não pode ser excluída', {
        duration: 3000,
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#dc3545',
          color: '#fff',
        },
      });
      return;
    }

    if (itens.length > 0) {
      toast.error(
        `Não é possível excluir a categoria "${categoria.nome}" pois possui ${itens.length} item(ns) vinculado(s)`,
        {
          duration: 5000,
          icon: '❌',
          style: {
            borderRadius: '12px',
            background: '#dc3545',
            color: '#fff',
          },
        }
      );
      return;
    }

    showConfirm({
      title: 'Excluir Categoria',
      itemName: categoria.nome,
      itemType: 'categoria',
      message: `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
      onConfirm: async () => {
        await onDeleteCategoria(categoria.id);
        // O toast de sucesso será mostrado pelo ConfirmModal
      }
    });
  };

  // Função para marcar item como comprado
    const handleToggleComprado = (item) => {
    const novoEstado = !item.comprado;
    onUpdateItem(item.id, { comprado: novoEstado });
    
    // Toast diferente para marcar e desmarcar
    if (novoEstado) {
      // Marcando como comprado
      toast.success(`"${item.nome}" marcado como comprado!`, {
        duration: 2000,
        icon: '',
        style: {
          borderRadius: '12px',
          background: theme === 'dark' ? '#1e1e1e' : '#4CAF50',
          color: '#fff',
        },
      });
    } else {
      // Desmarcando (volta para a lista)
      toast.success(`"${item.nome}" voltou para a lista!`, {
        duration: 2000,
        icon: '',
        style: {
          borderRadius: '12px',
          background: theme === 'dark' ? '#1e1e1e' : '#ff9800', // Laranja para desmarcar
          color: '#fff',
        },
      });
    }
  };

  // Função para adicionar item com toast
  const handleAddItemClick = () => {
    onAddItem(categoria.id);
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
          <DragHandle theme={theme} className="drag-handle">
            <span>⋮⋮</span>
          </DragHandle>
          <Icon theme={theme}>{categoria.icone || '📁'}</Icon>
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
          <IconButton 
            onClick={handleAddItemClick}
            theme={theme} 
            title="Adicionar item"
          >
            <Plus size={18} />
          </IconButton>
          
          {!categoria.isPadrao && (
            <IconButton 
              danger 
              onClick={handleDeleteCategoriaClick}
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
                      >
                        <span>⋮</span>
                      </ItemDragHandle>
                      
                      <CheckboxButton
                        $checked={item.comprado}
                        onClick={() => handleToggleComprado(item)}
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
                          onClick={() => handleDeleteItemClick(item)}
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
                  onClick={handleAddItemClick}
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