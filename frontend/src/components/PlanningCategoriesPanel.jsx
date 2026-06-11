import React from 'react';
import { Plus, Utensils, Bath, Armchair, Bed, Shirt } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatarMoeda } from '../utils/formatters';
import DynamicIcon from './DynamicIcon';
import * as S from '../styles/components/PlanningCategoriesPanelStyles';

const CATEGORY_ICONS = {
  cozinha: Utensils,
  banheiro: Bath,
  sala: Armchair,
  quarto: Bed,
  lavanderia: Shirt,
};

const PlanningCategoriesPanel = ({ categorias, itens, onAddCategory, onSelectCategory, selectedCategory }) => {
  const { theme } = useTheme();

  const getCategoryTotal = (categoriaId) => {
    return itens
      .filter(item => item.categoriaId === categoriaId)
      .reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  };

  const getCategoryCount = (categoriaId) => {
    return itens.filter(item => item.categoriaId === categoriaId).length;
  };

  const allCategories = [
    { id: 'all', nome: 'Todas categorias', icon: null, isDefault: true },
    ...categorias,
  ];

  return (
    <S.Panel theme={theme}>
      <S.PanelHeader>
        <S.PanelTitle>Categorias</S.PanelTitle>
        <S.AddCategoryButton onClick={onAddCategory} theme={theme}>
          <Plus size={16} />
          <span>Nova categoria</span>
        </S.AddCategoryButton>
      </S.PanelHeader>

      <S.CategoriesList>
        {allCategories.map((categoria) => {
          const IconComponent = categoria.isDefault ? null : CATEGORY_ICONS[categoria.nome.toLowerCase()] || null;
          const itemCount = categoria.isDefault ? itens.length : getCategoryCount(categoria.id);
          const itemTotal = categoria.isDefault 
            ? itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)
            : getCategoryTotal(categoria.id);
          const isSelected = selectedCategory === categoria.id;

          return (
            <S.CategoryItem
              key={categoria.id}
              onClick={() => onSelectCategory(categoria.isDefault ? null : categoria.id)}
              $selected={isSelected}
              theme={theme}
            >
              <S.CategoryIcon>
                {categoria.isDefault ? (
                  <S.DefaultIcon theme={theme}>
                    <S.IconDot />
                  </S.DefaultIcon>
                ) : IconComponent ? (
                  <IconComponent size={20} />
                ) : (
                  <DynamicIcon name={categoria.icon || categoria.icone || categoria.emoji} size={20} />
                )}
              </S.CategoryIcon>
              <S.CategoryInfo>
                <S.CategoryName $selected={isSelected} theme={theme}>
                  {categoria.nome}
                </S.CategoryName>
                <S.CategoryStats theme={theme}>
                  <S.ItemCount>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</S.ItemCount>
                  <S.Separator>•</S.Separator>
                  <S.TotalValue>{formatarMoeda(itemTotal)}</S.TotalValue>
                </S.CategoryStats>
              </S.CategoryInfo>
              {isSelected && <S.SelectedIndicator theme={theme} />}
            </S.CategoryItem>
          );
        })}
      </S.CategoriesList>
    </S.Panel>
  );
};

export default PlanningCategoriesPanel;
