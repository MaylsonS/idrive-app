import { api } from './api';

export interface AulaRequestDTO {
  inicio: string;
  fim: string;
  valor: number;
  descricao?: string;
}

export const aulaService = {
  criarAula: async (dados: AulaRequestDTO) => {
    const response = await api.post('/aulas', dados);
    return response.data;
  }
};