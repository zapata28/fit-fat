import { getDb } from "../_lib/db.mjs";
import { getSession } from "../_lib/session.mjs";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const { id } = req.query;
  const db = getDb();

  if (req.method === "PUT") {
    const body = req.body || {};
    const { data, error } = await db
      .from("routines")
      .update({ name: body.name, exercises: body.exercises })
      .eq("id", id)
      .eq("user_id", session.uid)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    const { error } = await db.from("routines").delete().eq("id", id).eq("user_id", session.uid);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
