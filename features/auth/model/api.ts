import { apiClient } from '@/shared/api/client';

export const loginApi = async (email: string, password: string) => {
    return apiClient.post(`user/login`, { email, password });
};