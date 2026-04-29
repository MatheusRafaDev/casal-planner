import React from 'react';
import { Filter, Plus, ShoppingBag } from 'lucide-react';
import {
  FilterSection,
  FilterGroup,
  FilterButtons,
  FilterButton,
  AddCategoryButton
} from '../styles/components/FiltrosStyles'; 

const Filtros = ({ filter, setFilter, onAddCategory, theme }) => {
  return (
    <FilterSection>
      <FilterGroup>
        <Filter size={18} color={theme.textSoft} />
        <FilterButtons>
          <FilterButton
            $active={filter === "all"}
            onClick={() => setFilter("all")}
            theme={theme}
          >
            Todos
          </FilterButton>
          <FilterButton
            $active={filter === "vrva"}
            $filter="vrva"
            onClick={() => setFilter("vrva")}
            theme={theme}
          >
            VR/VA
          </FilterButton>
          <FilterButton
            $active={filter === "normal"}
            $filter="normal"
            onClick={() => setFilter("normal")}
            theme={theme}
          >
            Normal
          </FilterButton>
          <FilterButton
            $active={filter === "comprado"}
            $filter="comprado"
            onClick={() => setFilter("comprado")}
            theme={theme}
          >
            Comprados
          </FilterButton>
        </FilterButtons>
      </FilterGroup>

      <AddCategoryButton onClick={onAddCategory} theme={theme}>
        <Plus size={18} />
        Categoria
      </AddCategoryButton>
    </FilterSection>
  );
};

export default Filtros;