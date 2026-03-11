
export const formatarMoeda = (valor) => {

  const numeros = valor.replace(/\D/g, '');
  

  const valorNumerico = parseInt(numeros) / 100;
  
  if (isNaN(valorNumerico)) return '';

  return valorNumerico.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const desformatarMoeda = (valor) => {
  if (!valor) return 0;
  

  if (typeof valor === 'number') return valor;

  const valorStr = valor.toString();
  const limpo = valorStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
    
  const numerico = parseFloat(limpo);
  return isNaN(numerico) ? 0 : numerico;
};


export const mascaraMoeda = (e) => {
  const { value } = e.target;
  e.target.value = formatarMoeda(value);
};


export const formatarValorParaExibicao = (valor) => {
  if (valor === undefined || valor === null) return '';
  
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};