import { getDb } from "../_lib/db.mjs";
import { getSession } from "../_lib/session.mjs";

const BUCKET = "exercise-photos";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const { id } = req.query;
  const db = getDb();

  if (req.method === "DELETE") {
    const { data: photo } = await db.from("exercise_photos").select("storage_path").eq("id", id).eq("user_id", session.uid).maybeSingle();
    const { error } = await db.from("exercise_photos").delete().eq("id", id).eq("user_id", session.uid);
    if (error) return res.status(500).json({ error: error.message });
    if (photo?.storage_path) await db.storage.from(BUCKET).remove([photo.storage_path]).catch(() => {});
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
