import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import api from '../utils/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export interface User {
  id: string;
  name: string;
  email: string;
  push_enabled?: boolean;
  email_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: { name: string, avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const segments = useSegments();
  const router = useRouter();

  // Load user on start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        }
      } catch (error) {
        console.log('Failed to restore session', error);
        await SecureStore.deleteItemAsync('accessToken');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Protect routes based on auth state
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth group
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to dashboard if authenticated and in auth group
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading, segments]);

  const login = async (token: string) => {
    await SecureStore.setItemAsync('accessToken', token);
    const response = await api.get('/auth/me');
    setUser(response.data.data);

    // Register for push notifications after successful login
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await api.put('/auth/me', { expo_push_token: pushToken });
      }
    } catch (e) {
      console.log('Failed to register push token on login', e);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.log('Error logging out from server', e);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      setUser(null);
    }
  };

  const updateUser = async (data: { name?: string, avatar?: string, push_enabled?: boolean, email_enabled?: boolean }) => {
    const response = await api.put('/auth/me', data);
    setUser(response.data.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
