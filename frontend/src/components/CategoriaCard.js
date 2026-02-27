import React from 'react';
import styled from 'styled-components';

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
  return (
    <CardContainer 
      theme={theme} 
      onDragOver={(e) => e.preventDefault()} 
      onDrop={() => onItemDrop(categoria.id)}
    >
      <CardHeader style={{ backgroundColor: categoria.bg, color: categoria.text }}>
        <CardTitle>{categoria.nome}</CardTitle>
        <ItemCount>{itens.length} itens</ItemCount>
        {!categoria.isPadrao && (
          <DeleteButton onClick={() => onDeleteCategoria(categoria.id)} title="Remover categoria">
            🗑️
          </DeleteButton>
        )}
      </CardHeader>
      
      <CardItems theme={theme}>
        {itens.length === 0 ? (
          <EmptyMessage theme={theme}>Nenhum item ainda</EmptyMessage>
        ) : (
          itens.map(item => (
            <Item
              key={item.id}
              theme={theme}
              draggable
              onDragStart={() => onItemDragStart(item.id)}
              onDragEnd={onItemDragEnd}
              style={{ opacity: draggedItem === item.id ? 0.5 : 1 }}
            >
              <ItemCheckbox
                type="checkbox"
                checked={item.comprado}
                onChange={() => onUpdateItem(item.id, { comprado: !item.comprado })}
              />
              <ItemInfo>
                <ItemNome comprado={item.comprado} theme={theme}>{item.nome}</ItemNome>
                <ItemDetalhes>
                  {item.marca && <ItemMarca theme={theme}>{item.marca}</ItemMarca>}
                  <ItemPreco>R$ {item.preco}</ItemPreco>
                  <ItemQtd>{item.quantidade} un</ItemQtd>
                  <PagamentoBadge pagamento={item.pagamento}>
                    {item.pagamento === 'vr' ? '🍽️ VR' : '💵'}
                  </PagamentoBadge>
                </ItemDetalhes>
              </ItemInfo>
              <ItemActions>
                <ActionButton onClick={() => onUpdateItem(item.id, { edit: true })} title="Editar">
                  ✏️
                </ActionButton>
                <ActionButton onClick={() => onDeleteItem(item.id)} title="Remover">
                  🗑️
                </ActionButton>
              </ItemActions>
            </Item>
          ))
        )}
      </CardItems>
      
      <CardFooter theme={theme}>
        <AddButton onClick={() => onAddItem(categoria.id)} theme={theme}>
          ➕ Adicionar item
        </AddButton>
      </CardFooter>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  background: ${props => props.theme.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: fit-content;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.1);
  }
`;

const CardHeader = styled.div`
  padding: 1rem 1.2rem;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.span`
  flex: 1;
`;

const ItemCount = styled.span`
  font-size: 0.8rem;
  background: rgba(0,0,0,0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  color: inherit;
  opacity: 0.7;
  transition: 0.2s;

  &:hover {
    opacity: 1;
    background: rgba(255,0,0,0.2);
  }
`;

const CardItems = styled.div`
  padding: 1rem;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  background: ${props => props.theme.background};
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.textLight};
  padding: 2rem;
  font-style: italic;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: ${props => props.theme.card};
  border-radius: 12px;
  margin-bottom: 0.5rem;
  border: 1px solid ${props => props.theme.border};
  cursor: grab;

  &:hover {
    border-color: ${props => props.theme.primary};
  }
`;

const ItemCheckbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: ${props => props.theme.primary};
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemNome = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  text-decoration: ${props => props.comprado ? 'line-through' : 'none'};
  opacity: ${props => props.comprado ? 0.6 : 1};
`;

const ItemDetalhes = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  flex-wrap: wrap;
`;

const ItemMarca = styled.span`
  background: ${props => props.theme.border};
  padding: 2px 8px;
  border-radius: 20px;
  color: ${props => props.theme.text};
`;

const ItemPreco = styled.span`
  background: ${props => props.theme.primary};
  padding: 2px 8px;
  border-radius: 20px;
  color: white;
`;

const ItemQtd = styled.span`
  background: ${props => props.theme.secondary};
  padding: 2px 8px;
  border-radius: 20px;
  color: white;
`;

const PagamentoBadge = styled.span`
  background: ${props => props.pagamento === 'vr' ? '#2980b9' : '#e67e22'};
  padding: 2px 8px;
  border-radius: 20px;
  color: white;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.3rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 20px;
  color: ${props => props.theme.textSoft};
  transition: 0.2s;

  &:hover {
    background: ${props => props.theme.border};
    transform: scale(1.1);
  }
`;

const CardFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.border};
  background: ${props => props.theme.card};
`;

const AddButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: ${props => props.theme.background};
  border: 2px dashed ${props => props.theme.border};
  border-radius: 16px;
  color: ${props => props.theme.textSoft};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.primary};
    color: ${props => props.theme.primary};
    background: ${props => props.theme.card};
  }
`;

export default CategoriaCard;