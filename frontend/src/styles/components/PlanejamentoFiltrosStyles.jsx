import styled from "styled-components";

// ── Container principal ───────────────────────────────────────────────────────
// variant sidebar: coluna vertical (dentro do PanelCategories)
// variant mobile: seção horizontal compacta

export const FilterBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: ${p => p.$mobile ? "8px 16px" : "0 4px 16px"};
  ${p => p.$mobile ? `
    background: ${p.theme?.surface || '#fff'};
    border-bottom: 1px solid ${p.theme?.border || '#e5e7eb'};
    flex-shrink: 0;
  ` : `
    border-bottom: 1px solid ${p.theme?.border || "#e5e7eb"};
    margin-bottom: 12px;
  `}
`;

// ── Rótulo de seção ───────────────────────────────────────────────────────────
export const FilterSectionLabel = styled.span`
  font-size: 10px;
  font-weight: 800;
  color: ${p => p.theme?.textSoft || "#9ca3af"};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

// ── Botão Limpar ──────────────────────────────────────────────────────────────
export const FilterClearBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #ef444412;
  border: 1px solid #ef444435;
  color: #ef4444;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #ef444420;
  }
`;

// ── Campo de pesquisa ─────────────────────────────────────────────────────────
export const FilterSearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${p => p.theme?.background || "#f8fafc"};
  border: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  border-radius: 12px;
  padding: 8px 12px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: ${p => p.theme?.primary || "#6366f1"};
    box-shadow: 0 0 0 3px ${p => (p.theme?.primary || "#6366f1")}1a;
  }

  svg {
    color: ${p => p.theme?.textSoft || "#9ca3af"};
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    color: ${p => p.theme?.text || "#111"};
    font-size: 13px;
    font-weight: 500;
    outline: none;
    min-width: 0;

    &::placeholder {
      color: ${p => p.theme?.textSoft || "#9ca3af"};
    }
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${p => p.theme?.surface2 || "#f1f5f9"};
    border: none;
    border-radius: 50%;
    color: ${p => p.theme?.textSoft || "#9ca3af"};
    width: 20px;
    height: 20px;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: ${p => p.theme?.border || "#e5e7eb"};
      color: ${p => p.theme?.text || "#111"};
    }
  }
`;

// ── Select estilizado (modo sidebar) ─────────────────────────────────────────
export const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  background: ${p => p.theme?.background || "#f8fafc"};
  color: ${p => p.theme?.text || "#111"};
  font-size: 13px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
  transition: border-color 0.2s, box-shadow 0.2s;

  option {
    background: ${p => p.theme?.surface || "#fff"};
    color: ${p => p.theme?.text || "#111"};
    font-weight: 500;
  }

  &:focus {
    border-color: ${p => p.theme?.primary || "#6366f1"};
    box-shadow: 0 0 0 3px ${p => (p.theme?.primary || "#6366f1")}1a;
  }

  &:hover {
    border-color: ${p => (p.theme?.primary || "#6366f1")}80;
  }
`;

// ── Linha de chips (modo mobile) ──────────────────────────────────────────────
export const FilterChipRow = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { display: none; }
`;

// ── Chip individual ───────────────────────────────────────────────────────────
export const FilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid ${p =>
    p.$active ? p.theme?.primary || "#6366f1" : p.theme?.border || "#e5e7eb"};
  background: ${p =>
    p.$active ? (p.theme?.primary || "#6366f1") + "18" : p.theme?.surface || "#fff"};
  color: ${p =>
    p.$active ? p.theme?.primary || "#6366f1" : p.theme?.textSoft || "#666"};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: ${p =>
    p.$active ? `0 2px 8px ${p.theme?.primary || "#6366f1"}20` : "none"};

  &:hover {
    border-color: ${p => (p.theme?.primary || "#6366f1")}80;
    color: ${p => p.theme?.primary || "#6366f1"};
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ── Período: linha com os 2 inputs de data ────────────────────────────────────
export const FilterDateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const FilterDateInput = styled.input`
  flex: 1;
  padding: 7px 8px;
  border-radius: 9px;
  border: 1.5px solid ${p => p.theme?.border || "#e5e7eb"};
  background: ${p => p.theme?.background || "#f8fafc"};
  color: ${p => p.theme?.text || "#111"};
  font-size: 12px;
  font-weight: 500;
  outline: none;
  transition: border-color 0.2s;
  min-width: 0;

  &:focus {
    border-color: ${p => p.theme?.primary || "#6366f1"};
  }

  /* Remove native calendar icon styling on some browsers */
  &::-webkit-calendar-picker-indicator {
    opacity: 0.5;
    cursor: pointer;
  }
`;

export const FilterDateSep = styled.span`
  color: ${p => p.theme?.textSoft || "#9ca3af"};
  font-size: 12px;
  flex-shrink: 0;
`;
