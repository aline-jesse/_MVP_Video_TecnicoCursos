/**
 * Admin Growth Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crescimento - Admin',
  description: 'Métricas de crescimento do sistema',
};

export default function GrowthPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Métricas de Crescimento</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Usuários Ativos</h2>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-green-600">+12% este mês</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Vídeos Criados</h2>
          <p className="text-3xl font-bold text-green-600">5,678</p>
          <p className="text-green-600">+25% este mês</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Tempo Médio</h2>
          <p className="text-3xl font-bold text-purple-600">2.5min</p>
          <p className="text-red-600">-8% este mês</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Taxa de Sucesso</h2>
          <p className="text-3xl font-bold text-orange-600">98.5%</p>
          <p className="text-green-600">+1.2% este mês</p>
        </div>
      </div>
    </div>
  );
}