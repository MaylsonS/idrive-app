import { api } from './api';

export interface AulaRequestDTO {
  inicio: string;
  fim: string;
  valor: number;
  descricao?: string;
}

export interface AulaResponseDTO {
  id: string;
  inicio: string;
  fim: string;
  valor: number;
  descricao?: string;
  autor: string;
  coAutor?: string;
  status: 'ABERTA' | 'ACEITA' | 'CONCLUIDA' | 'CANCELADA';
}

export const aulaService = {
  criarAula: async (dados: AulaRequestDTO) => {
    const response = await api.post('/aulas/criar-anuncio', dados);
    return response.data;
  },

  listarMinhasAulas: async () => {
    const response = await api.get('/aulas/minhas-aulas');
    return response.data as AulaResponseDTO[];
  },

  listarAnunciosPublicos: async () => {
    const response = await api.get('/aulas/anuncios');
    return response.data as AulaResponseDTO[];
  }
};