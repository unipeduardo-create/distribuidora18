import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

const USERS_KEY = 'distributor_app_users';
const SESSION_KEY = 'distributor_app_session';

// Função auxiliar para verificar se localStorage está disponível
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    console.warn('localStorage não disponível, usando fallback em memória');
    return false;
  }
}

// Fallback em memória
const memoryStorage: Record<string, string> = {};

function getFromStorage(key: string): string | null {
  if (isLocalStorageAvailable()) {
    return localStorage.getItem(key);
  }
  return memoryStorage[key] || null;
}

function setInStorage(key: string, value: string): void {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(key, value);
  } else {
    memoryStorage[key] = value;
  }
}

function removeFromStorage(key: string): void {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(key);
  } else {
    delete memoryStorage[key];
  }
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = getFromStorage(SESSION_KEY);
      console.log('Carregando sessão:', session ? 'encontrada' : 'não encontrada');
      
      if (session) {
        try {
          const user = JSON.parse(session);
          setCurrentUser(user);
          console.log('Usuário carregado:', user.email);
        } catch (parseError) {
          console.error('Erro ao fazer parse da sessão:', parseError);
          removeFromStorage(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUsers = (): User[] => {
    try {
      const data = getFromStorage(USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      return [];
    }
  };

  const saveUsers = (users: User[]) => {
    try {
      setInStorage(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
    }
  };

  const register = useCallback((name: string, email: string, password: string, role: 'admin' | 'user' = 'user'): { success: boolean; message: string } => {
    try {
      const users = getUsers();
      if (users.find((u) => u.email === email)) {
        return { success: false, message: 'Este e-mail já está cadastrado.' };
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveUsers(users);
      setInStorage(SESSION_KEY, JSON.stringify(newUser));
      setCurrentUser(newUser);
      console.log('Usuário registrado:', email);
      return { success: true, message: 'Cadastro realizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return { success: false, message: 'Erro ao registrar. Tente novamente.' };
    }
  }, []);

  const login = useCallback((email: string, password: string): { success: boolean; message: string } => {
    try {
      const users = getUsers();
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) {
        return { success: false, message: 'E-mail ou senha incorretos.' };
      }
      setInStorage(SESSION_KEY, JSON.stringify(user));
      setCurrentUser(user);
      console.log('Login realizado:', email);
      return { success: true, message: 'Login realizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: 'Erro ao fazer login. Tente novamente.' };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      removeFromStorage(SESSION_KEY);
      setCurrentUser(null);
      console.log('Logout realizado');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, []);

  return { currentUser, isLoading, register, login, logout };
}
