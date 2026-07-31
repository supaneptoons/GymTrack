import { Exercise, SessionState, AppData, ExerciseProgressEntry, ProgramKey } from '../types';
import { ALL_PROGRAMS } from '../data/defaultProgram';

export function dateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T12:00:00`);
}

export function formatFrenchDate(date: Date, options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }): string {
  const str = date.toLocaleDateString('fr-FR', options);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getProgramForDate(dateStr: string, sessions: Record<string, SessionState>, schedule: string[]): string {
  if (sessions[dateStr]?.manualProg) {
    return sessions[dateStr].manualProg!;
  }
  const d = parseDateKey(dateStr);
  const dayOfWeek = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  return schedule[dayOfWeek] || 'rest';
}

/**
 * Calculates estimated 1RM using Brzycki Formula: Weight * (36 / (37 - Reps))
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  const rm = weightKg * (36 / (37 - Math.min(reps, 30)));
  return Math.round(rm * 10) / 10;
}

/**
 * Checks past sessions for an exercise and returns a progressive overload suggestion if all sets were completed.
 */
export function getOverloadSuggestion(
  exId: string,
  currentKey: string,
  sessions: Record<string, SessionState>,
  allExercises: Exercise[],
  incrementStep: number = 2.5
): number | null {
  const sortedKeys = Object.keys(sessions)
    .sort()
    .filter((k) => k < currentKey);

  for (let i = sortedKeys.length - 1; i >= 0; i--) {
    const s = sessions[sortedKeys[i]];
    if (!s.completed?.includes(exId)) continue;
    const w = s.weights?.[exId];
    if (!w) continue;

    const ex = allExercises.find((e) => e.id === exId);
    if (!ex) continue;

    let allSetsCompleted = true;
    let maxKg = 0;

    for (let n = 1; n <= ex.sets; n++) {
      if (!w[`s${n}_done`]) {
        allSetsCompleted = false;
        break;
      }
      const kg = parseFloat(w[`s${n}_kg`]) || 0;
      if (kg > maxKg) maxKg = kg;
    }

    if (allSetsCompleted && maxKg > 0) {
      return maxKg + incrementStep;
    }
    return null;
  }

  return null;
}

/**
 * Barbell Plate Loading Calculator
 */
export interface PlateCalculation {
  perSide: { plate: number; count: number }[];
  remBarWeight: number;
  isValid: boolean;
  actualTotal: number;
}

export function calculatePlates(targetTotalKg: number, barWeightKg: number = 20): PlateCalculation {
  if (targetTotalKg < barWeightKg) {
    return { perSide: [], remBarWeight: barWeightKg, isValid: false, actualTotal: barWeightKg };
  }

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  let weightPerSide = (targetTotalKg - barWeightKg) / 2;
  const result: { plate: number; count: number }[] = [];
  let remaining = weightPerSide;

  for (const plate of availablePlates) {
    if (remaining >= plate) {
      const count = Math.floor(remaining / plate);
      result.push({ plate, count });
      remaining = Math.round((remaining - count * plate) * 100) / 100;
    }
  }

  const loadedPerSide = weightPerSide - remaining;
  const actualTotal = barWeightKg + loadedPerSide * 2;

  return {
    perSide: result,
    remBarWeight: barWeightKg,
    isValid: remaining === 0,
    actualTotal,
  };
}

/**
 * Web Audio API Beep Generator for countdown finish & feedback
 */
export function playBeep(freq = 880, type: OscillatorType = 'sine', duration = 0.15) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
}

/**
 * Play completion fanfare / multi-tone beep
 */
export function playFinishSound() {
  playBeep(523.25, 'triangle', 0.12); // C5
  setTimeout(() => playBeep(659.25, 'triangle', 0.12), 120); // E5
  setTimeout(() => playBeep(783.99, 'triangle', 0.12), 240); // G5
  setTimeout(() => playBeep(1046.5, 'triangle', 0.3), 360); // C6
}

/**
 * Export app state to downloadable JSON file
 */
export function exportDataAsJSON(data: AppData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gymtrack-backup-${dateKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Calculate exercise progress entries history
 */
export function getExerciseHistory(exId: string, sessions: Record<string, SessionState>): ExerciseProgressEntry[] {
  const entries: ExerciseProgressEntry[] = [];

  const keys = Object.keys(sessions).sort();
  for (const date of keys) {
    const s = sessions[date];
    const w = s.weights?.[exId];
    if (!w) continue;

    let maxKg = 0;
    let totalVolume = 0;
    let maxRepsAtMaxKg = 0;

    for (let setIndex = 1; setIndex <= 10; setIndex++) {
      const kg = parseFloat(w[`s${setIndex}_kg`]) || 0;
      const reps = parseInt(w[`s${setIndex}_reps`]) || 10;
      const isDone = w[`s${setIndex}_done`];

      if (kg > 0) {
        totalVolume += kg * reps;
        if (kg > maxKg) {
          maxKg = kg;
          maxRepsAtMaxKg = reps;
        }
      }
    }

    if (maxKg > 0) {
      entries.push({
        date,
        maxKg,
        totalVolume,
        done: s.completed?.includes(exId) || false,
        estimated1RM: calculate1RM(maxKg, maxRepsAtMaxKg),
      });
    }
  }

  return entries;
}

/**
 * Shifts or recalculates program assignments starting from a specific date key.
 * When a session is modified (e.g. converted to 'rest' or changed to program 'A', 'B', 'C'),
 * future non-completed sessions shift logically so the rotation (A -> B -> C -> A...) continues
 * without missing any workout in the sequence.
 */
export function shiftScheduleFromDate(
  startDateKey: string,
  newProgram: ProgramKey,
  currentSessions: Record<string, SessionState>,
  schedule: string[],
  daysCount: number = 60
): Record<string, SessionState> {
  const updatedSessions: Record<string, SessionState> = { ...currentSessions };

  // 1. Set start date
  const startSession = updatedSessions[startDateKey] || {
    program: newProgram,
    completed: [],
    weights: {},
  };
  updatedSessions[startDateKey] = {
    ...startSession,
    program: newProgram,
    manualProg: newProgram,
  };

  // Determine active sequence of workouts (e.g. ['A', 'B', 'C'])
  const activePrograms = schedule.filter((p) => p !== 'rest');
  const uniqueActiveProgs = Array.from(new Set(activePrograms));
  if (uniqueActiveProgs.length === 0) uniqueActiveProgs.push('A', 'B', 'C');

  // Find what program index comes next
  let nextProgIndex = 0;
  if (newProgram !== 'rest') {
    const idx = uniqueActiveProgs.indexOf(newProgram);
    nextProgIndex = idx >= 0 ? (idx + 1) % uniqueActiveProgs.length : 0;
  } else {
    // If startDateKey was set to 'rest', find what program was scheduled on startDateKey before the change
    const previousProg = getProgramForDate(startDateKey, currentSessions, schedule);
    if (previousProg !== 'rest') {
      const idx = uniqueActiveProgs.indexOf(previousProg);
      nextProgIndex = idx >= 0 ? idx : 0; // The missed program will be done on the next training day!
    } else {
      // Find previous active program in history
      const sortedKeys = Object.keys(currentSessions).filter((k) => k < startDateKey).sort();
      let lastProg = 'C';
      for (let i = sortedKeys.length - 1; i >= 0; i--) {
        const p = currentSessions[sortedKeys[i]]?.program;
        if (p && p !== 'rest') {
          lastProg = p;
          break;
        }
      }
      const idx = uniqueActiveProgs.indexOf(lastProg);
      nextProgIndex = (idx + 1) % uniqueActiveProgs.length;
    }
  }

  const currDateObj = parseDateKey(startDateKey);

  // Iterate dates into the future
  for (let i = 1; i <= daysCount; i++) {
    const nextDate = new Date(currDateObj);
    nextDate.setDate(currDateObj.getDate() + i);
    const k = dateKey(nextDate);

    // If session already has recorded completed workouts, don't overwrite its historical data
    if ((updatedSessions[k]?.completed?.length || 0) > 0) {
      const p = updatedSessions[k].program;
      if (p !== 'rest') {
        const idx = uniqueActiveProgs.indexOf(p);
        if (idx >= 0) nextProgIndex = (idx + 1) % uniqueActiveProgs.length;
      }
      continue;
    }

    const dayOfWeek = (nextDate.getDay() + 6) % 7; // Mon = 0
    const baseDayType = schedule[dayOfWeek] || 'rest';

    // If base weekly schedule specifies a training day:
    if (baseDayType !== 'rest') {
      const assignedProg = uniqueActiveProgs[nextProgIndex];
      updatedSessions[k] = {
        ...(updatedSessions[k] || { completed: [], weights: {} }),
        program: assignedProg,
        manualProg: assignedProg,
      };
      nextProgIndex = (nextProgIndex + 1) % uniqueActiveProgs.length;
    } else {
      // It's a natural rest day in weekly schedule
      updatedSessions[k] = {
        ...(updatedSessions[k] || { completed: [], weights: {} }),
        program: 'rest',
        manualProg: 'rest',
      };
    }
  }

  return updatedSessions;
}

/**
 * Clears all manual program overrides from a given date into the future,
 * restoring the standard 7-day schedule.
 */
export function clearManualScheduleOverrides(
  startDateKey: string,
  currentSessions: Record<string, SessionState>
): Record<string, SessionState> {
  const updatedSessions = { ...currentSessions };
  const keys = Object.keys(updatedSessions).filter((k) => k >= startDateKey);
  for (const k of keys) {
    if ((updatedSessions[k]?.completed?.length || 0) === 0) {
      delete updatedSessions[k].manualProg;
    }
  }
  return updatedSessions;
}
