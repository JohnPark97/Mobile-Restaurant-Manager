import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../config/api';

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: 'OWNER' | 'CUSTOMER';
  verified: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  registerOwner: (data: any) => Promise<void>;
  registerCustomer: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      setRestaurant(response.data.data.restaurant);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  const login = async (emailOrPhone: string, password: string) => {
    const response = await api.post('/auth/login', { emailOrPhone, password });
    const { user, restaurant, accessToken, refreshToken } = response.data.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);

    setUser(user);
    setRestaurant(restaurant);
  };

  const registerOwner = async (data: any) => {
    const response = await api.post('/auth/register/owner', data);
    const { user, restaurant, accessToken, refreshToken } = response.data.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);

    setUser(user);
    setRestaurant(restaurant);
  };

  const registerCustomer = async (data: any) => {
    const response = await api.post('/auth/register/customer', data);
    const { user, accessToken, refreshToken } = response.data.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);

    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
      setRestaurant(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        isLoading,
        isAuthenticated: !!user,
        login,
        registerOwner,
        registerCustomer,
        logout,
        refreshUser,
      }}
    >
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

