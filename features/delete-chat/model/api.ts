import { apiClient } from '@/shared/api/client';

export const deleteChatApi = async (id: string) => {
    return apiClient.delete(`chat/${id}`);
};