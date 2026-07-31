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
    <div className="p-4 max-w-4xl mx-auto pb-24 text-zinc-100 animate-in fade-in duration-200">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#0a0a0a] font-heading flex items-center gap-2">
          <ChartIcon className="w-6 h-6 text-[#0a0a0a]" />
          <span>Surcharge & Progrès</span>
        </h2>
        <p className="text-xs text-zinc-600 font-semibold mt-0.5">
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
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap font-heading ${
              selectedCategory === cat.id
                ? 'bg-[#bbff00] text-[#0a0a0a] shadow-md shadow-[#bbff00]/20'
                : 'bg-[#0a0a0a] border border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Muscle Volume Breakdown */}
      {grandTotalVolume > 0 && (
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-heading">
              <Dumbbell className="w-4 h-4 text-[#bbff00]" />
              <span>Volume Total Soulevé</span>
            </h3>
            <span className="font-mono font-black text-sm text-[#bbff00]">
              {Math.round(grandTotalVolume).toLocaleString('fr-FR')} kg
            </span>
          </div>

          {/* Distribution Bar */}
          <div className="h-3.5 w-full bg-zinc-950 rounded-full overflow-hidden flex mb-3 border border-zinc-800">
            {Object.entries(muscleVolumes).map(([cat, vol]) => {
              const pct = (vol / grandTotalVolume) * 100;
              let bg = 'bg-[#bbff00]';
              if (cat === 'pull') bg = 'bg-sky-400';
              if (cat === 'legs') bg = 'bg-amber-400';
              if (cat === 'shoulders') bg = 'bg-purple-400';
              if (cat === 'arms') bg = 'bg-emerald-400';

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

          <div className="flex flex-wrap gap-3 text-[11px] font-medium text-zinc-400">
            {Object.entries(muscleVolumes).map(([cat, vol]) => {
              const pct = Math.round((vol / grandTotalVolume) * 100);
              return (
                <div key={cat} className="flex items-center gap-1.5 capitalize">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      cat === 'push'
                        ? 'bg-[#bbff00]'
                        : cat === 'pull'
                        ? 'bg-sky-400'
                        : cat === 'legs'
                        ? 'bg-amber-400'
                        : cat === 'shoulders'
                        ? 'bg-purple-400'
                        : 'bg-emerald-400'
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
              className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-white font-heading">{ex.name}</h4>
                  <p className="text-[11px] text-zinc-400 capitalize">{ex.muscles}</p>
                </div>

                {/* Trend Badge */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    trend === 'up'
                      ? 'bg-[#bbff00]/15 text-[#bbff00] border border-[#bbff00]/40'
                      : trend === 'down'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#bbff00]" />}
                  {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                  {trend === 'same' && <Minus className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{trend === 'up' ? '+2.5kg' : trend === 'down' ? '-kg' : '='}</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-[#bbff00]">{maxRecord}</div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Record
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-amber-400">{max1RM}</div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    1RM Max
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-sky-400">
                    {lastEntry.maxKg}
                  </div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Dernier
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-2.5 text-center">
                  <div className="font-mono font-black text-lg text-emerald-400">
                    {targetNext}
                  </div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    Cible
                  </div>
                </div>
              </div>

              {/* Mini Progression Sparkline Bar Chart */}
              <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800/60 flex items-end gap-1 h-12">
                {history.slice(-12).map((h, i) => {
                  const heightPct = Math.max(20, (h.maxKg / maxRecord) * 100);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-[#bbff00]/80 hover:bg-[#bbff00] rounded-t transition-all group relative"
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-[9px] font-mono text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
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
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
            <Trophy className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs">
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
