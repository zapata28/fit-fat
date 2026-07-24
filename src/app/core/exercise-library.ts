import { normalize } from "./utils";

export type MuscleGroup = "Pecho" | "Espalda" | "Pierna" | "Glúteo" | "Abdomen" | "Hombro" | "Brazo" | "Cuerpo completo";

export interface ExerciseDef {
  key: string;
  label: string;
  group: MuscleGroup;
  aliases: string[];
  svg: string; // inline <svg> markup, trusted/static content authored by us
}

const s = (inner: string) =>
  `<svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // ---- Pecho ----
  {
    key: "press banca", label: "Press banca", group: "Pecho", aliases: ["press de banca", "bench press", "press pecho", "banca plana"],
    svg: s(`<rect x="30" y="70" width="60" height="8" rx="2"/><rect x="34" y="78" width="8" height="16"/><rect x="78" y="78" width="8" height="16"/><circle cx="60" cy="40" r="9"/><path d="M60 49 L60 68"/><path d="M60 55 L28 50 M60 55 L92 50"/><circle cx="24" cy="49" r="6"/><circle cx="96" cy="49" r="6"/><path d="M50 68 L46 70 M70 68 L74 70"/>`),
  },
  {
    key: "press inclinado", label: "Press inclinado", group: "Pecho", aliases: ["incline press", "press banca inclinado", "inclinado con mancuernas"],
    svg: s(`<path d="M32 90 L58 62 L88 62"/><rect x="36" y="82" width="8" height="14" transform="rotate(-30 40 89)"/><circle cx="60" cy="40" r="9"/><path d="M60 49 L58 62"/><path d="M58 62 L34 56 M58 62 L92 56"/><circle cx="28" cy="55" r="6"/><circle cx="96" cy="55" r="6"/>`),
  },
  {
    key: "aperturas con mancuernas", label: "Aperturas con mancuernas", group: "Pecho", aliases: ["flyes", "dumbbell flyes", "aperturas pecho", "cristo con mancuernas"],
    svg: s(`<rect x="30" y="70" width="60" height="8" rx="2"/><circle cx="60" cy="40" r="9"/><path d="M60 49 L60 68"/><path d="M60 58 Q40 40 26 52"/><path d="M60 58 Q80 40 94 52"/><circle cx="24" cy="52" r="6"/><circle cx="96" cy="52" r="6"/>`),
  },
  {
    key: "fondos en paralelas", label: "Fondos en paralelas", group: "Pecho", aliases: ["dips", "fondos", "parallel bar dips"],
    svg: s(`<path d="M30 30 L30 70 M90 30 L90 70"/><circle cx="60" cy="38" r="9"/><path d="M60 47 L60 66"/><path d="M60 50 L30 55 M60 50 L90 55"/><path d="M60 66 L52 90 M60 66 L68 90"/>`),
  },
  {
    key: "cruce de poleo", label: "Cruce de poleo", group: "Pecho", aliases: ["cable crossover", "poleas pecho", "cruces en polea"],
    svg: s(`<path d="M18 20 L18 100 M102 20 L102 100"/><circle cx="60" cy="34" r="9"/><path d="M60 43 L60 70"/><path d="M60 55 Q40 45 18 45"/><path d="M60 55 Q80 45 102 45"/><path d="M60 70 L50 96 M60 70 L70 96"/>`),
  },

  // ---- Espalda ----
  {
    key: "peso muerto", label: "Peso muerto", group: "Espalda", aliases: ["deadlift", "levantamiento muerto"],
    svg: s(`<circle cx="46" cy="22" r="9"/><path d="M46 31 L46 55 Q46 65 60 68 L74 70"/><path d="M46 55 L36 95"/><path d="M60 68 L66 95"/><path d="M60 60 L82 60"/><circle cx="30" cy="60" r="6"/><circle cx="88" cy="60" r="6"/><path d="M46 40 L30 58 M46 45 L88 58"/>`),
  },
  {
    key: "dominadas", label: "Dominadas", group: "Espalda", aliases: ["pull up", "pull-up", "pullup", "jalon dominadas"],
    svg: s(`<path d="M20 20 L100 20"/><path d="M35 20 L35 32 M85 20 L85 32"/><circle cx="60" cy="45" r="9"/><path d="M60 54 L60 78"/><path d="M60 60 L35 32 M60 60 L85 32"/><path d="M60 78 L48 100 M60 78 L72 100"/>`),
  },
  {
    key: "jalon al pecho", label: "Jalón al pecho", group: "Espalda", aliases: ["lat pulldown", "jalon polea", "jalon dorsal"],
    svg: s(`<path d="M60 14 L60 30"/><path d="M40 30 L80 30"/><circle cx="60" cy="42" r="9"/><path d="M60 51 L60 76"/><path d="M60 58 L40 30 M60 58 L80 30"/><path d="M50 76 L46 100 M70 76 L74 100"/>`),
  },
  {
    key: "remo con barra", label: "Remo con barra", group: "Espalda", aliases: ["remo", "barbell row", "remo inclinado"],
    svg: s(`<circle cx="34" cy="32" r="9"/><path d="M34 41 L58 70"/><path d="M58 70 L50 100 M58 70 L72 96"/><path d="M40 55 L86 76"/><circle cx="90" cy="80" r="6"/><path d="M40 55 L38 72"/>`),
  },
  {
    key: "remo con mancuerna", label: "Remo con mancuerna", group: "Espalda", aliases: ["one arm row", "remo unilateral", "remo a una mano"],
    svg: s(`<rect x="20" y="70" width="30" height="8" rx="2"/><path d="M50 40 L50 74"/><path d="M50 74 L38 96 M50 74 L58 92"/><path d="M50 50 L78 68"/><circle cx="84" cy="72" r="6"/><path d="M50 50 L48 66"/>`),
  },
  {
    key: "remo en polea", label: "Remo en polea", group: "Espalda", aliases: ["seated cable row", "remo sentado", "remo polea baja"],
    svg: s(`<path d="M30 70 L30 92 M90 70 L90 92"/><path d="M30 92 L54 92 L54 78 M90 92 L66 92 L66 78"/><circle cx="60" cy="42" r="9"/><path d="M60 51 L60 76"/><path d="M60 58 L54 78 M60 58 L66 78"/><path d="M52 76 L48 96 M68 76 L72 96"/>`),
  },
  {
    key: "pull-over", label: "Pull-over", group: "Espalda", aliases: ["pullover", "press de pullover"],
    svg: s(`<rect x="26" y="76" width="68" height="8" rx="2"/><rect x="30" y="84" width="8" height="14"/><rect x="82" y="84" width="8" height="14"/><circle cx="60" cy="44" r="9"/><path d="M60 53 L60 76"/><path d="M60 58 L40 32 M60 58 L80 32"/><circle cx="36" cy="30" r="5"/><circle cx="84" cy="30" r="5"/>`),
  },

  // ---- Pierna ----
  {
    key: "sentadilla", label: "Sentadilla", group: "Pierna", aliases: ["squat", "sentadillas", "back squat", "sentadilla libre"],
    svg: s(`<circle cx="60" cy="24" r="9"/><path d="M60 33 L60 60"/><path d="M60 60 L45 90 M60 60 L75 90"/><path d="M45 90 L40 100 M75 90 L80 100"/><path d="M38 45 L82 45"/><circle cx="34" cy="45" r="5"/><circle cx="86" cy="45" r="5"/><path d="M44 55 L34 68 M76 55 L86 68"/>`),
  },
  {
    key: "zancadas", label: "Zancadas", group: "Pierna", aliases: ["lunges", "estocadas", "zancada"],
    svg: s(`<circle cx="52" cy="24" r="9"/><path d="M52 33 L58 60"/><path d="M58 60 L38 78 L34 100"/><path d="M58 60 L78 72 L86 96"/><path d="M40 45 L58 50 M58 50 L74 42"/>`),
  },
  {
    key: "sentadilla bulgara", label: "Sentadilla búlgara", group: "Pierna", aliases: ["bulgarian split squat", "sentadilla b\u00falgara", "zancada bulgara"],
    svg: s(`<circle cx="48" cy="22" r="9"/><path d="M48 31 L52 58"/><path d="M52 58 L34 76 L30 98"/><path d="M52 58 L70 66 L82 60 L92 66"/><path d="M42 42 L48 48 M48 48 L60 40"/>`),
  },
  {
    key: "prensa de piernas", label: "Prensa de piernas", group: "Pierna", aliases: ["leg press", "prensa"],
    svg: s(`<rect x="16" y="40" width="10" height="46" rx="3"/><circle cx="52" cy="52" r="9"/><path d="M52 61 L52 78"/><path d="M52 78 L30 66 M52 78 L30 90"/><path d="M30 66 L26 60 M30 90 L26 84"/><path d="M84 40 L84 92"/><circle cx="84" cy="34" r="6"/>`),
  },
  {
    key: "extension de cuadriceps", label: "Extensión de cuádriceps", group: "Pierna", aliases: ["leg extension", "extension cuadriceps", "extensiones de pierna"],
    svg: s(`<rect x="20" y="30" width="8" height="50" rx="2"/><circle cx="46" cy="34" r="9"/><path d="M46 43 L46 70"/><path d="M46 70 L46 92"/><path d="M46 70 L74 74 L94 62"/><circle cx="98" cy="58" r="6"/>`),
  },
  {
    key: "curl femoral", label: "Curl femoral", group: "Pierna", aliases: ["leg curl", "curl de piernas", "femoral"],
    svg: s(`<rect x="20" y="70" width="76" height="8" rx="2"/><circle cx="36" cy="60" r="9"/><path d="M36 69 L60 78"/><path d="M60 78 L84 78 L92 60"/><circle cx="96" cy="56" r="6"/>`),
  },
  {
    key: "elevacion de talones", label: "Elevación de talones", group: "Pierna", aliases: ["calf raise", "elevacion de gemelos", "pantorrillas"],
    svg: s(`<circle cx="60" cy="22" r="9"/><path d="M60 31 L60 66"/><path d="M60 66 L48 88 L48 100"/><path d="M60 66 L72 88 L72 100"/><path d="M40 100 L56 100 M64 100 L80 100"/>`),
  },
  {
    key: "peso muerto rumano", label: "Peso muerto rumano", group: "Pierna", aliases: ["romanian deadlift", "rdl", "muerto rumano"],
    svg: s(`<circle cx="50" cy="24" r="9"/><path d="M50 33 L50 52 Q50 60 62 62"/><path d="M50 52 L44 90 L44 100"/><path d="M62 62 L66 90 L66 100"/><path d="M62 62 L88 66"/><circle cx="92" cy="66" r="6"/>`),
  },

  // ---- Glúteo ----
  {
    key: "hip thrust", label: "Hip thrust", group: "Glúteo", aliases: ["puente de gluteos con barra", "empuje de cadera"],
    svg: s(`<rect x="10" y="78" width="26" height="8" rx="2"/><circle cx="26" cy="60" r="8"/><path d="M26 68 L52 78 L80 78"/><path d="M52 78 L54 100"/><path d="M80 78 L70 60 M80 78 L94 66"/><path d="M60 60 L88 60"/><circle cx="92" cy="60" r="5"/>`),
  },
  {
    key: "puente de gluteo", label: "Puente de glúteo", group: "Glúteo", aliases: ["glute bridge", "puente de cadera"],
    svg: s(`<circle cx="24" cy="60" r="8"/><path d="M24 68 L48 76 L76 76"/><path d="M48 76 L50 100"/><path d="M76 76 L68 60 M76 76 L88 66"/>`),
  },
  {
    key: "patada de gluteo", label: "Patada de glúteo", group: "Glúteo", aliases: ["glute kickback", "patada de cable", "kickback"],
    svg: s(`<circle cx="28" cy="34" r="8"/><path d="M28 42 L50 60"/><path d="M50 60 L36 78 M50 60 L60 82"/><path d="M50 60 L80 58 L92 44"/><circle cx="96" cy="40" r="5"/>`),
  },
  {
    key: "abduccion de cadera", label: "Abducción de cadera", group: "Glúteo", aliases: ["hip abduction", "abductores en maquina"],
    svg: s(`<rect x="52" y="26" width="8" height="40" rx="2"/><circle cx="56" cy="18" r="8"/><path d="M56 66 L38 90 M56 66 L76 92"/><path d="M38 90 L20 94 M76 92 L94 96"/>`),
  },

  // ---- Abdomen ----
  {
    key: "plancha", label: "Plancha", group: "Abdomen", aliases: ["plank", "plancha abdominal"],
    svg: s(`<circle cx="26" cy="70" r="8"/><path d="M34 70 L92 46"/><path d="M45 72 L34 92 M60 65 L58 92"/><path d="M92 46 L100 60"/>`),
  },
  {
    key: "crunch abdominal", label: "Crunch abdominal", group: "Abdomen", aliases: ["crunch", "abdominales", "encogimientos"],
    svg: s(`<circle cx="30" cy="66" r="8"/><path d="M38 68 Q56 74 66 60"/><path d="M66 60 L88 66 M66 60 L84 46"/><path d="M38 68 L34 90 M38 68 L54 88"/>`),
  },
  {
    key: "elevacion de piernas colgado", label: "Elevación de piernas colgado", group: "Abdomen", aliases: ["hanging leg raise", "elevacion de piernas", "colgado abdominales"],
    svg: s(`<path d="M20 18 L100 18"/><path d="M40 18 L40 30 M80 18 L80 30"/><circle cx="60" cy="42" r="9"/><path d="M60 51 L60 66"/><path d="M60 55 L40 30 M60 55 L80 30"/><path d="M60 66 L46 46 M60 66 L74 46"/>`),
  },
  {
    key: "rueda abdominal", label: "Rueda abdominal", group: "Abdomen", aliases: ["ab wheel", "rodillo abdominal", "ab rollout"],
    svg: s(`<circle cx="34" cy="88" r="10"/><path d="M44 88 L74 60"/><path d="M74 60 L70 40 M74 60 L88 50"/><path d="M74 60 L86 82 L92 100"/>`),
  },
  {
    key: "russian twist", label: "Russian twist", group: "Abdomen", aliases: ["giro ruso", "twist abdominal"],
    svg: s(`<circle cx="60" cy="52" r="9"/><path d="M60 61 L58 82"/><path d="M58 82 L46 100 M58 82 L70 100"/><path d="M60 68 L34 76 M60 68 L86 60"/><circle cx="30" cy="78" r="5"/>`),
  },

  // ---- Hombro ----
  {
    key: "press militar", label: "Press militar", group: "Hombro", aliases: ["press hombro", "overhead press", "press de hombros", "military press"],
    svg: s(`<circle cx="60" cy="30" r="9"/><path d="M60 39 L60 72"/><path d="M60 72 L48 100 M60 72 L72 100"/><path d="M60 45 L60 18"/><path d="M40 18 L80 18"/><circle cx="36" cy="18" r="5"/><circle cx="84" cy="18" r="5"/><path d="M60 45 L42 55 M60 45 L78 55"/>`),
  },
  {
    key: "elevaciones laterales", label: "Elevaciones laterales", group: "Hombro", aliases: ["lateral raise", "elevacion lateral", "vuelos laterales"],
    svg: s(`<circle cx="60" cy="26" r="9"/><path d="M60 35 L60 70"/><path d="M60 70 L48 98 M60 70 L72 98"/><path d="M60 42 L34 34 M60 42 L86 34"/><circle cx="28" cy="33" r="5"/><circle cx="92" cy="33" r="5"/>`),
  },

  // ---- Brazo ----
  {
    key: "curl biceps", label: "Curl de bíceps", group: "Brazo", aliases: ["curl biceps", "bicep curl", "curl de biceps", "curl mancuerna"],
    svg: s(`<circle cx="60" cy="24" r="9"/><path d="M60 33 L60 68"/><path d="M60 68 L48 98 M60 68 L72 98"/><path d="M60 45 L44 58 L38 42"/><path d="M60 45 L76 58"/><circle cx="34" cy="38" r="5"/>`),
  },
  {
    key: "extension triceps", label: "Extensión de tríceps", group: "Brazo", aliases: ["triceps", "tricep extension", "extension de triceps", "press frances"],
    svg: s(`<circle cx="60" cy="26" r="9"/><path d="M60 35 L60 70"/><path d="M60 70 L48 98 M60 70 L72 98"/><path d="M60 42 L74 24 L86 30"/><circle cx="90" cy="28" r="5"/><path d="M60 42 L46 50"/>`),
  },

  // ---- Cuerpo completo ----
  {
    key: "burpees", label: "Burpees", group: "Cuerpo completo", aliases: ["burpee"],
    svg: s(`<circle cx="30" cy="70" r="8"/><path d="M38 70 L70 55 L92 62"/><path d="M50 68 L46 90 M62 60 L60 84"/><path d="M92 62 L100 50"/>`),
  },
];

export const MUSCLE_GROUPS: MuscleGroup[] = ["Pecho", "Espalda", "Pierna", "Glúteo", "Abdomen", "Hombro", "Brazo"];

export function findIllustration(name?: string | null): ExerciseDef | undefined {
  const n = normalize(name);
  if (!n) return undefined;
  return (
    EXERCISE_LIBRARY.find((ex) => n === ex.key || n.includes(ex.key)) ||
    EXERCISE_LIBRARY.find((ex) => ex.aliases.some((a) => n.includes(a)))
  );
}

export function findPhoto(name: string | null | undefined, photos: { exercise_name: string; url: string }[]): string | null {
  const n = normalize(name);
  if (!n) return null;
  const match = photos.find((p) => normalize(p.exercise_name) === n);
  return match ? match.url : null;
}
