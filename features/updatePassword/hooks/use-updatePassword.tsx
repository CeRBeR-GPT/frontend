import { useAuth, useUser } from '@/shared/contexts';

import { updatePasswordApi } from '../api';
import { useMutation } from '@tanstack/react-query';

export const useUpdatePassword = () => {
  const { setIsAuthenticated } = useAuth();
  const { getToken } = useUser();

  const { mutateAsync } = useMutation({
    mutationFn: async (newPassword: string) => {
      const token = await getToken();
      if (!token) throw new Error('No valid token');
      return updatePasswordApi.updatePassword(newPassword);
    },
    onSuccess: (data) => {
      localStorage.removeItem('new_password');
      if (data.data?.access_token) {
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
      }
    },
  });

  const updatePassword = async (newPassword: string) => {
    try {
      const result = await mutateAsync(newPassword);
      return { success: !!result?.data?.access_token };
    } catch (error) {
      return { success: false };
    }
  };

  return { updatePassword };
};
