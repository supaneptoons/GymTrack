import React, { useState } from 'react';
import { Exercise, ExerciseData } from '../types';
import { EXERCISE_IMAGE_BASE_URL } from '../data/defaultProgram';
import { calculate1RM } from '../utils/workoutUtils';
import { Check, ChevronDown, Lightbulb, Calculator, TrendingUp, Info } from 'lucide-react';

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
}) => {
  const [img0Error, setImg0Error] = useState(false);
  const [img1Error, setImg1Error] = useState(false);

  const [folder, f0, f1] = exercise.imgs;
  const img0Url = `${EXERCISE_IMAGE_BASE_URL}${folder}/${f0}`;
  const img1Url = `${EXERCISE_IMAGE_BASE_URL}${folder}/${f1}`;

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
      className={`bg-[#0a0a0a] border rounded-2xl overflow-hidden transition-all duration-200 mb-3.5 shadow-md ${
        isDone
          ? 'border-emerald-500/50 bg-[#0a0a0a] shadow-emerald-950/20'
          : isOpen
          ? 'border-[#bbff00] shadow-xl shadow-[#bbff00]/10'
          : 'border-zinc-800/90 hover:border-zinc-700'
      }`}
    >
      {/* Card Header */}
      <div
        onClick={onToggleOpen}
        className="p-4 flex items-center gap-3 cursor-pointer select-none"
      >
        {/* Index Badge */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm flex-shrink-0 ${
            isDone ? 'bg-emerald-500 text-[#0a0a0a]' : 'bg-[#bbff00] text-[#0a0a0a]'
          }`}
        >
          {index + 1}
        </div>

        {/* Title & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm sm:text-base text-zinc-100 truncate font-heading">
              {exercise.name}
            </h4>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium truncate">
            {exercise.sets}×{exercise.reps} · {exercise.muscles}
          </p>
        </div>

        {/* Right side indicators */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {overloadSuggestion && !isDone && (
            <div className="hidden sm:flex items-center gap-1 bg-[#bbff00]/10 border border-[#bbff00]/40 text-[#bbff00] px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono">
              <TrendingUp className="w-3 h-3 text-[#bbff00]" />
              <span>↑+{overloadSuggestion - (exerciseData.s1_kg || 0)}kg</span>
            </div>
          )}

          {isDone ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : (
            <ChevronDown
              className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180 text-[#bbff00]' : ''
              }`}
            />
          )}
        </div>
      </div>

      {/* Card Body */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-800/80 animate-in fade-in duration-150">
          {/* Demonstration Images */}
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-zinc-800/80 group">
              {!img0Error ? (
                <img
                  src={img0Url}
                  alt="Départ"
                  className="w-full h-full object-cover"
                  onError={() => setImg0Error(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 text-[10px] p-2 text-center">
                  <Info className="w-4 h-4 mb-1 text-zinc-500" />
                  <span>Position Départ</span>
                </div>
              )}
              <span className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider font-heading">
                Départ
              </span>
            </div>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-zinc-800/80 group">
              {!img1Error ? (
                <img
                  src={img1Url}
                  alt="Arrivée"
                  className="w-full h-full object-cover"
                  onError={() => setImg1Error(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 text-[10px] p-2 text-center">
                  <Info className="w-4 h-4 mb-1 text-zinc-500" />
                  <span>Position Arrivée</span>
                </div>
              )}
              <span className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider font-heading">
                Arrivée
              </span>
            </div>
          </div>

          {/* Form Tip */}
          <div className="bg-[#bbff00]/10 border-l-2 border-[#bbff00] p-2.5 rounded-r-xl mb-4 text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-[#bbff00] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#bbff00] font-bold block mb-0.5">Conseil d'exécution :</strong>
              {exercise.tip}
            </div>
          </div>

          {/* Sets Tracker Buttons */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between font-heading">
              <span>Séries réalisées</span>
              <span className="text-[10px] text-zinc-500 font-normal">
                Cliquez pour cocher et lancer le chrono ({exercise.rest}s)
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
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center font-mono font-black text-base transition-all active:scale-95 ${
                      setDone
                        ? 'bg-[#bbff00] border-[#bbff00] text-[#0a0a0a] shadow-md shadow-[#bbff00]/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <span>{setNum}</span>
                    <span className={`text-[9px] font-sans font-semibold mt-0.5 ${setDone ? 'text-[#0a0a0a]' : 'text-zinc-500'}`}>
                      {setDone ? 'Fait' : 'Série'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weights & Reps Input Grid */}
          <div className="mb-4">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between font-heading">
              <span>Poids & Répétitions</span>
              {maxEstimated1RM > 0 && (
                <span className="text-[10px] text-[#bbff00] font-mono font-bold bg-[#bbff00]/10 px-2 py-0.5 rounded border border-[#bbff00]/30">
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
                    className="flex items-center gap-2 bg-zinc-950 border border-zinc-800/80 rounded-xl p-2"
                  >
                    <span className="text-xs font-mono font-bold text-zinc-400 w-16">
                      Série {setNum}
                    </span>

                    {sugg && (
                      <span className="text-[10px] text-[#bbff00] font-bold bg-[#bbff00]/10 px-1.5 py-0.5 rounded">
                        ↑{sugg}kg
                      </span>
                    )}

                    {/* Weight Input */}
                    <div className="flex-1 flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 focus-within:border-[#bbff00]">
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
                        className="w-full bg-transparent text-white font-mono font-bold text-sm text-center focus:outline-none"
                      />
                      <span className="text-[10px] font-bold text-zinc-500">kg</span>

                      {/* Plate Calc trigger */}
                      <button
                        onClick={() =>
                          onOpenPlateCalculator(parseFloat(weightVal) || sugg || 60)
                        }
                        className="p-1 rounded text-zinc-500 hover:text-[#bbff00] hover:bg-zinc-800 transition-colors"
                        title="Calculateur de disques"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reps Input */}
                    <div className="w-24 flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 focus-within:border-[#bbff00]">
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
                        className="w-full bg-transparent text-white font-mono font-bold text-sm text-center focus:outline-none"
                      />
                      <span className="text-[10px] font-bold text-zinc-500">reps</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Exercise Button */}
          <button
            onClick={onToggleExerciseDone}
            className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 font-heading ${
              isDone
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                : 'bg-[#bbff00] hover:bg-[#a6e600] text-[#0a0a0a] shadow-md shadow-[#bbff00]/20'
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
