import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api';
import type { CurrentUser } from '../types';

interface AuthContextType {
  token: string | null;
  currentUser: CurrentUser | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (token) {
      api.get<CurrentUser>('/users/current').then((res) => {
        setCurrentUser(res.data);
      }).catch(() => {
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('token');
      });
    }
  }, [token]);

  async function login(newToken: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const res = await api.get<CurrentUser>('/users/current');
    setCurrentUser(res.data);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
