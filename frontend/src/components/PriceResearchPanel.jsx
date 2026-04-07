// components/PriceResearchPanel/index.js
import React, { useState, useCallback } from 'react';
import * as S from '../styles/components/PriceResearchPanelStyles';
import { formatarValorParaExibicao } from '../utils/mascaras';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const Icons = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  External: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
};

// Corrigir texto com Groq AI
async function corrigirTexto(nome, marca) {
  if (!nome && !marca) return { nome: '', marca: '' };
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em corrigir nomes de produtos. Corrija apenas erros de digitação e formatação, mantenha a essência do nome. Retorne APENAS o JSON no formato: {\"nome\": \"nome corrigido\", \"marca\": \"marca corrigida\"}"
        },
        {
          role: "user",
          content: `Corrija este produto: Nome: "${nome || ''}", Marca: "${marca || ''}"`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      nome: result.nome || nome,
      marca: result.marca || marca
    };
  } catch (error) {
    console.error('Erro na correção:', error);
    return { nome, marca };
  }
}

// Buscar preços
async function buscarPrecos(query) {
  const response = await fetch(`http://localhost:5286/api/shopping?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) throw new Error('Erro na busca');
  
  const data = await response.json();
  const results = data?.shopping_results ?? [];
  
  return results
    .filter(r => r.price)
    .map(r => ({
      nome: r.title,
      loja: r.source,
      preco: parseFloat(r.price.toString().replace(/[^\d,]/g, '').replace(',', '.')),
      link: r.product_link || r.link,
      imagem: r.thumbnail
    }))
    .filter(r => r.preco > 0)
    .sort((a, b) => a.preco - b.preco);
}

const PriceResearchPanel = ({ nome: nomeOriginal, marca: marcaOriginal, onSelectPrice, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  
  // Dados corrigidos
  const [nomeCorrigido, setNomeCorrigido] = useState(nomeOriginal || '');
  const [marcaCorrigida, setMarcaCorrigida] = useState(marcaOriginal || '');
  const [useCorrigido, setUseCorrigido] = useState(false);
  
  // Query editável pelo usuário
  const [customQuery, setCustomQuery] = useState('');
  const [useCustomQuery, setUseCustomQuery] = useState(false);

  const defaultQuery = `${nomeOriginal || ''} ${marcaOriginal || ''}`.trim();
  const correctedQuery = `${nomeCorrigido} ${marcaCorrigida}`.trim();
  const currentQuery = useCustomQuery ? customQuery : (useCorrigido ? correctedQuery : defaultQuery);

  // Corrigir texto com IA
  const handleCorrigirTexto = async () => {
    if (!nomeOriginal && !marcaOriginal) return;
    
    setCorrecting(true);
    const corrigido = await corrigirTexto(nomeOriginal, marcaOriginal);
    setNomeCorrigido(corrigido.nome);
    setMarcaCorrigida(corrigido.marca);
    setUseCorrigido(true);
    setUseCustomQuery(false);
    setCorrecting(false);
  };

  const handleBuscar = async () => {
    if (!currentQuery) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const data = await buscarPrecos(currentQuery);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    setExpanded(true);
    if (!results && !loading) {
      handleBuscar();
    }
  };

  const handleSelectPrice = (price) => {
    setSelectedPrice(price);
    if (onSelectPrice) onSelectPrice(price);
  };

  const handleSave = () => {
    if (selectedPrice && onSave) {
      onSave(selectedPrice);
    }
  };

  const precos = results?.map(r => r.preco) ?? [];
  const menorPreco = precos.length ? Math.min(...precos) : null;
  const mediaPreco = precos.length ? precos.reduce((a, b) => a + b, 0) / precos.length : null;

  return (
    <S.Wrapper>
      <S.TriggerButton onClick={handleExpand}>
        <Icons.Search />
        Pesquisar preços
      </S.TriggerButton>

      {expanded && (
        <S.Panel>
          <S.PanelHeader>
            <S.Title>🔍 Pesquisar preços</S.Title>
            <S.CloseButton onClick={() => setExpanded(false)}>✕</S.CloseButton>
          </S.PanelHeader>

          <S.PanelBody>
            {/* Sugestão de correção com IA */}
            {(nomeOriginal || marcaOriginal) && !useCorrigido && nomeCorrigido !== nomeOriginal && (
              <S.SuggestionBox>
                <S.SuggestionText>
                  <strong>Sugestão de correção:</strong> {nomeCorrigido} {marcaCorrigida}
                </S.SuggestionText>
                <S.CorrectButton onClick={handleCorrigirTexto} disabled={correcting}>
                  {correcting ? 'Corrigindo...' : 'Usar sugestão'}
                </S.CorrectButton>
              </S.SuggestionBox>
            )}

            {/* Campo de busca editável */}
            <S.SearchSection>
              <S.SearchLabel>O que você quer pesquisar?</S.SearchLabel>
              <S.SearchInputWrapper>
                <S.SearchInput
                  type="text"
                  value={useCustomQuery ? customQuery : currentQuery}
                  onChange={(e) => {
                    setCustomQuery(e.target.value);
                    setUseCustomQuery(true);
                    setUseCorrigido(false);
                  }}
                  placeholder="Ex: TV Samsung 55 polegadas 4K"
                  onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                />
                <S.SearchButton onClick={handleBuscar} disabled={loading || !currentQuery}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </S.SearchButton>
              </S.SearchInputWrapper>
              {useCustomQuery && (
                <S.ResetButton onClick={() => {
                  setUseCustomQuery(false);
                  setCustomQuery('');
                }}>
                  Voltar ao original
                </S.ResetButton>
              )}
            </S.SearchSection>

            {/* Loading */}
            {loading && (
              <S.LoadingContainer>
                <S.LoadingSpinner />
                <span>Buscando preços...</span>
              </S.LoadingContainer>
            )}

            {/* Erro */}
            {error && !loading && (
              <S.ErrorContainer>
                <span>⚠️ {error}</span>
                <S.RetryButton onClick={handleBuscar}>Tentar novamente</S.RetryButton>
              </S.ErrorContainer>
            )}

            {/* Resultados */}
            {results && !loading && results.length > 0 && (
              <>
                {/* Cards de resumo */}
                <S.StatsGrid>
                  <S.StatCard 
                    onClick={() => handleSelectPrice(menorPreco)}
                    $selected={selectedPrice === menorPreco}
                  >
                    <S.StatValue $type="min">{formatarValorParaExibicao(menorPreco)}</S.StatValue>
                    <S.StatLabel>Menor preço</S.StatLabel>
                  </S.StatCard>
                  <S.StatCard 
                    onClick={() => handleSelectPrice(mediaPreco)}
                    $selected={selectedPrice === mediaPreco}
                  >
                    <S.StatValue $type="avg">{formatarValorParaExibicao(mediaPreco)}</S.StatValue>
                    <S.StatLabel>Preço médio</S.StatLabel>
                  </S.StatCard>
                </S.StatsGrid>

                {/* Lista de produtos */}
                <S.ProductsList>
                  {results.map((item, idx) => (
                    <S.ProductItem 
                      key={idx}
                      onClick={() => handleSelectPrice(item.preco)}
                      $selected={selectedPrice === item.preco}
                      $isBest={idx === 0}
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
                        <S.StoreName>{item.loja}</S.StoreName>
                      </S.ProductInfo>
                      
                      <S.ProductPrice>
                        <S.PriceValue $isBest={idx === 0} $selected={selectedPrice === item.preco}>
                          {formatarValorParaExibicao(item.preco)}
                        </S.PriceValue>
                        {idx === 0 && <S.BestBadge>Melhor</S.BestBadge>}
                        {selectedPrice === item.preco && <S.SelectedBadge>✓</S.SelectedBadge>}
                      </S.ProductPrice>

                      <S.LinkButton 
                        href={item.link} 
                        target="_blank" 
                        onClick={(e) => e.stopPropagation()}
                        title="Ver na loja"
                      >
                        <Icons.External />
                      </S.LinkButton>
                    </S.ProductItem>
                  ))}
                </S.ProductsList>

                {/* Botão salvar */}
                <S.SaveArea>
                  <S.SaveButton onClick={handleSave} disabled={!selectedPrice}>
                    {selectedPrice 
                      ? `Salvar preço de ${formatarValorParaExibicao(selectedPrice)}` 
                      : 'Clique em um preço para salvar'}
                  </S.SaveButton>
                </S.SaveArea>
              </>
            )}

            {/* Sem resultados */}
            {results && !loading && results.length === 0 && (
              <S.EmptyState>
                <span>😕</span>
                <h4>Nenhum resultado encontrado</h4>
                <p>Tente usar termos mais genéricos</p>
                <S.RetryButton onClick={handleBuscar}>Buscar novamente</S.RetryButton>
              </S.EmptyState>
            )}
          </S.PanelBody>
        </S.Panel>
      )}
    </S.Wrapper>
  );
};

export default PriceResearchPanel;