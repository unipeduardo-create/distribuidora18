import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMsg('As senhas não coincidem'); return; }
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, token, password })
      });
      const j = await res.json();
      if (!res.ok) { setMsg(j.message || 'Erro'); return; }
      setMsg('Senha alterada com sucesso');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setMsg('Erro de rede');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Redefinir senha</h2>
          <p className="text-slate-500 text-sm mb-4">Escolha uma nova senha para sua conta.</p>
          <form onSubmit={handle} className="space-y-4">
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Nova senha" className="w-full py-2.5 px-3 border rounded-md bg-slate-50" />
            <input type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirmar senha" className="w-full py-2.5 px-3 border rounded-md bg-slate-50" />
            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-md">Salvar</button>
            {msg && <div className="mt-4 text-sm text-slate-600">{msg}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
