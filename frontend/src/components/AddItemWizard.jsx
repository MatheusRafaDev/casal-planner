import React, { useState } from 'react';
import { X, Search, Plus, ArrowRight, ArrowLeft, Check, Package, Edit3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import * as S from '../styles/components/AddItemWizardStyles';

const AddItemWizard = ({ isOpen, onClose, categorias, onSave }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState('initial'); // initial, search, manual, hybrid, complete
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    preco: 0,
    loja: '',
    categoriaId: '',
    prioridade: 'normal',
    quantidade: 1,
    pagamento: 'normal',
    parcelas: 1,
    observacao: '',
    fotoUrl: '',
  });

  if (!isOpen) return null;

  const flows = [
    {
      id: 'search',
      icon: Search,
      title: 'Pesquisar produto',
      description: 'Encontre o produto e importe os dados automaticamente.',
    },
    {
      id: 'manual',
      icon: Edit3,
      title: 'Adicionar manualmente',
      description: 'Preencha os dados manualmente.',
    },
    {
      id: 'hybrid',
      icon: Plus,
      title: 'Híbrido',
      description: 'Informe nome e categoria, depois encontre preços.',
    },
  ];

  const handleFlowSelect = (flowId) => {
    setSelectedFlow(flowId);
    if (flowId === 'search') {
      setStep('search');
    } else if (flowId === 'manual') {
      setStep('manual');
    } else if (flowId === 'hybrid') {
      setStep('hybrid');
    }
  };

  const handleSearch = async () => {
    // Simulate search - in real app, this would call an API
    const mockResults = [
      {
        id: 1,
        nome: 'Panela de Pressão 4L',
        preco: 299.90,
        loja: 'Magazine Luiza',
        fotoUrl: 'https://via.placeholder.com/100',
      },
      {
        id: 2,
        nome: 'Panela de Pressão 6L',
        preco: 399.90,
        loja: 'Amazon',
        fotoUrl: 'https://via.placeholder.com/100',
      },
    ];
    setSearchResults(mockResults);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      nome: product.nome,
      preco: product.preco,
      loja: product.loja,
      fotoUrl: product.fotoUrl,
    }));
    setStep('complete');
  };

  const handleManualSubmit = () => {
    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setStep('initial');
    setSelectedFlow(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setFormData({
      nome: '',
      preco: 0,
      loja: '',
      categoriaId: '',
      prioridade: 'normal',
      quantidade: 1,
      pagamento: 'normal',
      parcelas: 1,
      observacao: '',
      fotoUrl: '',
    });
    onClose();
  };

  const handleBack = () => {
    if (step === 'search' || step === 'manual' || step === 'hybrid') {
      setStep('initial');
      setSelectedFlow(null);
    } else if (step === 'complete') {
      setStep(selectedFlow);
    }
  };

  return (
    <S.Overlay theme={theme} onClick={handleClose}>
      <S.Modal theme={theme} onClick={e => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>
            {step === 'initial' && 'Adicionar Item'}
            {step === 'search' && 'Pesquisar Produto'}
            {step === 'manual' && 'Adicionar Manualmente'}
            {step === 'hybrid' && 'Híbrido'}
            {step === 'complete' && 'Completar Dados'}
          </S.ModalTitle>
          <S.CloseButton onClick={handleClose} theme={theme}>
            <X size={20} />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalContent>
          {step === 'initial' && (
            <S.FlowSelection>
              {flows.map(flow => (
                <S.FlowCard
                  key={flow.id}
                  onClick={() => handleFlowSelect(flow.id)}
                  theme={theme}
                >
                  <S.FlowIcon theme={theme}>
                    <flow.icon size={32} />
                  </S.FlowIcon>
                  <S.FlowTitle>{flow.title}</S.FlowTitle>
                  <S.FlowDescription>{flow.description}</S.FlowDescription>
                  <S.FlowArrow>
                    <ArrowRight size={20} />
                  </S.FlowArrow>
                </S.FlowCard>
              ))}
            </S.FlowSelection>
          )}

          {step === 'search' && (
            <S.SearchFlow>
              <S.SearchInputContainer>
                <S.SearchIcon>
                  <Search size={20} />
                </S.SearchIcon>
                <S.SearchInput
                  placeholder="Digite o nome do produto..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  theme={theme}
                />
                <S.SearchButton onClick={handleSearch} theme={theme}>
                  <Search size={18} />
                  Buscar
                </S.SearchButton>
              </S.SearchInputContainer>

              {searchResults.length > 0 && (
                <S.SearchResults>
                  {searchResults.map(product => (
                    <S.ResultCard
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      theme={theme}
                    >
                      <S.ResultImage src={product.fotoUrl} alt={product.nome} />
                      <S.ResultInfo>
                        <S.ResultName>{product.nome}</S.ResultName>
                        <S.ResultStore>{product.loja}</S.ResultStore>
                        <S.ResultPrice theme={theme}>
                          R$ {product.preco.toFixed(2)}
                        </S.ResultPrice>
                      </S.ResultInfo>
                      <S.ResultArrow>
                        <ArrowRight size={20} />
                      </S.ResultArrow>
                    </S.ResultCard>
                  ))}
                </S.SearchResults>
              )}
            </S.SearchFlow>
          )}

          {step === 'manual' && (
            <S.ManualFlow>
              <S.FormGroup>
                <S.FormLabel>Nome do item</S.FormLabel>
                <S.FormInput
                  value={formData.nome}
                  onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Panela de Pressão"
                  theme={theme}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Preço</S.FormLabel>
                <S.FormInput
                  type="number"
                  value={formData.preco}
                  onChange={e => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  theme={theme}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Loja</S.FormLabel>
                <S.FormInput
                  value={formData.loja}
                  onChange={e => setFormData(prev => ({ ...prev, loja: e.target.value }))}
                  placeholder="Ex: Magazine Luiza"
                  theme={theme}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Categoria</S.FormLabel>
                <S.FormSelect
                  value={formData.categoriaId}
                  onChange={e => setFormData(prev => ({ ...prev, categoriaId: e.target.value }))}
                  theme={theme}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </S.FormSelect>
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Prioridade</S.FormLabel>
                <S.FormSelect
                  value={formData.prioridade}
                  onChange={e => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
                  theme={theme}
                >
                  <option value="normal">Planejado</option>
                  <option value="urgente">Essencial</option>
                  <option value="pode_esperar">Futuro</option>
                </S.FormSelect>
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Quantidade</S.FormLabel>
                <S.FormInput
                  type="number"
                  value={formData.quantidade}
                  onChange={e => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                  min="1"
                  theme={theme}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Forma de pagamento</S.FormLabel>
                <S.FormSelect
                  value={formData.pagamento}
                  onChange={e => setFormData(prev => ({ ...prev, pagamento: e.target.value }))}
                  theme={theme}
                >
                  <option value="normal">Normal</option>
                  <option value="vr">VR/VA</option>
                </S.FormSelect>
              </S.FormGroup>

              {formData.pagamento === 'normal' && (
                <S.FormGroup>
                  <S.FormLabel>Parcelamento</S.FormLabel>
                  <S.FormInput
                    type="number"
                    value={formData.parcelas}
                    onChange={e => setFormData(prev => ({ ...prev, parcelas: parseInt(e.target.value) || 1 }))}
                    min="1"
                    theme={theme}
                  />
                </S.FormGroup>
              )}

              <S.FormGroup>
                <S.FormLabel>Observação</S.FormLabel>
                <S.FormTextarea
                  value={formData.observacao}
                  onChange={e => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Observações adicionais..."
                  theme={theme}
                />
              </S.FormGroup>
            </S.ManualFlow>
          )}

          {step === 'hybrid' && (
            <S.HybridFlow>
              <S.FormGroup>
                <S.FormLabel>Nome do item</S.FormLabel>
                <S.FormInput
                  value={formData.nome}
                  onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Panela de Pressão"
                  theme={theme}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Categoria</S.FormLabel>
                <S.FormSelect
                  value={formData.categoriaId}
                  onChange={e => setFormData(prev => ({ ...prev, categoriaId: e.target.value }))}
                  theme={theme}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </S.FormSelect>
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Prioridade</S.FormLabel>
                <S.FormSelect
                  value={formData.prioridade}
                  onChange={e => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
                  theme={theme}
                >
                  <option value="normal">Planejado</option>
                  <option value="urgente">Essencial</option>
                  <option value="pode_esperar">Futuro</option>
                </S.FormSelect>
              </S.FormGroup>

              <S.FindPricesButton onClick={handleSearch} theme={theme}>
                <Search size={18} />
                Encontrar preços automaticamente
              </S.FindPricesButton>

              {searchResults.length > 0 && (
                <S.SearchResults>
                  {searchResults.map(product => (
                    <S.ResultCard
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      theme={theme}
                    >
                      <S.ResultImage src={product.fotoUrl} alt={product.nome} />
                      <S.ResultInfo>
                        <S.ResultName>{product.nome}</S.ResultName>
                        <S.ResultStore>{product.loja}</S.ResultStore>
                        <S.ResultPrice theme={theme}>
                          R$ {product.preco.toFixed(2)}
                        </S.ResultPrice>
                      </S.ResultInfo>
                      <S.ResultArrow>
                        <ArrowRight size={20} />
                      </S.ResultArrow>
                    </S.ResultCard>
                  ))}
                </S.SearchResults>
              )}
            </S.HybridFlow>
          )}

          {step === 'complete' && (
            <S.CompleteFlow>
              <S.FormGroup>
                <S.FormLabel>Categoria</S.FormLabel>
                <S.FormSelect
                  value={formData.categoriaId}
                  onChange={e => setFormData(prev => ({ ...prev, categoriaId: e.target.value }))}
                  theme={theme}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </S.FormSelect>
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Prioridade</S.FormLabel>
                <S.FormSelect
                  value={formData.prioridade}
                  onChange={e => setFormData(prev => ({ ...prev, prioridade: e.target.value }))}
                  theme={theme}
                >
                  <option value="normal">Planejado</option>
                  <option value="urgente">Essencial</option>
                  <option value="pode_esperar">Futuro</option>
                </S.FormSelect>
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Quantidade</S.FormLabel>
                <S.FormInput
                  type="number"
                  value={formData.quantidade}
                  onChange={e => setFormData(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                  min="1"
                  theme={theme}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.FormLabel>Forma de pagamento</S.FormLabel>
                <S.FormSelect
                  value={formData.pagamento}
                  onChange={e => setFormData(prev => ({ ...prev, pagamento: e.target.value }))}
                  theme={theme}
                >
                  <option value="normal">Normal</option>
                  <option value="vr">VR/VA</option>
                </S.FormSelect>
              </S.FormGroup>

              {formData.pagamento === 'normal' && (
                <S.FormGroup>
                  <S.FormLabel>Parcelamento</S.FormLabel>
                  <S.FormInput
                    type="number"
                    value={formData.parcelas}
                    onChange={e => setFormData(prev => ({ ...prev, parcelas: parseInt(e.target.value) || 1 }))}
                    min="1"
                    theme={theme}
                  />
                </S.FormGroup>
              )}

              <S.FormGroup>
                <S.FormLabel>Observação</S.FormLabel>
                <S.FormTextarea
                  value={formData.observacao}
                  onChange={e => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Observações adicionais..."
                  theme={theme}
                />
              </S.FormGroup>
            </S.CompleteFlow>
          )}
        </S.ModalContent>

        <S.ModalFooter>
          {step !== 'initial' && (
            <S.BackButton onClick={handleBack} theme={theme}>
              <ArrowLeft size={18} />
              Voltar
            </S.BackButton>
          )}

          {(step === 'manual' || step === 'complete') && (
            <S.SaveButton onClick={handleManualSubmit} theme={theme}>
              <Check size={18} />
              Salvar
            </S.SaveButton>
          )}
        </S.ModalFooter>
      </S.Modal>
    </S.Overlay>
  );
};

export default AddItemWizard;
