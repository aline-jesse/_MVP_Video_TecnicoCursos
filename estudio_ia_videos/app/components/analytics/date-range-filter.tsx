'use client';

/**
 * Date Range Filter - Filtro de Período
 * 
 * Permite selecionar períodos pré-definidos ou customizar datas
 */

import { useState } from 'react';
import { subDays, format } from 'date-fns';

// ==========================================
// TIPOS
// ==========================================

interface DateRangeFilterProps {
  startDate: Date;
  endDate: Date;
  days: number;
  onDateRangeChange: (start: Date, end: Date) => void;
  onDaysChange: (days: number) => void;
}

// ==========================================
// PERÍODOS PRÉ-DEFINIDOS
// ==========================================

const PRESET_RANGES = [
  { label: '7 dias', days: 7 },
  { label: '14 dias', days: 14 },
  { label: '30 dias', days: 30 },
  { label: '60 dias', days: 60 },
  { label: '90 dias', days: 90 },
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function DateRangeFilter({
  startDate,
  endDate,
  days,
  onDateRangeChange,
  onDaysChange,
}: DateRangeFilterProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customStart, setCustomStart] = useState(format(startDate, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endDate, 'yyyy-MM-dd'));

  // ==========================================
  // HANDLERS
  // ==========================================

  const handlePresetChange = (presetDays: number) => {
    setCustomMode(false);
    onDaysChange(presetDays);
  };

  const handleCustomApply = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    
    if (start > end) {
      alert('A data inicial não pode ser maior que a data final');
      return;
    }
    
    onDateRangeChange(start, end);
  };

  const handleToggleCustom = () => {
    setCustomMode(!customMode);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Label */}
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Período:
          </span>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_RANGES.map((preset) => (
            <button
              key={preset.days}
              onClick={() => handlePresetChange(preset.days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !customMode && days === preset.days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
          
          <button
            onClick={handleToggleCustom}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              customMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Customizado
          </button>
        </div>

        {/* Custom Date Inputs */}
        {customMode && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                De:
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={customEnd}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Até:
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleCustomApply}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}

        {/* Current Range Display */}
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
        </div>
      </div>
    </div>
  );
}
