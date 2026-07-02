import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type Distributor = { id:number; name:string; address?:string; status?:string };

export function useDistributors() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/distributors`);
      if (!res.ok) return;
      const j = await res.json();
      setDistributors(j.distributors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(data: Partial<Distributor>) {
    const res = await fetch(`${API}/distributors`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const j = await res.json();
      setDistributors(prev => [j.distributor, ...prev]);
    }
  }

  return { distributors, loading, add, reload: load };
}
export default useDistributors;
