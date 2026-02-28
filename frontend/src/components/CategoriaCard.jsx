import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
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
  ItemDetails,
  PaymentBadge,
  ItemActions,
  ItemActionButton,
  ItemTotal,
  EmptyState,
  EmptyText,
  AddButton
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
  
  const totalCategoria = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Limpar estado de drag quando o componente desmontar
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

  // Função para iniciar o drag apenas pelo ícone
  const handleDragStart = (e, itemId) => {
    // Verifica se o elemento que iniciou o drag é o ícone de arrasto
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      onItemDragStart(itemId);
    } else {
      e.preventDefault(); // Impede o drag se não for no ícone
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onItemDragEnd();
  };

  return (
    <CardContainer 
      theme={theme} 
      onDragOver={(e) => e.preventDefault()} 
      onDrop={() => onItemDrop(categoria.id)}
    >
      <CardHeader color={categoria.bg} theme={theme}>
        <HeaderLeft>
          <DragHandle theme={theme} />
          <Icon>{categoria.icone || '📁'}</Icon>
          <TitleSection>
            <Title theme={theme}>{categoria.nome}</Title>
            <Subtitle theme={theme}>
              {itens.length} {itens.length === 1 ? 'item' : 'itens'} · {formatarMoeda(totalCategoria)}
            </Subtitle>
          </TitleSection>
        </HeaderLeft>
        
        <HeaderActions>
          <IconButton onClick={() => onAddItem(categoria.id)} theme={theme}>
            <Plus size={16} />
          </IconButton>
          {!categoria.isPadrao && (
            <IconButton 
              danger 
              onClick={() => onDeleteCategoria(categoria.id)} 
              theme={theme}
            >
              <Trash2 size={14} />
            </IconButton>
          )}
        </HeaderActions>
      </CardHeader>

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
                
                <ItemInfo>
                  <ItemName $purchased={item.comprado} theme={theme}>
                    {item.nome}
                    {item.marca && <span style={{ color: theme.textSoft }}> · {item.marca}</span>}
                  </ItemName>
                  <ItemDetails theme={theme}>
                    {item.quantidade}x {formatarMoeda(item.preco)} ·{' '}
                    <PaymentBadge $type={item.pagamento} theme={theme}>
                      {item.pagamento === 'vr' ? 'VR/VA' : 'Normal'}
                    </PaymentBadge>
                  </ItemDetails>
                </ItemInfo>
              </ItemLeft>

              <ItemActions className="item-actions">
                <ItemActionButton 
                  onClick={() => onUpdateItem(item.id, { edit: true })}
                  theme={theme}
                >
                  <Pencil size={14} />
                </ItemActionButton>
                <ItemActionButton 
                  danger 
                  onClick={() => handleDeleteClick(item.id)}
                  theme={theme}
                  style={{ color: confirmDelete === item.id ? theme.error : 'inherit' }}
                >
                  <Trash2 size={14} />
                </ItemActionButton>
              </ItemActions>

              <ItemTotal theme={theme}>
                {formatarMoeda(item.preco * item.quantidade)}
              </ItemTotal>
            </ItemRow>
          ))}
        </ItemsList>
      )}

      {itens.length === 0 && (
        <EmptyState>
          <EmptyText theme={theme}>Nenhum item ainda</EmptyText>
          <AddButton onClick={() => onAddItem(categoria.id)} theme={theme}>
            <Plus size={16} />
            Adicionar item
          </AddButton>
        </EmptyState>
      )}
    </CardContainer>
  );
};

export default CategoriaCard;