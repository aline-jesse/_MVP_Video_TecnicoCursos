
'use client';

/**
 * SPRINT 36 - WHITE-LABEL ASSETS MANAGER
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Props {
  organizationId: string;
  currentLogoUrl?: string | null;
  currentFaviconUrl?: string | null;
  onUpdate?: () => void;
}

export function WhiteLabelAssets({ organizationId, currentLogoUrl, currentFaviconUrl, onUpdate }: Props) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [faviconUrl, setFaviconUrl] = useState(currentFaviconUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use PNG, JPG, WEBP ou SVG.');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 2MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/org/${organizationId}/assets/logo`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setLogoUrl(data.url);
        toast.success('Logo enviado com sucesso!');
        onUpdate?.();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao enviar logo');
      }
    } catch (error) {
      toast.error('Erro ao enviar logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/x-icon', 'image/png', 'image/svg+xml'].includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use ICO, PNG ou SVG para favicon.');
      return;
    }

    setUploadingFavicon(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/org/${organizationId}/assets/favicon`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFaviconUrl(data.url);
        toast.success('Favicon enviado com sucesso!');
        onUpdate?.();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao enviar favicon');
      }
    } catch (error) {
      toast.error('Erro ao enviar favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Tem certeza que deseja remover o logo?')) return;

    try {
      const response = await fetch(`/api/org/${organizationId}/assets/logo`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLogoUrl(null);
        toast.success('Logo removido com sucesso!');
        onUpdate?.();
      } else {
        toast.error('Erro ao remover logo');
      }
    } catch (error) {
      toast.error('Erro ao remover logo');
    }
  };

  const handleDeleteFavicon = async () => {
    if (!confirm('Tem certeza que deseja remover o favicon?')) return;

    try {
      const response = await fetch(`/api/org/${organizationId}/assets/favicon`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFaviconUrl(null);
        toast.success('Favicon removido com sucesso!');
        onUpdate?.();
      } else {
        toast.error('Erro ao remover favicon');
      }
    } catch (error) {
      toast.error('Erro ao remover favicon');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo da Organização</CardTitle>
          <CardDescription>
            Personalize sua marca. Recomendado: PNG ou SVG, fundo transparente, 400x100px
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoUrl ? (
            <div className="space-y-4">
              <div className="relative aspect-[4/1] w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
                <Image
                  src={logoUrl}
                  alt="Organization logo"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Substituir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteLogo}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              {uploadingLogo ? (
                <Loader2 className="h-12 w-12 mx-auto text-gray-400 animate-spin mb-4" />
              ) : (
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Clique para fazer upload do logo
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP ou SVG • Máximo 2MB
              </p>
            </div>
          )}

          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Favicon</CardTitle>
          <CardDescription>
            Ícone exibido na aba do navegador. Recomendado: ICO, PNG ou SVG, 32x32px
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faviconUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
                  <Image
                    src={faviconUrl}
                    alt="Favicon"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploadingFavicon}
                >
                  {uploadingFavicon ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Substituir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteFavicon}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => faviconInputRef.current?.click()}
            >
              {uploadingFavicon ? (
                <Loader2 className="h-12 w-12 mx-auto text-gray-400 animate-spin mb-4" />
              ) : (
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Clique para fazer upload do favicon
              </p>
              <p className="text-xs text-gray-500">
                ICO, PNG ou SVG • 32x32px recomendado
              </p>
            </div>
          )}

          <input
            ref={faviconInputRef}
            type="file"
            accept="image/x-icon,image/png,image/svg+xml"
            className="hidden"
            onChange={handleFaviconUpload}
          />

          <Alert>
            <AlertDescription>
              <p className="text-xs">
                💡 <strong>Dica:</strong> Use ferramentas online como{' '}
                <a
                  href="https://realfavicongenerator.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  RealFaviconGenerator
                </a>{' '}
                para criar favicons compatíveis com todos os dispositivos.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
