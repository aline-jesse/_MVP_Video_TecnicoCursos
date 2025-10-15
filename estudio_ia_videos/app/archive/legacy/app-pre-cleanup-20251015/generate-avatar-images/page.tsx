
/**
 * 🖼️ Página para Gerar Imagens dos Avatares
 * Ferramenta para criar todas as imagens da galeria
 */

import AvatarGalleryImages from '@/components/avatars/avatar-gallery-images'

export const metadata = {
  title: 'Gerador de Imagens - Galeria de Avatares',
  description: 'Ferramenta para gerar todas as imagens necessárias para a galeria de avatares',
}

export default function GenerateAvatarImagesPage() {
  return <AvatarGalleryImages />
}
