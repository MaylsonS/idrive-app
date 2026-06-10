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

export interface AulaResponseDTO {
  id: string;
  inicio: string;
  fim: string;
  valor: number;
  descricao?: string;
  autor: string;
  autorId: string; // <-- (Lembrando que esse já tava no Java e é usado no botão Ver Perfil)
  coAutor?: string;
  status: 'ABERTA' | 'ACEITA' | 'CONCLUIDA' | 'CANCELADA';
  notaAutor?: number;  // <--- ADICIONE ESTA LINHA!
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
  },

  listarAulasPorInstrutor: async (instrutorId: string): Promise<AulaResponseDTO[]> => {
    const response = await api.get(`/aulas/instrutor/${instrutorId}`);
    return response.data;
  },

   aceitarAula: async (id: string): Promise<AulaResponseDTO> => {
    const response = await api.put(`/aulas/${id}/aceitar`);
    return response.data;
},

  editarAnuncio: async (id: string, dados: AulaRequestDTO): Promise<AulaResponseDTO> => {
    const response = await api.put(`/aulas/editar-anuncio/${id}`, dados);
    return response.data;
},

  cancelarAula: async (id: string): Promise<AulaResponseDTO> => {
    const response = await api.put(`/aulas/${id}/cancelar`);
    return response.data;
},
  excluirAnuncio: async (id: string): Promise<void> => {
      await api.delete(`/aulas/excluir-anuncio/${id}`);
  },

};