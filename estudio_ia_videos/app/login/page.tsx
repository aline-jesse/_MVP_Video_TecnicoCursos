/**
 * Página de Login
 */

import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return <LoginForm />;
}

export const metadata = {
  title: 'Login - Estúdio IA Vídeos',
  description: 'Faça login para acessar o sistema de criação de vídeos'
};