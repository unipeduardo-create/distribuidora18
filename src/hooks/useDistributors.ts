import { useState, useEffect, useCallback } from 'react';
import type { Distributor } from '../types';

const DISTRIBUTORS_KEY = 'distributor_app_distributors';

export function useDistributors(userId: string | undefined, userRole?: 'admin' | 'user') {
  const [distributors, setDistributors] = useState<Distributor[]>([]);

  useEffect(() => {
    if (!userId) return;
    const data = localStorage.getItem(DISTRIBUTORS_KEY);
    if (data) {
      const all = JSON.parse(data) as Distributor[];
      // Todos os usuários veem todas as distribuidoras cadastradas
      setDistributors(all);
    }
  }, [userId, userRole]);

  const saveAll = useCallback((items: Distributor[]) => {
    // Salva todas as distribuidoras sem filtragem
    localStorage.setItem(DISTRIBUTORS_KEY, JSON.stringify(items));
  }, []);

  const add = useCallback((distributor: Omit<Distributor, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const newDistributor: Distributor = {
      ...distributor,
      id: crypto.randomUUID(),
      userId: userId!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...distributors, newDistributor];
    setDistributors(updated);
    saveAll(updated);
    return newDistributor;
  }, [distributors, userId, saveAll]);

  const bulkAdd = useCallback((distributorsToAdd: Omit<Distributor, 'id' | 'createdAt' | 'updatedAt' | 'userId'>[]) => {
    if (!userId) return;
    const newDistributors: Distributor[] = distributorsToAdd.map(d => ({
      ...d,
      id: crypto.randomUUID(),
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    const updated = [...distributors, ...newDistributors];
    setDistributors(updated);
    saveAll(updated);
  }, [distributors, userId, saveAll]);

  const update = useCallback((id: string, data: Partial<Distributor>) => {
    const updated = distributors.map((d) =>
      d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
    );
    setDistributors(updated);
    saveAll(updated);
  }, [distributors, saveAll]);

  const remove = useCallback((id: string) => {
    const updated = distributors.filter((d) => d.id !== id);
    setDistributors(updated);
    saveAll(updated);
  }, [distributors, saveAll]);

  const toggleStatus = useCallback((id: string) => {
    const updated = distributors.map((d) =>
      d.id === id ? { ...d, isOpen: !d.isOpen, updatedAt: new Date().toISOString() } : d
    );
    setDistributors(updated);
    saveAll(updated);
  }, [distributors, saveAll]);

  const getById = useCallback((id: string) => {
    return distributors.find((d) => d.id === id);
  }, [distributors]);

  return { distributors, add, bulkAdd, update, remove, toggleStatus, getById };
}
