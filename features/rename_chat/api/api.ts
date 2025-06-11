import { apiClient } from '@/shared/api';

export const editChatNameApi = async (id: string, newName: string) => {
  return apiClient.put(`chat/${id}?new_name=${newName}`);
};
