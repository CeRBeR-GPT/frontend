import { apiClient } from '@/shared/api';

class ChatApi {
  private baseUrl = 'chat';

  getAll() {
    return apiClient.get(`${this.baseUrl}/all`);
  }

  getById(id: string) {
    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  create(chatName: string) {
    return apiClient.post(`${this.baseUrl}/new?name=${chatName}`);
  }
}

export const chatApi = new ChatApi();
