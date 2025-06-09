import { apiClient } from '@/shared/api';

export const newPaymentApi = async (plan: string) => {
    return apiClient.post(`transaction/new_payment?plan=${plan}`);
};