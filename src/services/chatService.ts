// services/chatService.ts
import { api } from './api';

export const chatService = {
  iniciarConversa: async (outroUsuarioId: string): Promise<string> => {
    const response = await api.post(
      `/api/chat/rooms/iniciar?outroUsuarioId=${outroUsuarioId}`
    );
    return response.data.roomId;
  },
};