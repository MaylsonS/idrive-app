import { api } from './api';

export interface InstrutorRegistroDTO {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  tipoPerfil: 'INSTRUTOR';
  cnh: string;
}

export const instrutorService = {
  registrar: async (dados: InstrutorRegistroDTO) => {
    const response = await api.post('/instrutores/register', dados);
    return response.data;
  }
};