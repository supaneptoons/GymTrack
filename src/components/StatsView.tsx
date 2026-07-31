import React, { useState } from 'react';
import { SessionState, Exercise } from '../types';
import { getExerciseHistory, calculate1RM } from '../utils/workoutUtils';
import { LineChart as ChartIcon, Trophy, TrendingUp, TrendingDown, Minus, Target, Dumbbell, Award, Flame } from 'lucide-react';

interface StatsViewProps {
  sessions: Record<string, SessionState>;
  allExercises: Exercise[];
}

export const StatsView: React.FC<StatsViewProps> = ({ sessions, allExercises }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredExercises = allExercises.filter(
    (ex) => selectedCategory === 'all' || ex.category === selectedCategory
  );

  // Calculate Muscle Volume Distribution
  const muscleVolumes: Record<string, number> = {};
  let grandTotalVolume = 0;

  Object.values(sessions).forEach((s: SessionState) => {
    Object.entries(s.weights || {}).forEach(([exId, w]) => {
      const ex = allExercises.find((e) => e.id === exId);
      if (!ex) return;

      let vol = 0;
      for (let i = 1; i <= 10; i++) {
        const kg = parseFloat(w[`s${i}_kg`]) || 0;
        const reps = parseInt(w[`s${i}_reps`]) || 10;
        if (kg > 0) vol += kg * reps;
      }

      const cat = ex.category || 'push';
      muscleVolumes[cat] = (muscleVolumes[cat] || 0) + vol;
      grandTotalVolume += vol;
    });
  });

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 text-slate-900 animate-in fade-in duration-200">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a] font-heading flex items-center gap-2">
          <ChartIcon className="w-6 h-6 text-[#0a0a0a]" />
          <span>Surcharge & Progrès</span>
        </h2>
        <p className="text-xs text-slate-600 font-bold mt-0.5">
          Suivi de tes charges maximales, volume d'entraînement et records personnels.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-4">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'push', label: 'Push' },
          { id: 'pull', label: 'Pull' },
          { id: 'legs', label: 'Jambes' },
          { id: 'shoulders', label: 'Épaules' },
          { id: 'arms', label: 'Bras' },
          { id: 'core', label: 'Abdos' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap font-heading shadow-xs ${
              selectedCategory === cat.id
                ? 'bg-[#0a0a0a] text-[#bbff00] shadow-md'
                : 'bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Muscle Volume Breakdown */}
      {grandTotalVolume > 0 && (
        <div className="liquid-glass rounded-2xl p-4 mb-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 font-heading">
              <Dumbbell className="w-4 h-4 text-[#0a0a0a]" />
              <span>Volume Total Soulevé</span>
            </h3>
            <span className="font-mono font-black text-sm text-[#0a0a0a]">
              {Math.round(grandTotalVolume).toLocaleString('fr-FR')} kg
            </span>
          </div>

          {/* Distribution Bar */}
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3 border border-slate-200">
            {Object.entries(muscleVolumes).map(([cat, vol]) => {
              const pct = (vol / grandTotalVolume) * 100;
              let bg = 'bg-[#0a0a0a]';
              if (cat === 'pull') bg = 'bg-sky-500';
              if (cat === 'legs') bg = 'bg-amber-500';
              if (cat === 'shoulders') bg = 'bg-purple-500';
              if (cat === 'arms') bg = 'bg-emerald-500';

              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${bg} transition-all duration-500`}
                  title={`${cat}: ${Math.round(pct)}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-600">
            {Object.entries(muscleVolumes).map(([cat, vol]) => {
              const pct = Math.round((vol / grandTotalVolume) * 100);
              return (
                <div key={cat} className="flex items-center gap-1.5 capitalize">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      cat === 'push'
                        ? 'bg-[#0a0a0a]'
                        : cat === 'pull'
                        ? 'bg-sky-500'
                        : cat === 'legs'
                        ? 'bg-amber-500'
                        : cat === 'shoulders'
                        ? 'bg-purple-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>
                    {cat} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercises Stats Grid */}
      <div className="space-y-3">
        {filteredExercises.map((ex) => {
          const history = getExerciseHistory(ex.id, sessions);
          if (history.length === 0) return null;

          const maxRecord = Math.max(...history.map((h) => h.maxKg));
          const max1RM = Math.max(...history.map((h) => h.estimated1RM));
          const lastEntry = history[history.length - 1];
          const prevEntry = history.length > 1 ? history[history.length - 2] : null;

          let trend = 'same';
          if (prevEntry) {
            if (lastEntry.maxKg > prevEntry.maxKg) trend = 'up';
            else if (lastEntry.maxKg < prevEntry.maxKg) trend = 'down';
          }

          const targetNext = lastEntry.maxKg + 2.5;

          return (
            <div
              key={ex.id}
              className="liquid-glass rounded-2xl p-4 shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-black text-sm text-slate-900 font-heading">{ex.name}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold capitalize">{ex.muscles}</p>
                </div>

                {/* Trend Badge */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-black ${
                    trend === 'up'
                      ? 'bg-[#0a0a0a] text-[#bbff00]'
                      : trend === 'down'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#bbff00]" />}
                  {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
                  {trend === 'same' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{trend === 'up' ? '+2.5kg' : trend === 'down' ? '-kg' : '='}</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-slate-900">{maxRecord}</div>
                  <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                    Record
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-amber-600">{max1RM}</div>
                  <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                    1RM Max
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-sky-600">
                    {lastEntry.maxKg}
                  </div>
                  <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                    Dernier
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-emerald-600">
                    {targetNext}
                  </div>
                  <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                    Cible
                  </div>
                </div>
              </div>

              {/* Mini Progression Sparkline Bar Chart */}
              <div className="bg-slate-100 p-2 rounded-xl border border-slate-200/90 flex items-end gap-1 h-12">
                {history.slice(-12).map((h, i) => {
                  const heightPct = Math.max(20, (h.maxKg / maxRecord) * 100);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-[#0a0a0a] hover:bg-zinc-800 rounded-t transition-all group relative"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#0a0a0a] text-[9px] font-mono text-[#bbff00] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10 shadow-md">
                        {h.maxKg}kg ({h.date})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredExercises.every((ex) => getExerciseHistory(ex.id, sessions).length === 0) && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-500">
            <Trophy className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium">
              Aucun historique enregistré pour ces exercices.
              <br />
              Entrez vos poids pendant vos séances pour générer vos courbes de progression !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
