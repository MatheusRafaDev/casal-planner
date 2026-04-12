// PainelPesquisaPrecos.jsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as S from '../styles/components/PainelPesquisaPrecosStyles';
import { formatarValorParaExibicao } from '../utils/mascaras';
import api from '../services/api';

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
  const { data } = await api.get(`/PesquisaPrecos?q=${encodeURIComponent(query)}`);
  return data.produtos || [];
};

const PainelPesquisaPrecos = ({ nome = '', marca = '', onSelectItem, onSelectPrice }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const queryOriginal = `${nome} ${marca}`.trim();

  const handleSearch = useCallback(async () => {
    if (!queryOriginal) return;
    setLoading(true);
    setError(null);
    
    try {
      const data = await buscarPrecos(queryOriginal);
      console.log('Produtos com validações:', data);
      setResults(data);
      if (data.length === 0) setError('Nenhum produto encontrado');
    } catch (err) {
      setError('Erro na busca');
    } finally {
      setLoading(false);
    }
  }, [queryOriginal]);

  const handleSelect = useCallback((item) => {
    if (selectedItem?.id === item.id) return;
    setSelectedItem(item);
    
    onSelectItem?.({
      nome: item.nome,
      marca: item.marca,
      preco: item.preco,
      loja: item.loja,
      link: item.link,
      imagem: item.imagem,
      isTrusted: item.is_trusted,
      isMarketplace: item.is_marketplace,
      isUsed: item.is_used
    });
    onSelectPrice?.(item.preco);
  }, [selectedItem, onSelectItem, onSelectPrice]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setExpanded(true);
        if (results.length === 0 && !loading) handleSearch();
      }
      if (e.key === 'Escape' && expanded) setExpanded(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded, results.length, loading, handleSearch]);

  const stats = useMemo(() => {
    // Filtra apenas produtos confiáveis (não marketplace)
    const validItems = results.filter(r => r.preco > 0 && r.is_trusted && !r.is_marketplace);
    if (validItems.length === 0) return null;
    const prices = validItems.map(r => r.preco);
    return {
      min: Math.min(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }, [results]);

  if (!expanded) {
    return (
      <S.Wrapper>
        <S.TriggerButton onClick={() => {
          setExpanded(true);
          if (results.length === 0 && !loading) handleSearch();
        }}>
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
          <S.SearchSection>
            <S.SearchInput
              value={queryOriginal}
              disabled
              placeholder="Produto para busca"
            />
            <S.SearchButton onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </S.SearchButton>
          </S.SearchSection>

          {loading && (
            <S.LoadingContainer>
              <S.LoadingSpinner />
              <span>Buscando produtos...</span>
            </S.LoadingContainer>
          )}

          {error && !loading && (
            <S.ErrorContainer>
              <span>⚠️ {error}</span>
              <S.RetryButton onClick={handleSearch}>Tentar novamente</S.RetryButton>
            </S.ErrorContainer>
          )}

          {results.length > 0 && stats && (
            <>
              <S.StatsGrid>
                <S.StatCard>
                  <S.StatValue>{formatarValorParaExibicao(stats.min)}</S.StatValue>
                  <S.StatLabel>Menor preço (oficial)</S.StatLabel>
                </S.StatCard>
                <S.StatCard>
                  <S.StatValue>{formatarValorParaExibicao(stats.avg)}</S.StatValue>
                  <S.StatLabel>Preço médio (oficial)</S.StatLabel>
                </S.StatCard>
              </S.StatsGrid>

              <S.ProductsList>
                {results.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const isMarketplaceItem = item.is_marketplace === true;
                  
                  return (
                    <S.ProductItem
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      $selected={isSelected}
                      $isMarketplace={isMarketplaceItem}
                    >
                      <S.ProductImage>
                        {item.imagem ? (
                          <img src={item.imagem} alt={item.nome} />
                        ) : (
                          <span>🛒</span>
                        )}
                      </S.ProductImage>

                      <S.ProductInfo>
                        <S.ProductTitle>{item.nome}</S.ProductTitle>
                        
                        <S.StoreInfo>
                          <S.StoreName>{item.loja}</S.StoreName>
                          
                          {/* 🔥 MARKETPLACE EM AMARELO */}
                          {isMarketplaceItem && (
                            <S.MarketplaceBadge>🛍️ Marketplace</S.MarketplaceBadge>
                          )}
                          
                          {/* Loja confiável (só mostra se não for marketplace) */}
                          {item.is_trusted && !isMarketplaceItem && (
                            <S.TrustBadge>✓ Loja oficial</S.TrustBadge>
                          )}
                          
                          {/* Produto usado */}
                          {item.is_used && (
                            <S.UsedBadge>♻️ Usado/Recondicionado</S.UsedBadge>
                          )}
                        </S.StoreInfo>
                        
                        {/* 🔥 MARCA VALIDADA PELA IA */}
                        {item.marca && (
                          <S.BrandInfo>
                            🏷️ Marca: <strong>{item.marca}</strong> {item.nome_validado && `| ${item.nome_validado}`}
                          </S.BrandInfo>
                        )}
                      </S.ProductInfo>

                      <S.ProductMeta>
                        <S.PriceValue $selected={isSelected} $isMarketplace={isMarketplaceItem}>
                          {formatarValorParaExibicao(item.preco)}
                        </S.PriceValue>
                      </S.ProductMeta>

                      <S.LinkButton 
                        href={item.link} 
                        target="_blank" 
                        onClick={(e) => e.stopPropagation()}
                        title="Abrir na loja"
                      >
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