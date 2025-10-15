import { supabase } from './client';
import { User } from '@supabase/supabase-js';

// Funções de autenticação
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, userData: { name: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
      },
    },
  });
  
  if (error) throw error;
  
  // Se o registro for bem-sucedido, criar o perfil do usuário
  if (data.user) {
    await createUserProfile(data.user, userData);
  }
  
  return data;
};

// Criar perfil do usuário na tabela users
const createUserProfile = async (user: User, userData: { name: string }) => {
  const { error } = await supabase.from('users').insert({
    id: user.id,
    email: user.email!,
    name: userData.name,
    created_at: new Date().toISOString(),
  });
  
  if (error) throw error;
};

// Redefinição de senha
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
  return { success: true };
};

// Atualizar senha
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
  return { success: true };
};

// Autenticação com provedores OAuth
export const signInWithProvider = async (provider: 'google' | 'github') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw error;
  return data;
};