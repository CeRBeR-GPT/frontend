import { renderHook, waitFor } from '@testing-library/react';
import { usePayForPlan } from './use-pay-for-plan';
import { useUser } from '@/shared/contexts';
import { paymentApi } from '../api';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Мокаем все зависимости
jest.mock('@/shared/contexts');
jest.mock('../api');
jest.mock('next/navigation');

// Создаем обертку для QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePayForPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Настраиваем мок useUser
    (useUser as jest.Mock).mockReturnValue({
      userData: {
        plan: 'premium',
        plan_expire_date: '2023-12-31T00:00:00.000Z',
        email: 'test@example.com',
      },
      getToken: jest.fn().mockReturnValue('mock-token'),
    });

    // Настраиваем мок useRouter
    (useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it('should return correct plan, expireDate and isPaidPlan values', () => {
    const { result } = renderHook(() => usePayForPlan(), {
      wrapper: createWrapper(),
    });

    expect(result.current.plan).toBe('Премиум');
    expect(result.current.expireDate).toBeDefined();
    expect(result.current.isPaidPlan).toBe(true);
  });

  it('should call paymentApi.newPayment and router.replace on success', async () => {
    const mockPaymentUrl = 'https://payment.example.com';
    (paymentApi.newPayment as jest.Mock).mockResolvedValue({
      data: { url: mockPaymentUrl },
    });

    const { result } = renderHook(() => usePayForPlan(), {
      wrapper: createWrapper(),
    });

    result.current.payForPlan('premium');

    await waitFor(() => {
      expect(paymentApi.newPayment).toHaveBeenCalledWith('premium');
      expect(useRouter().replace).toHaveBeenCalledWith(mockPaymentUrl);
    });
  });

  it('should handle payment error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Payment failed');
    (paymentApi.newPayment as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => usePayForPlan(), {
      wrapper: createWrapper(),
    });

    result.current.payForPlan('premium');

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Payment error:', mockError);
    });

    consoleErrorSpy.mockRestore();
  });

  it('should return correct values for different plans', () => {
    // Тестируем для базового плана
    (useUser as jest.Mock).mockReturnValueOnce({
      userData: { plan: 'default', plan_expire_date: null },
      getToken: jest.fn().mockReturnValue('mock-token'),
    });

    const { result: defaultResult } = renderHook(() => usePayForPlan(), {
      wrapper: createWrapper(),
    });
    expect(defaultResult.current.plan).toBe('Базовый');
    expect(defaultResult.current.isPaidPlan).toBe(false);

    // Тестируем для бизнес плана
    (useUser as jest.Mock).mockReturnValueOnce({
      userData: { plan: 'business', plan_expire_date: '2024-01-01T00:00:00.000Z' },
      getToken: jest.fn().mockReturnValue('mock-token'),
    });

    const { result: businessResult } = renderHook(() => usePayForPlan(), {
      wrapper: createWrapper(),
    });
    expect(businessResult.current.plan).toBe('Бизнес');
    expect(businessResult.current.isPaidPlan).toBe(true);
  });
});
