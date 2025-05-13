import { apiClient } from '@/shared/api/client';

export const clearChatApi = async (id: string) => {
    return apiClient.delete(`chat/${id}/clear`);
};