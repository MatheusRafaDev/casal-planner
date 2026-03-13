export const formatarMoeda = (valor) => {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  
  let numero;
  if (typeof valor === 'string') {
    const valorLimpo = valor.replace(/[R$\s]/g, '');
    
    if (valorLimpo.includes(',')) {
      const valorNumerico = valorLimpo.replace(/\./g, '').replace(',', '.');
      numero = parseFloat(valorNumerico);
    } else {
      numero = parseFloat(valorLimpo);
    }
  } else {
    numero = valor;
  }
  
  if (isNaN(numero)) return 'R$ 0,00';
  
  return numero.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatarValorInput = (valor) => {
  if (!valor) return '';
  
  const apenasDigitos = valor.toString().replace(/\D/g, '');
  
  if (apenasDigitos === '') return '';
  
  const numero = parseInt(apenasDigitos) / 100;
  
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const converterValorParaNumero = (valorFormatado) => {
  if (!valorFormatado) return 0;
  
  let valorLimpo = valorFormatado.toString();
  
  if (valorLimpo.includes(',')) {
    valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
  } else {
    valorLimpo = valorLimpo.replace(/[^\d,.]/g, '');
  }
  
  const numero = parseFloat(valorLimpo);
  return isNaN(numero) ? 0 : numero;
};

export const formatarCPF = (valor) => {
  if (!valor) return '';
  
  const apenasDigitos = valor.replace(/\D/g, '');
  const digitosLimitados = apenasDigitos.slice(0, 11);
  
  return digitosLimitados
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const formatarDataInput = (valor) => {
  if (!valor) return '';
  
  const apenasDigitos = valor.replace(/\D/g, '');
  const digitosLimitados = apenasDigitos.slice(0, 8);
  
  return digitosLimitados
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})$/, '$1');
};

export const formatarDataExibicao = (data) => {
  if (!data) return '';
  
  try {
    if (typeof data === 'string' && data.includes('-')) {
      const [ano, mes, dia] = data.split('T')[0].split('-');
      if (ano && mes && dia) {
        return `${dia}/${mes}/${ano}`;
      }
    }
    
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    
    return data;
  } catch {
    return '';
  }
};

export const converterDataBRparaISO = (dataBR) => {
  if (!dataBR) return '';
  
  const apenasDigitos = dataBR.replace(/\D/g, '');
  
  if (apenasDigitos.length !== 8) return '';
  
  const dia = apenasDigitos.slice(0, 2);
  const mes = apenasDigitos.slice(2, 4);
  const ano = apenasDigitos.slice(4, 8);
  
  return `${ano}-${mes}-${dia}`;
};

export const validarData = (data) => {
  if (!data) return false;
  
  const apenasDigitos = data.replace(/\D/g, '');
  
  if (apenasDigitos.length !== 8) return false;
  
  const dia = parseInt(apenasDigitos.slice(0, 2));
  const mes = parseInt(apenasDigitos.slice(2, 4)) - 1;
  const ano = parseInt(apenasDigitos.slice(4, 8));
  
  const dataObj = new Date(ano, mes, dia);
  
  return (
    dataObj.getDate() === dia &&
    dataObj.getMonth() === mes &&
    dataObj.getFullYear() === ano
  );
};

export const validarCPF = (cpf) => {
  if (!cpf) return false;
  
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto > 9 ? 0 : resto;
  
  if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto > 9 ? 0 : resto;
  
  return digitoVerificador2 === parseInt(cpfLimpo.charAt(10));
};

export const getPaymentIcon = (paymentMethod) => {

  const icons = {
    normal: '💵',
    vr: '🍽️',
  };

  return icons[paymentMethod] || '💵';
};