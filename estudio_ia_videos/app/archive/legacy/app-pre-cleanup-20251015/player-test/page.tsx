
/**
 * Página de Teste: Video Player
 */
'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/components/player/video-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export default function PlayerTestPage() {
  const [videoUrl, setVideoUrl] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
  const [currentTime, setCurrentTime] = useState(0);

  const handleLoad = () => {
    setCurrentVideoUrl(videoUrl);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Video Player - Teste</h1>

      {/* Input URL */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>URL do Vídeo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
              />
              <Button onClick={handleLoad}>
                <Play className="w-4 h-4 mr-2" />
                Carregar
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Vídeos de exemplo:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <button
                  onClick={() =>
                    setVideoUrl(
                      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                    )
                  }
                  className="text-blue-500 hover:underline"
                >
                  Big Buck Bunny
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setVideoUrl(
                      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                    )
                  }
                  className="text-blue-500 hover:underline"
                >
                  Elephants Dream
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setVideoUrl(
                      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                    )
                  }
                  className="text-blue-500 hover:underline"
                >
                  For Bigger Blazes
                </button>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Player */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <VideoPlayer
            src={currentVideoUrl}
            onTimeUpdate={setCurrentTime}
            className="aspect-video"
          />
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempo Atual:</span>
              <span className="font-mono">{currentTime.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">URL:</span>
              <span className="font-mono text-xs truncate max-w-xs">
                {currentVideoUrl}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Atalhos de Teclado:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                <kbd className="px-2 py-1 bg-background rounded">Espaço</kbd> - Play/Pause
              </li>
              <li>
                <kbd className="px-2 py-1 bg-background rounded">←</kbd> - Voltar 5s
              </li>
              <li>
                <kbd className="px-2 py-1 bg-background rounded">→</kbd> - Avançar 5s
              </li>
              <li>
                <kbd className="px-2 py-1 bg-background rounded">↑</kbd> - Volume +10%
              </li>
              <li>
                <kbd className="px-2 py-1 bg-background rounded">↓</kbd> - Volume -10%
              </li>
              <li>
                <kbd className="px-2 py-1 bg-background rounded">F</kbd> - Fullscreen
              </li>
              <li>
                <kbd className="px-2 py-1 bg-background rounded">M</kbd> - Mute
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
