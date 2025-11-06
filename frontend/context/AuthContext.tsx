import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { ENDPOINTS, STORAGE_KEYS } from '@/constants/config';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  points?: number;
  qrCode?: string;
  role: string;
  totalWasteDisposed?: number;
  badges?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [storedToken, storedUser] = await AsyncStorage.multiGet([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
      ]);

      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        setUser(JSON.parse(storedUser[1]));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role: string) => {
    try {
      const response: any = await api.post(ENDPOINTS.LOGIN, {
        email,
        password,
        role,
      });

      if (response.success) {
        const { data, token: authToken } = response;
        
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.TOKEN, authToken],
          [STORAGE_KEYS.USER, JSON.stringify(data)],
          [STORAGE_KEYS.USER_ROLE, role],
        ]);

        setToken(authToken);
        setUser(data);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      const response: any = await api.post(ENDPOINTS.REGISTER, userData);

      if (response.success) {
        const { data, token: authToken } = response;
        
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.TOKEN, authToken],
          [STORAGE_KEYS.USER, JSON.stringify(data)],
          [STORAGE_KEYS.USER_ROLE, userData.role || 'user'],
        ]);

        setToken(authToken);
        setUser(data);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_ROLE,
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
