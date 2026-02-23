// Utilitários para máscaras de input

// Formata valor para moeda brasileira (R$ 1.234,56)
export const formatarMoeda = (valor) => {
  // Remove tudo que não for número
  const numeros = valor.replace(/\D/g, '');
  
  // Converte para número e divide por 100 para ter centavos
  const valorNumerico = parseInt(numeros) / 100;
  
  if (isNaN(valorNumerico)) return '';
  
  // Formata no padrão brasileiro
  return valorNumerico.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Remove a formatação e retorna o valor numérico
export const desformatarMoeda = (valor) => {
  if (!valor) return 0;
  
  // Remove R$, espaços, pontos e troca vírgula por ponto
  const limpo = valor
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
    
  return parseFloat(limpo) || 0;
};

// Aplica a máscara enquanto o usuário digita
export const mascaraMoeda = (e) => {
  const { value } = e.target;
  e.target.value = formatarMoeda(value);
};

// Formata um valor numérico para exibição
export const formatarValorParaExibicao = (valor) => {
  if (valor === undefined || valor === null) return '';
  
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};