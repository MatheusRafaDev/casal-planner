import React, { useState } from "react";
import { Search, X, ArrowUpDown, Filter, ChevronDown, ChevronUp } from "lucide-react";
import {
  FilterBox,
  FilterSectionLabel,
  FilterClearBtn,
  FilterSearchWrap,
  FilterSelect,
  FilterChipRow,
  FilterChip,
  FilterDateRow,
  FilterDateInput,
  FilterDateSep,
} from "../styles/components/PlanejamentoFiltrosStyles";

const STATUS_OPTIONS = [
  { val: "all",      label: "Todos os status" },
  { val: "comprado", label: "✅ Comprados"     },
  { val: "pendente", label: "⬜ Pendentes"     },
];

const PRIORITY_OPTIONS = [
  { val: "all",       label: "Todas prioridades"       },
  { val: "essencial", label: "Primeira necessidade"  },
  { val: "planejado", label: "Próximas compras"       },
  { val: "futuro",    label: "Mais para frente"      },
];

const PAYMENT_OPTIONS = [
  { val: "all",    label: "Todos os pagamentos"     },
  { val: "vr",     label: "VR / VA"              },
  { val: "normal", label: "Normal (Cartão/Dinheiro)" },
];

const SORT_OPTIONS = [
  { val: "recent",    label: "Mais recentes"  },
  { val: "nameAsc",   label: "Nome (A-Z)"     },
  { val: "priceDesc", label: "Maior preço"    },
  { val: "priceAsc",  label: "Menor preço"    },
  { val: "category",  label: "Por categoria"  },
];

/**
 * PlanejamentoFiltros
 *
 * Props:
 *  - theme
 *  - variant: "sidebar" | "mobile"  (sidebar = desktop, mobile = horizontal bar)
 *  - searchQuery, onSearchChange
 *  - statusFilter, onStatusChange
 *  - filter (priority), onFilterChange
 *  - paymentFilter, onPaymentChange
 *  - sortOrder, onSortChange
 *  - dateRange { start, end }, onDateChange
 *  - hasActiveFilters (boolean)
 *  - onClearAll
 */
const PlanejamentoFiltros = ({
  theme,
  variant = "sidebar",
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  filter,
  onFilterChange,
  paymentFilter,
  onPaymentChange,
  sortOrder,
  onSortChange,
  dateRange,
  onDateChange,
  hasActiveFilters,
  onClearAll,
}) => {
  const isMobile = variant === "mobile";
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <FilterBox theme={theme} $mobile={isMobile}>
      {/* ── Label + Limpar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile && !isExpanded ? 0 : 8 }}>
        {isMobile ? (
          <div 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", width: "100%", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={16} color={hasActiveFilters ? (theme?.primary || "#3b82f6") : (theme?.textSoft || "#666")} />
              <FilterSectionLabel theme={theme} style={{ margin: 0 }}>Filtros</FilterSectionLabel>
              {hasActiveFilters && <span style={{ background: theme?.primary || "#3b82f6", color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>Ativos</span>}
            </div>
            {isExpanded ? <ChevronUp size={16} color={theme?.textSoft || "#666"} /> : <ChevronDown size={16} color={theme?.textSoft || "#666"} />}
          </div>
        ) : (
          <FilterSectionLabel theme={theme}>Filtros</FilterSectionLabel>
        )}
        
        {hasActiveFilters && (!isMobile || isExpanded) && (
          <FilterClearBtn theme={theme} onClick={(e) => { e.stopPropagation(); onClearAll(); }}>
            <X size={11} /> Limpar
          </FilterClearBtn>
        )}
      </div>

      {(!isMobile || isExpanded) && (
        <>
          {/* ── Pesquisa ── */}
          <FilterSearchWrap theme={theme}>
        <Search size={14} />
        <input
          type="text"
          placeholder="Pesquisar item, marca ou loja…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => onSearchChange("")}>
            <X size={12} />
          </button>
        )}
      </FilterSearchWrap>

      {/* ── Status ── */}
      {isMobile ? (
        <FilterChipRow>
          {STATUS_OPTIONS.map((o) => (
            <FilterChip
              key={o.val}
              theme={theme}
              $active={statusFilter === o.val}
              onClick={() => onStatusChange(o.val)}
            >
              {o.label}
            </FilterChip>
          ))}
        </FilterChipRow>
      ) : (
        <FilterSelect
          theme={theme}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.val} value={o.val}>{o.label}</option>
          ))}
        </FilterSelect>
      )}

      {/* ── Prioridade ── */}
      {isMobile ? (
        <FilterChipRow>
          {PRIORITY_OPTIONS.map((o) => (
            <FilterChip
              key={o.val}
              theme={theme}
              $active={filter === o.val}
              onClick={() => onFilterChange(o.val)}
            >
              {o.label}
            </FilterChip>
          ))}
        </FilterChipRow>
      ) : (
        <FilterSelect
          theme={theme}
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.val} value={o.val}>{o.label}</option>
          ))}
        </FilterSelect>
      )}

      {/* ── Pagamento ── */}
      {isMobile ? (
        <FilterChipRow>
          {PAYMENT_OPTIONS.map((o) => (
            <FilterChip
              key={o.val}
              theme={theme}
              $active={paymentFilter === o.val}
              onClick={() => onPaymentChange(o.val)}
            >
              {o.label}
            </FilterChip>
          ))}
        </FilterChipRow>
      ) : (
        <FilterSelect
          theme={theme}
          value={paymentFilter}
          onChange={(e) => onPaymentChange(e.target.value)}
        >
          {PAYMENT_OPTIONS.map((o) => (
            <option key={o.val} value={o.val}>{o.label}</option>
          ))}
        </FilterSelect>
      )}

      {/* ── Ordenação ── */}
      <FilterSelect
        theme={theme}
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
        style={{ display: "flex", alignItems: "center" }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.val} value={o.val}>Ordenar: {o.label}</option>
        ))}
      </FilterSelect>

      {/* ── Período ── */}
      <div>
        <FilterSectionLabel theme={theme} style={{ marginBottom: 6 }}>Período</FilterSectionLabel>
        <FilterDateRow>
          <FilterDateInput
            type="date"
            theme={theme}
            value={dateRange.start}
            onChange={(e) => onDateChange("start", e.target.value)}
          />
          <FilterDateSep theme={theme}>–</FilterDateSep>
          <FilterDateInput
            type="date"
            theme={theme}
            value={dateRange.end}
            onChange={(e) => onDateChange("end", e.target.value)}
          />
        </FilterDateRow>
      </div>
        </>
      )}
    </FilterBox>
  );
};

export default PlanejamentoFiltros;
