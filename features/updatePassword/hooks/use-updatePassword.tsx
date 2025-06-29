import { useAuth, useUser } from '@/shared/contexts';

import { updatePasswordApi } from '../api';

export const useUpdatePassword = () => {
  const { setIsAuthenticated } = useAuth();
  const { getToken } = useUser();

  const updatePassword = async (newPassword: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No valid token');

      const response = await updatePasswordApi.updatePassword(newPassword);
      localStorage.removeItem('new_password');
      if (response.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  return { updatePassword };
};
