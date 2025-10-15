

import { notFound } from 'next/navigation'
import RealtimeCollaboration from '../../../components/collaboration/realtime-collaboration'

interface CollaborationPageProps {
  params: {
    projectId: string
  }
}

export default function CollaborationPage({ params }: CollaborationPageProps) {
  // Validate projectId
  if (!params.projectId) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Colaboração em Tempo Real
          </h1>
          <p className="text-gray-600 mt-1">
            Trabalhe em equipe no projeto em tempo real
          </p>
        </div>
        
        <RealtimeCollaboration projectId={params.projectId} />
      </div>
    </div>
  )
}
