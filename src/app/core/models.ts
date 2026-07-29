export interface ExerciseSet {
  weight: string | number;
  reps: string | number;
  unit?: "kg" | "lb";
}

export interface RoutineExercise {
  id: string;
  name: string;
  targetSets: string | number;
  targetReps: string | number;
}

export interface Routine {
  id: string;
  user_id?: string;
  name: string;
  exercises: RoutineExercise[];
  created_at?: string;
}

export interface SessionExercise {
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  user_id?: string;
  date: string;
  routine_id?: string | null;
  routine_name?: string | null;
  exercises: SessionExercise[];
  created_at?: string;
}

export interface Measurement {
  id: string;
  user_id?: string;
  date: string;
  weight?: number | null;
  neck?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  arm?: number | null;
  thigh?: number | null;
  notes?: string | null;
}

export interface TeamMember {
  username: string;
  isMe?: boolean;
  latestWeight: number | null;
  latestDate: string | null;
  weightSeries: { date: string; weight: number }[];
  prs: { name: string; weight: number; date: string }[];
  recentSessions: { date: string; routineName: string | null; exerciseCount: number }[];
  trainingDates: string[];
  sessionCount: number;
}

export interface ShareTarget {
  id: string;
  username: string;
  shared: boolean;
}

export interface ExercisePhoto {
  id: string;
  exercise_name: string;
  url: string;
  storage_path?: string;
}

export interface NutritionLog {
  id: string;
  user_id?: string;
  date: string;
  meal_type: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id?: string;
  type: "weight" | "exercise";
  exercise_name: string | null;
  target_value: number;
  unit: "kg" | "lb";
  target_date: string | null;
  notes: string | null;
  created_at?: string;
}
