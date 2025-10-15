
/**
 * ✅ Timeline Service - Client-side utilities
 * Sprint 43 - P1 CORRIGIDO
 */

export interface TimelineKeyframe {
  id: string;
  time: number;
  value: any;
  easing?: string;
}

export interface TimelineTrack {
  id: string;
  type: string;
  name: string;
  keyframes: TimelineKeyframe[];
  locked?: boolean;
  visible?: boolean;
}

export interface TimelineSettings {
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  duration: number;
}

export interface Timeline {
  id?: string;
  projectId: string;
  tracks: TimelineTrack[];
  settings: TimelineSettings;
  totalDuration: number;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Buscar timeline por projectId
 */
export async function fetchTimeline(projectId: string): Promise<Timeline | null> {
  try {
    const response = await fetch(`/api/timeline?projectId=${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch timeline');
    }

    return data.timeline;
  } catch (error) {
    console.error('❌ Error fetching timeline:', error);
    throw error;
  }
}

/**
 * Salvar timeline (criar ou atualizar)
 */
export async function saveTimeline(timeline: Omit<Timeline, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<Timeline> {
  try {
    const response = await fetch('/api/timeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeline),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save timeline');
    }

    return data.timeline;
  } catch (error) {
    console.error('❌ Error saving timeline:', error);
    throw error;
  }
}

/**
 * Deletar timeline
 */
export async function deleteTimeline(projectId: string): Promise<void> {
  try {
    const response = await fetch(`/api/timeline?projectId=${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete timeline');
    }
  } catch (error) {
    console.error('❌ Error deleting timeline:', error);
    throw error;
  }
}

/**
 * Criar timeline vazia com configurações padrão
 */
export function createEmptyTimeline(projectId: string): Omit<Timeline, 'id' | 'version' | 'createdAt' | 'updatedAt'> {
  return {
    projectId,
    tracks: [
      {
        id: 'track-1',
        type: 'video',
        name: 'Video Track 1',
        keyframes: [],
        locked: false,
        visible: true,
      },
      {
        id: 'track-2',
        type: 'audio',
        name: 'Audio Track 1',
        keyframes: [],
        locked: false,
        visible: true,
      },
    ],
    settings: {
      resolution: {
        width: 1920,
        height: 1080,
      },
      fps: 30,
      duration: 60, // 60 seconds default
    },
    totalDuration: 0,
  };
}

/**
 * Validar timeline
 */
export function validateTimeline(timeline: Partial<Timeline>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!timeline.projectId) {
    errors.push('projectId is required');
  }

  if (!timeline.tracks || !Array.isArray(timeline.tracks)) {
    errors.push('tracks must be an array');
  }

  if (!timeline.settings) {
    errors.push('settings is required');
  } else {
    if (!timeline.settings.resolution) {
      errors.push('settings.resolution is required');
    }
    if (typeof timeline.settings.fps !== 'number') {
      errors.push('settings.fps must be a number');
    }
    if (typeof timeline.settings.duration !== 'number') {
      errors.push('settings.duration must be a number');
    }
  }

  if (typeof timeline.totalDuration !== 'number') {
    errors.push('totalDuration must be a number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
