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

import { formatarValorParaExibicao } from "../utils/mascaras";

import {
  PlanejamentoContainer,
  WelcomeSection,
  WelcomeTitle,
  WelcomeSubtitle,
  LoadingContainer,
  LoadingSpinner,
  CategoriesGrid,
  DragCardWrapper,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateButton,
} from "../styles/pages/PlanejamentoStyles";

// Calcula o resumo localmente a partir dos itens — sem request de rede extra
const calcularResumoLocal = (itens) => {
  if (!Array.isArray(itens) || itens.length === 0) {
    return {
      atual: {
        totalGeral: 0,
        totalVR: 0,
        totalNormal: 0,
        totalComprados: 0,
        totalItens: 0,
        porCategoria: {},
        quantidadePorCategoria: {},
      },
      comparativo: {
        totalGeral: 0,
        totalVR: 0,
        totalNormal: 0,
        totalComprados: 0,
        percentualGeral: 0,
      },
    };
  }
  return resumoService.calcularResumoManual(itens);
};

const Planejamento = () => {
  const { theme } = useTheme();
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState({ text: "", type: "" });

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

  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    marca: "",
    preco: "",
    precoFormatado: "",
    quantidade: 1,
    pagamento: "normal",
    loja: "",
    linkProduto: "",
    fotoUrl: "",
  });

  const scrollPositionRef = useRef(0);
  const reordenarTimerRef = useRef(null);

  // Resumo calculado localmente — zero requests extras de rede
  const resumoCalculado = useMemo(() => calcularResumoLocal(itens), [itens]);
  const resumo = resumoCalculado.atual;
  const comparativo = resumoCalculado.comparativo;

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (usuario) {
      loadData();
    } else {
      setLoadingInicial(false);
      setError("Usuário não autenticado");
    }
    
  }, [usuario]);

  // Carrega categorias e itens em paralelo, chamado somente quando necessário
  const loadData = useCallback(async () => {
    try {
      scrollPositionRef.current = window.scrollY;
      setLoadingInicial(true);
      setError(null);

      const [categoriasResult, itensResult] = await Promise.allSettled([
        categoriasService.listarDoUsuario(),
        itensService.getAll(),
      ]);

      if (categoriasResult.status === "fulfilled") {
        const sorted = [...(categoriasResult.value || [])].sort(
          (a, b) => (a.ordem || 0) - (b.ordem || 0),
        );
        setCategorias(sorted);
      } else {
        setCategorias([]);
        showMessage("Erro ao carregar categorias", "error");
      }

      if (itensResult.status === "fulfilled") {
        setItens(Array.isArray(itensResult.value) ? itensResult.value : []);
      } else {
        setItens([]);
        showMessage("Erro ao carregar itens", "error");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar dados");
      showMessage("Erro ao carregar dados", "error");
    } finally {
      setLoadingInicial(false);
      setTimeout(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: "auto" });
      }, 0);
    }
  }, []);

  const categoriasArray = useMemo(
    () => (Array.isArray(categorias) ? categorias : []),
    [categorias],
  );

  const itensArray = useMemo(
    () => (Array.isArray(itens) ? itens : []),
    [itens],
  );

  const filteredItems = useMemo(() => {
    if (filter === "all") return itensArray;
    return itensArray.filter(
      (i) => i?.pagamento === (filter === "vrva" ? "vr" : "normal"),
    );
  }, [itensArray, filter]);

  // Toggle comprado com optimistic update — sem recarregar nada
  const handleToggleComprado = useCallback(async (itemId, comprado) => {
    setItens((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, comprado } : i)),
    );
    try {
      await itensService.updateComprado(itemId, comprado);
    } catch (error) {
      // Reverte se falhar
      setItens((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, comprado: !comprado } : i)),
      );
      showMessage("Erro ao atualizar item", "error");
    }
  }, []);

  // Drag & drop de cards de categoria
  const handleCardDragStart = (e, index) => {
    setDraggedCardIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCardDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedCardIndex !== null && index !== dragOverCardIndex) {
      setDragOverCardIndex(index);
    }
  };

  const handleCardDrop = async (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = e.dataTransfer.getData("text/plain");

    if (sourceIndex === null || sourceIndex === targetIndex.toString()) {
      setDraggedCardIndex(null);
      setDragOverCardIndex(null);
      return;
    }

    const newCategorias = [...categoriasArray];
    const [removed] = newCategorias.splice(parseInt(sourceIndex), 1);
    newCategorias.splice(targetIndex, 0, removed);

    setCategorias(newCategorias);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);

    // Debounce: espera 400ms antes de salvar no backend
    if (reordenarTimerRef.current) clearTimeout(reordenarTimerRef.current);
    reordenarTimerRef.current = setTimeout(async () => {
      try {
        const categoriaIds = newCategorias.map((c) => c.id);
        await categoriasService.reordenar(categoriaIds);
      } catch (error) {
        console.error("Erro ao salvar ordem:", error);
        await loadData();
      }
    }, 400);
  };

  // Drag & drop de itens entre categorias com optimistic update
  const handleItemDragStart = (itemId) => setDraggedItemId(itemId);
  const handleItemDragEnd = () => setDraggedItemId(null);

  const handleItemDrop = useCallback(
    async (categoriaId) => {
      if (!draggedItemId) return;

      const itemAtual = itensArray.find((i) => i.id === draggedItemId);
      if (itemAtual?.categoriaId === categoriaId) {
        setDraggedItemId(null);
        return;
      }

      setItens((prev) =>
        prev.map((i) => (i.id === draggedItemId ? { ...i, categoriaId } : i)),
      );
      setDraggedItemId(null);

      try {
        await itensService.updateCategoria(draggedItemId, categoriaId);
      } catch (error) {
        // Reverte
        setItens((prev) =>
          prev.map((i) =>
            i.id === draggedItemId
              ? { ...i, categoriaId: itemAtual.categoriaId }
              : i,
          ),
        );
        showMessage("Erro ao mover item", "error");
      }
    },
    [draggedItemId, itensArray],
  );

  // Categoria
  const handleAddCategoria = () =>
    setCategoriaModal({ isOpen: true, categoria: null, isEditing: false });

  const handleEditCategoria = (categoria) =>
    setCategoriaModal({ isOpen: true, categoria, isEditing: true });

  const handleDeleteCategoria = async (categoriaId) => {
    const backupCategorias = [...categoriasArray];
    const backupItens = [...itensArray];

    // Optimistic: remove local
    setCategorias((prev) => prev.filter((c) => c.id !== categoriaId));
    setItens((prev) => prev.filter((i) => i.categoriaId !== categoriaId));

    try {
      await categoriasService.delete(categoriaId);
      showMessage("Categoria deletada");
    } catch (error) {
      setCategorias(backupCategorias);
      setItens(backupItens);
      showMessage("Erro ao deletar categoria", "error");
    }
  };

  const handleCloseCategoriaModal = () =>
    setCategoriaModal({ isOpen: false, categoria: null, isEditing: false });

  // Item
  const handleAddItem = (categoriaId) => {
    setItemModal({ isOpen: true, categoriaId, itemId: null });
    setFormData({
      nome: "",
      marca: "",
      preco: "",
      precoFormatado: "",
      quantidade: 1,
      pagamento: "normal",
      prioridade: "normal",
      loja: "",
      linkProduto: "",
      fotoUrl: "",
    });
  };

  const handleEditItem = (itemId) => {
    const item = itensArray.find((i) => i.id === itemId);
    if (!item) return;
    setItemModal({
      isOpen: true,
      categoriaId: item.categoriaId,
      itemId: item.id,
    });
    setFormData({
      nome: item.nome || "",
      marca: item.marca || "",
      preco: item.preco?.toString() || "",
      precoFormatado: formatarValorParaExibicao(item.preco || 0),
      quantidade: item.quantidade || 1,
      pagamento: item.pagamento || "normal",
      prioridade: item.prioridade || "normal",
      loja: item.loja || "",
      linkProduto: item.linkProduto || "",
      fotoUrl: item.fotoUrl || "",
    });
  };

  const handleDeleteItem = useCallback(
    async (itemId) => {
      const backup = [...itens];
      setItens((prev) => prev.filter((i) => i.id !== itemId));
      try {
        await itensService.delete(itemId);
      } catch (error) {
        setItens(backup);
        showMessage("Erro ao deletar item", "error");
      }
    },
    [itens],
  );

  const handleSaveItem = async () => {
    if (!formData.nome?.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    const itemData = {
      nome: formData.nome.trim(),
      marca: formData.marca?.trim() || "",
      preco: formData.preco,
      quantidade: parseInt(formData.quantidade) || 1,
      categoriaId: itemModal.categoriaId,
      pagamento: formData.pagamento,
      prioridade: formData.prioridade || "normal",
      loja: formData.loja?.trim() || "",
      linkProduto: formData.linkProduto?.trim() || "",
      fotoUrl: formData.fotoUrl?.trim() || "",
    };

    try {
      if (itemModal.itemId) {
        // Edição: atualiza local imediatamente
        setItens((prev) =>
          prev.map((i) =>
            i.id === itemModal.itemId ? { ...i, ...itemData } : i,
          ),
        );
        setItemModal({ isOpen: false, categoriaId: null, itemId: null });
        await itensService.update(itemModal.itemId, itemData);
      } else {
        // Criação: fecha modal, cria no backend, adiciona na lista local
        setItemModal({ isOpen: false, categoriaId: null, itemId: null });
        const novoItem = await itensService.create(itemData);
        setItens((prev) => [novoItem, ...prev]);
      }
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      showMessage("Erro ao salvar item", "error");
      await loadData();
    }
  };

  if (loadingInicial) {
    return (
      <PlanejamentoContainer theme={theme}>
        <LoadingContainer theme={theme}>
          <LoadingSpinner theme={theme} />
          <p>Carregando...</p>
        </LoadingContainer>
      </PlanejamentoContainer>
    );
  }

  return (
    <PlanejamentoContainer theme={theme}>
      {message.text && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "12px 24px",
            background: message.type === "error" ? "#f44336" : "#4caf50",
            color: "white",
            borderRadius: "4px",
            zIndex: 9999,
          }}
        >
          {message.text}
        </div>
      )}

      <WelcomeSection theme={theme}>
        <WelcomeTitle theme={theme}>
          Bem-vindo, {usuario?.nomeCompleto?.split(" ")[0] || "Usuário"}! 👋
        </WelcomeTitle>
        <WelcomeSubtitle theme={theme}>
          Organize seu lar com o CasalPlanner
        </WelcomeSubtitle>
      </WelcomeSection>

      <ResumoCards resumo={resumo} comparativo={comparativo} theme={theme} />

      <Filtros
        filter={filter}
        setFilter={setFilter}
        onAddCategory={handleAddCategoria}
        theme={theme}
      />

      {categoriasArray.length === 0 ? (
        <EmptyStateContainer theme={theme}>
          <EmptyStateIcon>🏠</EmptyStateIcon>
          <EmptyStateTitle>Comece por aqui</EmptyStateTitle>
          <EmptyStateDescription>
            Crie sua primeira categoria para adicionar itens
          </EmptyStateDescription>
          <EmptyStateButton onClick={handleAddCategoria} theme={theme}>
            Criar categoria
          </EmptyStateButton>
        </EmptyStateContainer>
      ) : (
        <CategoriesGrid>
          {categoriasArray.map((categoria, index) => (
            <DragCardWrapper
              key={categoria?.id || index}
              $isDragging={draggedCardIndex === index}
              $isDragOver={dragOverCardIndex === index}
              onDragStart={(e) => handleCardDragStart(e, index)}
              onDragOver={(e) => handleCardDragOver(e, index)}
              onDragLeave={() => setDragOverCardIndex(null)}
              onDrop={(e) => handleCardDrop(e, index)}
              onDragEnd={() => {
                setDraggedCardIndex(null);
                setDragOverCardIndex(null);
              }}
            >
              <CategoriaCard
                categoria={categoria || {}}
                itens={filteredItems.filter(
                  (i) => i?.categoriaId === categoria?.id,
                )}
                onAddItem={handleAddItem}
                onUpdateItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onDeleteCategoria={handleDeleteCategoria}
                onEditCategoria={handleEditCategoria}
                onItemDragStart={handleItemDragStart}
                onItemDragEnd={handleItemDragEnd}
                onItemDrop={handleItemDrop}
                onToggleComprado={handleToggleComprado}
                draggedItemId={draggedItemId}
                theme={theme}
              />
            </DragCardWrapper>
          ))}
        </CategoriesGrid>
      )}

      <CategoriaFormModal
        isOpen={categoriaModal.isOpen}
        onClose={handleCloseCategoriaModal}
        onCategoryAdded={loadData}
        categoriaParaEditar={categoriaModal.categoria}
        isEditing={categoriaModal.isEditing}
        theme={theme}
      />

      <ItemFormModal
        isOpen={itemModal.isOpen}
        onClose={() =>
          setItemModal({ isOpen: false, categoriaId: null, itemId: null })
        }
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveItem}
        isEditing={!!itemModal.itemId}
        theme={theme}
      />
    </PlanejamentoContainer>
  );
};

export default Planejamento;
