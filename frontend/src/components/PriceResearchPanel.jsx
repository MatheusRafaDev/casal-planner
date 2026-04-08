// components/PriceResearchPanel/index.js
import React, { useState, useCallback, useMemo } from 'react';
import * as S from '../styles/components/PriceResearchPanelStyles';
import { formatarValorParaExibicao } from '../utils/mascaras';
import api from '../services/api';
import { 
  identificarMarcaComIA, 
  limparNomeProdutoComIA,
  formatarMarca,
  extrairPreco,
  processarProdutosAPI,
  extrairMarcaBasica
} from '../services/priceResearchUtils';

// ─── Ícones ──────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconExternal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ─── API ────────────────────────────────────────────────────────────────────

async function buscarPrecos(query) {
  try {
    const { data } = await api.get(`/shopping?q=${encodeURIComponent(query)}`);
    if (!data) throw new Error('Sem resposta da API');

    const sitesMenorPrioridade = ['olx', 'mercado livre', 'enjoei', 'facebook marketplace', 'shopee'];
    const shoppingResults = data.shopping_results ?? [];
    
    const resultados = processarProdutosAPI(shoppingResults, sitesMenorPrioridade);
    
    console.log(`Produtos encontrados: ${resultados.length}`);
    return resultados;
  } catch (error) {
    console.error('Erro em buscarPrecos:', error);
    throw error;
  }
}

// ─── Componente Principal ───────────────────────────────────────────────────

const PriceResearchPanel = ({ 
  nome: nomeOriginal = '', 
  marca: marcaOriginal = '', 
  onSelectItem,
  onSelectPrice 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [queryMode, setQueryMode] = useState('original');
  const [queryCustom, setQueryCustom] = useState('');

  const queryOriginal = `${nomeOriginal} ${marcaOriginal}`.trim();
  const currentQuery = queryMode === 'custom' ? queryCustom : queryOriginal;

  const handleBuscar = async (query = currentQuery) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedItemId(null);
    try {
      const data = await buscarPrecos(query);
      setResults(data);
      if (data.length === 0) {
        setError('Nenhum produto encontrado com preço válido');
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    setExpanded(true);
    if (!results && !loading) handleBuscar(queryOriginal);
  };

  const handleSelectItem = async (item) => {
    if (selectedItemId === item.id) return;
    
    setSelectedItemId(item.id);
    
    try {
      // Usa IA para identificar marca
      let marcaDetectada = await identificarMarcaComIA(item.nome);
      let nomeLimpo = item.nome;
      
      if (!marcaDetectada) {
        marcaDetectada = extrairMarcaBasica(item.nome);
      }
      
      // Usa IA para limpar o nome do produto
      nomeLimpo = await limparNomeProdutoComIA(item.nome, marcaDetectada);
      
      const marcaFormatada = formatarMarca(marcaDetectada);
      
      const itemSelecionado = {
        nome: nomeLimpo,
        marca: marcaFormatada,
        preco: item.preco,
        loja: item.loja,
        link: item.link,
        imagem: item.imagem,
        isTrusted: item.isTrusted
      };
      
      if (onSelectItem) onSelectItem(itemSelecionado);
      if (onSelectPrice) onSelectPrice(item.preco);
    } catch (error) {
      console.error('Erro ao processar item selecionado:', error);
      // Fallback
      const marcaBasica = extrairMarcaBasica(item.nome);
      const itemSelecionado = {
        nome: item.nome,
        marca: marcaBasica,
        preco: item.preco,
        loja: item.loja,
        link: item.link,
        imagem: item.imagem,
        isTrusted: item.isTrusted
      };
      if (onSelectItem) onSelectItem(itemSelecionado);
      if (onSelectPrice) onSelectPrice(item.preco);
    }
  };

  const handleCustomChange = (e) => {
    setQueryCustom(e.target.value);
    setQueryMode('custom');
  };

  const handleResetQuery = () => {
    setQueryCustom('');
    setQueryMode('original');
  };

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!results?.length) return null;
    
    const produtosPrioritarios = results.filter(r => !r.isLowPriority);
    if (produtosPrioritarios.length === 0) return null;
    
    const menorPreco = Math.min(...produtosPrioritarios.map(r => r.preco));
    const mediaPreco = produtosPrioritarios.reduce((a, b) => a + b.preco, 0) / produtosPrioritarios.length;
    
    return {
      menor: menorPreco,
      media: mediaPreco,
    };
  }, [results]);

  return (
    <S.Wrapper>
      <S.TriggerButton onClick={handleExpand}>
        <IconSearch />
        Pesquisar preços
      </S.TriggerButton>

      {expanded && (
        <S.Panel>
          <S.PanelHeader>
            <S.Title>🔍 Pesquisar preços</S.Title>
            <S.CloseButton onClick={() => setExpanded(false)}>✕</S.CloseButton>
          </S.PanelHeader>

          <S.PanelBody>
            <S.SearchSection>
              <S.SearchLabel>Buscar preços na internet</S.SearchLabel>
              <S.SearchInputWrapper>
                <S.SearchInput
                  type="text"
                  value={queryMode === 'custom' ? queryCustom : currentQuery}
                  onChange={handleCustomChange}
                  placeholder="Exemplo: Smart TV 55 Samsung QLED 4K"
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <S.SearchButton onClick={() => handleBuscar()} disabled={loading || !currentQuery}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </S.SearchButton>
              </S.SearchInputWrapper>

              {queryMode !== 'original' && (
                <S.SearchActions>
                  <S.ResetButton onClick={handleResetQuery}>Voltar ao original</S.ResetButton>
                </S.SearchActions>
              )}
            </S.SearchSection>

            {loading && (
              <S.LoadingContainer>
                <S.LoadingSpinner />
                <span>Buscando preços em sites confiáveis...</span>
              </S.LoadingContainer>
            )}

            {error && !loading && (
              <S.ErrorContainer>
                <span>⚠️ {error}</span>
                <S.RetryButton onClick={() => handleBuscar()}>Tentar novamente</S.RetryButton>
              </S.ErrorContainer>
            )}

            {results && !loading && results.length > 0 && stats && (
              <>
                <S.StatsGrid>
                  <S.StatCard onClick={() => {
                    const item = results.find(r => r.preco === stats.menor && !r.isLowPriority);
                    if (item) handleSelectItem(item);
                  }}>
                    <S.StatValue $type="min">{formatarValorParaExibicao(stats.menor)}</S.StatValue>
                    <S.StatLabel>Menor preço</S.StatLabel>
                    <S.StatHint>Clique para aplicar</S.StatHint>
                  </S.StatCard>
                  <S.StatCard onClick={() => {
                    const item = results.reduce((prev, curr) => {
                      if (curr.isLowPriority) return prev;
                      return Math.abs(curr.preco - stats.media) < Math.abs(prev.preco - stats.media) ? curr : prev;
                    });
                    if (item) handleSelectItem(item);
                  }}>
                    <S.StatValue $type="avg">{formatarValorParaExibicao(stats.media)}</S.StatValue>
                    <S.StatLabel>Preço médio</S.StatLabel>
                    <S.StatHint>Clique para aplicar</S.StatHint>
                  </S.StatCard>
                </S.StatsGrid>

                <S.ProductsList>
                  {results.map((item, idx) => {
                    const isSelected = selectedItemId === item.id;
                    const isFirstPriority = !item.isLowPriority && idx === results.findIndex(r => !r.isLowPriority);
                    
                    return (
                      <S.ProductItem
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        $selected={isSelected}
                        $isBest={isFirstPriority}
                        $isLowPriority={item.isLowPriority}
                      >
                        <S.ProductImage>
                          {item.imagem ? <img src={item.imagem} alt={item.nome} /> : <span>🛒</span>}
                        </S.ProductImage>

                        <S.ProductInfo>
                          <S.ProductTitle title={item.nome}>{item.nome}</S.ProductTitle>
                          <S.StoreName>
                            {item.loja}
                            {item.isTrusted && <S.TrustBadge>✓ Site confiável</S.TrustBadge>}
                            {item.isLowPriority && <S.MarketplaceBadge>Marketplace</S.MarketplaceBadge>}
                          </S.StoreName>
                          {isSelected && <S.SelectedProductBadge>✓ Produto selecionado</S.SelectedProductBadge>}
                        </S.ProductInfo>

                        <S.ProductMeta>
                          <S.PriceValue $isBest={isFirstPriority} $selected={isSelected}>
                            {formatarValorParaExibicao(item.preco)}
                          </S.PriceValue>
                          <S.Badges>
                            {item.isTrusted && <S.BestBadge>Oficial</S.BestBadge>}
                            {isFirstPriority && !item.isTrusted && <S.BestBadge>Melhor oferta</S.BestBadge>}
                          </S.Badges>
                        </S.ProductMeta>

                        <S.LinkButton
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Ver na loja"
                        >
                          <IconExternal />
                        </S.LinkButton>
                      </S.ProductItem>
                    );
                  })}
                </S.ProductsList>
              </>
            )}

            {results && !loading && results.length === 0 && (
              <S.EmptyState>
                <span>😕</span>
                <h4>Nenhum resultado encontrado</h4>
                <p>Tente usar termos mais genéricos para a busca</p>
                <S.RetryButton onClick={() => handleBuscar()}>Buscar novamente</S.RetryButton>
              </S.EmptyState>
            )}
          </S.PanelBody>
        </S.Panel>
      )}
    </S.Wrapper>
  );
};

export default PriceResearchPanel;