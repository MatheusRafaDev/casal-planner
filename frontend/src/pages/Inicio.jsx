
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const [draggedItemId, setDraggedItemId] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    marca: "",
    preco: "",
    precoFormatado: "",
    quantidade: 1,
    pagamento: "normal",
  });


  const scrollPositionRef = useRef(0);

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
      scrollPositionRef.current = window.scrollY;
      
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        categoriasService.listarDoUsuario(),
        itensService.getAll(),
      ]);

      if (results[0].status === "fulfilled") {
        let categoriasData = results[0].value;
        categoriasData = categoriasData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
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
      
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
      }, 0);
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
    
    try {
      const categoriaIds = newCategorias.map(c => c.id);
      await categoriasService.reordenar(categoriaIds);
      showMessage("Categorias reordenadas");
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      await loadData();
    }

    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
  };


  const handleItemDragStart = (itemId) => {
    setDraggedItemId(itemId);
  };

  const handleItemDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleItemDrop = async (categoriaId) => {
    if (!draggedItemId) return;

    const itemAtual = itensArray.find((i) => i.id === draggedItemId);
    if (itemAtual?.categoriaId === categoriaId) {
      setDraggedItemId(null);
      return;
    }

    try {
      await itensService.update(draggedItemId, { categoriaId });
      await loadData();
      showMessage("Item movido");
    } catch (error) {
      console.error("Erro ao mover item:", error);
    } finally {
      setDraggedItemId(null);
    }
  };

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
      showMessage("Categoria deletada");
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
    }
  };


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
    });
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await itensService.delete(itemId);
      await loadData();
      showMessage("Item deletado");
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  };

  const handleSaveItem = async () => {
    if (!formData.nome?.trim()) {
      alert("Nome é obrigatório");
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
      } else {
        await itensService.create(itemData);
      }

      setItemModal({ isOpen: false, categoriaId: null, itemId: null });
      await loadData();
      showMessage("Item salvo");
    } catch (error) {
      console.error("Erro ao salvar item:", error);
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
          <p>Carregando...</p>
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
          Bem-vindo, {usuario?.nomeCompleto?.split(" ")[0] || "Usuário"}! 👋
        </WelcomeTitle>
        <WelcomeSubtitle theme={theme}>
          Organize seu lar com o CasalPlanner
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
          <p>Nenhuma categoria encontrada.</p>
          <button onClick={handleAddCategoria}>
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