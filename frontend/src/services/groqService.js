import api from "./api";

export const groqService = {
  async sugerirItens(comodo) {
    try {
      const response = await api.get(`/groq/sugestoes-comodo?comodo=${encodeURIComponent(comodo)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao sugerir itens:', error);
      throw error;
    }
  },

  async detectarDuplicata(nomeNovoItem) {
    try {
      const response = await api.post("/groq/detectar-duplicata", { nomeNovoItem });
      return response.data;
    } catch (error) {
      console.error('Erro ao detectar duplicata:', error);
      throw error;
    }
  },

  async estimarOrcamento(comodo, cidade) {
    try {
      const response = await api.get(`/groq/estimativa-comodo?comodo=${encodeURIComponent(comodo)}&cidade=${encodeURIComponent(cidade)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao estimar orçamento:', error);
      throw error;
    }
  },

  async gerarResumoEnxoval() {
    try {
      const response = await api.get("/groq/resumo-enxoval");
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar resumo do enxoval:', error);
      throw error;
    }
  },
};
