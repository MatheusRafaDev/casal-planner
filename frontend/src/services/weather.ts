// Open-Meteo Service: Previsão do Tempo e Logística para a Data da Mudança
// 100% Gratuito, sem necessidade de API key

export interface CidadeSugerida {
  id: number;
  name: string;
  admin1?: string; // Estado
  country?: string; // País
  latitude: number;
  longitude: number;
}

export interface PrevisaoDia {
  data: string; // YYYY-MM-DD
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  probabilidadeChuva: number;
  ventoMax: number;
}

export interface PrevisaoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  dias: PrevisaoDia[];
}

export interface InfoRiscoMudanca {
  nivel: "baixo" | "medio" | "alto" | "indefinido";
  titulo: string;
  badge: string;
  mensagem: string;
  dicas: string[];
}

/**
 * Busca cidades brasileiras e internacionais via Open-Meteo Geocoding
 */
export async function buscarCidades(query: string): Promise<CidadeSugerida[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=6&language=pt&format=json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1,
      country: r.country,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch {
    return [];
  }
}

/**
 * Consulta a previsão diária de até 16 dias via Open-Meteo Forecast
 */
export async function buscarPrevisaoTempo(
  latitude: number,
  longitude: number
): Promise<PrevisaoResponse | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=16`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.daily || !data.daily.time) return null;

    const dias: PrevisaoDia[] = data.daily.time.map((dataStr: string, idx: number) => ({
      data: dataStr,
      weatherCode: data.daily.weather_code?.[idx] ?? 0,
      tempMax: Math.round(data.daily.temperature_2m_max?.[idx] ?? 0),
      tempMin: Math.round(data.daily.temperature_2m_min?.[idx] ?? 0),
      probabilidadeChuva: data.daily.precipitation_probability_max?.[idx] ?? 0,
      ventoMax: Math.round(data.daily.wind_speed_10m_max?.[idx] ?? 0),
    }));

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      dias,
    };
  } catch {
    return null;
  }
}

/**
 * Mapeia o código WMO da OMM para descrição amigável em português
 */
export function getDescricaoClima(code: number): {
  descricao: string;
  icone: "sol" | "nublado" | "chuva" | "tempestade" | "nevoeiro";
} {
  switch (code) {
    case 0:
      return { descricao: "Céu limpo e ensolarado", icone: "sol" };
    case 1:
      return { descricao: "Predomínio de sol", icone: "sol" };
    case 2:
      return { descricao: "Parcialmente nublado", icone: "nublado" };
    case 3:
      return { descricao: "Encoberto", icone: "nublado" };
    case 45:
    case 48:
      return { descricao: "Nevoeiro ou névoa úmida", icone: "nevoeiro" };
    case 51:
    case 53:
    case 55:
      return { descricao: "Garoa fraca", icone: "chuva" };
    case 61:
    case 63:
    case 65:
      return { descricao: "Chuva contínua", icone: "chuva" };
    case 80:
    case 81:
    case 82:
      return { descricao: "Pancadas de chuva", icone: "chuva" };
    case 95:
    case 96:
    case 99:
      return { descricao: "Tempestade com trovoadas", icone: "tempestade" };
    default:
      return { descricao: "Condição estável", icone: "nublado" };
  }
}

/**
 * Avalia o risco logístico para a mudança baseado no tempo previsto
 */
export function analisarRiscoMudanca(previsao?: PrevisaoDia | null): InfoRiscoMudanca {
  if (!previsao) {
    return {
      nivel: "indefinido",
      titulo: "Previsão em breve",
      badge: "Aguardando",
      mensagem: "A previsão detalhada do Open-Meteo estará visível conforme a data se aproximar (até 16 dias de antecedência).",
      dicas: [
        "Faça o checklist de caixas etiquetadas por cômodo com antecedência.",
        "Confirme a reserva do caminhão ou frete para o dia marcado.",
        "Separe uma 'caixa de sobrevivência' com itens de primeira necessidade para a primeira noite."
      ],
    };
  }

  const { probabilidadeChuva, weatherCode, ventoMax } = previsao;

  if (probabilidadeChuva >= 60 || weatherCode >= 80 || ventoMax >= 45) {
    return {
      nivel: "alto",
      titulo: "Alerta de Chuva para a Mudança",
      badge: "Risco Alto",
      mensagem: `Probabilidade de chuva em ${probabilidadeChuva}%. Recomendamos precaução máxima no transporte de móveis e eletrodomésticos.`,
      dicas: [
        "Certifique-se de contratar caminhão com baú 100% fechado e estanque.",
        "Embale eletrônicos, colchões e sofás em plástico bolha e filme stretch reforçado.",
        "Deixe lonas e toalhas acessíveis na entrada dos dois imóveis para secar solados e caixas.",
      ],
    };
  }

  if (probabilidadeChuva >= 25 || (weatherCode >= 51 && weatherCode <= 65)) {
    return {
      nivel: "medio",
      titulo: "Possibilidade de Chuva Isolada",
      badge: "Atenção Moderada",
      mensagem: `Chance de chuva em ${probabilidadeChuva}%. Mantenha materiais de proteção por perto.`,
      dicas: [
        "Tenha lonas plásticas à mão durante a carga e descarga.",
        "Priorize carregar e descarregar móveis de madeira e eletrodomésticos nos horários mais secos.",
        "Etiquete as caixas frágeis com marcadores resistentes à água.",
      ],
    };
  }

  return {
    nivel: "baixo",
    titulo: "Clima Favorável para Mudança!",
    badge: "Tempo Excelente",
    mensagem: `Tempo seco com apenas ${probabilidadeChuva}% de chance de chuva e ventos amenos (${ventoMax} km/h). Condições ideais!`,
    dicas: [
      "Clima perfeito para carregar sem preocupação com umidade.",
      "Mantenha garrafas de água gelada para manter a hidratação de todos os ajudantes.",
      "Comece logo cedo pela manhã para aproveitar as temperaturas mais frescas.",
    ],
  };
}
