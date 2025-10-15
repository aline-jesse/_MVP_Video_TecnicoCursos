
/**
 * SPRINT 36 - WHITE-LABEL ASSETS STORAGE
 * Upload and manage organization logos, favicons, and custom assets
 */

import { uploadFile, deleteFile } from '../s3';
import { prisma } from '../db';

interface AssetUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload organization logo to S3
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: Buffer,
  fileName: string
): Promise<AssetUploadResult> {
  try {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (!['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) {
      return {
        success: false,
        error: 'Tipo de arquivo inválido. Use PNG, JPG, WEBP ou SVG.',
      };
    }

    // Generate unique key
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `organizations/${organizationId}/logo_${timestamp}_${sanitizedName}`;

    // Determine content type
    const contentType = getContentType(ext || 'bin');

    // Upload to S3
    const url = await uploadFile(file, key, contentType);

    // Update database
    const whiteLabelSettings = await prisma.whiteLabelSettings.upsert({
      where: { organizationId },
      create: {
        organizationId,
        logoUrl: url,
      },
      update: {
        logoUrl: url,
      },
    });

    console.log(`✅ Logo uploaded for organization ${organizationId}`);

    return {
      success: true,
      url,
    };

  } catch (error) {
    console.error('Failed to upload logo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload do logo',
    };
  }
}

/**
 * Upload organization favicon to S3
 */
export async function uploadOrganizationFavicon(
  organizationId: string,
  file: Buffer,
  fileName: string
): Promise<AssetUploadResult> {
  try {
    // Validate file type (favicons should be .ico, .png, or .svg)
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (!['ico', 'png', 'svg'].includes(ext || '')) {
      return {
        success: false,
        error: 'Tipo de arquivo inválido. Use ICO, PNG ou SVG para favicon.',
      };
    }

    // Generate unique key
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `organizations/${organizationId}/favicon_${timestamp}_${sanitizedName}`;

    // Determine content type
    const contentType = ext === 'ico' ? 'image/x-icon' : getContentType(ext || 'bin');

    // Upload to S3
    const url = await uploadFile(file, key, contentType);

    // Update database
    await prisma.whiteLabelSettings.upsert({
      where: { organizationId },
      create: {
        organizationId,
        faviconUrl: url,
      },
      update: {
        faviconUrl: url,
      },
    });

    console.log(`✅ Favicon uploaded for organization ${organizationId}`);

    return {
      success: true,
      url,
    };

  } catch (error) {
    console.error('Failed to upload favicon:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer upload do favicon',
    };
  }
}

/**
 * Delete organization asset
 */
export async function deleteOrganizationAsset(
  organizationId: string,
  assetType: 'logo' | 'favicon'
): Promise<{ success: boolean; error?: string }> {
  try {
    const whiteLabelSettings = await prisma.whiteLabelSettings.findUnique({
      where: { organizationId },
    });

    if (!whiteLabelSettings) {
      return {
        success: false,
        error: 'Configuração de white-label não encontrada',
      };
    }

    const assetUrl = assetType === 'logo' ? whiteLabelSettings.logoUrl : whiteLabelSettings.faviconUrl;

    if (assetUrl) {
      // Extract key from URL
      const key = extractKeyFromUrl(assetUrl);
      
      if (key) {
        await deleteFile(key);
      }

      // Update database
      await prisma.whiteLabelSettings.update({
        where: { organizationId },
        data: {
          [assetType === 'logo' ? 'logoUrl' : 'faviconUrl']: null,
        },
      });

      console.log(`✅ ${assetType} deleted for organization ${organizationId}`);
    }

    return { success: true };

  } catch (error) {
    console.error(`Failed to delete ${assetType}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Erro ao deletar ${assetType}`,
    };
  }
}

/**
 * Get content type from file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
  };
  
  return types[ext] || 'application/octet-stream';
}

/**
 * Extract S3 key from URL
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}

/**
 * Validate image dimensions (for logos)
 */
export async function validateImageDimensions(
  buffer: Buffer,
  maxWidth: number = 1000,
  maxHeight: number = 1000
): Promise<{ valid: boolean; error?: string }> {
  try {
    // In production, use sharp or similar library to check dimensions
    // For now, just check file size
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (buffer.length > maxSize) {
      return {
        valid: false,
        error: 'Imagem muito grande. Tamanho máximo: 2MB',
      };
    }

    return { valid: true };

  } catch (error) {
    return {
      valid: false,
      error: 'Erro ao validar imagem',
    };
  }
}
