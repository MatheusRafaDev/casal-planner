import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import * as S from '../styles/components/PainelPesquisaPrecosStyles';
import { formatarValorParaExibicao } from '../utils/mascaras';
import api from '../services/api';

// ---------- Icons ----------
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

// ---------- API ----------
const buscarPrecos = async (query, signal) => {
  const { data } = await api.get(`/PesquisaPrecos?q=${encodeURIComponent(query)}`, { signal });
  return data?.produtos || [];
};

// ---------- Component ----------
const PainelPesquisaPrecos = ({
  nome = '',
  marca = '',
  onSelectItem,
  onSelectPrice
}) => {

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const abortRef = useRef(null);
  const isSelectingRef = useRef(false);

  const query = useMemo(() => `${nome}`.trim(), [nome]);

  // ---------- Search ----------
  const handleSearch = useCallback(async () => {
    if (!query) return;

    // Cancela request anterior
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await buscarPrecos(query, abortRef.current.signal);
      setResults(data);

      if (!data.length) {
        setError('Nenhum produto encontrado');
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError('Erro ao buscar preços');
      }
    } finally {
      setLoading(false);
    }
  }, [query]);

  // ---------- Select ----------
  const handleSelect = useCallback((item) => {
    if (isSelectingRef.current) return;
    isSelectingRef.current = true;

    setSelectedItemId(item.id);

    const payload = {
      nome: item.nome || "",
      marca: item.marca || "",
      preco: Number(item.preco) || 0,
      loja: item.loja || "",
      linkProduto: item.link || "",
      fotoUrl: item.imagem || "",
    };

    onSelectItem?.(payload);
    onSelectPrice?.(payload.preco);

    setTimeout(() => {
      setExpanded(false);
      isSelectingRef.current = false;
    }, 200);

  }, [onSelectItem, onSelectPrice]);

  // ---------- Shortcuts ----------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setExpanded(true);
      }
      if (e.key === 'Escape') {
        setExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ---------- Stats ----------
  const stats = useMemo(() => {
    const valid = results.filter(r => r.preco > 0 && r.is_trusted && !r.is_marketplace);
    if (!valid.length) return null;

    const prices = valid.map(r => r.preco);

    return {
      min: Math.min(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }, [results]);

  // ---------- Auto search ----------
  useEffect(() => {
    if (expanded && query && results.length === 0) {
      handleSearch();
    }
  }, [expanded, query, results.length, handleSearch]);

  // ---------- UI ----------
  if (!expanded) {
    return (
      <S.Wrapper>
        <S.TriggerButton onClick={() => setExpanded(true)}>
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
            <S.SearchInput value={query} disabled />
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
              <S.RetryButton onClick={handleSearch}>
                Tentar novamente
              </S.RetryButton>
            </S.ErrorContainer>
          )}

          {!!results.length && stats && (
            <>
              <S.StatsGrid>
                <S.StatCard>
                  <S.StatValue>{formatarValorParaExibicao(stats.min)}</S.StatValue>
                  <S.StatLabel>Menor preço</S.StatLabel>
                </S.StatCard>
                <S.StatCard>
                  <S.StatValue>{formatarValorParaExibicao(stats.avg)}</S.StatValue>
                  <S.StatLabel>Preço médio</S.StatLabel>
                </S.StatCard>
              </S.StatsGrid>

              <S.ProductsList>
                {results.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const isMarketplace = item.is_marketplace;

                  return (
                    <S.ProductItem
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      $selected={isSelected}
                      $isMarketplace={isMarketplace}
                    >
                      <S.ProductImage>
                        {item.imagem ? (
                          <img src={item.imagem} alt={item.nome} />
                        ) : '🛒'}
                      </S.ProductImage>

                      <S.ProductInfo>
                        <S.ProductTitle>{item.nome}</S.ProductTitle>

                        <S.StoreInfo>
                          <S.StoreName>{item.loja}</S.StoreName>

                          {isMarketplace && <S.MarketplaceBadge>🛍️ Marketplace</S.MarketplaceBadge>}
                          {item.is_trusted && !isMarketplace && <S.TrustBadge>✓ Oficial</S.TrustBadge>}
                        </S.StoreInfo>

                        {item.marca && (
                          <S.BrandInfo>
                            🏷️ {item.marca}
                          </S.BrandInfo>
                        )}
                      </S.ProductInfo>

                      <S.ProductMeta>
                        <S.PriceValue $selected={isSelected}>
                          {formatarValorParaExibicao(item.preco)}
                        </S.PriceValue>
                      </S.ProductMeta>

                      <S.LinkButton
                        href={item.link}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
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
