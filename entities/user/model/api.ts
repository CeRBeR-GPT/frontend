
import { apiClient } from '@/shared/api/client';

export const getUserDataApi = async () => {
    return apiClient.get(`user/self`);
};