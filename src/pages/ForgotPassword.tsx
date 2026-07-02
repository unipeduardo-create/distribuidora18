import { useState } from 'react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      });
      setMessage('Se o e-mail existir, você receberá instruções para resetar a senha.');
    } catch {
      setMessage('Erro ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Recuperar senha</h2>
          <p className="text-slate-500 text-sm mb-4">Informe seu e-mail para receber o link de redefinição.</p>
          <form onSubmit={handle} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full py-2.5 px-3 border rounded-md bg-slate-50" placeholder="seu@email.com" />
            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-600 text-white rounded-md">{submitting ? 'Enviando...' : 'Enviar link'}</button>
            {message && <div className="mt-4 text-sm text-slate-600">{message}</div>}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
