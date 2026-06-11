import React, { useState } from 'react';
import { Check, MoreHorizontal, Plus, Minus, Store, ImageOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatarMoeda } from '../utils/formatters';
import storeLogoService from '../services/storeLogoService';
import * as S from '../styles/components/PlanningItemListStyles';

const PRIORIDADE_CONFIG = {
  urgente: { label: 'Essencial', color: '#ef4444', bgColor: '#ef444418' },
  normal: { label: 'Planejado', color: '#f59e0b', bgColor: '#f59e0b18' },
  pode_esperar: { label: 'Futuro', color: '#22c55e', bgColor: '#22c55e18' },
};

const PlanningItemList = ({ itens, onToggleComprado, onEditItem, onDeleteItem, onQuantityChange }) => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('todos');
  const [expandedItems, setExpandedItems] = useState({});

  const filteredItens = itens.filter(item => {
    if (filter === 'todos') return true;
    if (filter === 'comprado') return item.comprado;
    if (filter === 'urgente') return item.prioridade === 'urgente';
    if (filter === 'normal') return item.prioridade === 'normal';
    if (filter === 'pode_esperar') return item.prioridade === 'pode_esperar';
    return true;
  });

  const filters = [
    { id: 'todos', label: 'Todos' },
    { id: 'urgente', label: 'Essenciais' },
    { id: 'normal', label: 'Planejados' },
    { id: 'pode_esperar', label: 'Futuros' },
    { id: 'comprado', label: 'Comprados' },
  ];

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleQuantityChange = (itemId, delta) => {
    const item = itens.find(i => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, (item.quantidade || 1) + delta);
      onQuantityChange(itemId, newQuantity);
    }
  };

  return (
    <S.Container>
      <S.FilterTabs>
        {filters.map(f => (
          <S.FilterTab
            key={f.id}
            $active={filter === f.id}
            onClick={() => setFilter(f.id)}
            theme={theme}
          >
            {f.label}
          </S.FilterTab>
        ))}
      </S.FilterTabs>

      <S.ItemsList>
        {filteredItens.map(item => {
          const pc = PRIORIDADE_CONFIG[item.prioridade] || PRIORIDADE_CONFIG.normal;
          const isExpanded = expandedItems[item.id];

          return (
            <S.ItemCard key={item.id} theme={theme} $purchased={item.comprado}>
              <S.ItemMain>
                <S.ItemLeft>
                  <S.Checkbox
                    $checked={item.comprado}
                    onClick={() => onToggleComprado(item.id)}
                    theme={theme}
                  >
                    {item.comprado && <Check size={14} />}
                  </S.Checkbox>

                  {item.fotoUrl ? (
                    <S.ItemImage src={item.fotoUrl} alt={item.nome} />
                  ) : (
                    <S.ItemImagePlaceholder theme={theme}>
                      <ImageOff size={20} />
                    </S.ItemImagePlaceholder>
                  )}

                  <S.ItemInfo>
                    <S.ItemName $purchased={item.comprado} theme={theme}>
                      {item.nome}
                    </S.ItemName>
                    <S.ItemMeta theme={theme}>
                      {item.loja && (
                        <S.StoreInfo theme={theme}>
                          <Store size={14} />
                          {item.loja}
                        </S.StoreInfo>
                      )}
                      {item.marca && <S.Brand>{item.marca}</S.Brand>}
                    </S.ItemMeta>
                  </S.ItemInfo>
                </S.ItemLeft>

                <S.ItemRight>
                  <S.PriorityBadge $color={pc.color} $bgColor={pc.bgColor}>
                    {pc.label}
                  </S.PriorityBadge>
                  <S.ItemValue theme={theme}>
                    {formatarMoeda(item.preco * item.quantidade)}
                  </S.ItemValue>
                  <S.ActionButton onClick={() => toggleExpand(item.id)} theme={theme}>
                    <MoreHorizontal size={20} />
                  </S.ActionButton>
                </S.ItemRight>
              </S.ItemMain>

              {isExpanded && (
                <S.ItemExpanded>
                  <S.ExpandedRow>
                    <S.ExpandedLabel>Quantidade:</S.ExpandedLabel>
                    <S.QuantityControl>
                      <S.QuantityButton onClick={() => handleQuantityChange(item.id, -1)} theme={theme}>
                        <Minus size={14} />
                      </S.QuantityButton>
                      <S.QuantityValue theme={theme}>{item.quantidade || 1}</S.QuantityValue>
                      <S.QuantityButton onClick={() => handleQuantityChange(item.id, 1)} theme={theme}>
                        <Plus size={14} />
                      </S.QuantityButton>
                    </S.QuantityControl>
                  </S.ExpandedRow>

                  <S.ExpandedRow>
                    <S.ExpandedLabel>Preço unitário:</S.ExpandedLabel>
                    <S.ExpandedValue theme={theme}>{formatarMoeda(item.preco)}</S.ExpandedValue>
                  </S.ExpandedRow>

                  <S.ExpandedRow>
                    <S.ExpandedLabel>Pagamento:</S.ExpandedLabel>
                    <S.ExpandedValue theme={theme}>
                      {item.pagamento === 'vr' ? 'VR/VA' : 'Normal'}
                    </S.ExpandedValue>
                  </S.ExpandedRow>

                  {item.parcelas > 1 && (
                    <S.ExpandedRow>
                      <S.ExpandedLabel>Parcelamento:</S.ExpandedLabel>
                      <S.ExpandedValue theme={theme}>
                        {item.parcelas}x de {formatarMoeda((item.preco * item.quantidade) / item.parcelas)}
                      </S.ExpandedValue>
                    </S.ExpandedRow>
                  )}

                  <S.ExpandedActions>
                    <S.EditButton onClick={() => onEditItem(item.id)} theme={theme}>
                      Editar
                    </S.EditButton>
                    <S.DeleteButton onClick={() => onDeleteItem(item.id)} theme={theme}>
                      Excluir
                    </S.DeleteButton>
                  </S.ExpandedActions>
                </S.ItemExpanded>
              )}
            </S.ItemCard>
          );
        })}

        {filteredItens.length === 0 && (
          <S.EmptyState theme={theme}>
            <S.EmptyIcon>📦</S.EmptyIcon>
            <S.EmptyText>Nenhum item encontrado</S.EmptyText>
          </S.EmptyState>
        )}
      </S.ItemsList>
    </S.Container>
  );
};

export default PlanningItemList;
