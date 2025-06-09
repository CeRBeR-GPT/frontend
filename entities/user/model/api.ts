
import { apiClient } from '@/shared/api';

export const getUserDataApi = async () => {
    return apiClient.get(`user/self`);
};