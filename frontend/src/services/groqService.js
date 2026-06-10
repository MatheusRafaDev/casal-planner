import api from "./api";

export const groqService = {
  async sugerirItens(comodo) {
    const response = await api.get(`/groq/sugestoes-comodo?comodo=${encodeURIComponent(comodo)}`);
    return response.data;
  },

  async detectarDuplicata(nomeNovoItem) {
    const response = await api.post("/groq/detectar-duplicata", { nomeNovoItem });
    return response.data;
  },

  async estimarOrcamento(comodo, cidade) {
    const response = await api.get(`/groq/estimativa-comodo?comodo=${encodeURIComponent(comodo)}&cidade=${encodeURIComponent(cidade)}`);
    return response.data;
  },

  async gerarResumoEnxoval() {
    const response = await api.get("/groq/resumo-enxoval");
    return response.data;
  },
};
