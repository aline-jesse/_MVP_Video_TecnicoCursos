
/**
 * Player de Vídeo Profissional
 */
'use client';

import { useVideoPlayer } from '@/lib/hooks/use-video-player';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
} from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  onTimeUpdate,
  className = '',
}: VideoPlayerProps) {
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isFullscreen,
    isMuted,
    buffered,
    play,
    pause,
    togglePlay,
    seek,
    skip,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    toggleFullscreen,
  } = useVideoPlayer({ onTimeUpdate });

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        playsInline
      />

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            variant="ghost"
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <div
                className="absolute h-1 bg-white/30 rounded-full"
                style={{ width: '100%' }}
              />
              <div
                className="absolute h-1 bg-blue-500/50 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              <Slider
                value={[currentTime]}
                onValueChange={handleSeek}
                max={duration || 100}
                step={0.1}
                className="relative z-10"
              />
            </div>
            <span className="text-white text-xs font-mono">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              {/* Skip Back */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => skip(-5)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              {/* Skip Forward */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => skip(5)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={(val) => changeVolume(val[0] / 100)}
                  max={100}
                  className="w-20"
                />
              </div>

              {/* Playback Rate */}
              <Select
                value={String(playbackRate)}
                onValueChange={(val) => changePlaybackRate(parseFloat(val))}
              >
                <SelectTrigger className="w-16 h-8 text-white border-white/20 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {/* Settings */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>

              {/* Fullscreen */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
