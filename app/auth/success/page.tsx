'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useOAuth } from '@/features/oAuth/model';

const AuthSuccess = () => {
  const router = useRouter();
  const { handleAuthSuccess } = useOAuth();

  useEffect(() => {
    handleAuthSuccess().then((result) => {
      if (result.success) {
        router.push(`/chat/${result.lastChatId}`);
      } else {
        router.push('/');
      }
    });
  }, [router, handleAuthSuccess]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-emerald-500"></div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Авторизация успешна</h1>
        <p className="mb-4 text-gray-600">Перенаправление в личный кабинет...</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full animate-pulse rounded-full bg-emerald-500"
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
