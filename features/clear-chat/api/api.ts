import { apiClient } from '@/shared/api';

export const clearChatApi = async (id: string) => {
  return apiClient.delete(`chat/${id}/clear`);
};
