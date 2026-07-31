import React, { useState, useEffect } from 'react';
import { AppData, SessionState, Exercise, UserSettings, ProgramKey } from './types';
import {
  ALL_PROGRAMS,
  DEFAULT_SCHEDULE,
  DEFAULT_SETTINGS,
  EXTRA_LIBRARY_EXERCISES,
} from './data/defaultProgram';
import {
  dateKey,
  parseDateKey,
  getProgramForDate,
  getOverloadSuggestion,
  formatFrenchDate,
  shiftScheduleFromDate,
  clearManualScheduleOverrides,
} from './utils/workoutUtils';

import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { WeekStrip } from './components/WeekStrip';
import { ExerciseCard } from './components/ExerciseCard';
import { RestTimerOverlay } from './components/RestTimerOverlay';
import { PlateCalculatorModal } from './components/PlateCalculatorModal';
import { CalendarView } from './components/CalendarView';
import { StatsView } from './components/StatsView';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { SettingsModal } from './components/SettingsModal';
import { AiCoachModal } from './components/AiCoachModal';

import { Trophy, CheckCircle, Dumbbell, Sparkles, Plus, Info, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'gymtrack_v5';

export default function App() {
  const todayStr = dateKey();
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<TabType>('workout');

  // App Data State
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('gymtrack_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          sessions: parsed.sessions || {},
          customExercises: parsed.customExercises || [],
          schedule: parsed.schedule || DEFAULT_SCHEDULE,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to parse saved state', e);
    }
    return {
      sessions: {},
      customExercises: [],
      schedule: DEFAULT_SCHEDULE,
      settings: DEFAULT_SETTINGS,
    };
  });

  // Save to localStorage whenever data updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [data]);

  // Modals state
  const [activeTimer, setActiveTimer] = useState<{ totalSeconds: number; key: number } | null>(
    null
  );
  const [plateCalcWeight, setPlateCalcWeight] = useState<number | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAiCoachModal, setShowAiCoachModal] = useState<boolean>(false);

  // Card accordion open states
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});

  // All combined exercises (Default PPL + Extra Library + User Custom)
  const allExercises: Exercise[] = [
    ...ALL_PROGRAMS.A.exercises,
    ...ALL_PROGRAMS.B.exercises,
    ...ALL_PROGRAMS.C.exercises,
    ...EXTRA_LIBRARY_EXERCISES,
    ...data.customExercises,
  ];

  // Get or initialize session for selected date
  const currentProgram = getProgramForDate(selectedDateKey, data.sessions, data.schedule);
  const currentSession: SessionState = data.sessions[selectedDateKey] || {
    program: currentProgram,
    completed: [],
    weights: {},
  };

  const programDetails = ALL_PROGRAMS[currentProgram];

  // Calculate Streak
  let streakCount = 0;
  const d = new Date();
  while (true) {
    const k = dateKey(d);
    if ((data.sessions[k]?.completed?.length || 0) > 0) {
      streakCount++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  // Session Handler Helpers
  const updateSessionState = (
    dateStr: string,
    updater: (prev: SessionState) => SessionState
  ) => {
    setData((prevData) => {
      const existing = prevData.sessions[dateStr] || {
        program: getProgramForDate(dateStr, prevData.sessions, prevData.schedule),
        completed: [],
        weights: {},
      };
      const updatedSession = updater(existing);
      return {
        ...prevData,
        sessions: {
          ...prevData.sessions,
          [dateStr]: updatedSession,
        },
      };
    });
  };

  const handleToggleSetDone = (exId: string, setNum: number, restSeconds: number) => {
    updateSessionState(selectedDateKey, (session) => {
      const exWeights = session.weights[exId] || {};
      const key = `s${setNum}_done`;
      const currentVal = !!exWeights[key];

      const updatedWeights = {
        ...session.weights,
        [exId]: {
          ...exWeights,
          [key]: !currentVal,
        },
      };

      // Auto trigger timer when set is marked done!
      if (!currentVal) {
        setActiveTimer({
          totalSeconds: restSeconds || data.settings.defaultRestTime,
          key: Date.now(),
        });
      }

      return {
        ...session,
        weights: updatedWeights,
      };
    });
  };

  const handleUpdateWeight = (exId: string, setNum: number, weightKg: number | null) => {
    updateSessionState(selectedDateKey, (session) => {
      const exWeights = session.weights[exId] || {};
      return {
        ...session,
        weights: {
          ...session.weights,
          [exId]: {
            ...exWeights,
            [`s${setNum}_kg`]: weightKg,
          },
        },
      };
    });
  };

  const handleUpdateReps = (exId: string, setNum: number, reps: number | null) => {
    updateSessionState(selectedDateKey, (session) => {
      const exWeights = session.weights[exId] || {};
      return {
        ...session,
        weights: {
          ...session.weights,
          [exId]: {
            ...exWeights,
            [`s${setNum}_reps`]: reps,
          },
        },
      };
    });
  };

  const handleToggleExerciseDone = (exId: string) => {
    updateSessionState(selectedDateKey, (session) => {
      const isDone = session.completed.includes(exId);
      const updatedCompleted = isDone
        ? session.completed.filter((id) => id !== exId)
        : [...session.completed, exId];

      return {
        ...session,
        completed: updatedCompleted,
      };
    });
  };

  const handleManualProgramSet = (
    dateStr: string,
    prog: ProgramKey,
    cascade: boolean = data.settings.autoShiftSchedule ?? true
  ) => {
    setData((prev) => {
      if (cascade) {
        const shifted = shiftScheduleFromDate(dateStr, prog, prev.sessions, prev.schedule);
        return {
          ...prev,
          sessions: shifted,
        };
      }
      const existing = prev.sessions[dateStr] || {
        program: prog,
        completed: [],
        weights: {},
      };
      return {
        ...prev,
        sessions: {
          ...prev.sessions,
          [dateStr]: {
            ...existing,
            program: prog,
            manualProg: prog,
          },
        },
      };
    });
  };

  const handleClearScheduleOverrides = (startDateStr: string = todayStr) => {
    setData((prev) => ({
      ...prev,
      sessions: clearManualScheduleOverrides(startDateStr, prev.sessions),
    }));
  };

  const handleAddCustomExercise = (newEx: Exercise) => {
    setData((prev) => ({
      ...prev,
      customExercises: [...prev.customExercises, newEx],
    }));
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir réinitialiser toutes les données de GymTrack ? Cette action est irréversible.'
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      setData({
        sessions: {},
        customExercises: [],
        schedule: DEFAULT_SCHEDULE,
        settings: DEFAULT_SETTINGS,
      });
      setShowSettingsModal(false);
    }
  };

  // Load realistic sample data for testing stats & calendar!
  const handleLoadSampleData = () => {
    const sampleSessions: Record<string, SessionState> = {};
    const sampleDates = [];

    // Generate 12 previous training days
    const now = new Date();
    for (let i = 21; i >= 1; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = dateKey(d);
      const dayOfWeek = (d.getDay() + 6) % 7;
      const prog = DEFAULT_SCHEDULE[dayOfWeek];

      if (prog !== 'rest' && ALL_PROGRAMS[prog]) {
        const pDetails = ALL_PROGRAMS[prog];
        const exMap: Record<string, any> = {};
        const completedIds: string[] = [];

        pDetails.exercises.forEach((ex) => {
          completedIds.push(ex.id);
          const baseKg =
            ex.id === 'bench'
              ? 60 + Math.floor((21 - i) / 3) * 2.5
              : ex.id === 'squat'
              ? 80 + Math.floor((21 - i) / 3) * 2.5
              : ex.id === 'ohp'
              ? 40 + Math.floor((21 - i) / 3) * 2.5
              : 25;

          const setWeights: Record<string, any> = {};
          for (let s = 1; s <= ex.sets; s++) {
            setWeights[`s${s}_done`] = true;
            setWeights[`s${s}_kg`] = baseKg;
            setWeights[`s${s}_reps`] = parseInt(ex.reps) || 10;
          }
          exMap[ex.id] = setWeights;
        });

        sampleSessions[k] = {
          program: prog,
          completed: completedIds,
          weights: exMap,
        };
      }
    }

    setData((prev) => ({
      ...prev,
      sessions: { ...prev.sessions, ...sampleSessions },
    }));

    setShowSettingsModal(false);
    alert('Données de démonstration chargées avec succès ! Rendez-vous sur l\'onglet "Progrès" ou "Calendrier".');
  };

  const isSessionFullyComplete =
    programDetails &&
    programDetails.exercises.length > 0 &&
    currentSession.completed.length === programDetails.exercises.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 via-slate-100 to-white text-[#0a0a0a] flex flex-col font-sans select-none pb-12">
      {/* Header */}
      <Header
        currentDateKey={selectedDateKey}
        streakCount={streakCount}
        onOpenAiCoach={() => setShowAiCoachModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Navigation Bar */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Pages */}
      <main className="flex-1 w-full">
        {/* WORKOUT PAGE */}
        {activeTab === 'workout' && (
          <div className="p-4 max-w-3xl mx-auto pb-24 animate-in fade-in duration-200">
            {/* Week Strip Carousel */}
            <WeekStrip
              currentDateKey={todayStr}
              selectedDateKey={selectedDateKey}
              onSelectDate={(k) => setSelectedDateKey(k)}
              sessions={data.sessions}
              schedule={data.schedule}
            />

            {/* Session Header Banner */}
            <div className="my-4">
              {currentProgram === 'rest' ? (
                <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-8 text-center my-6 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-[#bbff00]">
                    <Info className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-2xl text-white font-heading tracking-wide">
                    REPOS ACTIF
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                    Aujourd'hui est une journée dédiée à la récupération, l'hydratation et le sommeil. Le muscle se reconstruit pendant le repos.
                  </p>
                </div>
              ) : (
                <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                          currentProgram === 'A'
                            ? 'bg-[#bbff00] text-[#0a0a0a]'
                            : currentProgram === 'B'
                            ? 'bg-sky-400 text-[#0a0a0a]'
                            : 'bg-amber-400 text-[#0a0a0a]'
                        }`}
                      >
                        SÉANCE {currentProgram}
                      </span>
                      <span className="text-xs font-extrabold text-zinc-200 truncate font-heading">
                        {programDetails?.label}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-zinc-400">
                      {currentSession.completed.length}/{programDetails?.exercises.length} fait
                    </span>
                  </div>

                  {/* Progress Fill Bar */}
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-[#bbff00] transition-all duration-500 rounded-full shadow-sm shadow-[#bbff00]/50"
                      style={{
                        width: `${
                          ((currentSession.completed.length || 0) /
                            (programDetails?.exercises.length || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Session Complete Celebration Banner */}
            {isSessionFullyComplete && currentProgram !== 'rest' && (
              <div className="bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/40 rounded-2xl p-5 mb-6 text-center animate-in zoom-in-95 duration-200 shadow-xl shadow-emerald-950/30">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <CheckCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-xl text-emerald-400 uppercase tracking-wide">
                  Séance Validée ! 🔥
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Excellente séance. Ta surcharge progressive a été enregistrée.
                </p>
              </div>
            )}

            {/* Exercise List Cards */}
            {currentProgram !== 'rest' && programDetails?.exercises && (
              <div className="space-y-3">
                {programDetails.exercises.map((ex, idx) => {
                  const isExDone = currentSession.completed.includes(ex.id);
                  const exWeights = currentSession.weights[ex.id] || {};
                  const overloadSugg = getOverloadSuggestion(
                    ex.id,
                    selectedDateKey,
                    data.sessions,
                    allExercises,
                    data.settings.autoOverloadStep
                  );

                  const isOpen =
                    openCards[ex.id] !== undefined ? openCards[ex.id] : idx === 0 || !isExDone;

                  return (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      index={idx}
                      exerciseData={exWeights}
                      isDone={isExDone}
                      overloadSuggestion={overloadSugg}
                      onToggleSetDone={(setNum, restSecs) =>
                        handleToggleSetDone(ex.id, setNum, restSecs)
                      }
                      onUpdateWeight={(setNum, kg) => handleUpdateWeight(ex.id, setNum, kg)}
                      onUpdateReps={(setNum, reps) => handleUpdateReps(ex.id, setNum, reps)}
                      onToggleExerciseDone={() => handleToggleExerciseDone(ex.id)}
                      onOpenPlateCalculator={(weight) => setPlateCalcWeight(weight)}
                      isOpen={isOpen}
                      onToggleOpen={() =>
                        setOpenCards((prev) => ({ ...prev, [ex.id]: !isOpen }))
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CALENDAR PAGE */}
        {activeTab === 'calendar' && (
          <CalendarView
            sessions={data.sessions}
            schedule={data.schedule}
            currentDateKey={selectedDateKey}
            autoShiftSchedule={data.settings.autoShiftSchedule ?? true}
            onSelectDate={(k) => {
              setSelectedDateKey(k);
              setActiveTab('workout');
            }}
            onSetManualProgram={handleManualProgramSet}
            onClearScheduleOverrides={handleClearScheduleOverrides}
          />
        )}

        {/* STATS PAGE */}
        {activeTab === 'stats' && (
          <StatsView sessions={data.sessions} allExercises={allExercises} />
        )}

        {/* LIBRARY PAGE */}
        {activeTab === 'library' && (
          <ExerciseLibraryView
            allExercises={allExercises}
            onAddCustomExercise={handleAddCustomExercise}
          />
        )}
      </main>

      {/* Rest Timer Overlay Modal */}
      {activeTimer && (
        <RestTimerOverlay
          key={activeTimer.key}
          totalSeconds={activeTimer.totalSeconds}
          soundEnabled={data.settings.timerSound}
          vibrationEnabled={data.settings.timerVibration}
          onFinish={() => setActiveTimer(null)}
          onCancel={() => setActiveTimer(null)}
        />
      )}

      {/* Plate Calculator Modal */}
      {plateCalcWeight !== null && (
        <PlateCalculatorModal
          initialWeight={plateCalcWeight}
          barWeight={data.settings.barbellWeight}
          onClose={() => setPlateCalcWeight(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={data.settings}
          schedule={data.schedule}
          appData={data}
          onUpdateSettings={(newSet) =>
            setData((prev) => ({ ...prev, settings: { ...prev.settings, ...newSet } }))
          }
          onUpdateSchedule={(newSch) => setData((prev) => ({ ...prev, schedule: newSch }))}
          onClearScheduleOverrides={() => handleClearScheduleOverrides(todayStr)}
          onImportData={(imp) => setData(imp)}
          onResetData={handleResetData}
          onLoadSampleData={handleLoadSampleData}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* AI Coach Modal */}
      {showAiCoachModal && (
        <AiCoachModal
          currentProgram={currentProgram}
          sessionName={programDetails?.label}
          recentSummary={`Séances effectuées: ${Object.keys(data.sessions).length}`}
          onClose={() => setShowAiCoachModal(false)}
        />
      )}
    </div>
  );
}
