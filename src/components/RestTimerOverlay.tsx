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
      <div className="fixed bottom-16 sm:bottom-4 right-4 z-50 liquid-glass rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
        <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-slate-200 flex items-center justify-center font-mono font-black text-[#bbff00] text-base">
          {timeLeft}s
        </div>
        <div>
          <div className="text-xs font-black text-slate-900 font-heading">Temps de repos</div>
          <div className="text-[10px] text-slate-500 font-bold">
            {timeLeft > 30 ? 'Récupération...' : timeLeft > 10 ? 'Prépare-toi' : 'C\'est reparti !'}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-[#0a0a0a] text-[#bbff00] font-bold shadow-xs"
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
    <div className="fixed inset-0 z-50 bg-slate-100/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-slate-900 animate-in fade-in duration-200">
      {/* Top Bar controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs flex items-center gap-1.5 text-xs font-extrabold"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Réduire</span>
        </button>
      </div>

      <div className="text-center font-mono text-[#0a0a0a] font-black uppercase tracking-widest text-xs mb-8 flex items-center justify-center gap-2 font-heading">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] animate-ping"></span>
        ⏱ Temps de Récupération
      </div>

      {/* SVG Ring Timer */}
      <div className="relative w-60 h-60 mb-6 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-slate-200 fill-none"
            strokeWidth="5"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-[#0a0a0a] fill-none transition-all duration-1000 ease-linear"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono font-black text-6xl tracking-tighter text-slate-900">
            {timeLeft}
          </span>
          <span className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-bold">
            Secondes
          </span>
        </div>
      </div>

      {/* Encouragement message */}
      <div className="text-sm font-bold text-slate-700 mb-8 h-6 text-center">
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
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-50 flex items-center gap-1 active:scale-95 shadow-xs"
        >
          <Minus className="w-3.5 h-3.5" /> 10s
        </button>
        <button
          onClick={() => setIsActive(!isActive)}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 active:scale-95 shadow-sm"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-900" />}
        </button>
        <button
          onClick={() => addTime(30)}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-50 flex items-center gap-1 active:scale-95 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> 30s
        </button>
      </div>

      {/* Skip Button */}
      <button
        onClick={onCancel}
        className="w-full max-w-xs py-3.5 bg-[#0a0a0a] hover:bg-zinc-800 text-[#bbff00] font-black text-sm uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all font-heading"
      >
        <FastForward className="w-4 h-4 fill-[#bbff00]" />
        <span>Passer le repos</span>
      </button>
    </div>
  );
};
