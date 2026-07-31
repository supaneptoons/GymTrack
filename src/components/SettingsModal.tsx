import React, { useRef } from 'react';
import { UserSettings, AppData } from '../types';
import { exportDataAsJSON, dateKey } from '../utils/workoutUtils';
import { Settings, Download, Upload, Trash2, X, Volume2, VolumeX, Smartphone, RefreshCw, Sparkles, ArrowRightLeft, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  settings: UserSettings;
  schedule: string[];
  appData: AppData;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onUpdateSchedule: (newSchedule: string[]) => void;
  onClearScheduleOverrides?: () => void;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  schedule,
  appData,
  onUpdateSettings,
  onUpdateSchedule,
  onClearScheduleOverrides,
  onImportData,
  onResetData,
  onLoadSampleData,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleScheduleChange = (index: number, value: string) => {
    const updated = [...schedule];
    updated[index] = value;
    onUpdateSchedule(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object' && parsed.sessions) {
          onImportData(parsed);
          alert('Données réimportées avec succès !');
        } else {
          alert('Format JSON invalide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier de sauvegarde.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-lg p-5 text-zinc-100 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#bbff00]" />
            <h3 className="font-black text-base uppercase tracking-wide text-white font-heading">
              Paramètres GymTrack
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 my-3 pr-1 space-y-5">
          {/* Schedule Config */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#bbff00] mb-2 font-heading">
              Programme Hebdomadaire (7 jours)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {days.map((dayName, idx) => (
                <div
                  key={dayName}
                  className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-800"
                >
                  <span className="text-xs font-medium text-zinc-300">{dayName}</span>
                  <select
                    value={schedule[idx] || 'rest'}
                    onChange={(e) => handleScheduleChange(idx, e.target.value)}
                    className="bg-zinc-900 text-xs font-bold font-mono text-white px-2 py-1 rounded border border-zinc-700 focus:outline-none focus:border-[#bbff00]"
                  >
                    <option value="A">Push (Séance A)</option>
                    <option value="B">Pull (Séance B)</option>
                    <option value="C">Legs (Séance C)</option>
                    <option value="rest">Repos (Récupération)</option>
                  </select>
                </div>
              ))}
            </div>

            {/* Shift rotation setting */}
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#bbff00]" />
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">
                      Rotation logique PPL (Cascade)
                    </span>
                    <span className="text-[10px] text-zinc-400 block leading-tight">
                      Décaler automatiquement la suite du programme si un jour passe en Repos
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({ autoShiftSchedule: !(settings.autoShiftSchedule ?? true) })
                  }
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative shrink-0 ${
                    (settings.autoShiftSchedule ?? true) ? 'bg-[#bbff00]' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      (settings.autoShiftSchedule ?? true)
                        ? 'bg-[#0a0a0a] transform translate-x-5'
                        : 'bg-white'
                    }`}
                  />
                </button>
              </div>

              {onClearScheduleOverrides && (
                <div className="pt-2 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={onClearScheduleOverrides}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg font-semibold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#bbff00]" />
                    <span>Rétablir la grille d'origine</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sound & Vibration Settings */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#bbff00] mb-2 font-heading">
              Alertes & Minuteur
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-200">
                    Sons pour le chrono de repos
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ timerSound: !settings.timerSound })}
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                    settings.timerSound ? 'bg-[#bbff00]' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      settings.timerSound ? 'bg-[#0a0a0a] transform translate-x-5' : 'bg-white'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-200">
                    Vibrations à la fin des séries
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ timerVibration: !settings.timerVibration })}
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                    settings.timerVibration ? 'bg-[#bbff00]' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      settings.timerVibration ? 'bg-[#0a0a0a] transform translate-x-5' : 'bg-white'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Backup & Sample Data */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#bbff00] mb-2 font-heading">
              Données & Sauvegardes
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportDataAsJSON(appData)}
                className="flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-2.5 rounded-xl text-xs font-bold text-zinc-200"
              >
                <Download className="w-4 h-4 text-[#bbff00]" />
                <span>Exporter JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 p-2.5 rounded-xl text-xs font-bold text-zinc-200"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Importer JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="mt-3">
              <button
                onClick={onLoadSampleData}
                className="w-full flex items-center justify-center gap-2 bg-[#bbff00]/10 border border-[#bbff00]/30 hover:border-[#bbff00]/60 p-2.5 rounded-xl text-xs font-bold text-[#bbff00]"
              >
                <Sparkles className="w-4 h-4 text-[#bbff00]" />
                <span>Charger des données de démonstration (Exemple)</span>
              </button>
            </div>
          </div>

          {/* Reset Factory */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={onResetData}
              className="w-full flex items-center justify-center gap-2 bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/60 p-2.5 rounded-xl text-xs font-bold text-rose-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Réinitialiser toutes les données</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
