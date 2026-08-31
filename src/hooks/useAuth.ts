import { useAuthStore } from '@/stores/useAuthStore';

export const useAuth = () => {
  const {
    user,
    loading,
    error,
    initialized,
    login,
    register,
    loginWithGoogle,
    logout,
  } = useAuthStore();

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    isInitialized: initialized,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
  };
};