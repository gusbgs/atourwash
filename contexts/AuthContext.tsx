import { useState, useCallback, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@atourwash_auth';
const ONBOARDING_KEY = '@atourwash_onboarding';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  user: {
    phone?: string;
    email?: string;
    name?: string;
  } | null;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    hasSeenOnboarding: false,
    user: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [authData, onboardingData] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);

      setAuthState({
        isAuthenticated: !!authData,
        isLoading: false,
        hasSeenOnboarding: onboardingData === 'true',
        user: authData ? JSON.parse(authData) : null,
      });
    } catch (error) {
      console.log('Error checking auth state:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setAuthState(prev => ({ ...prev, hasSeenOnboarding: true }));
    } catch (error) {
      console.log('Error saving onboarding state:', error);
    }
  }, []);

  const loginWithPhone = useCallback(async (phone: string) => {
    try {
      const userData = { phone, name: 'Pengguna' };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: userData,
      }));
    } catch (error) {
      console.log('Error logging in with phone:', error);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (email: string, name: string) => {
    try {
      const userData = { email, name };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: userData,
      }));
    } catch (error) {
      console.log('Error logging in with Google:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
    } catch (error) {
      console.log('Error logging out:', error);
    }
  }, []);

  return {
    ...authState,
    completeOnboarding,
    loginWithPhone,
    loginWithGoogle,
    logout,
  };
});
