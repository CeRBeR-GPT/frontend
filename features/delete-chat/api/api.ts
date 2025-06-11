import { apiClient } from '@/shared/api';

export const deleteChatApi = async (id: string) => {
  return apiClient.delete(`chat/${id}`);
};
