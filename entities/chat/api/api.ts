import { apiClient } from '@/shared/api';

class ChatApi {
  private baseUrl = 'chat';

  async getAll() {
    return apiClient.get(`${this.baseUrl}/all`);
  }

  async getById(id: string) {
    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  async create(chatName: string) {
    return apiClient.post(`${this.baseUrl}/new?name=${chatName}`);
  }
}

export const chatApi = new ChatApi();
