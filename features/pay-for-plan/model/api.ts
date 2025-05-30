import { apiClient } from '@/shared/api/client';

export const newPaymentApi = async (plan: string) => {
    return apiClient.post(`transaction/new_payment?plan=${plan}`);
};