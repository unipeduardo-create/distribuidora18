import type { AuthError, PostgrestError } from "@supabase/supabase-js";

export const getSupabaseErrorMessage = (err: unknown): string => {
  // Erros de autenticação do Supabase
  if (err && typeof err === "object" && "__isAuthError" in err) {
    const authErr = err as unknown as AuthError;
    const code = authErr.status?.toString() || authErr.code || "";

    const messages: Record<string, string> = {
      "400": "Requisição inválida. Verifique os dados enviados.",
      "401": "E-mail ou senha incorretos.",
      "403": "Acesso negado. Verifique as permissões.",
      "404": "Usuário não encontrado.",
      "422": "E-mail inválido ou senha muito fraca.",
      "429": "Muitas tentativas. Aguarde um pouco.",
      invalid_credentials: "E-mail ou senha incorretos.",
      user_not_found: "Usuário não encontrado.",
      email_not_confirmed: "E-mail ainda não confirmado.",
      email_exists: "Este e-mail já está em uso.",
      weak_password: "A senha deve ter pelo menos 6 caracteres.",
    };

    return messages[code] || authErr.message || "Erro de autenticação.";
  }

  // Erros do banco de dados (Postgrest)
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    const pgErr = err as unknown as PostgrestError;

    const messages: Record<string, string> = {
      "42501": "Permissão negada. Verifique as políticas de segurança (RLS) do Supabase.",
      "23505": "Registro duplicado. Este dado já existe.",
      "23503": "Violação de chave estrangeira.",
      "42P01": "Tabela não encontrada. Verifique se a tabela foi criada no Supabase.",
      "PGRST116": "Limite de requisições excedido.",
    };

    return messages[pgErr.code] || pgErr.message || "Erro no banco de dados.";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
};
