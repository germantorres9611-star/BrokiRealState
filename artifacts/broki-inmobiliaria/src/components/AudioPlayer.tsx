import React, { useRef, useState, useEffect } from 'react';
import { useAudio } from '../hooks/use-broki';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AudioPlayer() {
  const { data: audioBase64 } = useAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioBase64]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(p) ? 0 : p);
    }
  };

  if (!audioBase64) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border px-4 py-3 flex items-center justify-between"
    >
      <audio 
        ref={audioRef} 
        src={audioBase64} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        loop
      />
      
      <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-primary text-white hover:bg-primary/80 transition-colors"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
        </button>
        
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>BROKI FM</span>
            <span>VIBE</span>
          </div>
          <div className="h-1 bg-border w-full relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button 
          onClick={toggleMute}
          className="text-muted-foreground hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
