import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuth, useUser } from '@/shared/contexts';
import { useLogout } from './use-logout';

jest.mock('@/shared/contexts');

describe('useLogout', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      setIsAuthenticated: jest.fn(),
      setAuthChecked: jest.fn(),
    });

    (useUser as jest.Mock).mockReturnValue({
      setUserData: jest.fn(),
    });
  });

  it('should clean localstorage and states', () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('access_token', 'test-access-token');
    localStorage.setItem('refresh_token', 'test-refresh-token');

    const { result } = renderHook(() => useLogout());
    const { logout } = result.current;

    act(() => {
      logout();
    });

    expect(localStorage.getItem('isAuthenticated')).not.toBeDefined();
    expect(localStorage.getItem('access_token')).not.toBeDefined();
    expect(localStorage.getItem('refresh_token')).not.toBeDefined();

    // Получаем моки функций из контекстов
    const { setIsAuthenticated, setAuthChecked } = useAuth();
    const { setUserData } = useUser();

    expect(setUserData).toHaveBeenCalledWith(null);
    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(setAuthChecked).toHaveBeenCalledWith(false);
  });

  it('should work even when localStorage is empty', () => {
    // localStorage.setItem('isAuthenticated', 'true');
    // localStorage.setItem('access_token', 'test-access-token');
    // localStorage.setItem('refresh_token', 'test-refresh-token');

    const { result } = renderHook(() => useLogout());
    const { logout } = result.current;

    act(() => {
      logout();
    });

    expect(localStorage.getItem('isAuthenticated')).not.toBeDefined();
    expect(localStorage.getItem('access_token')).not.toBeDefined();
    expect(localStorage.getItem('refresh_token')).not.toBeDefined();

    // Получаем моки функций из контекстов
    const { setIsAuthenticated, setAuthChecked } = useAuth();
    const { setUserData } = useUser();

    expect(setUserData).toHaveBeenCalledWith(null);
    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(setAuthChecked).toHaveBeenCalledWith(false);
  });
});
