import React, { useRef, useState } from 'react';
import { UserSettings, AppData } from '../types';
import { exportDataAsJSON, dateKey } from '../utils/workoutUtils';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  RefreshCw,
  Sparkles,
  ArrowRightLeft,
  RotateCcw,
  Film,
  AlertTriangle,
} from 'lucide-react';

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
  const [confirmReset, setConfirmReset] = useState(false);

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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="liquid-glass rounded-2xl w-full max-w-lg p-5 text-slate-900 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0a0a0a]" />
            <h3 className="font-black text-base uppercase tracking-wide text-slate-900 font-heading">
              Paramètres GymTrack
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 my-3 pr-1 space-y-5">
          {/* Schedule Config */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a] mb-2 font-heading">
              Programme Hebdomadaire (7 jours)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {days.map((dayName, idx) => (
                <div
                  key={dayName}
                  className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/90"
                >
                  <span className="text-xs font-bold text-slate-700">{dayName}</span>
                  <select
                    value={schedule[idx] || 'rest'}
                    onChange={(e) => handleScheduleChange(idx, e.target.value)}
                    className="bg-white text-xs font-bold font-mono text-slate-900 px-2 py-1 rounded border border-slate-300 focus:outline-none focus:border-[#0a0a0a]"
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
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#0a0a0a]" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-heading">
                      Rotation logique PPL (Cascade)
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                      Décaler automatiquement la suite du programme si un jour passe en Repos
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({ autoShiftSchedule: !(settings.autoShiftSchedule ?? true) })
                  }
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative shrink-0 ${
                    (settings.autoShiftSchedule ?? true) ? 'bg-[#0a0a0a]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      (settings.autoShiftSchedule ?? true)
                        ? 'bg-[#bbff00] transform translate-x-5'
                        : 'bg-white'
                    }`}
                  />
                </button>
              </div>

              {onClearScheduleOverrides && (
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={onClearScheduleOverrides}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200/90 hover:border-slate-400 px-3 py-1.5 rounded-lg font-bold transition-all shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#0a0a0a]" />
                    <span>Rétablir la grille d'origine</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sound & Vibration Settings */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a] mb-2 font-heading">
              Alertes & Minuteur
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/90">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Sons pour le chrono de repos
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ timerSound: !settings.timerSound })}
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                    settings.timerSound ? 'bg-[#0a0a0a]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      settings.timerSound ? 'bg-[#bbff00] transform translate-x-5' : 'bg-white'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/90">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800">
                    Vibrations à la fin des séries
                  </span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ timerVibration: !settings.timerVibration })}
                  className={`w-11 h-6 rounded-full transition-colors p-1 relative ${
                    settings.timerVibration ? 'bg-[#0a0a0a]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      settings.timerVibration ? 'bg-[#bbff00] transform translate-x-5' : 'bg-white'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Media & Photos Settings */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a] mb-2 font-heading">
              Affichage des Photos d'Exercices
            </h4>
            <div className="space-y-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-700 font-heading">
                    Source / URL de la banque d'images
                  </label>
                </div>

                <input
                  type="text"
                  value={settings.exerciseMediaBaseUrl || 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/'}
                  onChange={(e) => onUpdateSettings({ exerciseMediaBaseUrl: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0a0a0a] font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  La source actuelle est appliquée instantanément à toutes vos fiches d'exercices.
                </p>
              </div>
            </div>
          </div>

          {/* Data Backup & Sample Data */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a] mb-2 font-heading">
              Données & Sauvegardes
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportDataAsJSON(appData)}
                className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs font-extrabold text-slate-800 shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#0a0a0a]" />
                <span>Exporter JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs font-extrabold text-slate-800 shadow-2xs"
              >
                <Upload className="w-4 h-4 text-sky-600" />
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
                className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-[#bbff00] hover:bg-zinc-800 p-2.5 rounded-xl text-xs font-black font-heading shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#bbff00]" />
                <span>Charger des données de démonstration</span>
              </button>
            </div>
          </div>

          {/* Reset Factory */}
          <div className="pt-2 border-t border-slate-200">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 p-2.5 rounded-xl text-xs font-extrabold text-rose-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Réinitialiser toutes les données</span>
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-start gap-2 text-rose-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Voulez-vous vraiment réinitialiser ?</span>
                    <span className="text-[11px] text-rose-700 leading-tight block mt-0.5">
                      Toutes vos séances enregistrées, historiques et réglages seront définitivement effacés.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onResetData}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2 px-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Oui, tout effacer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
