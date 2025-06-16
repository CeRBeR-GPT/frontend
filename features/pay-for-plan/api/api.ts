import { apiClient } from '@/shared/api';

class PaymentApi {
  private baseUrl = 'transaction';

  async newPayment(plan: string) {
    return apiClient.post(`${this.baseUrl}/new_payment?plan=${plan}`);
  }
}

export const paymentApi = new PaymentApi();
