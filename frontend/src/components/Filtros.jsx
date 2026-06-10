import React from 'react';
import { Filter, Plus, ShoppingBag } from 'lucide-react';
import {
  FilterSection,
  FilterGroup,
  FilterButtons,
  FilterButton,
  AddCategoryButton
} from '../styles/components/FiltrosStyles'; 

const Filtros = ({ filter, setFilter, onAddCategory, theme, filtroFase, setFiltroFase, filtroOrigem, setFiltroOrigem }) => {
  return (
    <FilterSection>
      <FilterGroup>
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

      {/* Fase Filter */}
      <FilterGroup>
        <FilterButtons>
          <FilterButton
            $active={filtroFase === null}
            onClick={() => setFiltroFase(null)}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            Todas fases
          </FilterButton>
          <FilterButton
            $active={filtroFase === "primeiro_mes"}
            $filter="fase"
            onClick={() => setFiltroFase("primeiro_mes")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            📦 1º mês
          </FilterButton>
          <FilterButton
            $active={filtroFase === "segundo_mes"}
            $filter="fase"
            onClick={() => setFiltroFase("segundo_mes")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            📦 2º mês
          </FilterButton>
          <FilterButton
            $active={filtroFase === "terceiro_mes"}
            $filter="fase"
            onClick={() => setFiltroFase("terceiro_mes")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            📦 3º mês
          </FilterButton>
          <FilterButton
            $active={filtroFase === "depois"}
            $filter="fase"
            onClick={() => setFiltroFase("depois")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            📅 Depois
          </FilterButton>
        </FilterButtons>
      </FilterGroup>

      {/* Origem Filter */}
      <FilterGroup>
        <FilterButtons>
          <FilterButton
            $active={filtroOrigem === null}
            onClick={() => setFiltroOrigem(null)}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            Todas origens
          </FilterButton>
          <FilterButton
            $active={filtroOrigem === "comprado"}
            $filter="origem"
            onClick={() => setFiltroOrigem("comprado")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            🛒 Comprar
          </FilterButton>
          <FilterButton
            $active={filtroOrigem === "presente"}
            $filter="origem"
            onClick={() => setFiltroOrigem("presente")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            🎁 Presente
          </FilterButton>
          <FilterButton
            $active={filtroOrigem === "herdado"}
            $filter="origem"
            onClick={() => setFiltroOrigem("herdado")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            🏠 Herdado
          </FilterButton>
          <FilterButton
            $active={filtroOrigem === "alugado"}
            $filter="origem"
            onClick={() => setFiltroOrigem("alugado")}
            theme={theme}
            style={{ fontSize: "0.85rem" }}
          >
            🔑 Alugar
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