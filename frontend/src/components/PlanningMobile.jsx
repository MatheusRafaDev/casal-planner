import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatarMoeda } from '../utils/formatters';
import DynamicIcon from './DynamicIcon';
import * as S from '../styles/components/PlanningMobileStyles';

const PlanningMobile = ({ 
  resumo, 
  categorias, 
  itens, 
  onAddItem, 
  onToggleFilters, 
  onSelectCategory,
  onToggleComprado,
  onEditItem,
  onDeleteItem
}) => {
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const totalNecessario = resumo.totalGeral || 0;
  const totalGasto = resumo.totalPago || 0;
  const percentualConcluido = totalNecessario > 0 ? (totalGasto / totalNecessario) * 100 : 0;
  const totalItens = resumo.totalItens || 0;
  const comprados = resumo.totalComprados || 0;
  const pendentes = totalItens - comprados;

  const summaryCards = [
    { label: 'Total necessário', value: formatarMoeda(totalNecessario), color: theme.primary },
    { label: 'Total gasto', value: formatarMoeda(totalGasto), color: theme.success },
    { label: 'Concluído', value: `${percentualConcluido.toFixed(1)}%`, color: theme.secondary },
    { label: 'Itens', value: totalItens, color: theme.info },
  ];

  const handleCategorySelect = (categoriaId) => {
    setSelectedCategory(categoriaId);
    onSelectCategory(categoriaId);
  };

  return (
    <S.MobileContainer theme={theme}>
      <S.MobileHeader>
        <S.MobileLogo>🏠 CasaPlanner</S.MobileLogo>
        <S.MobileSearch>
          <S.SearchIcon>
            <Search size={18} />
          </S.SearchIcon>
          <S.SearchInput
            placeholder="Buscar..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            theme={theme}
          />
        </S.MobileSearch>
      </S.MobileHeader>

      <S.MobileContent>
        <S.SummaryGrid>
          {summaryCards.map((card, index) => (
            <S.SummaryCard key={index} theme={theme} $color={card.color}>
              <S.SummaryLabel>{card.label}</S.SummaryLabel>
              <S.SummaryValue>{card.value}</S.SummaryValue>
            </S.SummaryCard>
          ))}
        </S.SummaryGrid>

        <S.CategoriesScroll>
          <S.CategoryChip
            $selected={selectedCategory === null}
            onClick={() => handleCategorySelect(null)}
            theme={theme}
          >
            Todas
          </S.CategoryChip>
          {categorias.map(categoria => (
            <S.CategoryChip
              key={categoria.id}
              $selected={selectedCategory === categoria.id}
              onClick={() => handleCategorySelect(categoria.id)}
              theme={theme}
            >
              <DynamicIcon name={categoria.icon || categoria.icone || categoria.emoji} size={16} />
              {categoria.nome}
            </S.CategoryChip>
          ))}
        </S.CategoriesScroll>

        <S.MobileFilters>
          <S.FilterButton onClick={onToggleFilters} theme={theme}>
            <Filter size={16} />
            Filtros
          </S.FilterButton>
        </S.MobileFilters>

        <S.MobileItemsList>
          {itens.map(item => (
            <S.MobileItem key={item.id} theme={theme} $purchased={item.comprado}>
              <S.MobileItemLeft>
                <S.MobileCheckbox
                  $checked={item.comprado}
                  onClick={() => onToggleComprado(item.id)}
                  theme={theme}
                />
                <S.MobileItemImage src={item.fotoUrl} alt={item.nome} />
                <S.MobileItemInfo>
                  <S.MobileItemName $purchased={item.comprado} theme={theme}>
                    {item.nome}
                  </S.MobileItemName>
                  <S.MobileItemMeta theme={theme}>
                    {item.loja && <S.MobileStore>{item.loja}</S.MobileStore>}
                    <S.MobilePrice>{formatarMoeda(item.preco * item.quantidade)}</S.MobilePrice>
                  </S.MobileItemMeta>
                </S.MobileItemInfo>
              </S.MobileItemLeft>
              <S.MobileItemActions>
                <S.MobileActionButton onClick={() => onEditItem(item.id)} theme={theme}>
                  Editar
                </S.MobileActionButton>
              </S.MobileItemActions>
            </S.MobileItem>
          ))}
        </S.MobileItemsList>
      </S.MobileContent>

      <S.FloatingButton onClick={onAddItem} theme={theme}>
        <Plus size={24} />
      </S.FloatingButton>
    </S.MobileContainer>
  );
};

export default PlanningMobile;
