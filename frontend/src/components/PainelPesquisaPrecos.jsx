
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import * as S from '../styles/components/PainelPesquisaPrecosStyles';
import { formatarValorParaExibicao } from '../utils/mascaras';
import api from '../services/api';
import { validarEFormatarProdutoComIA, extrairMarcaBasica, processarProdutosAPI } from '../services/PainelPesquisaPrecosUtils';

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

const buscarPrecos = async (query) => {
  const { data } = await api.get(`/pesquisaprecos?q=${encodeURIComponent(query)}`);
  console.log(data)
  return processarProdutosAPI(data.shopping_results ?? []);
};

const PainelPesquisaPrecos = ({ nome = '', marca = '', onSelectItem, onSelectPrice, buscaUsuario = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [useCustomQuery, setUseCustomQuery] = useState(false);
  
  const warningTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(warningTimer.current);
  }, []);

  const queryOriginal = `${nome} ${marca}`.trim();
  const currentQuery = useCustomQuery ? customQuery : queryOriginal;

  const handleSearch = useCallback(async (query = currentQuery) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedItem(null);

    
    try {
      const data = await buscarPrecos(query);
      setResults(data);
      if (data.length === 0) setError('Nenhum produto encontrado');
    } catch (err) {
      setError(err.message || 'Erro na busca');
    } finally {
      setLoading(false);
    }
  }, [currentQuery]);

  const handleSelect = useCallback(async (item) => {
    if (selectedItem?.id === item.id) return;
    setSelectedItem(item);

    try {
      const validation = await validarEFormatarProdutoComIA(item.nome, buscaUsuario || currentQuery);
      

      onSelectItem?.({
        nome: validation.nomeValidado,
        marca: validation.marca,
        preco: item.preco,
        loja: item.loja,
        link: item.link,
        imagem: item.imagem,
        isTrusted: item.isTrusted,
      });
      onSelectPrice?.(item.preco);
    } catch {
      // Fallback sem IA
      onSelectItem?.({
        nome: item.nome.replace(/\b[A-Z0-9]{5,}\b/g, '').trim(),
        marca: extrairMarcaBasica(item.nome),
        preco: item.preco,
        loja: item.loja,
        link: item.link,
        imagem: item.imagem,
        isTrusted: item.isTrusted,
      });
      onSelectPrice?.(item.preco);
    }
  }, [selectedItem, buscaUsuario, currentQuery, onSelectItem, onSelectPrice]);

  const stats = useMemo(() => {
    const validItems = results.filter(r => !r.isLowPriority && r.preco > 0);
    if (validItems.length === 0) return null;
    const prices = validItems.map(r => r.preco);
    return {
      min: Math.min(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      minItem: validItems.find(r => r.preco === Math.min(...prices)),
      avgItem: validItems.reduce((prev, curr) => 
        Math.abs(curr.preco - prices.reduce((a,b) => a+b,0)/prices.length) < 
        Math.abs(prev.preco - prices.reduce((a,b) => a+b,0)/prices.length) ? curr : prev
      )
    };
  }, [results]);

  const handleExpand = () => {
    setExpanded(true);
    if (results.length === 0 && !loading) handleSearch(queryOriginal);
  };

  if (!expanded) {
    return (
      <S.Wrapper>
        <S.TriggerButton onClick={handleExpand}>
          <IconSearch />
          Pesquisar preços
        </S.TriggerButton>
      </S.Wrapper>
    );
  }

  return (
    <S.Wrapper>
      <S.Panel>
        <S.PanelHeader>
          <S.Title>🔍 Pesquisar preços</S.Title>
          <S.CloseButton onClick={() => setExpanded(false)}>✕</S.CloseButton>
        </S.PanelHeader>

        <S.PanelBody>
          {/* Busca */}
          <S.SearchSection>
            <S.SearchLabel>Buscar na internet</S.SearchLabel>
            <S.SearchInputWrapper>
              <S.SearchInput
                value={currentQuery}
                onChange={(e) => {
                  setCustomQuery(e.target.value);
                  setUseCustomQuery(true);
                }}
                placeholder=""
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <S.SearchButton onClick={() => handleSearch()} disabled={loading || !currentQuery}>
                {loading ? '...' : 'Buscar'}
              </S.SearchButton>
            </S.SearchInputWrapper>
            {useCustomQuery && (
              <S.ResetButton onClick={() => {
                setCustomQuery('');
                setUseCustomQuery(false);
              }}>
                Original
              </S.ResetButton>
            )}
          </S.SearchSection>

          {/* Loading */}
          {loading && (
            <S.LoadingContainer>
              <S.LoadingSpinner />
              <span>Buscando...</span>
            </S.LoadingContainer>
          )}

          {/* Error */}
          {error && !loading && (
            <S.ErrorContainer>
              <span>⚠️ {error}</span>
              <S.RetryButton onClick={() => handleSearch()}>Tentar</S.RetryButton>
            </S.ErrorContainer>
          )}

          {/* Results */}
          {results.length > 0 && !loading && stats && (
            <>
              <S.StatsGrid>
                <S.StatCard onClick={() => stats.minItem && handleSelect(stats.minItem)}>
                  <S.StatValue $type="min">{formatarValorParaExibicao(stats.min)}</S.StatValue>
                  <S.StatLabel>Menor preço</S.StatLabel>
                </S.StatCard>
                <S.StatCard onClick={() => stats.avgItem && handleSelect(stats.avgItem)}>
                  <S.StatValue $type="avg">{formatarValorParaExibicao(stats.avg)}</S.StatValue>
                  <S.StatLabel>Preço médio</S.StatLabel>
                </S.StatCard>
              </S.StatsGrid>

              <S.ProductsList>
                {results.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const isBestOffer = !item.isLowPriority && 
                    item.preco === Math.min(...results.filter(r => !r.isLowPriority).map(r => r.preco));

                  return (
                    <S.ProductItem
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      $selected={isSelected}
                      $isBest={isBestOffer}
                      $isLowPriority={item.isLowPriority}
                    >
                      <S.ProductImage>
                        {item.imagem ? <img src={item.imagem} alt={item.nome} /> : <span>🛒</span>}
                      </S.ProductImage>

                      <S.ProductInfo>
                        <S.ProductTitle>{item.nome}</S.ProductTitle>
                        <S.StoreName>
                          {item.loja}
                          {item.isTrusted && <S.TrustBadge>✓ Confiável</S.TrustBadge>}
                        </S.StoreName>
                        {isSelected && <S.SelectedProductBadge>✓ Selecionado</S.SelectedProductBadge>}
                      </S.ProductInfo>

                      <S.ProductMeta>
                        <S.PriceValue $isBest={isBestOffer} $selected={isSelected}>
                          {formatarValorParaExibicao(item.preco)}
                        </S.PriceValue>
                        {item.isTrusted && <S.BestBadge>Oficial</S.BestBadge>}
                      </S.ProductMeta>

                      <S.LinkButton href={item.link} target="_blank" onClick={(e) => e.stopPropagation()}>
                        <IconExternal />
                      </S.LinkButton>
                    </S.ProductItem>
                  );
                })}
              </S.ProductsList>
            </>
          )}
        </S.PanelBody>
      </S.Panel>
    </S.Wrapper>
  );
};

export default PainelPesquisaPrecos;