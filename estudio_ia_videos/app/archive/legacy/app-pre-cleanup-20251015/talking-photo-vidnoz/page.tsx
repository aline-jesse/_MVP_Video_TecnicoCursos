
/**
 * 🎭 Redirecionamento: Talking Photo Vidnoz -> Talking Photo PRO  
 * Redireciona automaticamente para o módulo funcional
 */

import { redirect } from 'next/navigation'

export default function TalkingPhotoVidnozRedirect() {
  redirect('/talking-photo-pro')
}
