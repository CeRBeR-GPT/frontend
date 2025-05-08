
import { useUserData } from '@/features/user/model/use-user';
import { useAuth } from '@/features/auth/model/use-auth';
export const useLogout = () => {

    const { setIsAuthenticated, setAuthChecked} = useAuth()
    const { setUserData } = useUserData()

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUserData(null);
        setIsAuthenticated(false);
        setAuthChecked(false);
    };

  return { logout };
};
