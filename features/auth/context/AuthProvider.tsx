
// features/auth/context/AuthProvider.tsx
'use client';

import { createContext } from 'react';
import { useAuthProvider } from '../model/use-auth';

export const AuthContext = createContext(/*...*/);

export function AuthProvider({ children }) {
  const auth = useAuthProvider(); // Хук с логикой
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}