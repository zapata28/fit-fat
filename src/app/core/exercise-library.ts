import { normalize, levenshtein } from "./utils";

export type MuscleGroup = "Pecho" | "Espalda" | "Pierna" | "Glúteo" | "Abdomen" | "Hombro" | "Bíceps" | "Tríceps" | "Antebrazo" | "Cuerpo completo";

export interface ExerciseDef {
  key: string;
  label: string;
  group: MuscleGroup;
  aliases: string[];
}

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // ---- Pecho ----
  {
    key: "press banca", label: "Press banca", group: "Pecho", aliases: ["press de banca", "bench press", "press pecho", "banca plana"],
  },
  {
    key: "press inclinado", label: "Press inclinado", group: "Pecho", aliases: ["incline press", "press banca inclinado", "inclinado con mancuernas"],
  },
  {
    key: "aperturas con mancuernas", label: "Aperturas con mancuernas", group: "Pecho", aliases: ["flyes", "dumbbell flyes", "aperturas pecho", "cristo con mancuernas"],
  },
  {
    key: "fondos en paralelas", label: "Fondos en paralelas", group: "Pecho", aliases: ["dips", "fondos", "parallel bar dips"],
  },
  {
    key: "cruce de poleo", label: "Cruce de poleo", group: "Pecho", aliases: ["cable crossover", "poleas pecho", "cruces en polea"],
  },
  {
    key: "flexiones", label: "Flexiones", group: "Pecho", aliases: ["push up", "push-up", "lagartijas", "flexiones de pecho", "flexiones de brazos"],
  },

  // ---- Espalda ----
  {
    key: "peso muerto", label: "Peso muerto", group: "Espalda", aliases: ["deadlift", "levantamiento muerto"],
  },
  {
    key: "dominadas", label: "Dominadas", group: "Espalda", aliases: ["pull up", "pull-up", "pullup", "jalon dominadas"],
  },
  {
    key: "jalon al pecho", label: "Jalón al pecho", group: "Espalda", aliases: ["lat pulldown", "jalon polea", "jalon dorsal"],
  },
  {
    key: "remo con barra", label: "Remo con barra", group: "Espalda", aliases: ["remo", "barbell row", "remo inclinado"],
  },
  {
    key: "remo con mancuerna", label: "Remo con mancuerna", group: "Espalda", aliases: ["one arm row", "remo unilateral", "remo a una mano"],
  },
  {
    key: "remo en polea", label: "Remo en polea", group: "Espalda", aliases: ["seated cable row", "remo sentado", "remo polea baja"],
  },
  {
    key: "pull-over", label: "Pull-over", group: "Espalda", aliases: ["pullover", "press de pullover"],
  },

  // ---- Pierna ----
  {
    key: "sentadilla", label: "Sentadilla", group: "Pierna", aliases: ["squat", "sentadillas", "back squat", "sentadilla libre"],
  },
  {
    key: "zancadas", label: "Zancadas", group: "Pierna", aliases: ["lunges", "estocadas", "zancada"],
  },
  {
    key: "sentadilla bulgara", label: "Sentadilla búlgara", group: "Pierna", aliases: ["bulgarian split squat", "sentadilla búlgara", "zancada bulgara"],
  },
  {
    key: "prensa de piernas", label: "Prensa de piernas", group: "Pierna", aliases: ["leg press", "prensa"],
  },
  {
    key: "extension de cuadriceps", label: "Extensión de cuádriceps", group: "Pierna", aliases: ["leg extension", "extension cuadriceps", "extensiones de pierna", "extension de piernas"],
  },
  {
    key: "curl femoral", label: "Curl femoral", group: "Pierna", aliases: ["leg curl", "curl de piernas", "femoral"],
  },
  {
    key: "elevacion de talones", label: "Elevación de talones", group: "Pierna", aliases: ["calf raise", "elevacion de gemelos", "pantorrillas"],
  },
  {
    key: "peso muerto rumano", label: "Peso muerto rumano", group: "Pierna", aliases: ["romanian deadlift", "rdl", "muerto rumano"],
  },

  // ---- Glúteo ----
  {
    key: "hip thrust", label: "Hip thrust", group: "Glúteo", aliases: ["puente de gluteos con barra", "empuje de cadera"],
  },
  {
    key: "puente de gluteo", label: "Puente de glúteo", group: "Glúteo", aliases: ["glute bridge", "puente de cadera"],
  },
  {
    key: "patada de gluteo", label: "Patada de glúteo", group: "Glúteo", aliases: ["glute kickback", "patada de cable", "kickback"],
  },
  {
    key: "abduccion de cadera", label: "Abducción de cadera", group: "Glúteo", aliases: ["hip abduction", "abductores en maquina"],
  },

  // ---- Abdomen ----
  {
    key: "plancha", label: "Plancha", group: "Abdomen", aliases: ["plank", "plancha abdominal"],
  },
  {
    key: "crunch abdominal", label: "Crunch abdominal", group: "Abdomen", aliases: ["crunch", "abdominales"],
  },
  {
    key: "elevacion de piernas colgado", label: "Elevación de piernas colgado", group: "Abdomen", aliases: ["hanging leg raise", "elevacion de piernas", "colgado abdominales"],
  },
  {
    key: "rueda abdominal", label: "Rueda abdominal", group: "Abdomen", aliases: ["ab wheel", "rodillo abdominal", "ab rollout"],
  },
  {
    key: "russian twist", label: "Russian twist", group: "Abdomen", aliases: ["giro ruso", "twist abdominal"],
  },

  // ---- Hombro ----
  {
    key: "press militar", label: "Press militar", group: "Hombro", aliases: ["press hombro", "overhead press", "press de hombros", "military press"],
  },
  {
    key: "elevaciones laterales", label: "Elevaciones laterales", group: "Hombro", aliases: ["lateral raise", "elevacion lateral", "vuelos laterales"],
  },
  {
    key: "elevaciones frontales", label: "Elevaciones frontales", group: "Hombro", aliases: ["front raise", "elevacion frontal", "elevacion de hombro al frente"],
  },
  {
    key: "pajaros", label: "Pájaros (reverse fly)", group: "Hombro", aliases: ["reverse fly", "pajaro", "vuelo posterior", "deltoide posterior", "aperturas invertidas"],
  },
  {
    key: "face pull", label: "Face pull", group: "Hombro", aliases: ["jalon a la cara", "face pull polea", "jalon facial"],
  },
  {
    key: "encogimientos", label: "Encogimientos", group: "Hombro", aliases: ["shrugs", "encogimiento de hombros", "trapecio shrugs", "encogimientos de trapecio"],
  },

  // ---- Bíceps ----
  {
    key: "curl biceps", label: "Curl de bíceps", group: "Bíceps", aliases: ["curl biceps", "bicep curl", "curl de biceps", "curl mancuerna"],
  },
  {
    key: "curl con barra", label: "Curl con barra", group: "Bíceps", aliases: ["barbell curl", "curl barra recta", "curl de biceps con barra"],
  },
  {
    key: "curl banco scott", label: "Curl banco Scott", group: "Bíceps", aliases: ["preacher curl", "curl scott", "banco predicador", "curl predicador"],
  },
  {
    key: "curl martillo", label: "Curl martillo", group: "Bíceps", aliases: ["hammer curl", "curl neutro"],
  },
  {
    key: "curl concentrado", label: "Curl concentrado", group: "Bíceps", aliases: ["concentration curl", "curl banco"],
  },

  // ---- Tríceps ----
  {
    key: "extension triceps", label: "Extensión de tríceps", group: "Tríceps", aliases: ["triceps", "tricep extension", "extension de triceps", "press frances"],
  },
  {
    key: "extension en polea", label: "Extensión en polea", group: "Tríceps", aliases: ["tricep pushdown", "jalon triceps", "polea triceps"],
  },
  {
    key: "patada de triceps", label: "Patada de tríceps", group: "Tríceps", aliases: ["triceps kickback", "kickback triceps"],
  },

  // ---- Cuerpo completo ----
  {
    key: "burpees", label: "Burpees", group: "Cuerpo completo", aliases: ["burpee"],
  },

  // ==== Ampliacion masiva (lista de 168 ejercicios) ====
  {
    key: "press de banca plano con barra", label: "Press de banca plano con barra", group: "Pecho", aliases: [],
  },
  {
    key: "press de banca plano con mancuernas", label: "Press de banca plano con mancuernas", group: "Pecho", aliases: [],
  },
  {
    key: "press inclinado con barra", label: "Press inclinado con barra", group: "Pecho", aliases: [],
  },
  {
    key: "press inclinado con mancuernas", label: "Press inclinado con mancuernas", group: "Pecho", aliases: [],
  },
  {
    key: "press declinado con barra", label: "Press declinado con barra", group: "Pecho", aliases: ["press declinado barra"],
  },
  {
    key: "press declinado con mancuernas", label: "Press declinado con mancuernas", group: "Pecho", aliases: ["press declinado mancuernas"],
  },
  {
    key: "aperturas inclinadas", label: "Aperturas inclinadas", group: "Pecho", aliases: [],
  },
  {
    key: "aperturas declinadas", label: "Aperturas declinadas", group: "Pecho", aliases: [],
  },
  {
    key: "cruce de poleas alto", label: "Cruce de poleas alto", group: "Pecho", aliases: [],
  },
  {
    key: "cruce de poleas medio", label: "Cruce de poleas medio", group: "Pecho", aliases: [],
  },
  {
    key: "cruce de poleas bajo", label: "Cruce de poleas bajo", group: "Pecho", aliases: [],
  },
  {
    key: "pec deck", label: "Pec Deck", group: "Pecho", aliases: ["pec-deck", "contractora de pecho"],
  },
  {
    key: "fondos para pecho", label: "Fondos para pecho", group: "Pecho", aliases: [],
  },
  {
    key: "flexiones tradicionales", label: "Flexiones tradicionales", group: "Pecho", aliases: [],
  },
  {
    key: "flexiones abiertas", label: "Flexiones abiertas", group: "Pecho", aliases: [],
  },
  {
    key: "press convergente", label: "Press convergente", group: "Pecho", aliases: ["press convergente maquina"],
  },
  {
    key: "press en maquina hammer", label: "Press en máquina Hammer", group: "Pecho", aliases: ["hammer press pecho"],
  },
  {
    key: "dominadas pronas", label: "Dominadas pronas", group: "Espalda", aliases: [],
  },
  {
    key: "dominadas supinas", label: "Dominadas supinas", group: "Espalda", aliases: ["chin up", "chin-up"],
  },
  {
    key: "dominadas neutras", label: "Dominadas neutras", group: "Espalda", aliases: [],
  },
  {
    key: "jalon tras nuca", label: "Jalón tras nuca", group: "Espalda", aliases: ["jalon nuca"],
  },
  {
    key: "jalon con agarre cerrado", label: "Jalón con agarre cerrado", group: "Espalda", aliases: ["jalon agarre cerrado"],
  },
  {
    key: "jalon unilateral", label: "Jalón unilateral", group: "Espalda", aliases: [],
  },
  {
    key: "pullover en polea", label: "Pullover en polea", group: "Espalda", aliases: [],
  },
  {
    key: "pullover con mancuerna", label: "Pullover con mancuerna", group: "Espalda", aliases: [],
  },
  {
    key: "remo pendlay", label: "Remo Pendlay", group: "Espalda", aliases: ["pendlay row"],
  },
  {
    key: "remo t-bar", label: "Remo T-Bar", group: "Espalda", aliases: ["t-bar row", "remo t bar"],
  },
  {
    key: "remo sentado en polea", label: "Remo sentado en polea", group: "Espalda", aliases: [],
  },
  {
    key: "remo hammer", label: "Remo Hammer", group: "Espalda", aliases: ["hammer row", "remo maquina hammer"],
  },
  {
    key: "remo invertido", label: "Remo invertido", group: "Espalda", aliases: ["inverted row"],
  },
  {
    key: "peso muerto convencional", label: "Peso muerto convencional", group: "Espalda", aliases: [],
  },
  {
    key: "peso muerto sumo", label: "Peso muerto sumo", group: "Espalda", aliases: ["sumo deadlift"],
  },
  {
    key: "buenos dias", label: "Buenos días", group: "Espalda", aliases: ["good morning"],
  },
  {
    key: "hiperextensiones", label: "Hiperextensiones", group: "Espalda", aliases: ["hiperextension", "banco romano"],
  },
  {
    key: "press arnold", label: "Press Arnold", group: "Hombro", aliases: ["arnold press"],
  },
  {
    key: "press con mancuernas", label: "Press con mancuernas", group: "Hombro", aliases: ["press hombro mancuernas"],
  },
  {
    key: "press en maquina de hombro", label: "Press en máquina de hombro", group: "Hombro", aliases: ["press hombro maquina"],
  },
  {
    key: "elevaciones frontales con disco", label: "Elevaciones frontales con disco", group: "Hombro", aliases: ["elevacion frontal disco"],
  },
  {
    key: "elevaciones laterales en polea", label: "Elevaciones laterales en polea", group: "Hombro", aliases: [],
  },
  {
    key: "elevaciones laterales sentado", label: "Elevaciones laterales sentado", group: "Hombro", aliases: [],
  },
  {
    key: "elevaciones laterales inclinadas", label: "Elevaciones laterales inclinadas", group: "Hombro", aliases: [],
  },
  {
    key: "reverse pec deck", label: "Reverse Pec Deck", group: "Hombro", aliases: ["reverse pec deck", "contractora inversa"],
  },
  {
    key: "remo al cuello", label: "Remo al cuello", group: "Hombro", aliases: ["upright row cuello"],
  },
  {
    key: "remo alto en polea", label: "Remo alto en polea", group: "Hombro", aliases: ["upright row polea"],
  },
  {
    key: "encogimientos con barra", label: "Encogimientos con barra", group: "Hombro", aliases: [],
  },
  {
    key: "encogimientos con mancuernas", label: "Encogimientos con mancuernas", group: "Hombro", aliases: [],
  },
  {
    key: "encogimientos en maquina", label: "Encogimientos en máquina", group: "Hombro", aliases: [],
  },
  {
    key: "curl ez", label: "Curl EZ", group: "Bíceps", aliases: ["curl barra ez", "ez bar curl"],
  },
  {
    key: "curl alterno", label: "Curl alterno", group: "Bíceps", aliases: ["alternating curl"],
  },
  {
    key: "curl inclinado", label: "Curl inclinado", group: "Bíceps", aliases: ["incline curl"],
  },
  {
    key: "curl scott en maquina", label: "Curl Scott en máquina", group: "Bíceps", aliases: ["preacher curl maquina"],
  },
  {
    key: "curl en polea", label: "Curl en polea", group: "Bíceps", aliases: ["cable curl"],
  },
  {
    key: "curl inverso", label: "Curl inverso", group: "Bíceps", aliases: ["reverse curl"],
  },
  {
    key: "curl arana", label: "Curl araña", group: "Bíceps", aliases: ["spider curl"],
  },
  {
    key: "curl predicador", label: "Curl predicador", group: "Bíceps", aliases: [],
  },
  {
    key: "press cerrado", label: "Press cerrado", group: "Tríceps", aliases: ["close grip bench press", "press banca agarre cerrado"],
  },
  {
    key: "extension con cuerda", label: "Extensión con cuerda", group: "Tríceps", aliases: ["rope pushdown"],
  },
  {
    key: "extension sobre la cabeza", label: "Extensión sobre la cabeza", group: "Tríceps", aliases: ["overhead extension"],
  },
  {
    key: "extension unilateral", label: "Extensión unilateral", group: "Tríceps", aliases: [],
  },
  {
    key: "fondos", label: "Fondos", group: "Tríceps", aliases: [],
  },
  {
    key: "press jm", label: "Press JM", group: "Tríceps", aliases: ["jm press"],
  },
  {
    key: "curl de muneca", label: "Curl de muñeca", group: "Antebrazo", aliases: ["wrist curl"],
  },
  {
    key: "curl de muneca inverso", label: "Curl de muñeca inverso", group: "Antebrazo", aliases: ["reverse wrist curl"],
  },
  {
    key: "farmer walk", label: "Farmer Walk", group: "Antebrazo", aliases: ["farmer's walk", "caminata del granjero"],
  },
  {
    key: "wrist roller", label: "Wrist Roller", group: "Antebrazo", aliases: ["rodillo de muñeca"],
  },
  {
    key: "pinch grip", label: "Pinch Grip", group: "Antebrazo", aliases: ["agarre pellizco"],
  },
  {
    key: "sentadilla trasera", label: "Sentadilla trasera", group: "Pierna", aliases: ["back squat"],
  },
  {
    key: "sentadilla frontal", label: "Sentadilla frontal", group: "Pierna", aliases: ["front squat"],
  },
  {
    key: "sentadilla hack", label: "Sentadilla Hack", group: "Pierna", aliases: ["hack squat"],
  },
  {
    key: "sentadilla goblet", label: "Sentadilla Goblet", group: "Pierna", aliases: ["goblet squat"],
  },
  {
    key: "sentadilla zercher", label: "Sentadilla Zercher", group: "Pierna", aliases: ["zercher squat"],
  },
  {
    key: "sentadilla sissy", label: "Sentadilla Sissy", group: "Pierna", aliases: ["sissy squat"],
  },
  {
    key: "prensa unilateral", label: "Prensa unilateral", group: "Pierna", aliases: [],
  },
  {
    key: "zancadas caminando", label: "Zancadas caminando", group: "Pierna", aliases: ["walking lunges"],
  },
  {
    key: "split squat", label: "Split Squat", group: "Pierna", aliases: [],
  },
  {
    key: "step up", label: "Step Up", group: "Pierna", aliases: ["subida al cajon"],
  },
  {
    key: "peso muerto piernas rigidas", label: "Peso muerto piernas rígidas", group: "Pierna", aliases: ["stiff leg deadlift"],
  },
  {
    key: "curl femoral acostado", label: "Curl femoral acostado", group: "Pierna", aliases: ["lying leg curl"],
  },
  {
    key: "curl femoral sentado", label: "Curl femoral sentado", group: "Pierna", aliases: ["seated leg curl"],
  },
  {
    key: "curl femoral de pie", label: "Curl femoral de pie", group: "Pierna", aliases: ["standing leg curl"],
  },
  {
    key: "nordic curl", label: "Nordic Curl", group: "Pierna", aliases: ["nordic hamstring curl"],
  },
  {
    key: "pull through", label: "Pull Through", group: "Glúteo", aliases: ["pull-through"],
  },
  {
    key: "monster walk", label: "Monster Walk", group: "Glúteo", aliases: ["monster walk banda"],
  },
  {
    key: "maquina aductora", label: "Máquina aductora", group: "Pierna", aliases: ["adductor machine"],
  },
  {
    key: "aductores con polea", label: "Aductores con polea", group: "Pierna", aliases: ["cable adductor"],
  },
  {
    key: "copenhagen plank", label: "Copenhagen Plank", group: "Pierna", aliases: ["plancha copenhague"],
  },
  {
    key: "maquina abductora", label: "Máquina abductora", group: "Glúteo", aliases: ["abductor machine"],
  },
  {
    key: "abduccion en polea", label: "Abducción en polea", group: "Glúteo", aliases: ["cable abduction"],
  },
  {
    key: "caminata lateral con banda", label: "Caminata lateral con banda", group: "Glúteo", aliases: ["lateral band walk"],
  },
  {
    key: "elevacion de talones de pie", label: "Elevación de talones de pie", group: "Pierna", aliases: ["standing calf raise"],
  },
  {
    key: "elevacion sentado", label: "Elevación sentado", group: "Pierna", aliases: ["seated calf raise"],
  },
  {
    key: "donkey calf raise", label: "Donkey Calf Raise", group: "Pierna", aliases: [],
  },
  {
    key: "gemelos en prensa", label: "Gemelos en prensa", group: "Pierna", aliases: ["leg press calf raise"],
  },
  {
    key: "crunch en maquina", label: "Crunch en máquina", group: "Abdomen", aliases: ["machine crunch"],
  },
  {
    key: "crunch en polea", label: "Crunch en polea", group: "Abdomen", aliases: ["cable crunch"],
  },
  {
    key: "crunch inverso", label: "Crunch inverso", group: "Abdomen", aliases: ["reverse crunch"],
  },
  {
    key: "sit up", label: "Sit Up", group: "Abdomen", aliases: ["situp"],
  },
  {
    key: "elevacion de piernas", label: "Elevación de piernas", group: "Abdomen", aliases: [],
  },
  {
    key: "elevacion de rodillas", label: "Elevación de rodillas", group: "Abdomen", aliases: ["knee raise"],
  },
  {
    key: "dragon flag", label: "Dragon Flag", group: "Abdomen", aliases: [],
  },
  {
    key: "woodchopper", label: "Woodchopper", group: "Abdomen", aliases: ["wood chopper"],
  },
  {
    key: "side crunch", label: "Side Crunch", group: "Abdomen", aliases: ["crunch lateral"],
  },
  {
    key: "side bend", label: "Side Bend", group: "Abdomen", aliases: ["flexion lateral con mancuerna"],
  },
  {
    key: "plancha lateral", label: "Plancha lateral", group: "Abdomen", aliases: ["side plank"],
  },
  {
    key: "plancha con peso", label: "Plancha con peso", group: "Abdomen", aliases: ["weighted plank"],
  },
  {
    key: "dead bug", label: "Dead Bug", group: "Abdomen", aliases: [],
  },
  {
    key: "bird dog", label: "Bird Dog", group: "Abdomen", aliases: [],
  },
  {
    key: "hollow hold", label: "Hollow Hold", group: "Abdomen", aliases: [],
  },
  {
    key: "mountain climbers", label: "Mountain Climbers", group: "Abdomen", aliases: ["escaladores"],
  },
  {
    key: "caminadora", label: "Caminadora", group: "Cuerpo completo", aliases: ["cinta de correr", "treadmill"],
  },
  {
    key: "bicicleta estatica", label: "Bicicleta estática", group: "Cuerpo completo", aliases: ["bici estatica", "stationary bike"],
  },
  {
    key: "eliptica", label: "Elíptica", group: "Cuerpo completo", aliases: ["eliptica", "elliptical"],
  },
  {
    key: "remo (cardio)", label: "Remo (cardio)", group: "Cuerpo completo", aliases: ["rowing machine", "maquina de remo"],
  },
  {
    key: "escaladora", label: "Escaladora", group: "Cuerpo completo", aliases: ["stair master", "stairmaster"],
  },
  {
    key: "assault bike", label: "Assault Bike", group: "Cuerpo completo", aliases: ["bici de asalto"],
  },
  {
    key: "saltar cuerda", label: "Saltar cuerda", group: "Cuerpo completo", aliases: ["jump rope", "cuerda"],
  },
  {
    key: "sprint", label: "Sprint", group: "Cuerpo completo", aliases: ["sprints"],
  },
  {
    key: "battle ropes", label: "Battle Ropes", group: "Cuerpo completo", aliases: ["cuerdas de batalla"],
  },
  {
    key: "clean", label: "Clean", group: "Cuerpo completo", aliases: ["cargada"],
  },
  {
    key: "power clean", label: "Power Clean", group: "Cuerpo completo", aliases: [],
  },
  {
    key: "hang clean", label: "Hang Clean", group: "Cuerpo completo", aliases: [],
  },
  {
    key: "snatch", label: "Snatch", group: "Cuerpo completo", aliases: ["arranque"],
  },
  {
    key: "push press", label: "Push Press", group: "Cuerpo completo", aliases: [],
  },
  {
    key: "push jerk", label: "Push Jerk", group: "Cuerpo completo", aliases: [],
  },
  {
    key: "split jerk", label: "Split Jerk", group: "Cuerpo completo", aliases: [],
  },
  {
    key: "thruster", label: "Thruster", group: "Cuerpo completo", aliases: ["thrusters"],
  },
  {
    key: "kettlebell swing", label: "Kettlebell Swing", group: "Cuerpo completo", aliases: ["swing con pesa rusa"],
  },
  {
    key: "turkish get up", label: "Turkish Get Up", group: "Cuerpo completo", aliases: ["turkish get-up", "levantada turca"],
  },
  {
    key: "sled push", label: "Sled Push", group: "Cuerpo completo", aliases: ["empuje de trineo"],
  },
  {
    key: "sled pull", label: "Sled Pull", group: "Cuerpo completo", aliases: ["jalon de trineo"],
  },
  {
    key: "box jump", label: "Box Jump", group: "Cuerpo completo", aliases: ["salto a cajon"],
  },
  {
    key: "wall ball", label: "Wall Ball", group: "Cuerpo completo", aliases: ["balon a la pared"],
  },
  {
    key: "bear crawl", label: "Bear Crawl", group: "Cuerpo completo", aliases: ["caminata del oso"],
  },
  {
    key: "rope climb", label: "Rope Climb", group: "Cuerpo completo", aliases: ["escalada de cuerda"],
  },
];

export const MUSCLE_GROUPS: MuscleGroup[] = ["Pecho", "Espalda", "Pierna", "Glúteo", "Abdomen", "Hombro", "Bíceps", "Tríceps", "Antebrazo", "Cuerpo completo"];

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

export type ExerciseSuggestion =
  | { kind: "exercise"; def: ExerciseDef }
  | { kind: "group"; group: MuscleGroup; examples: string[] };

// Detecta errores de tipeo cercanos a un ejercicio conocido o a un grupo
// muscular (p. ej. "pecjho" -> "Pecho", que es un grupo, no un ejercicio).
export function suggestFix(name?: string | null): ExerciseSuggestion | null {
  const n = normalize(name);
  if (!n || n.length < 4) return null;
  if (findIllustration(name)) return null; // ya se reconoce, no hace falta sugerir

  let bestGroup: { group: MuscleGroup; dist: number } | null = null;
  for (const g of MUSCLE_GROUPS) {
    if (g === "Cuerpo completo") continue;
    const d = levenshtein(n, normalize(g));
    if (d <= 2 && (!bestGroup || d < bestGroup.dist)) bestGroup = { group: g, dist: d };
  }
  if (bestGroup) {
    const examples = EXERCISE_LIBRARY.filter((e) => e.group === bestGroup!.group)
      .slice(0, 3)
      .map((e) => e.label);
    return { kind: "group", group: bestGroup.group, examples };
  }

  let bestEx: { def: ExerciseDef; dist: number } | null = null;
  for (const ex of EXERCISE_LIBRARY) {
    const d = Math.min(levenshtein(n, ex.key), levenshtein(n, normalize(ex.label)));
    if (d <= 2 && (!bestEx || d < bestEx.dist)) bestEx = { def: ex, dist: d };
  }
  if (bestEx) return { kind: "exercise", def: bestEx.def };

  return null;
}
