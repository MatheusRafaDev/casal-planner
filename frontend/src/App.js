import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Header from './components/Header';
import ResumoCards from './components/ResumoCards';
import CategoriaCard from './components/CategoriaCard';
import AddCategoriaCard from './components/AddCategoriaCard';
import Modal from './components/Modal';
import { categoriasService } from './services/categoriasService';
import { itensService } from './services/itensService';
import { resumoService } from './services/resumoService';
import { formatarMoeda, desformatarMoeda, formatarValorParaExibicao } from './utils/mascaras';
import './App.css';

function AppContent() {
  const { estaAutenticado, loading } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Modals
  const [itemModal, setItemModal] = useState({ isOpen: false, categoriaId: null, itemId: null });
  const [categoriaModal, setCategoriaModal] = useState(false);
  
  // Form states - ADICIONADO precoFormatado
  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    preco: '',
    precoFormatado: '',
    quantidade: 1,
    pagamento: 'normal'
  });

  const [categoriaForm, setCategoriaForm] = useState({
    nome: '',
    icone: '',
    bg: '#d6e9d6'
  });

  useEffect(() => {
    if (estaAutenticado) {
      loadData();
    }
  }, [estaAutenticado]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [categoriasData, itensData, resumoData] = await Promise.all([
        categoriasService.getAll(),
        itensService.getAll(),
        resumoService.get()
      ]);
      
      setCategorias(categoriasData);
      setItens(itensData);
      setResumo(resumoData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleExport = () => {
    const data = {
      categorias,
      itens,
      exportadoEm: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casalplanner-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        alert('Importação simulada - implementar lógica no backend');
      } catch (err) {
        alert('Arquivo inválido');
      }
    };
    reader.readAsText(file);
  };

  // MODIFICADO - handleAddItem com precoFormatado vazio
  const handleAddItem = (categoriaId) => {
    setItemModal({ isOpen: true, categoriaId, itemId: null });
    setFormData({
      nome: '',
      marca: '',
      preco: '',
      precoFormatado: '',
      quantidade: 1,
      pagamento: 'normal'
    });
  };

  // MODIFICADO - handleEditItem com precoFormatado
  const handleEditItem = (itemId, data) => {
    if (data.edit) {
      const item = itens.find(i => i.id === itemId);
      setItemModal({ isOpen: true, categoriaId: item.categoriaId, itemId });
      setFormData({
        nome: item.nome,
        marca: item.marca || '',
        preco: item.preco.toString(),
        precoFormatado: formatarValorParaExibicao(item.preco),
        quantidade: item.quantidade,
        pagamento: item.pagamento
      });
    } else {
      itensService.update(itemId, data).then(loadData);
    }
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Remover item?')) {
      itensService.delete(itemId).then(loadData);
    }
  };

  const handleMoveItem = async (itemId, novaCategoriaId) => {
    await itensService.update(itemId, { categoriaId: novaCategoriaId });
    loadData();
  };

  const handleDeleteCategoria = async (categoriaId) => {
    if (window.confirm('Remover esta categoria?')) {
      await categoriasService.delete(categoriaId);
      loadData();
    }
  };

  // MODIFICADO - handleSaveItem com desformatarMoeda
  const handleSaveItem = async () => {
    if (!formData.nome) {
      alert('Nome é obrigatório');
      return;
    }

    const itemData = {
      nome: formData.nome,
      marca: formData.marca,
      preco: desformatarMoeda(formData.precoFormatado || formData.preco) || 0,
      quantidade: parseInt(formData.quantidade) || 1,
      categoriaId: itemModal.categoriaId,
      pagamento: formData.pagamento
    };

    if (itemModal.itemId) {
      await itensService.update(itemModal.itemId, itemData);
    } else {
      await itensService.create(itemData);
    }

    setItemModal({ isOpen: false, categoriaId: null, itemId: null });
    loadData();
  };

  const handleSaveCategoria = async () => {
    if (!categoriaForm.nome) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    const textColors = {
      '#d6e9d6': '#2c5e2c',
      '#f5ded2': '#b84a2c',
      '#d6e3f0': '#2c5282',
      '#e2d9ed': '#553c9a',
      '#f7d9df': '#97266d',
      '#fff3cd': '#856404',
      '#d4edda': '#155724',
      '#cff4fc': '#0c5460'
    };

    await categoriasService.create({
      nome: categoriaForm.nome,
      icone: categoriaForm.icone,
      bg: categoriaForm.bg,
      text: textColors[categoriaForm.bg] || '#2c3e50'
    });

    setCategoriaModal(false);
    setCategoriaForm({ nome: '', icone: '', bg: '#d6e9d6' });
    loadData();
  };

  if (loading || loadingData) {
    return <div className="loading">Carregando...</div>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider>
      <div className="container">
        <Header onExport={handleExport} onImport={handleImport} />
        
        <ResumoCards resumo={resumo} />
        
        <div className="cards-container">
          {categorias.map(categoria => (
            <CategoriaCard
              key={categoria.id}
              categoria={categoria}
              itens={itens.filter(i => i.categoriaId === categoria.id)}
              onAddItem={handleAddItem}
              onUpdateItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onDeleteCategoria={handleDeleteCategoria}
              onMoveItem={handleMoveItem}
            />
          ))}
          
          <AddCategoriaCard onClick={() => setCategoriaModal(true)} />
        </div>

        {/* Modal de Item - MODIFICADO com máscara e disableOutsideClick */}
        <Modal
          isOpen={itemModal.isOpen}
          onClose={() => setItemModal({ isOpen: false, categoriaId: null, itemId: null })}
          title={itemModal.itemId ? '✏️ Editar Item' : '➕ Adicionar Item'}
          disableOutsideClick={true}
        >
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Geladeira"
            />
          </div>

          <div className="form-group">
            <label>Marca</label>
            <input
              type="text"
              value={formData.marca}
              onChange={e => setFormData({ ...formData, marca: e.target.value })}
              placeholder="Ex: Consul"
            />
          </div>

          <div className="form-group">
            <label>Preço (R$) *</label>
            <input
              type="text"
              value={formData.precoFormatado}
              onChange={e => {
                const rawValue = e.target.value;
                const formatado = formatarMoeda(rawValue);
                setFormData({ 
                  ...formData, 
                  precoFormatado: formatado,
                  preco: desformatarMoeda(formatado).toString()
                });
              }}
              placeholder="Ex: 2.500,00"
            />
          </div>

          <div className="form-group">
            <label>Quantidade</label>
            <input
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={e => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="form-group">
            <label>Pagamento</label>
            <select
              value={formData.pagamento}
              onChange={e => setFormData({ ...formData, pagamento: e.target.value })}
            >
              <option value="normal">💵 Normal</option>
              <option value="vr">🍽️ VR/VA</option>
            </select>
          </div>

          <div className="modal-buttons">
            <button 
              className="btn-secondary"
              onClick={() => setItemModal({ isOpen: false, categoriaId: null, itemId: null })}
            >
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSaveItem}>
              {itemModal.itemId ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </Modal>

        {/* Modal de Categoria - também com disableOutsideClick */}
        <Modal
          isOpen={categoriaModal}
          onClose={() => setCategoriaModal(false)}
          title="➕ Nova Categoria"
          disableOutsideClick={true}
        >
          <div className="form-group">
            <label>Nome da Categoria *</label>
            <input
              type="text"
              value={categoriaForm.nome}
              onChange={e => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
              placeholder="Ex: Escritório, Garagem, Jardim"
            />
          </div>

          <div className="form-group">
            <label>Ícone (opcional)</label>
            <input
              type="text"
              value={categoriaForm.icone}
              onChange={e => setCategoriaForm({ ...categoriaForm, icone: e.target.value })}
              placeholder="Ex: 📚, 🚗, 🌱"
            />
          </div>

          <div className="form-group">
            <label>Cor</label>
            <select
              value={categoriaForm.bg}
              onChange={e => setCategoriaForm({ ...categoriaForm, bg: e.target.value })}
            >
              <option value="#d6e9d6">Verde Claro</option>
              <option value="#f5ded2">Pêssego</option>
              <option value="#d6e3f0">Azul Claro</option>
              <option value="#e2d9ed">Lavanda</option>
              <option value="#f7d9df">Rosa Claro</option>
              <option value="#fff3cd">Amarelo</option>
              <option value="#d4edda">Menta</option>
              <option value="#cff4fc">Ciano</option>
            </select>
          </div>

          <div className="modal-buttons">
            <button className="btn-secondary" onClick={() => setCategoriaModal(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSaveCategoria}>
              Criar Categoria
            </button>
          </div>
        </Modal>
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Componente de rota privada
const PrivateRoute = () => {
  const { estaAutenticado, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }
  
  return estaAutenticado ? <AppContent /> : <Navigate to="/login" replace />;
};

export default App;