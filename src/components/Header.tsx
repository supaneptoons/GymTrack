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
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/80 px-4 py-3 flex items-center justify-between text-slate-900 shadow-sm">
      {/* Logo & Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] text-[#bbff00] flex items-center justify-center shadow-md">
          <Dumbbell className="w-5 h-5 transform -rotate-45" />
        </div>
        <div>
          <div className="font-black tracking-wider text-xl font-heading flex items-center gap-1 leading-none text-[#0a0a0a]">
            GYM<span className="text-[#84bd00] font-black">TRACK</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase block mt-0.5">
            Surcharge Progressive
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Streak Badge */}
        {streakCount > 0 && (
          <div className="flex items-center gap-1 bg-[#0a0a0a] text-[#bbff00] px-2.5 py-1 rounded-full text-xs font-bold font-mono shadow-sm">
            <Flame className="w-3.5 h-3.5 text-[#bbff00] fill-[#bbff00] animate-pulse" />
            <span>{streakCount} j</span>
          </div>
        )}

        {/* AI Coach Trigger */}
        <button
          onClick={onOpenAiCoach}
          className="flex items-center gap-1.5 bg-[#0a0a0a] hover:bg-zinc-800 text-[#bbff00] px-3 py-1.5 rounded-xl text-xs font-black font-heading transition-all active:scale-95 shadow-sm"
          title="Coach IA GymTrack"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#bbff00]" />
          <span className="hidden sm:inline">Coach IA</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#0a0a0a] hover:bg-slate-200 transition-colors active:scale-95"
          title="Paramètres & Options"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
