import { supabase } from './client';

// Invoca uma função Edge do Supabase
export const invokeFunction = async (
  functionName: string,
  payload: any = {}
) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) throw error;
  return data;
};

// Função para processar vídeos
export const processVideo = async (videoUrl: string, metadata: any) => {
  return await invokeFunction('process-video', {
    videoUrl,
    metadata,
  });
};

// Função para gerar thumbnails automaticamente
export const generateThumbnail = async (videoUrl: string) => {
  return await invokeFunction('generate-thumbnail', {
    videoUrl,
  });
};

// Função para transcrever vídeo
export const transcribeVideo = async (videoUrl: string, language: string = 'pt-BR') => {
  return await invokeFunction('transcribe-video', {
    videoUrl,
    language,
  });
};

// Função para enviar notificações
export const sendNotification = async (userId: string, message: string, data: any = {}) => {
  return await invokeFunction('send-notification', {
    userId,
    message,
    data,
  });
};

// Função para gerar relatórios
export const generateReport = async (reportType: string, filters: any = {}) => {
  return await invokeFunction('generate-report', {
    reportType,
    filters,
  });
};