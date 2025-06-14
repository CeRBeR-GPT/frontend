import { apiClient } from '@/shared/api';

export const sendEmailCodeApi = async (email: string) => {
  return apiClient.get(`user/register/verify_code?email=${email}`);
};

export const verifyEmailCodeApi = async (email: string, code: string) => {
  return apiClient.post(`user/register/verify_code?email=${email}&code=${code}`);
};

export const registrationApi = async (userData: { email: string; password: string }) => {
  return apiClient.post(`/user/register`, userData);
};
