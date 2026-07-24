import { getDb } from "./_lib/db.mjs";
import { getSession } from "./_lib/session.mjs";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const db = getDb();

  if (req.method === "GET") {
    const { data, error } = await db
      .from("sessions")
      .select("*")
      .eq("user_id", session.uid)
      .order("date", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!body.date || !Array.isArray(body.exercises) || body.exercises.length === 0) {
      return res.status(400).json({ error: "Faltan datos de la sesión." });
    }
    const { data, error } = await db
      .from("sessions")
      .insert({
        user_id: session.uid,
        date: body.date,
        routine_id: body.routineId || null,
        routine_name: body.routineName || null,
        exercises: body.exercises,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
