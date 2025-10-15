/**
 * Admin Metrics Page
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Métricas - Admin',
  description: 'Métricas detalhadas do sistema',
};

export default function MetricsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Métricas do Sistema</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Performance</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>CPU Usage</span>
              <span className="font-bold">45%</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage</span>
              <span className="font-bold">67%</span>
            </div>
            <div className="flex justify-between">
              <span>Disk Usage</span>
              <span className="font-bold">23%</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">API Metrics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Requests/min</span>
              <span className="font-bold">1,234</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Response Time</span>
              <span className="font-bold">245ms</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate</span>
              <span className="font-bold text-red-600">0.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}