import React from 'react';
import { Exercise, ExerciseData } from '../types';
import { EXERCISE_IMAGE_BASE_URL } from '../data/defaultProgram';
import { calculate1RM } from '../utils/workoutUtils';
import { Check, ChevronDown, Lightbulb, Calculator, TrendingUp, Info } from 'lucide-react';
import { ExerciseMediaViewer } from './ExerciseMediaViewer';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  exerciseData: ExerciseData;
  isDone: boolean;
  overloadSuggestion: number | null;
  onToggleSetDone: (setNum: number, restSeconds: number) => void;
  onUpdateWeight: (setNum: number, weightKg: number | null) => void;
  onUpdateReps: (setNum: number, reps: number | null) => void;
  onToggleExerciseDone: () => void;
  onOpenPlateCalculator: (weightKg: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  animatedGifs?: boolean;
  mediaBaseUrl?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  exerciseData,
  isDone,
  overloadSuggestion,
  onToggleSetDone,
  onUpdateWeight,
  onUpdateReps,
  onToggleExerciseDone,
  onOpenPlateCalculator,
  isOpen,
  onToggleOpen,
  animatedGifs,
  mediaBaseUrl,
}) => {
  // Find max 1RM for current sets
  let maxEstimated1RM = 0;
  for (let s = 1; s <= exercise.sets; s++) {
    const kg = parseFloat(exerciseData[`s${s}_kg`]) || 0;
    const reps = parseInt(exerciseData[`s${s}_reps`]) || parseInt(exercise.reps) || 10;
    if (kg > 0) {
      const e1rm = calculate1RM(kg, reps);
      if (e1rm > maxEstimated1RM) maxEstimated1RM = e1rm;
    }
  }

  return (
    <div
      style={{ borderRadius: '52px', borderWidth: '0px' }}
      className={`liquid-glass rounded-[52px] border-0 overflow-hidden transition-all duration-200 mb-3.5 shadow-md ${
        isDone
          ? 'bg-emerald-50/40'
          : isOpen
          ? 'ring-2 ring-[#0a0a0a]/10 shadow-lg'
          : ''
      }`}
    >
      {/* Card Header */}
      <div
        onClick={onToggleOpen}
        className="p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer select-none"
      >
        {/* Index Badge */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm flex-shrink-0 shadow-xs ${
            isDone ? 'bg-emerald-600 text-white' : 'bg-[#0a0a0a] text-[#bbff00]'
          }`}
        >
          {index + 1}
        </div>

        {/* Title & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm sm:text-base text-slate-900 truncate font-heading">
              {exercise.name}
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
            {exercise.sets}×{exercise.reps} · {exercise.muscles}
          </p>
        </div>

        {/* Right side indicators */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {overloadSuggestion && !isDone && (
            <div className="hidden sm:flex items-center gap-1 bg-[#0a0a0a] text-[#bbff00] px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono shadow-xs">
              <TrendingUp className="w-3 h-3 text-[#bbff00]" />
              <span>↑+{overloadSuggestion - (exerciseData.s1_kg || 0)}kg</span>
            </div>
          )}

          {isDone ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          ) : (
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180 text-slate-900' : ''
              }`}
            />
          )}
        </div>
      </div>

      {/* Card Body */}
      {isOpen && (
        <div className="px-3.5 sm:px-4 pb-4 pt-1 border-t border-slate-200/90 animate-in fade-in duration-150">
          {/* Photos de démonstration */}
          <ExerciseMediaViewer
            exercise={exercise}
            baseUrl={mediaBaseUrl}
          />

          {/* Form Tip */}
          <div className="bg-[#0a0a0a] text-slate-100 p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-start gap-2 shadow-sm">
            <Lightbulb className="w-4 h-4 text-[#bbff00] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#bbff00] font-bold block mb-0.5 font-heading">Conseil d'exécution :</strong>
              <span className="text-zinc-300">{exercise.tip}</span>
            </div>
          </div>

          {/* Sets Tracker Buttons */}
          <div className="mb-4">
            <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between font-heading">
              <span>Séries réalisées</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Cliquez pour cocher ({exercise.rest}s repos)
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {Array.from({ length: exercise.sets }).map((_, i) => {
                const setNum = i + 1;
                const setDone = !!exerciseData[`s${setNum}_done`];

                return (
                  <button
                    key={setNum}
                    onClick={() => onToggleSetDone(setNum, exercise.rest)}
                    className={`min-h-[48px] rounded-xl border flex flex-col items-center justify-center font-mono font-black text-base transition-all active:scale-95 shadow-xs ${
                      setDone
                        ? 'bg-[#0a0a0a] border-[#0a0a0a] text-[#bbff00]'
                        : 'bg-slate-100 border-slate-200/90 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <span>{setNum}</span>
                    <span className={`text-[9px] font-sans font-extrabold ${setDone ? 'text-[#bbff00]' : 'text-slate-500'}`}>
                      {setDone ? 'Fait' : 'Série'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weights & Reps Input Grid */}
          <div className="mb-4">
            <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between font-heading">
              <span>Poids & Répétitions</span>
              {maxEstimated1RM > 0 && (
                <span className="text-[10px] text-[#0a0a0a] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  1RM Estimé : ~{maxEstimated1RM} kg
                </span>
              )}
            </div>

            <div className="space-y-2">
              {Array.from({ length: exercise.sets }).map((_, i) => {
                const setNum = i + 1;
                const weightVal = exerciseData[`s${setNum}_kg`] ?? '';
                const repsVal = exerciseData[`s${setNum}_reps`] ?? '';
                const sugg = overloadSuggestion && !weightVal ? overloadSuggestion : null;

                return (
                  <div
                    key={setNum}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl p-2"
                  >
                    <span className="text-xs font-mono font-bold text-slate-700 w-16 shrink-0">
                      Série {setNum}
                    </span>

                    {sugg && (
                      <span className="text-[10px] text-[#0a0a0a] font-bold bg-[#bbff00] px-1.5 py-0.5 rounded shrink-0">
                        ↑{sugg}kg
                      </span>
                    )}

                    {/* Weight Input */}
                    <div className="flex-1 flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus-within:border-[#0a0a0a] focus-within:ring-1 focus-within:ring-[#0a0a0a]">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        placeholder={sugg ? `${sugg}` : 'Poids'}
                        value={weightVal}
                        onChange={(e) =>
                          onUpdateWeight(
                            setNum,
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-transparent text-slate-900 font-mono font-black text-base text-center focus:outline-none"
                      />
                      <span className="text-[10px] font-bold text-slate-500">kg</span>

                      {/* Plate Calc trigger */}
                      <button
                        onClick={() =>
                          onOpenPlateCalculator(parseFloat(weightVal) || sugg || 60)
                        }
                        className="p-1 rounded text-slate-400 hover:text-[#0a0a0a] hover:bg-slate-100 transition-colors shrink-0"
                        title="Calculateur de disques"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reps Input */}
                    <div className="w-24 sm:w-28 flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus-within:border-[#0a0a0a] focus-within:ring-1 focus-within:ring-[#0a0a0a] shrink-0">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={exercise.reps}
                        value={repsVal}
                        onChange={(e) =>
                          onUpdateReps(
                            setNum,
                            e.target.value === '' ? null : parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full bg-transparent text-slate-900 font-mono font-black text-base text-center focus:outline-none"
                      />
                      <span className="text-[10px] font-bold text-slate-500">reps</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Exercise Button */}
          <button
            onClick={onToggleExerciseDone}
            className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 font-heading ${
              isDone
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                : 'bg-[#0a0a0a] hover:bg-zinc-800 text-[#bbff00] shadow-md'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isDone ? 'Exercice Terminé' : 'Marquer comme terminé'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
