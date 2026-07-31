import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, Plus, Minus, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { playBeep, playFinishSound } from '../utils/workoutUtils';

interface RestTimerOverlayProps {
  totalSeconds: number;
  onFinish: () => void;
  onCancel: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
  totalSeconds,
  onFinish,
  onCancel,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(totalSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished!
            if (soundEnabled) playFinishSound();
            if (vibrationEnabled && navigator.vibrate) {
              navigator.vibrate([100, 50, 100, 50, 100]);
            }
            onFinish();
            return 0;
          }
          // Tick beep for last 3 seconds
          if (prev <= 4 && soundEnabled) {
            playBeep(440, 'sine', 0.08);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onFinish, soundEnabled, vibrationEnabled]);

  const addTime = (secs: number) => {
    setTimeLeft((prev) => Math.max(0, prev + secs));
  };

  const circumference = 276.5;
  const strokeDashoffset = circumference - (circumference * timeLeft) / Math.max(1, totalSeconds);

  // Minimized Bar View
  if (isMinimized) {
    return (
      <div className="fixed bottom-16 sm:bottom-4 right-4 z-50 bg-[#0a0a0a]/95 border border-[#bbff00]/50 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5">
        <div className="w-10 h-10 rounded-xl bg-[#bbff00]/15 border border-[#bbff00]/30 flex items-center justify-center font-mono font-black text-[#bbff00] text-base">
          {timeLeft}s
        </div>
        <div>
          <div className="text-xs font-bold text-white font-heading">Temps de repos</div>
          <div className="text-[10px] text-zinc-400">
            {timeLeft > 30 ? 'Récupération...' : timeLeft > 10 ? 'Prépare-toi' : 'C\'est reparti !'}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-[#bbff00] text-[#0a0a0a] font-bold"
            title="Agrandir"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Full Screen Modal View
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-zinc-100 animate-in fade-in duration-200">
      {/* Top Bar controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Réduire</span>
        </button>
      </div>

      <div className="text-center font-mono text-[#bbff00] font-bold uppercase tracking-widest text-xs mb-8 flex items-center justify-center gap-2 font-heading">
        <span className="w-2 h-2 rounded-full bg-[#bbff00] animate-ping"></span>
        ⏱ Temps de Récupération
      </div>

      {/* SVG Ring Timer */}
      <div className="relative w-60 h-60 mb-6 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-zinc-800 fill-none"
            strokeWidth="5"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-[#bbff00] fill-none transition-all duration-1000 ease-linear"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono font-black text-6xl tracking-tighter text-white">
            {timeLeft}
          </span>
          <span className="text-xs text-zinc-400 uppercase tracking-wider mt-1 font-semibold">
            Secondes
          </span>
        </div>
      </div>

      {/* Encouragement message */}
      <div className="text-sm font-semibold text-zinc-300 mb-8 h-6">
        {timeLeft > 60
          ? 'Souffle bien, bois de l\'eau...'
          : timeLeft > 30
          ? 'Analyse tes sensations sur la série précédente.'
          : timeLeft > 10
          ? 'Mets-toi en position pour la série suivante !'
          : 'C\'est l\'heure ! Donne tout ! 🔥'}
      </div>

      {/* Quick Time Adjustments */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => addTime(-10)}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-800 flex items-center gap-1 active:scale-95"
        >
          <Minus className="w-3.5 h-3.5" /> 10s
        </button>
        <button
          onClick={() => setIsActive(!isActive)}
          className="p-3.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 active:scale-95"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
        </button>
        <button
          onClick={() => addTime(30)}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-800 flex items-center gap-1 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> 30s
        </button>
      </div>

      {/* Skip Button */}
      <button
        onClick={onCancel}
        className="w-full max-w-xs py-3.5 bg-[#bbff00] hover:bg-[#a6e600] text-[#0a0a0a] font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#bbff00]/20 flex items-center justify-center gap-2 active:scale-98 transition-all font-heading"
      >
        <FastForward className="w-4 h-4 fill-[#0a0a0a]" />
        <span>Passer le repos</span>
      </button>
    </div>
  );
};
