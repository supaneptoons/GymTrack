import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { calculatePlates } from '../utils/workoutUtils';

interface PlateCalculatorModalProps {
  initialWeight?: number;
  barWeight?: number;
  onClose: () => void;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeight = 60,
  barWeight = 20,
  onClose,
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight);
  const [currentBarWeight, setCurrentBarWeight] = useState<number>(barWeight);

  const calc = calculatePlates(targetWeight, currentBarWeight);

  const plateColors: Record<number, string> = {
    25: 'bg-red-600 text-white border-red-400',
    20: 'bg-blue-600 text-white border-blue-400',
    15: 'bg-yellow-500 text-zinc-950 border-yellow-300',
    10: 'bg-emerald-600 text-white border-emerald-400',
    5: 'bg-white text-zinc-950 border-zinc-300',
    2.5: 'bg-zinc-700 text-white border-zinc-500',
    1.25: 'bg-zinc-500 text-white border-zinc-400',
  };

  const plateHeights: Record<number, string> = {
    25: 'h-28 w-8',
    20: 'h-24 w-7.5',
    15: 'h-20 w-7',
    10: 'h-16 w-6',
    5: 'h-14 w-5',
    2.5: 'h-11 w-4',
    1.25: 'h-9 w-3.5',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-md p-5 text-zinc-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-[#bbff00] font-black font-heading">
          <Calculator className="w-5 h-5" />
          <h3 className="text-lg uppercase tracking-wide text-white">Calculateur de Disques</h3>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-xs text-zinc-400 font-medium mb-1">
              Poids total visé (kg)
            </label>
            <input
              type="number"
              value={targetWeight || ''}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-center text-xl font-mono font-bold text-white focus:outline-none focus:border-[#bbff00]"
              placeholder="ex: 80"
              step="2.5"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 font-medium mb-1">Poids de la barre</label>
            <select
              value={currentBarWeight}
              onChange={(e) => setCurrentBarWeight(parseFloat(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-[#bbff00]"
            >
              <option value={20}>20 kg (Barre Olympique)</option>
              <option value={15}>15 kg (Barre Féminine)</option>
              <option value={10}>10 kg (Barre courte)</option>
              <option value={0}>0 kg (Machine guidée)</option>
            </select>
          </div>
        </div>

        {/* Visual Barbell Representation */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-5 flex flex-col items-center justify-center min-h-[160px]">
          <div className="text-xs text-zinc-400 font-medium mb-3">
            Poids par côté :{' '}
            <strong className="text-[#bbff00] font-mono text-sm">
              {Math.max(0, (targetWeight - currentBarWeight) / 2)} kg
            </strong>
          </div>

          {/* Bar Diagram */}
          <div className="flex items-center justify-center gap-1 w-full overflow-x-auto py-2">
            {/* Left sleeve end */}
            <div className="h-3 w-4 bg-zinc-600 rounded-l"></div>

            {/* Left Plates */}
            <div className="flex items-center gap-1 flex-row-reverse">
              {calc.perSide.map(({ plate, count }) =>
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={`left-${plate}-${i}`}
                    className={`${plateHeights[plate]} ${plateColors[plate]} border flex items-center justify-center text-[10px] font-mono font-bold rounded shadow-md transform -scale-x-100`}
                    title={`${plate} kg`}
                  >
                    <span className="transform rotate-90">{plate}</span>
                  </div>
                ))
              )}
            </div>

            {/* Center Bar Collar */}
            <div className="h-10 w-2.5 bg-zinc-400 rounded-sm"></div>
            {/* Center Bar Shaft */}
            <div className="h-4 w-16 bg-zinc-500 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-950">
              {currentBarWeight}kg
            </div>
            {/* Right Bar Collar */}
            <div className="h-10 w-2.5 bg-zinc-400 rounded-sm"></div>

            {/* Right Plates */}
            <div className="flex items-center gap-1">
              {calc.perSide.map(({ plate, count }) =>
                Array.from({ length: count }).map((_, i) => (
                  <div
                    key={`right-${plate}-${i}`}
                    className={`${plateHeights[plate]} ${plateColors[plate]} border flex items-center justify-center text-[10px] font-mono font-bold rounded shadow-md`}
                    title={`${plate} kg`}
                  >
                    <span className="transform rotate-90">{plate}</span>
                  </div>
                ))
              )}
            </div>

            {/* Right sleeve end */}
            <div className="h-3 w-4 bg-zinc-600 rounded-r"></div>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-1.5 text-xs">
          <div className="text-zinc-400 font-medium mb-1">Composition par côté :</div>
          {calc.perSide.length === 0 ? (
            <div className="text-zinc-500 italic">Aucun disque requis (charge = barre seule).</div>
          ) : (
            calc.perSide.map(({ plate, count }) => (
              <div
                key={plate}
                className="flex items-center justify-between bg-zinc-950/60 px-3 py-1.5 rounded-lg border border-zinc-800/60"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${plateColors[plate]}`}></div>
                  <span className="font-semibold">{plate} kg</span>
                </div>
                <span className="font-mono font-bold text-[#bbff00]">
                  {count} {count > 1 ? 'disques' : 'disque'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
