/**
 * Admin Configurações Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurações - Admin',
  description: 'Configurações do sistema',
};

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Configurações do Sistema</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Configurações Gerais</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Sistema
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              defaultValue="Estúdio IA Videos"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL Base
            </label>
            <input
              type="url"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              defaultValue="https://app.example.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}