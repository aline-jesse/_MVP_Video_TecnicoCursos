
/**
 * 🎭 Redirecionamento: Talking Photo -> Talking Photo PRO
 * Redireciona automaticamente para o módulo funcional
 */

import { redirect } from 'next/navigation'

export default function TalkingPhotoRedirect() {
  redirect('/talking-photo-pro')
}
