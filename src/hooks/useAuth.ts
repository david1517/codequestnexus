import { useAuthStore } from '@/stores/useAuthStore';

export const useAuth = () => {
  const { 
    user, 
    firebaseUser,
    loading, 
    error, 
    initialized,
    login, 
    register, 
    loginWithGoogle, 
    logout 
  } = useAuthStore();

  return {
    user,
    firebaseUser,
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
