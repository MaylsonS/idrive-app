import { api } from './api';
import type { LoginCredentials } from '../types/Auth';

export const authService = {
  login: async (credenciais: LoginCredentials) => {
    const response = await api.post('/usuarios/login', credenciais);
    return response.data;
  }
};