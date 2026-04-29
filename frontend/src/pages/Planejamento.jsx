import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import ResumoCards from "../components/ResumoCards";
import CategoriaCard from "../components/CategoriaCard";
import CategoriaFormModal from "../components/CategoriaFormModal";
import Filtros from "../components/Filtros";
import ItemFormModal from "../components/ItemFormModal";

import { categoriasService } from "../services/categoriasService";
import { itensService } from "../services/itensService";
import resumoService from "../services/resumoService";

import {
  PlanejamentoContainer,
  WelcomeSection,
  WelcomeTitle,
  WelcomeSubtitle,
  LoadingContainer,
  LoadingSpinner,
  CategoriesGrid,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateButton,
} from "../styles/pages/PlanejamentoStyles";

// ---------- Utils ----------
const calcularResumoLocal = (itens) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    return {
      atual: {
        totalGeral: 0,
        totalVR: 0,
        totalNormal: 0,
        totalComprados: 0,
        totalItens: 0,
      },
      comparativo: {},
    };
  }
  return resumoService.calcularResumoManual(itens);
};

const FORM_DATA_VAZIO = {
  nome: "",
  marca: "",
  preco: 0,
  quantidade: 1,
  pagamento: "normal",
  prioridade: "normal",
  loja: "",
  linkProduto: "",
  fotoUrl: "",
};

// ---------- Component ----------
const Planejamento = () => {
  const { theme } = useTheme();
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [itemModal, setItemModal] = useState({
    isOpen: false,
    categoriaId: null,
    itemId: null,
  });
  const [categoriaModal, setCategoriaModal] = useState({
    isOpen: false,
    categoria: null,
    isEditing: false,
  });

  const [formData, setFormData] = useState(FORM_DATA_VAZIO);

  const draggedItemIdRef = useRef(null);
  const scrollRef = useRef(0);

  // ---------- Load ----------
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      scrollRef.current = window.scrollY;

      const [cats, its] = await Promise.all([
        categoriasService.listarDoUsuario(),
        itensService.getAll(),
      ]);

      setCategorias(
        (cats || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
      );
      setItens(Array.isArray(its) ? its : []);
    } catch {
      // erro silencioso — toast é mostrado pelos hooks
    } finally {
      setLoading(false);
      setTimeout(() => window.scrollTo(0, scrollRef.current), 0);
    }
  }, []);

  useEffect(() => {
    if (usuario) loadData();
  }, [usuario, loadData]);

  // ---------- Memo ----------
  const itensFiltrados = useMemo(() => {
    if (filter === "all") return itens;

    if (filter === "comprado") {
      return itens.filter((i) => i.comprado === true);
    }

    return itens.filter(
      (i) => i.pagamento === (filter === "vrva" ? "vr" : "normal"),
    );
  }, [itens, filter]);

  const resumo = useMemo(() => calcularResumoLocal(itens).atual, [itens]);
  const comparativo = useMemo(
    () => calcularResumoLocal(itens).comparativo,
    [itens],
  );

  // ---------- Item ----------
  const handleSaveItem = useCallback(
    async (dadosDoModal) => {
      const payload = {
        ...dadosDoModal,
        categoriaId: dadosDoModal.categoriaId || itemModal.categoriaId,
      };

      if (itemModal.itemId) {
        await itensService.update(itemModal.itemId, payload);
        setItens((prev) =>
          prev.map((i) =>
            i.id === itemModal.itemId ? { ...i, ...payload } : i,
          ),
        );
      } else {
        const novo = await itensService.create(payload);
        setItens((prev) => [novo, ...prev]);
      }
    },
    [itemModal.categoriaId, itemModal.itemId],
  );

  const handleCloseItemModal = useCallback(() => {
    setItemModal({ isOpen: false, categoriaId: null, itemId: null });
    setFormData(FORM_DATA_VAZIO);
  }, []);

  const handleAddItem = useCallback((categoriaId) => {
    setFormData({
      ...FORM_DATA_VAZIO,
      categoriaId: categoriaId,
    });
    setItemModal({ isOpen: true, categoriaId, itemId: null });
  }, []);

  const handleEditItem = useCallback(
    (itemId) => {
      const item = itens.find((i) => i.id === itemId);
      if (!item) return;

      setItemModal({ isOpen: true, categoriaId: item.categoriaId, itemId });
      setFormData({
        nome: item.nome || "",
        marca: item.marca || "",
        preco: Number(item.preco) || 0,
        quantidade: item.quantidade || 1,
        pagamento: item.pagamento || "normal",
        prioridade: item.prioridade || "normal",
        loja: item.loja || "",
        linkProduto: item.linkProduto || "",
        fotoUrl: item.fotoUrl || "",
        categoriaId: item.categoriaId,
      });
    },
    [itens],
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      const backup = [...itens];
      setItens((prev) => prev.filter((i) => i.id !== id));
      try {
        await itensService.delete(id);
      } catch {
        setItens(backup);
      }
    },
    [itens],
  );

  const handleToggleComprado = useCallback(
    async (itemId) => {
      const itemAtual = itens.find((i) => i.id === itemId);
      if (!itemAtual) return;

      const novoEstado = !itemAtual.comprado;

      setItens((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, comprado: novoEstado } : i)),
      );

      try {
        await itensService.updateComprado(itemId, novoEstado);
      } catch (error) {
        console.error("Erro:", error);
        setItens((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, comprado: itemAtual.comprado } : i,
          ),
        );
      }
    },
    [itens],
  );

  // ---------- Drag & Drop de itens entre categorias ----------
  const handleItemDragStart = useCallback((itemId) => {
    draggedItemIdRef.current = String(itemId);
  }, []);

  const handleItemDragEnd = useCallback(() => {
    draggedItemIdRef.current = null;
  }, []);

  const handleItemDrop = useCallback(
    async (novaCategoriaId) => {
      const itemId = draggedItemIdRef.current;

      if (!itemId) return;
      const item = itens.find((i) => String(i.id) === String(itemId));
      if (!item) {
        return;
      }

      if (String(item.categoriaId) === String(novaCategoriaId)) {
        return;
      }
      const categoriaAnterior = item.categoriaId;

      setItens((prev) =>
        prev.map((i) =>
          String(i.id) === String(itemId)
            ? { ...i, categoriaId: novaCategoriaId }
            : i,
        ),
      );

      try {
        await itensService.updateCategoria(String(itemId), novaCategoriaId);
      } catch (error) {
        setItens((prev) =>
          prev.map((i) =>
            String(i.id) === String(itemId)
              ? { ...i, categoriaId: categoriaAnterior }
              : i,
          ),
        );
      }
    },
    [itens],
  );

  // ---------- Categoria ----------
  const handleAddCategoria = useCallback(
    () =>
      setCategoriaModal({ isOpen: true, categoria: null, isEditing: false }),
    [],
  );

  const handleEditCategoria = useCallback((categoria) => {
    setCategoriaModal({ isOpen: true, categoria, isEditing: true });
  }, []);

  const handleCategoryAdded = useCallback((categoriaResultado, isEditing) => {
    if (isEditing) {
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === categoriaResultado.id ? { ...c, ...categoriaResultado } : c,
        ),
      );
    } else {
      setCategorias((prev) => [...prev, categoriaResultado]);
    }
  }, []);

  const handleDeleteCategoria = useCallback(
    async (id) => {
      const backup = [...categorias];
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      setItens((prev) => prev.filter((i) => i.categoriaId !== id));
      try {
        await categoriasService.delete(id);
      } catch {
        setCategorias(backup);
        const its = await itensService.getAll().catch(() => itens);
        setItens(Array.isArray(its) ? its : itens);
      }
    },
    [categorias, itens],
  );

  // ---------- UI ----------
  if (loading) {
    return (
      <PlanejamentoContainer theme={theme}>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Carregando...</p>
        </LoadingContainer>
      </PlanejamentoContainer>
    );
  }

  return (
    <PlanejamentoContainer theme={theme}>
      <WelcomeSection>
        <WelcomeTitle>
          Bem-vindo, {usuario?.nomeCompleto?.split(" ")[0]} 👋
        </WelcomeTitle>
        <WelcomeSubtitle>Organize seu lar</WelcomeSubtitle>
      </WelcomeSection>

      <ResumoCards resumo={resumo} comparativo={comparativo} theme={theme} />

      <Filtros
        filter={filter}
        setFilter={setFilter}
        onAddCategory={handleAddCategoria}
        theme={theme}
      />

      {categorias.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateIcon>🏠</EmptyStateIcon>
          <EmptyStateTitle>Comece criando uma categoria</EmptyStateTitle>
          <EmptyStateButton onClick={handleAddCategoria}>
            Criar categoria
          </EmptyStateButton>
        </EmptyStateContainer>
      ) : (
        <CategoriesGrid>
          {categorias.map((categoria) => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              itens={itensFiltrados.filter(
                (i) => i.categoriaId === categoria.id,
              )}
              onAddItem={handleAddItem}
              onUpdateItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onDeleteCategoria={handleDeleteCategoria}
              onEditCategoria={handleEditCategoria}
              onToggleComprado={handleToggleComprado}
              onItemDragStart={handleItemDragStart}
              onItemDragEnd={handleItemDragEnd}
              onItemDrop={handleItemDrop}
              draggedItemId={
                draggedItemIdRef.current
                  ? String(draggedItemIdRef.current)
                  : null
              }
              theme={theme}
            />
          ))}
        </CategoriesGrid>
      )}

      <ItemFormModal
        isOpen={itemModal.isOpen}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        isEditing={!!itemModal.itemId}
        theme={theme}
        categoriaId={itemModal.categoriaId}
        itemParaEditar={
          itemModal.itemId ? itens.find((i) => i.id === itemModal.itemId) : null
        }
      />

      <CategoriaFormModal
        isOpen={categoriaModal.isOpen}
        onClose={() =>
          setCategoriaModal({
            isOpen: false,
            categoria: null,
            isEditing: false,
          })
        }
        onCategoryAdded={handleCategoryAdded}
        categoriaParaEditar={categoriaModal.categoria}
        isEditing={categoriaModal.isEditing}
        theme={theme}
      />
    </PlanejamentoContainer>
  );
};

export default Planejamento;
