import { apiClient } from '@/shared/api';

class UserApi {
  private baseUrl = 'user';

  async login(email: string, password: string) {
    return apiClient.post(`${this.baseUrl}/login`, { email, password });
  }

  async getUserData() {
    return apiClient.get(`${this.baseUrl}/self`);
  }
}

export const userApi = new UserApi();
