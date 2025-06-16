import { apiClient } from '@/shared/api';

class RegistrationApi {
  private baseUrl = 'user';

  sendEmailCode(email: string) {
    return apiClient.get(`${this.baseUrl}/register/verify_code?email=${email}`);
  }

  verifyEmailCode(email: string, code: string) {
    return apiClient.post(`${this.baseUrl}/register/verify_code?email=${email}&code=${code}`);
  }

  registration(userData: { email: string; password: string }) {
    return apiClient.post(`${this.baseUrl}/register`, userData);
  }
}

export const regApi = new RegistrationApi();
