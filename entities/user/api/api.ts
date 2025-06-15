import { apiClient } from '@/shared/api';

class UserApi {
  private baseUrl = 'user';

  login(email: string, password: string) {
    return apiClient.post(`${this.baseUrl}/login`, { email, password });
  }

  getUserData() {
    return apiClient.get(`${this.baseUrl}/self`);
  }
}

export const chatApi = new UserApi();
