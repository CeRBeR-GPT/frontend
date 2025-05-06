import { apiClient } from '@/shared/api/client'; // Общий HTTP-клиент

export const loginApi = async (email: string, password: string) => {
    console.log("Привет")
    return apiClient.post(`user/login`, { email, password });
};