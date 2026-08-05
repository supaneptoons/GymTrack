export type ProgramKey = 'A' | 'B' | 'C' | 'rest' | string;

export interface Exercise {
  id: string;
  name: string;
  category: 'push' | 'pull' | 'legs' | 'core' | 'arms' | 'shoulders';
  muscles: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  tip: string;
  imgs: [string, string, string]; // [folder, image0, image1]
  equipment?: string;
  custom?: boolean;
  gifUrl?: string;
}

export interface ProgramDetails {
  key: string;
  badge: string;
  title: string;
  label: string;
  description: string;
  exercises: Exercise[];
}

export interface SetData {
  done?: boolean;
  kg?: number | null;
  reps?: number | null;
}

export interface ExerciseData {
  [key: string]: any; // s1_done, s1_kg, s1_reps, etc.
}

export interface SessionState {
  program: ProgramKey;
  manualProg?: ProgramKey;
  completed: string[]; // Exercise IDs
  weights: Record<string, ExerciseData>; // exId -> set data
  notes?: string;
  energyRating?: number; // 1-10
  startTime?: string;
  endTime?: string;
}

export interface UserSettings {
  weightUnit: 'kg' | 'lbs';
  timerSound: boolean;
  timerVibration: boolean;
  defaultRestTime: number;
  autoOverloadStep: number; // e.g. 2.5 kg
  barbellWeight: number; // e.g. 20 kg
  autoShiftSchedule?: boolean; // automatically cascade PPL rotation on schedule changes
  animatedGifs?: boolean; // enable looping animated GIF playback
  exerciseMediaBaseUrl?: string; // custom base URL for image/gif source
}

export interface AppData {
  sessions: Record<string, SessionState>; // YYYY-MM-DD -> SessionState
  customExercises: Exercise[];
  schedule: string[]; // 7 days (Mon-Sun) e.g. ['A', 'B', 'C', 'rest', 'A', 'B', 'rest']
  settings: UserSettings;
}

export interface ExerciseProgressEntry {
  date: string;
  maxKg: number;
  totalVolume: number;
  done: boolean;
  estimated1RM: number;
}
