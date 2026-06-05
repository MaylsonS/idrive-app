import { api } from './api';

export interface PerfilPublicoDTO {
  id: string;
  nome: string;
  tipoPerfil: 'ALUNO' | 'INSTRUTOR';
  notaMedia?: number;
  descricao?: string;
  totalAulas: number;
}

export const perfilService = {
  // Perfil do próprio usuário logado
  meuPerfil: async (): Promise<PerfilPublicoDTO> => {
    const response = await api.get('/perfil/me');
    return response.data;
  },

  // Perfil público de qualquer usuário pelo ID
  buscarPorId: async (id: string): Promise<PerfilPublicoDTO> => {
    const response = await api.get(`/perfil/${id}`);
    return response.data;
  },
};
