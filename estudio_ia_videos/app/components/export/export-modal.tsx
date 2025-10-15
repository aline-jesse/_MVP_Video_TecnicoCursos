/**
 * 🎬 Modal de Exportação - Configurações de Renderização
 * Interface para configurar e iniciar renderização de vídeos
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Settings, Video, Image, Music, FileText } from 'lucide-react';
import { useRendering } from '../../hooks/use-rendering';
import { useTimeline } from '../../hooks/use-timeline';
import { ExportSettings, QUALITY_PRESETS } from '../../lib/types/remotion-types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project } = useTimeline();
  const { isRendering, progress, error, startRender, clearError } = useRendering();
  
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 8,
    codec: 'h264',
    audioCodec: 'aac',
    bitrate: '8M',
    audioBitrate: '192k'
  });

  const [selectedPreset, setSelectedPreset] = useState('1080p');

  const handleExport = async () => {
    try {
      clearError();
      await startRender(project, settings);
    } catch (err) {
      console.error('Erro ao iniciar exportação:', err);
    }
  };

  const handlePresetChange = (presetName: string) => {
    const preset = QUALITY_PRESETS[presetName];
    if (preset) {
      setSelectedPreset(presetName);
      setSettings(prev => ({
        ...prev,
        bitrate: preset.bitrate,
        audioBitrate: preset.audioBitrate
      }));
    }
  };

  const formatOptions = [
    { value: 'mp4', label: 'MP4 Video', icon: Video },
    { value: 'webm', label: 'WebM Video', icon: Video },
    { value: 'gif', label: 'GIF Animation', icon: Image },
    { value: 'mp3', label: 'MP3 Audio', icon: Music },
    { value: 'wav', label: 'WAV Audio', icon: Music }
  ];

  const qualityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1) as ExportSettings['quality'],
    label: `Qualidade ${i + 1}${i === 9 ? ' (Máxima)' : i === 0 ? ' (Mínima)' : ''}`
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Download className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Exportar Vídeo</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Informações do Projeto */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Projeto</h3>
              <p className="text-white font-medium">{project.name}</p>
              <p className="text-sm text-gray-400">
                Duração: {Math.round(project.duration / 1000)}s • 
                Elementos: {project.layers.reduce((acc, layer) => acc + layer.elements.length, 0)}
              </p>
            </div>

            {/* Formato */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Formato de Saída
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formatOptions.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setSettings(prev => ({ ...prev, format: format.value as any }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      settings.format === format.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <format.icon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm font-medium text-white">{format.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preset de Qualidade */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Preset de Qualidade
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedPreset === key
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-sm font-medium text-white">{preset.name}</p>
                    <p className="text-xs text-gray-400">{preset.width}x{preset.height}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-300">
                  Configurações Avançadas
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Qualidade */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Qualidade</label>
                  <select
                    value={settings.quality}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      quality: parseInt(e.target.value) as any 
                    }))}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  >
                    {qualityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Codec */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Codec</label>
                  <select
                    value={settings.codec}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      codec: e.target.value as any 
                    }))}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  >
                    <option value="h264">H.264</option>
                    <option value="h265">H.265</option>
                    <option value="vp8">VP8</option>
                    <option value="vp9">VP9</option>
                  </select>
                </div>

                {/* Bitrate */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bitrate Vídeo</label>
                  <input
                    type="text"
                    value={settings.bitrate}
                    onChange={(e) => setSettings(prev => ({ ...prev, bitrate: e.target.value }))}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    placeholder="8M"
                  />
                </div>

                {/* Audio Bitrate */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bitrate Áudio</label>
                  <input
                    type="text"
                    value={settings.audioBitrate}
                    onChange={(e) => setSettings(prev => ({ ...prev, audioBitrate: e.target.value }))}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    placeholder="192k"
                  />
                </div>
              </div>
            </div>

            {/* Progresso */}
            {isRendering && progress && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Renderizando...</span>
                  <span className="text-sm text-white">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Frame {progress.frame} de {progress.totalFrames}</span>
                  {progress.estimatedTimeRemaining && (
                    <span>~{progress.estimatedTimeRemaining}s restantes</span>
                  )}
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isRendering}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isRendering}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRendering ? 'Renderizando...' : 'Iniciar Exportação'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};