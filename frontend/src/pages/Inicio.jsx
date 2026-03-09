// src/pages/Inicio.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import ResumoCards from "../components/ResumoCards";
import CategoriaCard from "../components/CategoriaCard";
import AddCategoriaModal from "../components/AddCategoriaModal";
import Filtros from "../components/Filtros";
import ItemFormModal from "../components/ItemFormModal";
import { categoriasService } from "../services/categoriasService";
import { itensService } from "../services/itensService";

import {
  formatarMoeda,
  desformatarMoeda,
  formatarValorParaExibicao,
} from "../utils/mascaras";

import {
  InicioContainer,
  WelcomeSection,
  WelcomeTitle,
  WelcomeSubtitle,
  LoadingContainer,
  LoadingSpinner,
  CategoriesGrid,
  DragCardWrapper,
} from "../styles/pages/InicioStyles";

const calcularResumo = (itens) => {
  const itensArray = Array.isArray(itens) ? itens : [];

  const totalGeral = itensArray.reduce(
    (acc, item) => acc + (item?.preco || 0) * (item?.quantidade || 0),
    0,
  );

  const totalVR = itensArray
    .filter((i) => i?.pagamento === "vr")
    .reduce(
      (acc, item) => acc + (item?.preco || 0) * (item?.quantidade || 0),
      0,
    );

  const totalNormal = itensArray
    .filter((i) => i?.pagamento === "normal")
    .reduce(
      (acc, item) => acc + (item?.preco || 0) * (item?.quantidade || 0),
      0,
    );

  const totalComprados = itensArray.filter((i) => i?.comprado).length;

  return {
    totalGeral,
    totalVR,
    totalNormal,
    totalComprados,
    totalItens: itensArray.length,
  };
};

const Inicio = () => {
  const { theme } = useTheme();
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [resumo, setResumo] = useState({
    totalGeral: 0,
    totalVR: 0,
    totalNormal: 0,
    totalComprados: 0,
    totalItens: 0,
  });

  const [loading, setLoading] = useState(true);
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
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    marca: "",
    preco: "",
    precoFormatado: "",
    quantidade: 1,
    pagamento: "normal",
  });

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (usuario) {
      loadData();
    } else {
      setLoading(false);
      setError("Usuário não autenticado");
    }
  }, [usuario]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        categoriasService.listarDoUsuario(),
        itensService.getAll(),
      ]);

      if (results[0].status === "fulfilled") {
        const categoriasData = results[0].value;
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
      } else {
        console.error("❌ Erro ao carregar categorias:", results[0].reason);
        setCategorias([]);
        showMessage("Erro ao carregar categorias", "error");
      }

      let itensData = [];
      if (results[1].status === "fulfilled") {
        itensData = results[1].value;
        setItens(Array.isArray(itensData) ? itensData : []);
      } else {
        setItens([]);
        showMessage("Erro ao carregar itens", "error");
      }

      setResumo(calcularResumo(itensData));
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setError(error.message || "Erro ao carregar dados");
      showMessage("Erro ao carregar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  const categoriasArray = useMemo(
    () => (Array.isArray(categorias) ? categorias : []),
    [categorias],
  );
  const itensArray = useMemo(
    () => (Array.isArray(itens) ? itens : []),
    [itens],
  );

  const filteredItems = useMemo(() => {
    if (!Array.isArray(itensArray)) return [];
    if (filter === "all") return itensArray;
    return itensArray.filter(
      (i) => i?.pagamento === (filter === "vrva" ? "vr" : "normal"),
    );
  }, [itensArray, filter]);

  const handleToggleComprado = async (itemId, comprado) => {
    try {
      await itensService.updateComprado(itemId, comprado);
      await loadData();
      showMessage("Item atualizado");
    } catch (error) {
      showMessage("Erro ao atualizar item", "error");
    }
  };

  const handleCardDragStart = (e, index) => {
    if (e.target.closest(".category-drag-handle")) {
      console.log("📦 Categoria drag start:", index);
      setDraggedCardIndex(index);
      e.dataTransfer.setData("text/plain", `categoria-${index}`);
      e.dataTransfer.effectAllowed = "move";
    } else {
      e.preventDefault();
    }
  };

  const handleCardDragEnd = () => {
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
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

    if (draggedCardIndex === null || draggedCardIndex === targetIndex) {
      setDraggedCardIndex(null);
      setDragOverCardIndex(null);
      return;
    }

    const newCategorias = [...categoriasArray];
    const [removed] = newCategorias.splice(draggedCardIndex, 1);
    newCategorias.splice(targetIndex, 0, removed);

    setCategorias(newCategorias);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
    showMessage("Categoria reordenada");
  };

  // Drag de ITENS
  const handleItemDragStart = (itemId) => {
   
    setDraggedItemId(itemId);
    setDraggedItem(true);
  };

  const handleItemDragEnd = () => {
    setDraggedItemId(null);
    setDraggedItem(null);
  };

  const handleItemDrop = async (categoriaId) => {
    
    if (!draggedItemId) {
      console.log("❌ Sem item sendo arrastado");
      return;
    }

    const itemAtual = itensArray.find((i) => i.id === draggedItemId);
    if (itemAtual?.categoriaId === categoriaId) {
      console.log("ℹ️ Item já está nesta categoria");
      setDraggedItemId(null);
      setDraggedItem(null);
      return;
    }

    try {
      await itensService.update(draggedItemId, { categoriaId });
      await loadData();
      showMessage("Item movido com sucesso");
    } catch (error) {
      console.error("❌ Erro ao mover item:", error);
      showMessage("Erro ao mover item", "error");
    } finally {
      setDraggedItemId(null);
      setDraggedItem(null);
    }
  };

  // Handlers de categoria
  const handleAddCategoria = () => {
    setCategoriaModal({
      isOpen: true,
      categoria: null,
      isEditing: false,
    });
  };

  const handleEditCategoria = (categoria) => {
    setCategoriaModal({
      isOpen: true,
      categoria,
      isEditing: true,
    });
  };

  const handleDeleteCategoria = async (categoriaId) => {
    try {
      await categoriasService.delete(categoriaId);
      await loadData();
      showMessage("Categoria deletada com sucesso");
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      showMessage("Erro ao deletar categoria", "error");
    }
  };

  // Handlers de item
  const handleAddItem = (categoriaId) => {
    setItemModal({
      isOpen: true,
      categoriaId,
      itemId: null,
    });
    setFormData({
      nome: "",
      marca: "",
      preco: "",
      precoFormatado: "",
      quantidade: 1,
      pagamento: "normal",
    });
  };

  const handleEditItem = (itemId) => {
    const item = itensArray.find((i) => i.id === itemId);
    if (!item) {
      showMessage("Item não encontrado", "error");
      return;
    }

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
    });
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await itensService.delete(itemId);
      await loadData();
      showMessage("Item deletado com sucesso");
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      showMessage("Erro ao deletar item", "error");
    }
  };

  const handleSaveItem = async () => {
    if (!formData.nome?.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    if (formData.quantidade <= 0) {
      alert("Quantidade deve ser maior que zero");
      return;
    }

    const precoNumerico = desformatarMoeda(formData.preco);

    if (precoNumerico < 0 || isNaN(precoNumerico)) {
      alert("Preço inválido");
      return;
    }

    const itemData = {
      nome: formData.nome.trim(),
      marca: formData.marca.trim() || "",
      preco: precoNumerico,
      quantidade: parseInt(formData.quantidade) || 1,
      categoriaId: itemModal.categoriaId,
      pagamento: formData.pagamento,
    };

    try {
      if (itemModal.itemId) {
        await itensService.update(itemModal.itemId, itemData);
        showMessage("Item atualizado com sucesso");
      } else {
        await itensService.create(itemData);
        showMessage("Item criado com sucesso");
      }

      setItemModal({ isOpen: false, categoriaId: null, itemId: null });
      await loadData();
    } catch (error) {
      console.error("Erro detalhado:", error.response?.data);
      alert(`Erro: ${error.response?.data?.message || "Erro ao salvar item"}`);
    }
  };

  const handleCloseCategoriaModal = () => {
    setCategoriaModal({
      isOpen: false,
      categoria: null,
      isEditing: false,
    });
  };

  if (loading) {
    return (
      <InicioContainer theme={theme}>
        <LoadingContainer theme={theme}>
          <LoadingSpinner theme={theme} />
          <p>Carregando seu planejamento...</p>
        </LoadingContainer>
      </InicioContainer>
    );
  }

  if (error) {
    return (
      <InicioContainer theme={theme}>
        <LoadingContainer theme={theme}>
          <p style={{ color: "#f44336" }}>Erro: {error}</p>
          <button
            onClick={loadData}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: theme?.primary || "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </LoadingContainer>
      </InicioContainer>
    );
  }

  return (
    <InicioContainer theme={theme}>
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
          Bem-vindo de volta,{" "}
          {usuario?.nomeCompleto?.split(" ")[0] || "Usuário"}! 👋
        </WelcomeTitle>
        <WelcomeSubtitle theme={theme}>
          Continue organizando seu lar com o CasalPlanner
        </WelcomeSubtitle>
      </WelcomeSection>

      <ResumoCards resumo={resumo} theme={theme} />

      <Filtros
        filter={filter}
        setFilter={setFilter}
        onAddCategory={handleAddCategoria}
        theme={theme}
      />

      {categoriasArray.length === 0 ? (
        <LoadingContainer theme={theme}>
          <p>
            Nenhuma categoria encontrada. Comece criando sua primeira categoria!
          </p>
          <button
            onClick={handleAddCategoria}
            style={{
              marginTop: "16px",
              padding: "12px 24px",
              background: theme?.primary || "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            + Adicionar Categoria
          </button>
        </LoadingContainer>
      ) : (
        <CategoriesGrid>
          {categoriasArray.map((categoria, index) => (
            <DragCardWrapper
              key={categoria?.id || index}
              $isDragging={draggedCardIndex === index}
              $isDragOver={dragOverCardIndex === index}
              draggable
              onDragStart={(e) => handleCardDragStart(e, index)}
              onDragEnd={handleCardDragEnd}
              onDragOver={(e) => handleCardDragOver(e, index)}
              onDragLeave={() => setDragOverCardIndex(null)}
              onDrop={(e) => handleCardDrop(e, index)}
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

      <AddCategoriaModal
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
    </InicioContainer>
  );
};

export default Inicio;
