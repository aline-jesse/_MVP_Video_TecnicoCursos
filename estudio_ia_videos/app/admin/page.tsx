/**
 * Admin Dashboard - Main Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Sistema de administração',
};

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Usuários</h2>
          <p className="text-gray-600">Gerenciar usuários do sistema</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Métricas</h2>
          <p className="text-gray-600">Visualizar métricas do sistema</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Custos</h2>
          <p className="text-gray-600">Monitorar custos operacionais</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Configurações</h2>
          <p className="text-gray-600">Configurações do sistema</p>
        </div>
      </div>
    </div>
  );
}