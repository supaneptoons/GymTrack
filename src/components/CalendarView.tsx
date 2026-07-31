import React, { useState } from 'react';
import { SessionState, ProgramKey } from '../types';
import { ALL_PROGRAMS } from '../data/defaultProgram';
import { dateKey, formatFrenchDate, parseDateKey, getProgramForDate } from '../utils/workoutUtils';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Dumbbell,
  ArrowRightLeft,
  Info,
  RotateCcw,
} from 'lucide-react';

interface CalendarViewProps {
  sessions: Record<string, SessionState>;
  schedule: string[];
  currentDateKey: string;
  autoShiftSchedule?: boolean;
  onSelectDate: (dateKey: string) => void;
  onSetManualProgram: (dateKey: string, prog: ProgramKey, cascade?: boolean) => void;
  onClearScheduleOverrides?: (startDateKey?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  schedule,
  currentDateKey,
  autoShiftSchedule = true,
  onSelectDate,
  onSetManualProgram,
  onClearScheduleOverrides,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDayModalKey, setSelectedDayModalKey] = useState<string | null>(null);
  const [cascadeShift, setCascadeShift] = useState<boolean>(autoShiftSchedule);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthLabel = currentMonth.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Monthly stats
  const completedMonthSessions = Object.keys(sessions).filter(
    (k) => k.startsWith(monthPrefix) && (sessions[k].completed?.length || 0) > 0
  );

  // Calculate Streak
  let streak = 0;
  const d = new Date();
  while (true) {
    const k = dateKey(d);
    if ((sessions[k]?.completed?.length || 0) > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  // Calendar Grid setup
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Selected Day Details
  const modalDate = selectedDayModalKey ? parseDateKey(selectedDayModalKey) : null;
  const modalSession = selectedDayModalKey ? sessions[selectedDayModalKey] : null;
  const modalProgram = selectedDayModalKey
    ? getProgramForDate(selectedDayModalKey, sessions, schedule)
    : 'rest';

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 text-slate-900 animate-in fade-in duration-200">
      {/* Page Title & Month Navigator */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a] font-heading flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#0a0a0a]" />
            <span>Calendrier</span>
          </h2>
          <p className="text-xs text-slate-600 font-bold capitalize mt-0.5">{monthLabel}</p>
        </div>

        <div className="flex items-center gap-1 liquid-glass p-1 rounded-xl shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="liquid-glass rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="p-3 rounded-xl bg-[#0a0a0a] text-[#bbff00]">
            <CheckCircle2 className="w-6 h-6 text-[#bbff00]" />
          </div>
          <div>
            <div className="font-mono font-black text-2xl text-slate-900">
              {completedMonthSessions.length}
            </div>
            <div className="text-xs text-slate-500 font-bold">Séances ce mois</div>
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="p-3 rounded-xl bg-amber-500 text-white">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono font-black text-2xl text-slate-900">{streak} j</div>
            <div className="text-xs text-slate-500 font-bold">Série en cours</div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="liquid-glass rounded-2xl p-4 mb-6 shadow-md">
        <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-heading">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells for previous month padding */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-xl opacity-0" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(
              2,
              '0'
            )}`;
            const isToday = k === currentDateKey;
            const isDone = (sessions[k]?.completed?.length || 0) > 0;
            const prog = getProgramForDate(k, sessions, schedule);

            return (
              <button
                key={k}
                onClick={() => setSelectedDayModalKey(k)}
                className={`aspect-square min-h-[44px] rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all relative active:scale-90 shadow-xs ${
                  isDone
                    ? 'bg-emerald-500 text-white border-emerald-600 font-black shadow-sm'
                    : isToday
                    ? 'bg-white border-[#0a0a0a] text-[#0a0a0a] font-black ring-2 ring-[#0a0a0a]/20'
                    : 'bg-slate-50 border-slate-200/90 text-slate-800 hover:border-slate-400'
                }`}
              >
                <span className="text-xs font-mono font-bold">{dayNum}</span>

                {/* Session badge indicator */}
                {prog !== 'rest' && (
                  <span
                    className={`text-[9px] font-black px-1 rounded uppercase font-mono ${
                      isDone
                        ? 'bg-emerald-700 text-white'
                        : prog === 'A'
                        ? 'bg-[#0a0a0a] text-[#bbff00]'
                        : prog === 'B'
                        ? 'bg-sky-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {prog}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* History List */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2 font-heading">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Historique Récent</span>
        </h3>

        <div className="space-y-2">
          {completedMonthSessions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs font-medium">
              Aucune séance enregistrée pour ce mois-ci.
            </div>
          ) : (
            completedMonthSessions
              .sort((a, b) => b.localeCompare(a))
              .slice(0, 10)
              .map((k) => {
                const s = sessions[k];
                const pKey = s.program;
                const dObj = parseDateKey(k);
                const exCount = s.completed?.length || 0;

                return (
                  <div
                    key={k}
                    onClick={() => setSelectedDayModalKey(k)}
                    className="bg-white border border-slate-200/90 hover:border-slate-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                          pKey === 'A'
                            ? 'bg-[#0a0a0a] text-[#bbff00]'
                            : pKey === 'B'
                            ? 'bg-sky-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {pKey}
                      </div>

                      <div>
                        <div className="text-xs font-black text-slate-900 capitalize font-heading">
                          {formatFrenchDate(dObj, {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          Séance {pKey} · {exCount} exercices effectués
                        </div>
                      </div>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Terminé
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDayModalKey && modalDate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 text-slate-900 shadow-2xl relative max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-black text-base text-slate-900 capitalize font-heading">
                  {formatFrenchDate(modalDate, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Détails de la journée</p>
              </div>

              <button
                onClick={() => setSelectedDayModalKey(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Routine Override options & Logical Shift */}
            <div className="my-3 bg-slate-50 p-3 rounded-xl border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-800 font-extrabold flex items-center gap-1.5 font-heading">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#0a0a0a]" />
                  <span>Programme pour ce jour :</span>
                </span>
                <div className="flex gap-1">
                  {['A', 'B', 'C', 'rest'].map((p) => (
                    <button
                      key={p}
                      onClick={() => onSetManualProgram(selectedDayModalKey, p, cascadeShift)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition-all ${
                        modalProgram === p
                          ? 'bg-[#0a0a0a] text-[#bbff00] shadow'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {p === 'rest' ? 'Repos' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cascade shift toggle option */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={cascadeShift}
                    onChange={(e) => setCascadeShift(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#0a0a0a] rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-700">
                    Décaler logiquement les séances (A → B → C)
                  </span>
                </label>

                {onClearScheduleOverrides && (
                  <button
                    onClick={() => {
                      onClearScheduleOverrides(selectedDayModalKey);
                      setSelectedDayModalKey(null);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1"
                    title="Rétablir la grille fixe de base"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {cascadeShift && (
                <div className="bg-[#0a0a0a] text-zinc-100 p-2.5 rounded-lg text-[10px] leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#bbff00] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-[#bbff00] mb-0.5 font-heading">
                      Rotation logique active
                    </strong>
                    Si vous modifiez ce jour en <strong>Repos</strong> (ou changez la séance), la séance initiale glisse automatiquement sur le prochain jour d'entraînement afin d'enchaîner le PPL sans sauter de séance.
                  </div>
                </div>
              )}
            </div>

            {/* Workout Exercises details list */}
            <div className="overflow-y-auto flex-1 my-2 pr-1 space-y-2">
              {modalProgram === 'rest' ? (
                <div className="py-8 text-center text-slate-500 text-xs font-medium">
                  Journée de repos prévue. Récupération & nutrition.
                </div>
              ) : !modalSession || Object.keys(modalSession.weights || {}).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs font-medium">
                  Aucune donnée d'exercice enregistrée pour cette séance.
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        onSelectDate(selectedDayModalKey);
                        setSelectedDayModalKey(null);
                      }}
                      className="px-4 py-2.5 bg-[#0a0a0a] text-[#bbff00] rounded-xl text-xs font-black uppercase tracking-wider font-heading shadow-md"
                    >
                      Démarrer la séance maintenant
                    </button>
                  </div>
                </div>
              ) : (
                ALL_PROGRAMS[modalProgram]?.exercises.map((ex) => {
                  const w = modalSession.weights[ex.id];
                  if (!w) return null;
                  const isExDone = modalSession.completed?.includes(ex.id);

                  const setsRecorded = [];
                  for (let s = 1; s <= ex.sets; s++) {
                    const kg = w[`s${s}_kg`];
                    const reps = w[`s${s}_reps`] || ex.reps;
                    const done = w[`s${s}_done`];
                    if (kg !== undefined && kg !== null && kg !== '') {
                      setsRecorded.push({ setNum: s, kg, reps, done });
                    }
                  }

                  if (setsRecorded.length === 0) return null;

                  return (
                    <div
                      key={ex.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-black text-xs text-slate-900 flex items-center gap-2 font-heading">
                          <Dumbbell className="w-3.5 h-3.5 text-[#0a0a0a]" />
                          <span>{ex.name}</span>
                        </div>
                        {isExDone && (
                          <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded">
                            Validation OK
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {setsRecorded.map((s) => (
                          <div
                            key={s.setNum}
                            className="text-xs text-slate-600 flex items-center justify-between bg-white border border-slate-200/80 px-2.5 py-1 rounded"
                          >
                            <span>Série {s.setNum}</span>
                            <span className="font-mono font-black text-slate-900">
                              {s.kg} kg × {s.reps} reps
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  onSelectDate(selectedDayModalKey);
                  setSelectedDayModalKey(null);
                }}
                className="w-full py-3 bg-[#0a0a0a] text-[#bbff00] hover:bg-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider font-heading shadow-md"
              >
                Ouvrir dans la vue Séance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
