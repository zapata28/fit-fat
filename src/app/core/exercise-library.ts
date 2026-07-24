import { normalize } from "./utils";

export interface ExerciseDef {
  key: string;
  label: string;
  aliases: string[];
  svg: string; // inline <svg> markup, trusted/static content authored by us
}

const s = (inner: string) =>
  `<svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  {
    key: "sentadilla", label: "Sentadilla", aliases: ["squat", "sentadillas", "back squat", "sentadilla libre"],
    svg: s(`<circle cx="60" cy="24" r="9"/><path d="M60 33 L60 60"/><path d="M60 60 L45 90 M60 60 L75 90"/><path d="M45 90 L40 100 M75 90 L80 100"/><path d="M38 45 L82 45"/><circle cx="34" cy="45" r="5"/><circle cx="86" cy="45" r="5"/><path d="M44 55 L34 68 M76 55 L86 68"/>`),
  },
  {
    key: "press banca", label: "Press banca", aliases: ["press de banca", "bench press", "press pecho", "banca plana"],
    svg: s(`<rect x="30" y="70" width="60" height="8" rx="2"/><rect x="34" y="78" width="8" height="16"/><rect x="78" y="78" width="8" height="16"/><circle cx="60" cy="40" r="9"/><path d="M60 49 L60 68"/><path d="M60 55 L28 50 M60 55 L92 50"/><circle cx="24" cy="49" r="6"/><circle cx="96" cy="49" r="6"/><path d="M50 68 L46 70 M70 68 L74 70"/>`),
  },
  {
    key: "peso muerto", label: "Peso muerto", aliases: ["deadlift", "levantamiento muerto"],
    svg: s(`<circle cx="46" cy="22" r="9"/><path d="M46 31 L46 55 Q46 65 60 68 L74 70"/><path d="M46 55 L36 95"/><path d="M60 68 L66 95"/><path d="M60 60 L82 60"/><circle cx="30" cy="60" r="6"/><circle cx="88" cy="60" r="6"/><path d="M46 40 L30 58 M46 45 L88 58"/>`),
  },
  {
    key: "dominadas", label: "Dominadas", aliases: ["pull up", "pull-up", "pullup", "jalon dominadas"],
    svg: s(`<path d="M20 20 L100 20"/><path d="M35 20 L35 32 M85 20 L85 32"/><circle cx="60" cy="45" r="9"/><path d="M60 54 L60 78"/><path d="M60 60 L35 32 M60 60 L85 32"/><path d="M60 78 L48 100 M60 78 L72 100"/>`),
  },
  {
    key: "remo con barra", label: "Remo con barra", aliases: ["remo", "barbell row", "remo inclinado"],
    svg: s(`<circle cx="34" cy="32" r="9"/><path d="M34 41 L58 70"/><path d="M58 70 L50 100 M58 70 L72 96"/><path d="M40 55 L86 76"/><circle cx="90" cy="80" r="6"/><path d="M40 55 L38 72"/>`),
  },
  {
    key: "press militar", label: "Press militar", aliases: ["press hombro", "overhead press", "press de hombros", "military press"],
    svg: s(`<circle cx="60" cy="30" r="9"/><path d="M60 39 L60 72"/><path d="M60 72 L48 100 M60 72 L72 100"/><path d="M60 45 L60 18"/><path d="M40 18 L80 18"/><circle cx="36" cy="18" r="5"/><circle cx="84" cy="18" r="5"/><path d="M60 45 L42 55 M60 45 L78 55"/>`),
  },
  {
    key: "curl biceps", label: "Curl de bíceps", aliases: ["curl biceps", "bicep curl", "curl de biceps", "curl mancuerna"],
    svg: s(`<circle cx="60" cy="24" r="9"/><path d="M60 33 L60 68"/><path d="M60 68 L48 98 M60 68 L72 98"/><path d="M60 45 L44 58 L38 42"/><path d="M60 45 L76 58"/><circle cx="34" cy="38" r="5"/>`),
  },
  {
    key: "extension triceps", label: "Extensión de tríceps", aliases: ["triceps", "tricep extension", "extension de triceps", "press frances"],
    svg: s(`<circle cx="60" cy="26" r="9"/><path d="M60 35 L60 70"/><path d="M60 70 L48 98 M60 70 L72 98"/><path d="M60 42 L74 24 L86 30"/><circle cx="90" cy="28" r="5"/><path d="M60 42 L46 50"/>`),
  },
  {
    key: "zancadas", label: "Zancadas", aliases: ["lunges", "estocadas", "zancada"],
    svg: s(`<circle cx="52" cy="24" r="9"/><path d="M52 33 L58 60"/><path d="M58 60 L38 78 L34 100"/><path d="M58 60 L78 72 L86 96"/><path d="M40 45 L58 50 M58 50 L74 42"/>`),
  },
  {
    key: "plancha", label: "Plancha", aliases: ["plank", "plancha abdominal"],
    svg: s(`<circle cx="26" cy="70" r="8"/><path d="M34 70 L92 46"/><path d="M45 72 L34 92 M60 65 L58 92"/><path d="M92 46 L100 60"/>`),
  },
  {
    key: "prensa de piernas", label: "Prensa de piernas", aliases: ["leg press", "prensa"],
    svg: s(`<rect x="16" y="40" width="10" height="46" rx="3"/><circle cx="52" cy="52" r="9"/><path d="M52 61 L52 78"/><path d="M52 78 L30 66 M52 78 L30 90"/><path d="M30 66 L26 60 M30 90 L26 84"/><path d="M84 40 L84 92"/><circle cx="84" cy="34" r="6"/>`),
  },
  {
    key: "elevaciones laterales", label: "Elevaciones laterales", aliases: ["lateral raise", "elevacion lateral", "vuelos laterales"],
    svg: s(`<circle cx="60" cy="26" r="9"/><path d="M60 35 L60 70"/><path d="M60 70 L48 98 M60 70 L72 98"/><path d="M60 42 L34 34 M60 42 L86 34"/><circle cx="28" cy="33" r="5"/><circle cx="92" cy="33" r="5"/>`),
  },
  {
    key: "hip thrust", label: "Hip thrust", aliases: ["puente de gluteos", "empuje de cadera", "gluteo bridge"],
    svg: s(`<rect x="10" y="78" width="26" height="8" rx="2"/><circle cx="26" cy="60" r="8"/><path d="M26 68 L52 78 L80 78"/><path d="M52 78 L54 100"/><path d="M80 78 L70 60 M80 78 L94 66"/><path d="M60 60 L88 60"/><circle cx="92" cy="60" r="5"/>`),
  },
  {
    key: "burpees", label: "Burpees", aliases: ["burpee"],
    svg: s(`<circle cx="30" cy="70" r="8"/><path d="M38 70 L70 55 L92 62"/><path d="M50 68 L46 90 M62 60 L60 84"/><path d="M92 62 L100 50"/>`),
  },
];

export function findIllustration(name?: string | null): ExerciseDef | undefined {
  const n = normalize(name);
  if (!n) return undefined;
  return (
    EXERCISE_LIBRARY.find((ex) => n === ex.key || n.includes(ex.key)) ||
    EXERCISE_LIBRARY.find((ex) => ex.aliases.some((a) => n.includes(a)))
  );
}
