// Classe para tratamento de erros do Supabase
export class SupabaseError extends Error {
  code: string;
  details: string | null;
  hint: string | null;

  constructor(error: any) {
    super(error.message || 'Erro desconhecido do Supabase');
    this.name = 'SupabaseError';
    this.code = error.code || 'unknown';
    this.details = error.details || null;
    this.hint = error.hint || null;
  }

  static isSupabaseError(error: any): boolean {
    return error && error.code && error.message;
  }
}

// Função para tratar erros do Supabase
export const handleSupabaseError = (error: any): SupabaseError => {
  console.error('Erro do Supabase:', error);
  
  if (SupabaseError.isSupabaseError(error)) {
    return new SupabaseError(error);
  }
  
  return new SupabaseError({
    message: error.message || 'Erro desconhecido',
    code: 'unknown',
  });
};

// Função para tratar erros de autenticação
export const handleAuthError = (error: any): string => {
  const errorMap: Record<string, string> = {
    'invalid_credentials': 'Email ou senha inválidos',
    'user_not_found': 'Usuário não encontrado',
    'email_taken': 'Este email já está em uso',
    'weak_password': 'A senha é muito fraca',
    'expired_token': 'Sua sessão expirou, faça login novamente',
  };
  
  const code = error.code || 'unknown';
  return errorMap[code] || error.message || 'Erro de autenticação';
};

// Função para tratar erros de banco de dados
export const handleDatabaseError = (error: any): string => {
  const errorMap: Record<string, string> = {
    '23505': 'Registro duplicado',
    '23503': 'Violação de chave estrangeira',
    '42P01': 'Tabela não existe',
    '42703': 'Coluna não existe',
  };
  
  const code = error.code || 'unknown';
  return errorMap[code] || error.message || 'Erro de banco de dados';
};

// Função para tratar erros de armazenamento
export const handleStorageError = (error: any): string => {
  const errorMap: Record<string, string> = {
    'storage/object-not-found': 'Arquivo não encontrado',
    'storage/unauthorized': 'Não autorizado a acessar este arquivo',
    'storage/quota-exceeded': 'Cota de armazenamento excedida',
    'storage/invalid-format': 'Formato de arquivo inválido',
  };
  
  const code = error.code || 'unknown';
  return errorMap[code] || error.message || 'Erro de armazenamento';
};

// Função para logging centralizado
export const logError = (
  context: string,
  error: any,
  additionalInfo: Record<string, any> = {}
): void => {
  console.error(`[${context}] Erro:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
    stack: error.stack,
    ...additionalInfo,
  });
  
  // Aqui você pode implementar logging para serviços externos
  // como Sentry, LogRocket, etc.
};