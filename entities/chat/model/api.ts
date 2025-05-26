import { apiClient } from '@/shared/api/client';

export const getChatAllApi = async () => {
    return apiClient.get(`chat/all`);
};

export const getChatByIdApi = async (id: string) => {
    return apiClient.get(`chat/${id}`);
};