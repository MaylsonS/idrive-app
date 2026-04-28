import { api } from './api';

export interface AlunoRegistroDTO {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  tipoPerfil: 'ALUNO';
}

export const alunoService = {
  registrar: async (dados: AlunoRegistroDTO) => {
    const response = await api.post('/usuarios/register', dados);
    return response.data;
  }
};