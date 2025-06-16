import { apiClient } from '@/shared/api';

class ChatManagerApi {
  private baseUrl = 'chat';

  async clearChat(id: string) {
    return apiClient.delete(`${this.baseUrl}/${id}/clear`);
  }

  async deleteChat(id: string) {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async editChatName(id: string, newName: string) {
    return apiClient.put(`${this.baseUrl}/${id}?new_name=${newName}`);
  }
}

export const chatManagerApi = new ChatManagerApi();
