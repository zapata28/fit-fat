export const todayStr = (): string => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGO = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const fmtDate = (s?: string | null): string => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${parseInt(d, 10)} ${MESES[parseInt(m, 10) - 1]} ${y}`;
};

export const monthKey = (s?: string | null): string => (s ? s.slice(0, 7) : "");

export const fmtMonth = (key: string): string => {
  if (!key) return "";
  const [y, m] = key.split("-");
  return `${MESES_LARGO[parseInt(m, 10) - 1]} ${y}`;
};

export const weekKey = (s?: string | null): string => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
};

export const fmtWeek = (key: string): string => {
  if (!key) return "";
  const [y, w] = key.split("-W");
  return `Semana ${w} · ${y}`;
};

export const normalize = (s?: string | null): string =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const uid = (): string =>
  (crypto as any).randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
