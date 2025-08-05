import { useLoginForm } from './use-login-form';
import { act, renderHook } from '@testing-library/react';
import { useAuth, useUser } from '@/shared/contexts';
import { useForm } from 'react-hook-form';

jest.mock('@/shared/contexts');
jest.mock('react-hook-form');
jest.mock('@hookform/resolvers/zod');

const mockLocation = {
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
};
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe('useLoginForm', () => {
  const mockLogin = jest.fn();
  const mockClearErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Настраиваем мок useAuth
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    });

    // Настраиваем мок useForm
    (useForm as jest.Mock).mockReturnValue({
      formState: { errors: {} },
      handleSubmit: (fn: any) => fn,
      clearErrors: mockClearErrors,
      getValues: () => ({ email: 'test@example.com', password: 'password' }),
    });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.showPassword).toBe(false);
  });

  it('should initialize error and clean it', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setError('Some error');
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.setError('');
    });

    expect(result.current.error).toBe('');
  });

  it('should redirect to saved chat after successful login', async () => {
    mockLogin.mockResolvedValue({ success: true });
    mockLocalStorage.getItem.mockReturnValue('123');

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.onSubmit({
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('lastSavedChat');

    // Проверяем, что был вызван window.location.assign с правильным URL
    expect(window.location.assign).toHaveBeenCalledWith('http://localhost/chat/123');

    // ИЛИ проверяем изменение href напрямую
    expect(window.location.href).toBe('http://localhost/chat/123');
  });

  it('should handle login error', async () => {
    const error = new Error('Network error');
    mockLogin.mockRejectedValue(error);

    // Сохраняем исходное значение href
    const initialHref = window.location.href;

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.onSubmit({
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(result.current.error).toBe('Network error');
    // Проверяем, что href не изменился после ошибки
    expect(window.location.href).toBe(initialHref);
  });
});
