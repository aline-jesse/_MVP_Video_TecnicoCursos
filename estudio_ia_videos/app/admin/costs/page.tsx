/**
 * Admin Costs Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custos - Admin',
  description: 'Monitoramento de custos operacionais',
};

export default function CostsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Custos Operacionais</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">TTS APIs</h2>
          <p className="text-3xl font-bold text-blue-600">$245.50</p>
          <p className="text-gray-600">Este mês</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Avatar Rendering</h2>
          <p className="text-3xl font-bold text-green-600">$189.30</p>
          <p className="text-gray-600">Este mês</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Storage</h2>
          <p className="text-3xl font-bold text-purple-600">$67.80</p>
          <p className="text-gray-600">Este mês</p>
        </div>
      </div>
    </div>
  );
}