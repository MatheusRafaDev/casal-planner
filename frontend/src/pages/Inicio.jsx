import React, { useState, useEffect } from "react";
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
} from "../styles/pages/InicioStyles";

const Inicio = () => {
  const { theme } = useTheme();
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Modals
  const [itemModal, setItemModal] = useState({
    isOpen: false,
    categoriaId: null,
    itemId: null,
  });
  const [categoriaModal, setCategoriaModal] = useState(false);

  // Drag and drop
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    marca: "",
    preco: "",
    precoFormatado: "",
    quantidade: 1,
    pagamento: "normal",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriasData, itensData] = await Promise.all([
        categoriasService.getAll(),
        itensService.getAll(),
      ]);

      setCategorias(categoriasData);
      setItens(itensData);

      // Calcular resumo manualmente
      const totalGeral = itensData.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0,
      );
      const totalVR = itensData
        .filter((i) => i.pagamento === "vr")
        .reduce((acc, item) => acc + item.preco * item.quantidade, 0);
      const totalNormal = itensData
        .filter((i) => i.pagamento === "normal")
        .reduce((acc, item) => acc + item.preco * item.quantidade, 0);
      const totalComprados = itensData.filter((i) => i.comprado).length;

      setResumo({
        totalGeral,
        totalVR,
        totalNormal,
        totalComprados,
        totalItens: itensData.length,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtro de itens
  const filteredItems =
    filter === "all"
      ? itens
      : itens.filter(
          (i) => i.pagamento === (filter === "vrva" ? "vr" : "normal"),
        );

  // ===== DRAG AND DROP PARA CARDS =====
  const handleCardDragStart = (e, index) => {
    setDraggedCardIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
  };

  const handleCardDragEnd = (e) => {
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
    e.target.classList.remove("dragging");
  };

  const handleCardDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedCardIndex !== null && index !== dragOverCardIndex) {
      setDragOverCardIndex(index);
    }
  };

  const handleCardDrop = (e, targetIndex) => {
    e.preventDefault();

    if (draggedCardIndex === null || draggedCardIndex === targetIndex) {
      setDraggedCardIndex(null);
      setDragOverCardIndex(null);
      return;
    }

    const newCategorias = [...categorias];
    const [removed] = newCategorias.splice(draggedCardIndex, 1);
    newCategorias.splice(targetIndex, 0, removed);

    setCategorias(newCategorias);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
  };

  // ===== DRAG AND DROP PARA ITENS =====
  const handleItemDragStart = (itemId) => {
    setDraggedItem(itemId);
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
  };

  const handleItemDrop = async (categoriaId) => {
    if (!draggedItem) return;

    await itensService.update(draggedItem, { categoriaId });
    loadData();
    setDraggedItem(null);
  };

  // ===== CRUD DE ITENS =====
  const handleAddItem = (categoriaId) => {
    setItemModal({ isOpen: true, categoriaId, itemId: null });
    setFormData({
      nome: "",
      marca: "",
      preco: "",
      precoFormatado: "",
      quantidade: 1,
      pagamento: "normal",
    });
  };

  const handleEditItem = (itemId, data) => {
    if (data.edit) {
      const item = itens.find((i) => i.id === itemId);
      setItemModal({ isOpen: true, categoriaId: item.categoriaId, itemId });
      setFormData({
        nome: item.nome,
        marca: item.marca || "",
        preco: item.preco.toString(),
        precoFormatado: formatarValorParaExibicao(item.preco),
        quantidade: item.quantidade,
        pagamento: item.pagamento,
      });
    } else {
      itensService.update(itemId, data).then(loadData);
    }
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm("Remover item?")) {
      itensService.delete(itemId).then(loadData);
    }
  };

  const handleSaveItem = async () => {
    if (!formData.nome) {
      alert("Nome é obrigatório");
      return;
    }

    const precoNumerico = desformatarMoeda(
      formData.precoFormatado || formData.preco,
    );

    const itemData = {
      nome: formData.nome.trim(),
      marca: formData.marca.trim() || "",
      preco: precoNumerico,
      quantidade: parseInt(formData.quantidade) || 1,
      categoriaId: itemModal.categoriaId,
      pagamento: formData.pagamento,
    };

    console.log("📦 Enviando item:", itemData);

    try {
      if (itemModal.itemId) {
        await itensService.update(itemModal.itemId, itemData);
      } else {
        await itensService.create(itemData);
      }

      setItemModal({ isOpen: false, categoriaId: null, itemId: null });
      loadData();
    } catch (error) {
      console.error("❌ Erro detalhado:", error.response?.data);
      alert(`Erro: ${error.response?.data?.message || "Erro ao salvar item"}`);
    }
  };

  // ===== CRUD DE CATEGORIAS =====
  const handleDeleteCategoria = async (categoriaId) => {
    if (
      window.confirm("Remover esta categoria? Todos os itens serão perdidos!")
    ) {
      await categoriasService.delete(categoriaId);
      loadData();
    }
  };

  if (loading) {
    return (
      <InicioContainer theme={theme}>
        <div className="loading">Carregando...</div>
      </InicioContainer>
    );
  }

  return (
    <InicioContainer theme={theme}>
      <WelcomeSection theme={theme}>
        <h2>Bem-vindo de volta, {usuario?.nomeCompleto?.split(" ")[0]}! 👋</h2>
        <p>Continue organizando seu lar com o CasalPlanner</p>
      </WelcomeSection>

      <ResumoCards resumo={resumo} />

      <Filtros
        filter={filter}
        setFilter={setFilter}
        onAddCategory={() => setCategoriaModal(true)}
        theme={theme}
      />

      <div className="cards-container">
        {categorias.map((categoria, index) => (
          <div
            key={categoria.id}
            className={`drag-card-wrapper ${dragOverCardIndex === index ? "drag-over" : ""} ${draggedCardIndex === index ? "dragging" : ""}`}
            draggable
            onDragStart={(e) => handleCardDragStart(e, index)}
            onDragEnd={handleCardDragEnd}
            onDragOver={(e) => handleCardDragOver(e, index)}
            onDragLeave={() => setDragOverCardIndex(null)}
            onDrop={(e) => handleCardDrop(e, index)}
          >
            <CategoriaCard
              categoria={categoria}
              itens={filteredItems.filter(
                (i) => i.categoriaId === categoria.id,
              )}
              onAddItem={handleAddItem}
              onUpdateItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onDeleteCategoria={handleDeleteCategoria}
              onItemDragStart={handleItemDragStart}
              onItemDragEnd={handleItemDragEnd}
              onItemDrop={handleItemDrop}
              draggedItem={draggedItem}
              theme={theme}
            />
          </div>
        ))}

        <AddCategoriaModal
          isOpen={categoriaModal}
          onClose={() => setCategoriaModal(false)}
          onCategoryAdded={loadData}
        />
      </div>


      <ItemFormModal
        isOpen={itemModal.isOpen}
        onClose={() => setItemModal({ isOpen: false, categoriaId: null, itemId: null })}
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