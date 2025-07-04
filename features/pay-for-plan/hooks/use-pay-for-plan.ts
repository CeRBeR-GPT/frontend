import { useRouter } from 'next/navigation';

import { useUser } from '@/shared/contexts';
import { formatExpireDate } from '@/shared/utils';

import { useMutation } from '@tanstack/react-query';
import { paymentApi } from '../api';

export const usePayForPlan = () => {
  const router = useRouter();
  const { userData } = useUser();

  const plan =
    userData?.plan === 'default'
      ? 'Базовый'
      : userData?.plan === 'premium'
        ? 'Премиум'
        : userData?.plan === 'business'
          ? 'Бизнес'
          : '';

  const expireDate = formatExpireDate(userData?.plan_expire_date);
  const isPaidPlan = userData?.plan === 'premium' || userData?.plan === 'business';

  const { mutate: payForPlan } = useMutation({
    mutationFn: async (plan: string) => {
      const response = await paymentApi.newPayment(plan);
      return response.data.url;
    },
    onSuccess: (paymentUrl) => {
      router.replace(paymentUrl);
    },
    onError: (error) => {
      console.error('Payment error:', error);
    },
  });

  return { payForPlan, plan, expireDate, isPaidPlan };
};
