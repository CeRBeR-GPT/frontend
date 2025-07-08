export type AuthContextType = {
  isAuthenticated: boolean;
  authChecked: boolean;
  isLoading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setAuthChecked: (value: boolean) => void;
  getToken: () => Promise<string | null>;
  login: (credentials: { email: string; password: string }) => Promise<{
    success: boolean;
    lastChatId?: string;
  }>;
};
