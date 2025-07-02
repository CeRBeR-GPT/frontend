import { apiClient } from '@/shared/api';

class UpdatePasswordApi {
  private baseUrl = 'user';

  updatePassword(newPassword: string) {
    return apiClient.post(`${this.baseUrl}/edit_password?new_password=${newPassword}`);
  }

  getVerifyPasswordCode() {
    return apiClient.get(`${this.baseUrl}/secure_verify_code`);
  }

  VerifyPasswordCode(email: string | undefined, code: string) {
    return apiClient.post(`${this.baseUrl}/secure_verify_code?email=${email}&code=${code}`);
  }
}

export const updatePasswordApi = new UpdatePasswordApi();
