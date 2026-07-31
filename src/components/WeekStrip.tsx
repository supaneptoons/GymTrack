import React from 'react';
import { SessionState } from '../types';
import { dateKey, parseDateKey, getProgramForDate } from '../utils/workoutUtils';
import { Check } from 'lucide-react';

interface WeekStripProps {
  currentDateKey: string;
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  sessions: Record<string, SessionState>;
  schedule: string[];
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  currentDateKey,
  selectedDateKey,
  onSelectDate,
  sessions,
  schedule,
}) => {
  const selectedDate = parseDateKey(selectedDateKey);
  const dayOfWeek = (selectedDate.getDay() + 6) % 7; // Mon = 0

  // Calculate Monday of current selected week
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() - dayOfWeek);

  const daysNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-1">
      <div className="flex gap-2 min-w-max justify-start sm:justify-center">
        {daysNames.map((name, idx) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + idx);
          const k = dateKey(d);

          const prog = getProgramForDate(k, sessions, schedule);
          const isDone = (sessions[k]?.completed?.length || 0) > 0;
          const isToday = k === currentDateKey;
          const isSelected = k === selectedDateKey;

          let badgeColor = 'bg-zinc-800 text-zinc-400';
          if (prog === 'A') badgeColor = 'bg-[#bbff00]/15 text-[#bbff00] border border-[#bbff00]/40';
          if (prog === 'B') badgeColor = 'bg-sky-500/15 text-sky-400 border border-sky-500/30';
          if (prog === 'C') badgeColor = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
          if (prog === 'rest') badgeColor = 'bg-zinc-800 text-zinc-400';

          return (
            <button
              key={k}
              onClick={() => onSelectDate(k)}
              className={`flex-shrink-0 w-14 rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 transition-all active:scale-95 text-center shadow-sm ${
                isSelected
                  ? 'bg-[#0a0a0a] border-[#bbff00] shadow-lg shadow-[#bbff00]/15 text-white'
                  : isDone
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : isToday
                  ? 'bg-[#0a0a0a] border-zinc-500 text-white'
                  : 'bg-[#0a0a0a]/90 border-zinc-800/80 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                {name}
              </span>
              <span className="font-mono font-black text-lg my-0.5 text-white flex items-center justify-center gap-1">
                {d.getDate()}
                {isDone && <Check className="w-3.5 h-3.5 text-[#bbff00] stroke-[3]" />}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-heading ${badgeColor}`}
              >
                {prog === 'rest' ? 'Repos' : prog}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
