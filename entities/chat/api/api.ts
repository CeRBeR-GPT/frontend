import { apiClient } from '@/shared/api';

export const getChatAllApi = async () => {
  return apiClient.get(`chat/all`);
};

export const getChatByIdApi = async (id: string) => {
  return apiClient.get(`chat/${id}`);
};

export const createChatApi = async (chatName: string) => {
  return apiClient.post(`chat/new?name=${chatName}`);
};
