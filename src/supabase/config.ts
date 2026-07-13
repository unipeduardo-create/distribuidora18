import { createClient } from "@supabase/supabase-js";

const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Variável de ambiente ${name} não encontrada ou está vazia. ` +
        `Verifique se você criou o arquivo .env com as credenciais do Supabase ` +
        `ou configurou as variáveis no painel do Netlify antes de fazer o deploy.`
    );
  }
  return value.trim();
};

let supabaseUrl: string;
let supabaseAnonKey: string;

try {
  supabaseUrl = getEnvVar("VITE_SUPABASE_URL");
  supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY");

  // Validação básica de URL
  if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
    throw new Error(
      `VITE_SUPABASE_URL inválida: "${supabaseUrl}". ` +
        `A URL deve começar com http:// ou https://. ` +
        `Exemplo: https://abcdefgh12345678.supabase.co`
    );
  }

  console.log(
    "[Supabase] URL configurada:",
    supabaseUrl.replace(/https:\/\//, "").split(".")[0] + "..."
  );
} catch (error) {
  console.error("[Supabase] Erro na configuração:", error);
  throw error;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
