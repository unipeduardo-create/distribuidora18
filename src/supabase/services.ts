import { supabase } from "./config";

export interface Distributor {
  id?: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  responsavel: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Auth
export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// Database
const TABLE_NAME = "distributors";

export const addDistributor = async (
  data: Omit<Distributor, "id" | "created_at" | "updated_at" | "user_id">
): Promise<Distributor> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[Supabase] Usuário atual:", user?.id || "não logado");
  console.log("[Supabase] Inserindo dados:", data);

  const { data: inserted, error } = await supabase
    .from(TABLE_NAME)
    .insert([
      {
        ...data,
        user_id: user?.id || null,
      },
    ])
    .select()
    .single();

  console.log("[Supabase] Resposta da inserção:", { inserted, error });

  if (error) throw error;
  if (!inserted) throw new Error("Erro ao inserir distribuidora.");

  return inserted as Distributor;
};

export const getDistributors = async (): Promise<Distributor[]> => {
  console.log("[Supabase] Buscando distribuidoras...");

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  console.log("[Supabase] Resposta da busca:", { data, error });

  if (error) throw error;
  return (data as Distributor[]) || [];
};

export const updateDistributor = async (
  id: string,
  data: Partial<Omit<Distributor, "id" | "created_at" | "updated_at" | "user_id">>
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update(data)
    .eq("id", id);

  if (error) throw error;
};

export const deleteDistributor = async (id: string): Promise<void> => {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
};
