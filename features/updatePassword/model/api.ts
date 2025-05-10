import { apiClient } from '@/shared/api/client';

export const updatePasswordApi = async (newPassword: string) => {
    return apiClient.post(`user/edit_password?new_password=${newPassword}`);
};

export const getVerifyPasswordCodeApi = async () => {
    return apiClient.get(`user/secure_verify_code`);
};

export const VerifyPasswordCodeApi = async (email: string | undefined, code: string) => {
    return apiClient.post(`user/secure_verify_code?email=${email}&code=${code}`);
};