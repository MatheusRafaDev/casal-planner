import { createWorker } from "tesseract.js";

export async function extrairDadosPorOcr(file: File): Promise<{ nome: string; preco: number | null }> {
  const worker = await createWorker("por");
  const ret = await worker.recognize(file);
  await worker.terminate();
  
  const textArray = ret.data.text.split('\n');
  const lines = textArray.map((l: string) => l.trim()).filter((l: string) => l.length > 0);
  
  let precoEncontrado: number | null = null;
  let nomeEncontrado = "";

  // Regex para achar preços no formato R$ 10,00 ou 10,00 ou R$10.00
  const precoRegex = /(?:R\$)?\s*(\d+[,.]\d{2})/;
  
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(precoRegex);
    if (match) {
      const pStr = match[1].replace(',', '.');
      const val = parseFloat(pStr);
      if (!isNaN(val) && val > 0) {
        precoEncontrado = val;
        
        // Tentar pegar o nome na linha de cima ou na mesma linha
        const txtSemPreco = lines[i].replace(precoRegex, '').trim();
        if (txtSemPreco.length > 3) {
          nomeEncontrado = txtSemPreco;
        } else if (i > 0) {
          nomeEncontrado = lines[i-1];
        }
        break;
      }
    }
  }

  // Se não achou preço mas achou algum texto
  if (!nomeEncontrado && lines.length > 0) {
    nomeEncontrado = lines[0]; // Pega a primeira linha legível como fallback
  }

  return {
    nome: nomeEncontrado,
    preco: precoEncontrado
  };
}
