// PainelPesquisaPrecos.jsx - VERSÃO COMPLETA CORRIGIDA

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import * as S from '../styles/components/PainelPesquisaPrecosStyles';
import { formatarValorParaExibicao } from '../utils/mascaras';
import api from '../services/api';
import { validarEFormatarProdutoComIA, extrairMarcaBasica, processarProdutosAPI } from '../services/PainelPesquisaPrecosUtils';
import storeLogoService from '../services/storeLogoService';

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

// Componente de logo genérica (SVG inline)
const GenericStoreIcon = ({ size = 'small', type = 'store' }) => {
  // Ícone para marketplace
  if (type === 'marketplace') {
    return (
      <S.GenericStoreSvg 
        width={size === 'small' ? 16 : 24} 
        height={size === 'small' ? 16 : 24} 
        viewBox="0 0 24 24" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M3 6H5L7 14H19L21 6H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 14V20H17V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="17" r="1" fill="currentColor"/>
        <circle cx="15" cy="17" r="1" fill="currentColor"/>
        <path d="M12 6V14" stroke="currentColor" strokeWidth="1.5"/>
      </S.GenericStoreSvg>
    );
  }
  
  // Ícone padrão de loja
  return (
    <S.GenericStoreSvg 
      width={size === 'small' ? 16 : 24} 
      height={size === 'small' ? 16 : 24} 
      viewBox="0 0 24 24" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 9L5 5H19L21 9M3 9V19H21V9M3 9H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 9V13H15V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7" cy="15" r="1" fill="currentColor"/>
      <circle cx="17" cy="15" r="1" fill="currentColor"/>
    </S.GenericStoreSvg>
  );
};

// Função para identificar se é marketplace
const isMarketplace = (storeName, storeType = '') => {
  console.log('Identificando tipo de loja:', { storeName, storeType });
  
  if (!storeName) return false;

  // Lista de marketplaces conhecidos
  const marketplaces = [
    'olx', 'facebook', 'marketplace', 'enjoei', 'mercadolivre', 'mercadolibre',
    'shopee', 'aliexpress', 'ebay', 'etsy', 'magazine luiza', 'magalu',
    'americanas', 'submarino', 'shoptime', 'casas bahia', 'ponto frio', 'fast shop',
    'bne store', 'br celulares', 'amazon'
  ];
  
  const storeLower = storeName.toLowerCase();
  
  // Verifica pelo nome da loja
  const isMarketplaceByName = marketplaces.some(mp => storeLower.includes(mp));
  
  // Verifica pelo store_type da API
  const storeTypeLower = (storeType || '').toLowerCase();
  const isMarketplaceByType = storeTypeLower === 'olx' || 
                              storeTypeLower === 'marketplace' ||
                              (storeTypeLower === 'desconhecida' && storeLower.includes('usado')) ||
                              (storeTypeLower === 'física' && storeLower.includes('usado'));
  
  return isMarketplaceByName || isMarketplaceByType;
};

// Componente de logo automático com busca em tempo real
const AutoStoreLogo = ({ storeName, size = 'small', storeType = '' }) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMp, setIsMp] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let imageElement = null;
    
    const loadLogo = async () => {
      if (!storeName) {
        setLoading(false);
        setError(true);
        return;
      }
      
      // Verifica se é marketplace
      const mp = isMarketplace(storeName, storeType);
      setIsMp(mp);
      
      setLoading(true);
      setError(false);
      
      try {
        // Busca logo usando o serviço
        const url = await storeLogoService.getLogoUrl(storeName, size === 'small' ? 16 : 32);
        
        if (isMounted && url) {
          // Testa a imagem de forma silenciosa
          const img = new Image();
          imageElement = img;
          
          const timeoutId = setTimeout(() => {
            if (isMounted) {
              setError(true);
              setLoading(false);
            }
          }, 3000);
          
          img.onload = () => {
            clearTimeout(timeoutId);
            if (isMounted) {
              setLogoUrl(url);
              setLoading(false);
            }
          };
          
          img.onerror = () => {
            clearTimeout(timeoutId);
            if (isMounted) {
              setError(true);
              setLoading(false);
            }
          };
          
          img.src = url;
        } else if (isMounted) {
          setError(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar logo da loja:', err);
        if (isMounted) setError(true);
        setLoading(false);
      }
    };
    
    loadLogo();
    
    return () => {
      isMounted = false;
      if (imageElement) {
        imageElement.onload = null;
        imageElement.onerror = null;
      }
    };
  }, [storeName, size, storeType]);

  if (loading) {
    return <S.StoreLogoSkeleton />;
  }

  if (error || !logoUrl) {
    return <GenericStoreIcon size={size} type={isMp ? 'marketplace' : 'store'} />;
  }

  return (
    <S.StoreLogo 
      src={logoUrl}
      alt={storeName}
      $size={size}
      onError={() => setError(true)}
    />
  );
};

const buscarPrecos = async (query) => {
  const { data } = await api.get(`/pesquisaprecos?q=${encodeURIComponent(query)}`);
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

  // 🔥 DECLARAR queryOriginal ANTES de usar nos useEffects 🔥
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

  // 🔥 useEffect para limpar timer
  useEffect(() => {
    return () => clearTimeout(warningTimer.current);
  }, []);

  // 🔥 useEffect para atalho Ctrl+K (AGORA queryOriginal já está declarada)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setExpanded(true);
        if (results.length === 0 && !loading) {
          handleSearch(queryOriginal);
        }
      }
      // ESC para fechar
      if (e.key === 'Escape' && expanded) {
        setExpanded(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded, results.length, loading, queryOriginal, handleSearch]);

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
        isMarketplace: isMarketplace(item.loja, item.store_type),
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
        isMarketplace: isMarketplace(item.loja, item.store_type),
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
    if (results.length === 0 && !loading) {
      handleSearch(queryOriginal);
    }
  };

  if (!expanded) {
    return (
      <S.Wrapper>
        <S.TriggerButton onClick={handleExpand} title="Pesquisar preços (Ctrl+K)">
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
          <S.CloseButton onClick={() => setExpanded(false)} title="Fechar (ESC)">
            ✕
          </S.CloseButton>
        </S.PanelHeader>

        <S.PanelBody>
          <S.SearchSection>
            <S.SearchLabel>Buscar na internet</S.SearchLabel>
            <S.SearchInputWrapper>
              <S.SearchInput
                value={currentQuery}
                onChange={(e) => {
                  setCustomQuery(e.target.value);
                  setUseCustomQuery(true);
                }}
                placeholder="Digite o nome do produto... (Enter para buscar)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                autoFocus={expanded}
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

          {loading && (
            <S.LoadingContainer>
              <S.LoadingSpinner />
              <span>Buscando...</span>
            </S.LoadingContainer>
          )}

          {error && !loading && (
            <S.ErrorContainer>
              <span>⚠️ {error}</span>
              <S.RetryButton onClick={() => handleSearch()}>Tentar</S.RetryButton>
            </S.ErrorContainer>
          )}

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
                  const isMp = isMarketplace(item.loja, item.store_type);

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
                        <S.StoreInfo>
                          <AutoStoreLogo 
                            storeName={item.loja}
                            storeType={item.store_type}
                            size="small" 
                          />
                          <S.StoreName title={item.loja}>
                            {item.loja.length > 25 
                              ? item.loja.substring(0, 25) + '...' 
                              : item.loja}
                            {isMp && <S.MarketplaceBadge>🏪 Marketplace</S.MarketplaceBadge>}
                            {item.isTrusted && !isMp && <S.TrustBadge>✓ Confiável</S.TrustBadge>}
                          </S.StoreName>
                        </S.StoreInfo>
                        {isSelected && <S.SelectedProductBadge>✓ Selecionado</S.SelectedProductBadge>}
                      </S.ProductInfo>

                      <S.ProductMeta>
                        <S.PriceValue $isBest={isBestOffer} $selected={isSelected}>
                          {formatarValorParaExibicao(item.preco)}
                        </S.PriceValue>
                        {item.isTrusted && !isMp && <S.BestBadge>Oficial</S.BestBadge>}
                        {isMp && <S.MarketplaceBadge $small>Usado/Novo</S.MarketplaceBadge>}
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