'use client';

import React, { useState } from 'react';

interface VoiceCloningIntegrationProps {
  onVoiceCreated?: (voiceId: string) => void;
  className?: string;
}

export default function VoiceCloningIntegration({
  onVoiceCreated,
  className = ''
}: VoiceCloningIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [voiceName, setVoiceName] = useState('');
  const [createdVoiceId, setCreatedVoiceId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createVoiceClone = async () => {
    if (!voiceName || uploadedFiles.length === 0) return;

    setIsProcessing(true);

    // Simulação de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockVoiceId = `voice_${Date.now()}`;
    setCreatedVoiceId(mockVoiceId);
    setIsProcessing(false);

    if (onVoiceCreated) {
      onVoiceCreated(mockVoiceId);
    }
  };

  return (
    <div className={`voice-cloning-integration ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Voice Cloning</h3>

        {!createdVoiceId ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Voz
              </label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Narrador Profissional"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload de Amostras de Voz (mín. 3 arquivos)
              </label>
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="w-full"
              />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Requisitos:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Mínimo de 3 amostras de áudio</li>
                <li>• Cada amostra deve ter pelo menos 30 segundos</li>
                <li>• Áudio claro e sem ruído de fundo</li>
                <li>• Formato MP3, WAV ou M4A</li>
              </ul>
            </div>

            <button
              onClick={createVoiceClone}
              disabled={isProcessing || !voiceName || uploadedFiles.length < 3}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                'Criar Voice Clone'
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">Voz Criada com Sucesso!</h4>
            <p className="text-gray-600 mb-1">Nome: <strong>{voiceName}</strong></p>
            <p className="text-sm text-gray-500">ID: {createdVoiceId}</p>
            <button
              onClick={() => {
                setCreatedVoiceId(null);
                setUploadedFiles([]);
                setVoiceName('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Criar Nova Voz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
