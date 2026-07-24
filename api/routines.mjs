import { getDb } from "./_lib/db.mjs";
import { getSession } from "./_lib/session.mjs";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const db = getDb();

  if (req.method === "GET") {
    const { data, error } = await db.from("routines").select("*").eq("user_id", session.uid).order("created_at", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const { data, error } = await db
      .from("routines")
      .insert({ user_id: session.uid, name: body.name || "Nueva rutina", exercises: body.exercises || [] })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
