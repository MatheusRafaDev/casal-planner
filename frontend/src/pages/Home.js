import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ResumoCards from '../components/ResumoCards';
import CategoriaCard from '../components/CategoriaCard';
import AddCategoriaCard from '../components/AddCategoriaCard';
import Modal from '../components/Modal';
import { categoriasService } from '../services/categoriasService';
import { itensService } from '../services/itensService';

import { formatarMoeda, desformatarMoeda, formatarValorParaExibicao } from '../utils/mascaras';

const HomeContainer = styled.div`
  .cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 1.2rem;
    color: ${props => props.theme.textSoft};
  }
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
  padding: 2rem;
  background: ${props => props.theme.gradientSoft};
  border-radius: 24px;
  color: ${props => props.theme.text};

  h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: ${props => props.theme.textSoft};
    font-size: 1rem;
  }
`;

const Home = () => {
  const { theme } = useTheme();
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [itemModal, setItemModal] = useState({ isOpen: false, categoriaId: null, itemId: null });
  const [categoriaModal, setCategoriaModal] = useState(false);
  
  // Drag and drop
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Form states
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriasData, itensData, resumoData] = await Promise.all([
        categoriasService.getAll(),
        itensService.getAll(),

      ]);
      
      setCategorias(categoriasData);
      setItens(itensData);
      setResumo(resumoData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== DRAG AND DROP PARA CARDS =====
  const handleCardDragStart = (e, index) => {
    setDraggedCardIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleCardDragEnd = (e) => {
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
    e.target.classList.remove('dragging');
  };

  const handleCardDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
      nome: '',
      marca: '',
      preco: '',
      precoFormatado: '',
      quantidade: 1,
      pagamento: 'normal'
    });
  };

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

 const handleSaveItem = async () => {
  if (!formData.nome) {
    alert('Nome é obrigatório');
    return;
  }

  // 👇 CONVERTER CORRETAMENTE OS VALORES
  const precoNumerico = desformatarMoeda(formData.precoFormatado || formData.preco);
  
  const itemData = {
    nome: formData.nome.trim(),
    marca: formData.marca.trim() || '',
    preco: precoNumerico,
    quantidade: parseInt(formData.quantidade) || 1,
    categoriaId: itemModal.categoriaId,
    pagamento: formData.pagamento
  };

  console.log('📦 Enviando item:', itemData); // 👈 VERIFICAR NO CONSOLE

  try {
    if (itemModal.itemId) {
      await itensService.update(itemModal.itemId, itemData);
    } else {
      await itensService.create(itemData);
    }

    setItemModal({ isOpen: false, categoriaId: null, itemId: null });
    loadData();
  } catch (error) {
    console.error('❌ Erro detalhado:', error.response?.data);
    alert(`Erro: ${error.response?.data?.message || 'Erro ao salvar item'}`);
  }
};

  // ===== CRUD DE CATEGORIAS =====
  const handleDeleteCategoria = async (categoriaId) => {
    if (window.confirm('Remover esta categoria? Todos os itens serão perdidos!')) {
      await categoriasService.delete(categoriaId);
      loadData();
    }
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

  if (loading) {
    return (
      <HomeContainer theme={theme}>
        <div className="loading">Carregando...</div>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer theme={theme}>
      <WelcomeSection theme={theme}>
        <h2>Bem-vindo de volta, {usuario?.nomeCompleto?.split(' ')[0]}! 👋</h2>
        <p>Continue organizando seu lar com o CasalPlanner</p>
      </WelcomeSection>

      <ResumoCards resumo={resumo} />
      
      <div className="cards-container">
        {categorias.map((categoria, index) => (
          <div
            key={categoria.id}
            className={`drag-card-wrapper ${dragOverCardIndex === index ? 'drag-over' : ''} ${draggedCardIndex === index ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleCardDragStart(e, index)}
            onDragEnd={handleCardDragEnd}
            onDragOver={(e) => handleCardDragOver(e, index)}
            onDragLeave={() => setDragOverCardIndex(null)}
            onDrop={(e) => handleCardDrop(e, index)}
          >
            <CategoriaCard
              categoria={categoria}
              itens={itens.filter(i => i.categoriaId === categoria.id)}
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
        
        <AddCategoriaCard onClick={() => setCategoriaModal(true)} theme={theme} />
      </div>

      {/* Modal de Item */}
      <Modal
        isOpen={itemModal.isOpen}
        onClose={() => setItemModal({ isOpen: false, categoriaId: null, itemId: null })}
        title={itemModal.itemId ? '✏️ Editar Item' : '➕ Adicionar Item'}
        disableOutsideClick={true}
        theme={theme}
      >
        <FormGroup>
          <Label theme={theme}>Nome *</Label>
          <Input
            type="text"
            value={formData.nome}
            onChange={e => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Geladeira"
            theme={theme}
          />
        </FormGroup>

        <FormGroup>
          <Label theme={theme}>Marca</Label>
          <Input
            type="text"
            value={formData.marca}
            onChange={e => setFormData({ ...formData, marca: e.target.value })}
            placeholder="Ex: Consul"
            theme={theme}
          />
        </FormGroup>

        <FormGroup>
          <Label theme={theme}>Preço (R$) *</Label>
          <Input
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
            theme={theme}
          />
        </FormGroup>

        <FormGroup>
          <Label theme={theme}>Quantidade</Label>
          <Input
            type="number"
            min="1"
            value={formData.quantidade}
            onChange={e => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
            theme={theme}
          />
        </FormGroup>

        <FormGroup>
          <Label theme={theme}>Pagamento</Label>
          <Select
            value={formData.pagamento}
            onChange={e => setFormData({ ...formData, pagamento: e.target.value })}
            theme={theme}
          >
            <option value="normal">💵 Normal</option>
            <option value="vr">🍽️ VR/VA</option>
          </Select>
        </FormGroup>

        <ModalButtons>
          <CancelarButton onClick={() => setItemModal({ isOpen: false, categoriaId: null, itemId: null })} theme={theme}>
            Cancelar
          </CancelarButton>
          <SalvarButton onClick={handleSaveItem} theme={theme}>
            {itemModal.itemId ? 'Salvar' : 'Adicionar'}
          </SalvarButton>
        </ModalButtons>
      </Modal>

      {/* Modal de Categoria */}
      <Modal
        isOpen={categoriaModal}
        onClose={() => setCategoriaModal(false)}
        title="➕ Nova Categoria"
        disableOutsideClick={true}
        theme={theme}
      >
        <FormGroup>
          <Label theme={theme}>Nome da Categoria *</Label>
          <Input
            type="text"
            value={categoriaForm.nome}
            onChange={e => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
            placeholder="Ex: Escritório, Garagem, Jardim"
            theme={theme}
          />
        </FormGroup>

        <FormGroup>
          <Label theme={theme}>Ícone (opcional)</Label>
          <Input
            type="text"
            value={categoriaForm.icone}
            onChange={e => setCategoriaForm({ ...categoriaForm, icone: e.target.value })}
            placeholder="Ex: 📚, 🚗, 🌱"
            theme={theme}
          />
        </FormGroup>

        <FormGroup>
          <Label theme={theme}>Cor</Label>
          <Select
            value={categoriaForm.bg}
            onChange={e => setCategoriaForm({ ...categoriaForm, bg: e.target.value })}
            theme={theme}
          >
            <option value="#d6e9d6">Verde Claro</option>
            <option value="#f5ded2">Pêssego</option>
            <option value="#d6e3f0">Azul Claro</option>
            <option value="#e2d9ed">Lavanda</option>
            <option value="#f7d9df">Rosa Claro</option>
            <option value="#fff3cd">Amarelo</option>
            <option value="#d4edda">Menta</option>
            <option value="#cff4fc">Ciano</option>
          </Select>
        </FormGroup>

        <ModalButtons>
          <CancelarButton onClick={() => setCategoriaModal(false)} theme={theme}>
            Cancelar
          </CancelarButton>
          <SalvarButton onClick={handleSaveCategoria} theme={theme}>
            Criar Categoria
          </SalvarButton>
        </ModalButtons>
      </Modal>
    </HomeContainer>
  );
};

// Styled Components para os formulários
const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.textSoft};
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  transition: 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  font-size: 1rem;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelarButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.theme.border};
  color: ${props => props.theme.text};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${props => props.theme.textLight};
  }
`;

const SalvarButton = styled(CancelarButton)`
  background: ${props => props.theme.primary};
  color: white;

  &:hover {
    background: ${props => props.theme.primary}cc;
  }
`;

export default Home;