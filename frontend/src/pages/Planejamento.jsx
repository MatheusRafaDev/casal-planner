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

// ---------- Component ----------
const Planejamento = () => {
  const { theme } = useTheme();
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState(null);

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

  const [formData, setFormData] = useState({
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

  const scrollRef = useRef(0);

  // ---------- Mensagem ----------
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

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
      showMessage("Erro ao carregar dados", "error");
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
  const handleSaveItem = async () => {
    if (!formData.nome.trim()) return alert("Nome obrigatório");

    const payload = {
      ...formData,
      nome: formData.nome.trim(),
      preco: Number(formData.preco),
      quantidade: Number(formData.quantidade),
      categoriaId: itemModal.categoriaId,
    };

    try {
      if (itemModal.itemId) {
        await itensService.update(itemModal.itemId, payload);

        setItens((prev) =>
          prev.map((i) =>
            i.id === itemModal.itemId ? { ...i, ...payload } : i,
          ),
        );

        showMessage("Item atualizado");
      } else {
        const novo = await itensService.create(payload);
        setItens((prev) => [novo, ...prev]);
        showMessage("Item criado");
      }

      handleCloseItemModal();
    } catch {
      showMessage("Erro ao salvar item", "error");
    }
  };

  const handleCloseItemModal = () => {
    setItemModal({ isOpen: false, categoriaId: null, itemId: null });
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
    const item = itens.find((i) => i.id === itemId);
    if (!item) return;

    setItemModal({ isOpen: true, categoriaId: item.categoriaId, itemId });

    setFormData({
      ...item,
      preco: item.preco?.toString() || "",
      precoFormatado: formatarValorParaExibicao(item.preco || 0),
    });
  };

  const handleDeleteItem = async (id) => {
    const backup = [...itens];
    setItens((prev) => prev.filter((i) => i.id !== id));

    try {
      await itensService.delete(id);
    } catch {
      setItens(backup);
      showMessage("Erro ao deletar", "error");
    }
  };

  // ---------- Categoria ----------
  const handleAddCategoria = () =>
    setCategoriaModal({ isOpen: true, categoria: null, isEditing: false });

  const handleDeleteCategoria = async (id) => {
    const backup = categorias;
    setCategorias((prev) => prev.filter((c) => c.id !== id));

    try {
      await categoriasService.delete(id);
    } catch {
      setCategorias(backup);
      showMessage("Erro ao deletar categoria", "error");
    }
  };

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
      {message && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: 12,
            background: message.type === "error" ? "#f44336" : "#4caf50",
            color: "#fff",
          }}
        >
          {message.text}
        </div>
      )}

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
              onAddItem={(id) =>
                setItemModal({ isOpen: true, categoriaId: id })
              }
              onUpdateItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onDeleteCategoria={handleDeleteCategoria}
            />
          ))}
        </CategoriesGrid>
      )}

      <ItemFormModal
        isOpen={itemModal.isOpen}
        onClose={() =>
          setItemModal({ isOpen: false, categoriaId: null, itemId: null })
        }
        onSave={handleSaveItem}
        initialData={formData}
        isEditing={!!itemModal.itemId}
        theme={theme}
      />

      <CategoriaFormModal
        isOpen={categoriaModal.isOpen}
        onClose={() => setCategoriaModal({ isOpen: false })}
      />
    </PlanejamentoContainer>
  );
};

export default Planejamento;
