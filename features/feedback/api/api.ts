import { apiClient } from '@/shared/api';

class FeedbackApi {
  private baseUrl = 'user';

  async handleSubmitFeedback(name: string, message: string, formData: FormData) {
    return apiClient.post(
      `${this.baseUrl}/feedback?name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }
}

export const feedbackApi = new FeedbackApi();
