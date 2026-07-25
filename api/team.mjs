import { getDb } from "./_lib/db.mjs";
import { getSession } from "./_lib/session.mjs";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const db = getDb();

  // Quién puede ver quién: yo siempre me veo a mí, y veo a quien me haya
  // compartido sus datos (shares donde viewer_id = yo).
  const { data: grants, error: gErr } = await db.from("shares").select("owner_id").eq("viewer_id", session.uid);
  if (gErr) return res.status(500).json({ error: gErr.message });

  const visibleIds = new Set([session.uid, ...(grants || []).map((g) => g.owner_id)]);

  const [{ data: users, error: uErr }, { data: measurements, error: mErr }, { data: sessions, error: sErr }] = await Promise.all([
    db.from("users").select("id, username").in("id", Array.from(visibleIds)),
    db.from("measurements").select("*").in("user_id", Array.from(visibleIds)).order("date", { ascending: true }),
    db.from("sessions").select("*").in("user_id", Array.from(visibleIds)).order("date", { ascending: false }),
  ]);

  if (uErr || mErr || sErr) {
    return res.status(500).json({ error: (uErr || mErr || sErr).message });
  }

  const team = (users || []).map((u) => {
    const myMeasurements = (measurements || []).filter((m) => m.user_id === u.id);
    const latest = myMeasurements[myMeasurements.length - 1] || null;
    const weightSeries = myMeasurements
      .filter((m) => m.weight !== null && m.weight !== undefined)
      .map((m) => ({ date: m.date, weight: m.weight }));

    const mySessions = (sessions || []).filter((s) => s.user_id === u.id);

    const maxByExercise = {};
    for (const s of [...mySessions].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const ex of s.exercises || []) {
        for (const set of ex.sets || []) {
          const w = parseFloat(set.weight);
          if (!isFinite(w)) continue;
          if (!maxByExercise[ex.name] || w > maxByExercise[ex.name].weight) {
            maxByExercise[ex.name] = { weight: w, date: s.date };
          }
        }
      }
    }
    const prs = Object.entries(maxByExercise)
      .map(([name, v]) => ({ name, weight: v.weight, date: v.date }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return {
      username: u.username,
      isMe: u.id === session.uid,
      latestWeight: latest ? latest.weight : null,
      latestDate: latest ? latest.date : null,
      weightSeries,
      prs,
      recentSessions: mySessions.slice(0, 3).map((s) => ({
        date: s.date,
        routineName: s.routine_name,
        exerciseCount: (s.exercises || []).length,
      })),
      trainingDates: Array.from(new Set(mySessions.map((s) => s.date))),
      sessionCount: mySessions.length,
    };
  });

  team.sort((a, b) => (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0) || b.sessionCount - a.sessionCount);
  return res.status(200).json(team);
}
