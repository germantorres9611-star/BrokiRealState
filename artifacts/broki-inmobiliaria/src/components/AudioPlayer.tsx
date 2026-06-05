import React, { useRef, useState, useEffect } from 'react';
import { useActiveTrack } from '../hooks/use-broki';
import { Play, Pause, Volume2, VolumeX, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function AudioPlayer() {
  const activeTrack = useActiveTrack();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  // Reset when track changes
  useEffect(() => {
    if (!activeTrack) return;
    if (activeTrack.id !== currentTrackId) {
      setCurrentTrackId(activeTrack.id);
      setProgress(0);
      setIsPlaying(false);
    }
  }, [activeTrack, currentTrackId]);

  useEffect(() => {
    if (!audioRef.current || !activeTrack) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeTrack]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(isNaN(p) ? 0 : p);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  if (!activeTrack) return null;

  const displayName = activeTrack.name.replace(/\.[^.]+$/, '');

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 80 }}
      className="fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-white/20 px-4 py-3"
    >
      {activeTrack && (
        <audio
          key={activeTrack.id}
          ref={audioRef}
          src={activeTrack.data}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          loop
        />
      )}

      <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(p => !p)}
          className="w-10 h-10 flex items-center justify-center bg-primary text-white hover:bg-primary/80 transition-colors shrink-0"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* Track info + progress */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 min-w-0">
              <Music2 size={12} className="text-primary shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-widest text-foreground truncate">
                {displayName}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 ml-2">
              BROKI FM
            </span>
          </div>
          {/* Seekable progress bar */}
          <div
            className="h-1 bg-border w-full relative overflow-hidden cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute top-0 left-0 h-full w-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Mute */}
        <button
          onClick={() => {
            if (audioRef.current) { audioRef.current.muted = !isMuted; }
            setIsMuted(m => !m);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
