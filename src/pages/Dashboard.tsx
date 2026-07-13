import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  addDistributor,
  deleteDistributor,
  getDistributors,
  logoutUser,
  updateDistributor,
  type Distributor,
} from "@/supabase/services";
import { getSupabaseErrorMessage } from "@/utils/supabaseErrors";

const initialForm: Omit<Distributor, "id" | "created_at" | "updated_at" | "user_id"> = {
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  responsavel: "",
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDistributors();
    }
  }, [user]);

  const fetchDistributors = async () => {
    setIsLoading(true);
    try {
      const data = await getDistributors();
      setDistributors(data);
    } catch (err) {
      console.error("Erro ao carregar distribuidoras:", err);
      setMessage(getSupabaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Você precisa estar logado para salvar dados.");
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await updateDistributor(editingId, form);
        setMessage("Distribuidora atualizada com sucesso!");
      } else {
        await addDistributor(form);
        setMessage("Distribuidora cadastrada com sucesso!");
      }
      setForm(initialForm);
      setEditingId(null);
      await fetchDistributors();
    } catch (err) {
      console.error("Erro ao salvar distribuidora:", err);
      setMessage(getSupabaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (distributor: Distributor) => {
    setEditingId(distributor.id || null);
    setForm({
      razao_social: distributor.razao_social,
      nome_fantasia: distributor.nome_fantasia,
      cnpj: distributor.cnpj,
      email: distributor.email,
      telefone: distributor.telefone,
      endereco: distributor.endereco,
      cidade: distributor.cidade,
      estado: distributor.estado,
      cep: distributor.cep,
      responsavel: distributor.responsavel,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta distribuidora?")) return;
    setIsLoading(true);
    try {
      await deleteDistributor(id);
      setMessage("Distribuidora excluída com sucesso!");
      await fetchDistributors();
    } catch (err) {
      console.error("Erro ao excluir distribuidora:", err);
      setMessage(getSupabaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Cadastro de Distribuidoras
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie seus cadastros no Supabase
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </header>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.includes("Erro") || message.includes("negada") || message.includes("não encontrada")
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message}
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            {editingId ? "Editar distribuidora" : "Nova distribuidora"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Razão Social *
                </label>
                <input
                  type="text"
                  name="razao_social"
                  required
                  value={form.razao_social}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  name="nome_fantasia"
                  value={form.nome_fantasia}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  CNPJ *
                </label>
                <input
                  type="text"
                  name="cnpj"
                  required
                  value={form.cnpj}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Responsável
                </label>
                <input
                  type="text"
                  name="responsavel"
                  value={form.responsavel}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={form.cep}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {isLoading
                  ? "Salvando..."
                  : editingId
                  ? "Atualizar"
                  : "Cadastrar"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            Distribuidoras cadastradas
          </h2>
          {isLoading && distributors.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : distributors.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhuma distribuidora cadastrada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Razão Social</th>
                    <th className="pb-3 pr-4 font-medium">CNPJ</th>
                    <th className="pb-3 pr-4 font-medium">E-mail</th>
                    <th className="pb-3 pr-4 font-medium">Cidade/UF</th>
                    <th className="pb-3 pr-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {distributors.map((d) => (
                    <tr key={d.id} className="text-slate-700">
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {d.razao_social}
                      </td>
                      <td className="py-3 pr-4">{d.cnpj}</td>
                      <td className="py-3 pr-4">{d.email}</td>
                      <td className="py-3 pr-4">
                        {d.cidade}
                        {d.estado ? `/${d.estado}` : ""}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(d.id!)}
                            className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
