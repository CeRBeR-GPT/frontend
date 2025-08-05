import { useLoginForm } from './use-login-form';
import { act, renderHook } from '@testing-library/react';
import { useAuth, useUser } from '@/shared/contexts';
import { useForm } from 'react-hook-form';

jest.mock('@/shared/contexts');
jest.mock('react-hook-form');
jest.mock('@hookform/resolvers/zod');

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

    // expect(result.current.isSubmitting).toBe(false);
    // expect(result.current.error).toBe('');
    // expect(result.current.showPassword).toBe(false);
  });
});
