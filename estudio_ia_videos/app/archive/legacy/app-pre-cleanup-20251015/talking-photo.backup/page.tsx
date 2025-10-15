
/**
 * 🎭 Página do Vidnoz AI Talking Photo
 * Interface idêntica ao Vidnoz original
 */

import VidnozTalkingPhoto from '@/components/avatars/vidnoz-talking-photo'

export const metadata = {
  title: 'Vidnoz AI Talking Photo Free - Bring Photos to Life',
  description: 'Create realistic talking photos online free with AI. Upload or select a photo, input text and create talking avatars in 100+ languages.',
  keywords: 'talking photo, AI avatar, video generation, text to speech, deepfake, avatar creator'
}

export default function TalkingPhotoPage() {
  return (
    <div className="min-h-screen">
      <VidnozTalkingPhoto />
    </div>
  )
}
