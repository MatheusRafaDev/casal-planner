// Planejamento.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import CategoriaFormModal from "../components/CategoriaFormModal";
import ItemFormModal from "../components/ItemFormModal";

// New components
import PlanningSidebar from "../components/PlanningSidebar";
import PlanningHeader from "../components/PlanningHeader";
import PlanningSummaryCards from "../components/PlanningSummaryCards";
import PlanningCategoriesPanel from "../components/PlanningCategoriesPanel";
import PlanningItemList from "../components/PlanningItemList";
import AddItemWizard from "../components/AddItemWizard";
import PlanningMobile from "../components/PlanningMobile";

import { categoriasService } from "../services/categoriasService";
import { itensService } from "../services/itensService";

import {
  PlanejamentoContainer,
  SkeletonWelcomeSection,
  SkeletonCategoriesGrid,
  SkeletonCategoryCard,
} from "../styles/pages/PlanejamentoStyles";

import * as MainLayout from "../styles/pages/PlanejamentoMainLayoutStyles";

const Planejamento = () => {
  const { theme }   = useTheme();
  const { usuario } = useAuth();

  const [categorias, setCategorias] = useState([]);
  const [itens, setItens]           = useState([]);
  const [loading, setLoading]       = useState(true);

  const [itemModal, setItemModal] = useState({ isOpen:false, categoriaId:null, itemId:null });
  const [categoriaModal, setCategoriaModal] = useState({ isOpen:false, categoria:null, isEditing:false });

  // New state for new components
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const savedScrollRef   = useRef(0);

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
    let filtered = itens;

    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(i => i.categoriaId === selectedCategory);
    }

    return filtered;
  }, [itens, selectedCategory]);

  // Calculate summary data
  const resumo = useMemo(() => {
    const totalGeral = itens.reduce((acc, item) => acc + (item.preco * item.quantidade || 0), 0);
    const totalPago = itens.filter(i => i.comprado).reduce((acc, item) => acc + (item.preco * item.quantidade || 0), 0);
    const totalComprados = itens.filter(i => i.comprado).length;
    const totalItens = itens.length;

    return {
      totalGeral,
      totalPago,
      totalComprados,
      totalItens,
    };
  }, [itens]);

  

  // ─── Item ────────────────────────────────────────────────────────────────
  const handleSaveItem = useCallback(async (dadosDoModal) => {
    const payload = { ...dadosDoModal, categoriaId: dadosDoModal.categoriaId || itemModal.categoriaId };

    if (itemModal.itemId) {
      const atualizado = await itensService.update(itemModal.itemId, payload);
      setItens(prev => prev.map(i => i.id === itemModal.itemId ? atualizado : i));
    } else {
      const novo = await itensService.create(payload);
      setItens(prev => [novo, ...prev]);
    }
  }, [itemModal.categoriaId, itemModal.itemId]);

  const handleCloseItemModal = useCallback(() => {
    setItemModal({ isOpen:false, categoriaId:null, itemId:null });
    restoreScroll();
  }, [restoreScroll]);

  const handleEditItem = useCallback((itemId) => {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    saveScroll();
    setItemModal({ isOpen:true, categoriaId:item.categoriaId, itemId });
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

  const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    saveScroll();
    const anterior = item.quantidade;
    setItens(prev => prev.map(i => i.id === itemId ? { ...i, quantidade: newQuantity } : i));
    restoreScroll();
    try {
      await itensService.update(itemId, { ...item, quantidade: newQuantity });
    } catch {
      setItens(prev => prev.map(i => i.id === itemId ? { ...i, quantidade: anterior } : i));
      restoreScroll();
    }
  }, [itens, saveScroll, restoreScroll]);

  const handleOpenWizard = useCallback(() => {
    setWizardOpen(true);
  }, []);

  const handleCloseWizard = useCallback(() => {
    setWizardOpen(false);
  }, []);

  const handleWizardSave = useCallback(async (dados) => {
    try {
      const novo = await itensService.create(dados);
      setItens(prev => [novo, ...prev]);
      handleCloseWizard();
    } catch (error) {
      console.error('Error saving item from wizard:', error);
    }
  }, [handleCloseWizard]);

  const handleToggleFilters = useCallback(() => {
    setFilterActive(prev => !prev);
  }, []);

  const handleSelectCategory = useCallback((categoriaId) => {
    setSelectedCategory(categoriaId);
  }, []);

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

  // ─── Categoria ───────────────────────────────────────────────────────────
  const handleAddCategoria = useCallback(() => setCategoriaModal({ isOpen:true, categoria:null, isEditing:false }), []);

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
    <>
      {/* Desktop Layout */}
      <MainLayout.DesktopLayout>
        <PlanningSidebar resumo={resumo} />
        
        <MainLayout.MainContent>
          <PlanningHeader 
            onAddItem={handleOpenWizard}
            onToggleFilters={handleToggleFilters}
            filterActive={filterActive}
          />
          
          <PlanningSummaryCards resumo={resumo} />
          
          <MainLayout.ContentArea>
            <PlanningCategoriesPanel 
              categorias={categorias}
              itens={itens}
              onAddCategory={handleAddCategoria}
              onSelectCategory={handleSelectCategory}
              selectedCategory={selectedCategory}
            />
            
            <PlanningItemList 
              itens={itensFiltrados}
              onToggleComprado={handleToggleComprado}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onQuantityChange={handleQuantityChange}
            />
          </MainLayout.ContentArea>
        </MainLayout.MainContent>
      </MainLayout.DesktopLayout>

      {/* Mobile Layout */}
      <PlanningMobile 
        resumo={resumo}
        categorias={categorias}
        itens={itensFiltrados}
        onAddItem={handleOpenWizard}
        onToggleFilters={handleToggleFilters}
        onSelectCategory={handleSelectCategory}
        onToggleComprado={handleToggleComprado}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Modals */}
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

      <AddItemWizard
        isOpen={wizardOpen}
        onClose={handleCloseWizard}
        categorias={categorias}
        onSave={handleWizardSave}
      />
    </>
  );
};

export default Planejamento;