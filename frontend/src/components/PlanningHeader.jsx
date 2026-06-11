import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as S from '../styles/components/PlanningHeaderStyles';

const PlanningHeader = ({ onAddItem, onToggleFilters, filterActive }) => {
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <S.Header theme={theme}>
      <S.HeaderContent>
        <S.SearchContainer $focused={isFocused} theme={theme}>
          <S.SearchIcon theme={theme}>
            <Search size={20} />
          </S.SearchIcon>
          <S.SearchInput
            id="search-input"
            type="text"
            placeholder="Buscar item..."
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            theme={theme}
          />
          <S.Shortcut theme={theme}>Ctrl + K</S.Shortcut>
          {searchValue && (
            <S.ClearButton onClick={handleClearSearch} theme={theme}>
              <X size={16} />
            </S.ClearButton>
          )}
        </S.SearchContainer>

        <S.HeaderActions>
          <S.FilterButton 
            onClick={onToggleFilters} 
            $active={filterActive}
            theme={theme}
          >
            <Filter size={20} />
            <span>Filtros</span>
          </S.FilterButton>

          <S.AddButton onClick={onAddItem} theme={theme}>
            <Plus size={20} />
            <span>Adicionar item</span>
          </S.AddButton>
        </S.HeaderActions>
      </S.HeaderContent>
    </S.Header>
  );
};

export default PlanningHeader;
