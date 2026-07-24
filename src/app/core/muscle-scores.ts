import { WorkoutSession } from "./models";
import { MUSCLE_GROUPS, MuscleGroup, findIllustration } from "./exercise-library";

export const TRACKED_GROUPS: MuscleGroup[] = MUSCLE_GROUPS.filter((g) => g !== "Cuerpo completo") as MuscleGroup[];

export interface MuscleScore {
  group: MuscleGroup;
  frequency: number; // distinct training days in the window
  volume: number; // sum of weight * reps in the window
  score: number; // 0..1, combined and normalized
}

function todayMinusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function computeMuscleScores(sessions: WorkoutSession[], days = 30): MuscleScore[] {
  const cutoff = todayMinusDays(days);

  const freqByGroup: Partial<Record<MuscleGroup, Set<string>>> = {};
  const volByGroup: Partial<Record<MuscleGroup, number>> = {};

  for (const s of sessions) {
    if (s.date < cutoff) continue;
    for (const ex of s.exercises) {
      const def = findIllustration(ex.name);
      if (!def || def.group === "Cuerpo completo") continue;
      const g = def.group;

      if (!freqByGroup[g]) freqByGroup[g] = new Set();
      freqByGroup[g]!.add(s.date);

      let vol = 0;
      for (const set of ex.sets) {
        const w = parseFloat(String(set.weight));
        const r = parseFloat(String(set.reps));
        if (isFinite(w) && isFinite(r)) vol += w * r;
      }
      volByGroup[g] = (volByGroup[g] || 0) + vol;
    }
  }

  const maxFreq = Math.max(1, ...TRACKED_GROUPS.map((g) => freqByGroup[g]?.size || 0));
  const maxVol = Math.max(1, ...TRACKED_GROUPS.map((g) => volByGroup[g] || 0));

  return TRACKED_GROUPS.map((g) => {
    const frequency = freqByGroup[g]?.size || 0;
    const volume = Math.round(volByGroup[g] || 0);
    const freqNorm = frequency / maxFreq;
    const volNorm = volume / maxVol;
    const score = 0.65 * freqNorm + 0.35 * volNorm;
    return { group: g, frequency, volume, score };
  }).sort((a, b) => b.score - a.score);
}

const FROM = [217, 207, 184]; // --paper-line, untrained
const TO = [178, 59, 46]; // --rust, fully trained

export function intensityColor(score: number): string {
  const t = Math.max(0, Math.min(1, score));
  const r = Math.round(FROM[0] + (TO[0] - FROM[0]) * t);
  const g = Math.round(FROM[1] + (TO[1] - FROM[1]) * t);
  const b = Math.round(FROM[2] + (TO[2] - FROM[2]) * t);
  return `rgb(${r},${g},${b})`;
}
