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
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-1 touch-pan-x">
      <div className="flex gap-2 min-w-max justify-start sm:justify-center">
        {daysNames.map((name, idx) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + idx);
          const k = dateKey(d);

          const prog = getProgramForDate(k, sessions, schedule);
          const isDone = (sessions[k]?.completed?.length || 0) > 0;
          const isToday = k === currentDateKey;
          const isSelected = k === selectedDateKey;

          let badgeColor = 'bg-slate-100 text-slate-600 border border-slate-200';
          if (prog === 'A') badgeColor = 'bg-[#0a0a0a] text-[#bbff00]';
          if (prog === 'B') badgeColor = 'bg-sky-500 text-white';
          if (prog === 'C') badgeColor = 'bg-amber-500 text-white';
          if (prog === 'rest') badgeColor = 'bg-slate-200/80 text-slate-600';

          return (
            <button
              key={k}
              onClick={() => onSelectDate(k)}
              style={{ borderRadius: '30px' }}
              className={`flex-shrink-0 w-14 sm:w-16 min-h-[64px] rounded-[30px] p-2 flex flex-col items-center justify-between border-2 transition-all active:scale-95 text-center shadow-sm ${
                isSelected
                  ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-md shadow-slate-400/30'
                  : isDone
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : isToday
                  ? 'bg-white border-[#0a0a0a] text-slate-900 font-extrabold ring-2 ring-[#0a0a0a]/10'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-400'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider font-heading ${isSelected ? 'text-zinc-300' : 'text-slate-500'}`}>
                {name}
              </span>
              <span className={`font-mono font-black text-base my-0.5 flex items-center justify-center gap-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {d.getDate()}
                {isDone && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-heading ${badgeColor}`}
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
