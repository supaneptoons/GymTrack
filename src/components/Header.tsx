import React from 'react';
import { Dumbbell, Sparkles, Settings, Flame, RotateCcw } from 'lucide-react';
import { formatFrenchDate, parseDateKey } from '../utils/workoutUtils';

interface HeaderProps {
  currentDateKey: string;
  streakCount: number;
  onOpenAiCoach: () => void;
  onOpenSettings: () => void;
  onOpenResetConfirm?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateKey,
  streakCount,
  onOpenAiCoach,
  onOpenSettings,
}) => {
  const currentDate = parseDateKey(currentDateKey);
  const formattedDate = formatFrenchDate(currentDate, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between text-zinc-100 shadow-xl">
      {/* Logo & Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#bbff00] flex items-center justify-center shadow-lg shadow-[#bbff00]/20">
          <Dumbbell className="w-5 h-5 text-[#0a0a0a] transform -rotate-45" />
        </div>
        <div>
          <div className="font-black tracking-wider text-xl font-heading flex items-center gap-1 leading-none text-white">
            GYM<span className="text-[#bbff00]">TRACK</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase block mt-0.5">
            Surcharge Progressive
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Streak Badge */}
        {streakCount > 0 && (
          <div className="flex items-center gap-1 bg-[#bbff00]/10 border border-[#bbff00]/30 text-[#bbff00] px-2.5 py-1 rounded-full text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-[#bbff00] fill-[#bbff00] animate-pulse" />
            <span>{streakCount} j</span>
          </div>
        )}

        {/* AI Coach Trigger */}
        <button
          onClick={onOpenAiCoach}
          className="flex items-center gap-1.5 bg-[#bbff00]/10 hover:bg-[#bbff00]/20 border border-[#bbff00]/40 text-[#bbff00] px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          title="Coach IA GymTrack"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#bbff00]" />
          <span className="hidden sm:inline">Coach IA</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#bbff00] hover:bg-zinc-800 transition-colors active:scale-95"
          title="Paramètres & Options"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
