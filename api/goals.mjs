import { getDb } from "./_lib/db.mjs";
import { getSession } from "./_lib/session.mjs";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const db = getDb();
  const { id } = req.query;

  if (req.method === "GET") {
    const { data, error } = await db
      .from("goals")
      .select("*")
      .eq("user_id", session.uid)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!body.type || body.targetValue == null || body.targetValue === "") {
      return res.status(400).json({ error: "Falta el tipo o el valor objetivo." });
    }
    if (body.type === "exercise" && !body.exerciseName) {
      return res.status(400).json({ error: "Falta el nombre del ejercicio." });
    }
    const { data, error } = await db
      .from("goals")
      .insert({
        user_id: session.uid,
        type: body.type,
        exercise_name: body.type === "exercise" ? body.exerciseName : null,
        target_value: parseFloat(body.targetValue),
        unit: body.unit === "lb" ? "lb" : "kg",
        target_date: body.targetDate || null,
        notes: body.notes || null,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "Falta el id." });
    const { error } = await db.from("goals").delete().eq("id", id).eq("user_id", session.uid);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
