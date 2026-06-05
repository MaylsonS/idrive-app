import { api } from './api';

export interface AvaliacaoInstrutorRequestDTO {
  aulaId: string;
  pontualidade: number;
  seguirRegrasDeTransito: number;
  clareza: number;
}

export interface AvaliacaoAlunoRequestDTO {
  aulaId: string;
  pontualidade: number;
  receptividade: number;
}

export const avaliacaoService = {
  avaliarInstrutor: async (dados: AvaliacaoInstrutorRequestDTO) => {
    const response = await api.post('/avaliacoes/instrutor', dados);
    return response.data;
  },

  avaliarAluno: async (dados: AvaliacaoAlunoRequestDTO) => {
    const response = await api.post('/avaliacoes/aluno', dados);
    return response.data;
  },
};
