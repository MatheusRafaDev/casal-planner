// Planejamento.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CategoriaCard from "../components/CategoriaCard";
import CategoriaFormModal from "../components/CategoriaFormModal";
import Filtros from "../components/Filtros";
import ItemFormModal from "../components/ItemFormModal";

import { categoriasService } from "../services/categoriasService";
import { itensService } from "../services/itensService";

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
  SkeletonWelcomeSection,
  SkeletonCategoriesGrid,
  SkeletonCategoryCard,
} from "../styles/pages/PlanejamentoStyles";



const FORM_DATA_VAZIO = {
  nome:"", marca:"", preco:0, quantidade:1,
  pagamento:"normal", prioridade:"normal",
  loja:"", fotoUrl: "",
};

const Planejamento = () => {
  const { theme }   = useTheme();
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");

  const [itemModal, setItemModal] = useState({ isOpen:false, categoriaId:null, itemId:null });
  const [categoriaModal, setCategoriaModal] = useState({ isOpen:false, categoria:null, isEditing:false });
  const [formData, setFormData] = useState(FORM_DATA_VAZIO);

  const draggedItemIdRef = useRef(null);
  const savedScrollRef   = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const saveScroll    = useCallback(() => { savedScrollRef.current = window.scrollY; }, []);
  const restoreScroll = useCallback(() => { requestAnimationFrame(() => window.scrollTo({ top:savedScrollRef.current, behavior:"instant" })); }, []);

  // ─── Load ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      savedScrollRef.current = window.scrollY;
      setLoading(true);
      // listar() retorna categorias padrão + do usuário e popula o cache local,
      // eliminando a request extra que verificarNomeExistente disparava em seguida.
      const [cats, its] = await Promise.all([categoriasService.listar(), itensService.getAll()]);
      setCategorias((cats||[]).sort((a,b)=>(a.ordem||0)-(b.ordem||0)));
      setItens(Array.isArray(its)?its:[]);
    } catch { /* toast nos services */ } finally {
      setLoading(false);
      requestAnimationFrame(() => window.scrollTo({ top:savedScrollRef.current, behavior:"instant" }));
    }
  }, []);

  useEffect(() => { if (usuario) loadData(); }, [usuario, loadData]);

  // ─── Memo ────────────────────────────────────────────────────────────────
  const itensFiltrados = useMemo(() => {
    if (filter==="all") return itens;
    if (filter==="comprado") return itens.filter(i=>i.comprado===true);
    return itens.filter(i=>i.pagamento===(filter==="vrva"?"vr":"normal"));
  }, [itens, filter]);

  

  // ─── Item ────────────────────────────────────────────────────────────────
  const handleSaveItem = useCallback(async (dadosDoModal) => {
    const payload = { ...dadosDoModal, categoriaId: dadosDoModal.categoriaId || itemModal.categoriaId };

    if (itemModal.itemId) {
      await itensService.update(itemModal.itemId, payload);
      setItens(prev => prev.map(i => i.id===itemModal.itemId ? {...i,...payload} : i));
    } else {
      const novo = await itensService.create(payload);
      setItens(prev => [novo, ...prev]);
    }
  }, [itemModal.categoriaId, itemModal.itemId]);

  const handleCloseItemModal = useCallback(() => {
    setItemModal({ isOpen:false, categoriaId:null, itemId:null });
    setFormData(FORM_DATA_VAZIO);
    restoreScroll();
  }, [restoreScroll]);

  const handleAddItem = useCallback((categoriaId) => {
    saveScroll();
    setFormData({ ...FORM_DATA_VAZIO, categoriaId });
    setItemModal({ isOpen:true, categoriaId, itemId:null });
  }, [saveScroll]);

  const handleEditItem = useCallback((itemId) => {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    saveScroll();
    setItemModal({ isOpen:true, categoriaId:item.categoriaId, itemId });
    setFormData({
      nome:       item.nome        || "",
      marca:      item.marca       || "",
      preco:      Number(item.preco) || 0,
      quantidade: item.quantidade  || 1,
      pagamento:  item.pagamento   || "normal",
      prioridade: item.prioridade  || "normal",
      loja:       item.loja        || "",
      fotoUrl:    item.fotoUrl     || "",
      categoriaId:item.categoriaId,
    });
  }, [itens, saveScroll]);

  const handleDeleteItem = useCallback(async (id) => {
    saveScroll();
    const backup = [...itens];
    setItens(prev => prev.filter(i => i.id !== id));
    restoreScroll();
    try {
      await itensService.delete(id);
    } catch {
      setItens(backup);
      restoreScroll();
    }
  }, [itens, saveScroll, restoreScroll]);

  const handleToggleComprado = useCallback(async (itemId) => {
    const itemAtual = itens.find(i => i.id === itemId);
    if (!itemAtual) return;
    saveScroll();
    const novoEstado = !itemAtual.comprado;
    setItens(prev => prev.map(i => i.id===itemId ? {...i, comprado:novoEstado} : i));
    restoreScroll();
    try {
      await itensService.updateComprado(itemId, novoEstado);
    } catch {
      setItens(prev => prev.map(i => i.id===itemId ? {...i, comprado:itemAtual.comprado} : i));
      restoreScroll();
    }
  }, [itens, saveScroll, restoreScroll]);

  // ─── Drag & Drop ─────────────────────────────────────────────────────────
  const handleItemDragStart = useCallback(id  => { draggedItemIdRef.current = String(id); }, []);
  const handleItemDragEnd   = useCallback(()  => { draggedItemIdRef.current = null; }, []);

  const handleItemDrop = useCallback(async (novaCategoriaId) => {
    const itemId = draggedItemIdRef.current;
    if (!itemId) return;
    const item = itens.find(i => String(i.id)===String(itemId));
    if (!item || String(item.categoriaId)===String(novaCategoriaId)) return;
    saveScroll();
    const anterior = item.categoriaId;
    setItens(prev => prev.map(i => String(i.id)===String(itemId) ? {...i, categoriaId:novaCategoriaId} : i));
    restoreScroll();
    try {
      await itensService.updateCategoria(String(itemId), novaCategoriaId);
    } catch {
      setItens(prev => prev.map(i => String(i.id)===String(itemId) ? {...i, categoriaId:anterior} : i));
      restoreScroll();
    }
  }, [itens, saveScroll, restoreScroll]);

  const handleCategoryDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categorias.findIndex(c => c.id === active.id);
    const newIndex = categorias.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newCategorias = arrayMove(categorias, oldIndex, newIndex);
    setCategorias(newCategorias);

    // Update order in database
    try {
      await Promise.all(newCategorias.map((cat, index) => 
        categoriasService.update(cat.id, { ...cat, ordem: index })
      ));
    } catch (error) {
      console.error('Failed to update category order:', error);
      // Revert on error
      setCategorias(categorias);
    }
  }, [categorias]);

  // ─── Categoria ───────────────────────────────────────────────────────────
  const handleAddCategoria = useCallback(() => setCategoriaModal({ isOpen:true, categoria:null, isEditing:false }), []);

  const handleEditCategoria = useCallback((categoria) => {
    saveScroll();
    setCategoriaModal({ isOpen:true, categoria, isEditing:true });
  }, [saveScroll]);

  const handleCloseCategoriaModal = useCallback(() => {
    setCategoriaModal({ isOpen:false, categoria:null, isEditing:false });
    restoreScroll();
  }, [restoreScroll]);

  const handleCategoryAdded = useCallback((resultado, isEditing) => {
    if (isEditing) {
      setCategorias(prev => prev.map(c => c.id===resultado.id ? {...c,...resultado} : c));
    } else {
      setCategorias(prev => [...prev, resultado]);
    }
    restoreScroll();
  }, [restoreScroll]);

  const handleDeleteCategoria = useCallback(async (id) => {
    saveScroll();
    const backup = [...categorias];
    setCategorias(prev => prev.filter(c => c.id !== id));
    setItens(prev => prev.filter(i => i.categoriaId !== id));
    restoreScroll();
    try {
      await categoriasService.delete(id);
    } catch {
      setCategorias(backup);
      const its = await itensService.getAll().catch(() => itens);
      setItens(Array.isArray(its) ? its : itens);
      restoreScroll();
    }
  }, [categorias, itens, saveScroll, restoreScroll]);

  // ─── UI ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PlanejamentoContainer theme={theme}>
        <SkeletonWelcomeSection theme={theme}/>
        <div style={{marginBottom:"1.5rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:"1rem"}}>
            {[1,2,3,4].map(n=>(
              <div key={n} style={{background:theme.border,borderRadius:"1rem",padding:"1rem",animation:"pulse 1.5s ease-in-out infinite"}}>
                <div style={{width:"32px",height:"32px",background:theme.surface,borderRadius:"0.75rem",marginBottom:"0.75rem"}}/>
                <div style={{width:"60%",height:"12px",background:theme.surface,borderRadius:"0.5rem",marginBottom:"0.5rem"}}/>
                <div style={{width:"80%",height:"20px",background:theme.surface,borderRadius:"0.5rem"}}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:"1.5rem",display:"flex",gap:"0.5rem"}}>
          {[1,2,3,4].map(n=><div key={n} style={{width:"80px",height:"40px",background:theme.border,borderRadius:"2rem",animation:"pulse 1.5s ease-in-out infinite"}}/>)}
        </div>
        <SkeletonCategoriesGrid theme={theme}>
          {[1,2,3,4,5,6].map(n=><SkeletonCategoryCard key={n} theme={theme}/>)}
        </SkeletonCategoriesGrid>
      </PlanejamentoContainer>
    );
  }

  return (
    <PlanejamentoContainer theme={theme}>
      
      <Filtros filter={filter} setFilter={setFilter} onAddCategory={handleAddCategoria} theme={theme}/>

      {categorias.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateIcon>🏠</EmptyStateIcon>
          <EmptyStateTitle>Comece criando uma categoria</EmptyStateTitle>
          <EmptyStateButton onClick={handleAddCategoria}>Criar categoria</EmptyStateButton>
        </EmptyStateContainer>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCategoryDragEnd}
        >
          <SortableContext
            items={categorias.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <CategoriesGrid>
              {categorias.map(categoria => (
                <CategoriaCard
                  key={categoria.id}
                  categoria={categoria}
                  itens={itensFiltrados.filter(i => i.categoriaId === categoria.id)}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onDeleteCategoria={handleDeleteCategoria}
                  onEditCategoria={handleEditCategoria}
                  onToggleComprado={handleToggleComprado}
                  onItemDragStart={handleItemDragStart}
                  onItemDragEnd={handleItemDragEnd}
                  onItemDrop={handleItemDrop}
                  draggedItemId={draggedItemIdRef.current ? String(draggedItemIdRef.current) : null}
                  theme={theme}
                />
              ))}
            </CategoriesGrid>
          </SortableContext>
        </DndContext>
      )}

      <ItemFormModal
        isOpen={itemModal.isOpen}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        isEditing={!!itemModal.itemId}
        theme={theme}
        categoriaId={itemModal.categoriaId}
        itemParaEditar={itemModal.itemId ? itens.find(i => i.id === itemModal.itemId) : null}
      />

      <CategoriaFormModal
        isOpen={categoriaModal.isOpen}
        onClose={handleCloseCategoriaModal}
        onCategoryAdded={handleCategoryAdded}
        categoriaParaEditar={categoriaModal.categoria}
        isEditing={categoriaModal.isEditing}
        theme={theme}
      />
    </PlanejamentoContainer>
  );
};

export default Planejamento;