import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type User = { id: number; name?: string; email: string; role?: string };

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const v = localStorage.getItem('currentUser');
    return v && v !== 'null' ? JSON.parse(v) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('currentUser', currentUser ? JSON.stringify(currentUser) : 'null');
  }, [currentUser]);

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const j = await res.json();
        return { success: false, message: j.message || 'Erro ao autenticar' };
      }
      const j = await res.json();
      setCurrentUser(j.user);
      return { success: true, message: 'OK' };
    } catch (err) {
      return { success: false, message: 'Erro de rede' };
    } finally {
      setIsLoading(false);
    }
  }

  async function register(name: string, email: string, password: string, role: 'admin'|'user') {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (!res.ok) {
        const j = await res.json();
        return { success: false, message: j.message || 'Erro ao cadastrar' };
      }
      const j = await res.json();
      setCurrentUser(j.user);
      return { success: true, message: 'OK' };
    } catch (err) {
      return { success: false, message: 'Erro de rede' };
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }

  return { currentUser, isLoading, login, register, logout };
}
export default useAuth;
