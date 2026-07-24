import { getDb } from "./_lib/db.mjs";
import { getSession } from "./_lib/session.mjs";

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const db = getDb();

  if (req.method === "GET") {
    const [{ data: users, error: uErr }, { data: myShares, error: sErr }] = await Promise.all([
      db.from("users").select("id, username").neq("id", session.uid).order("username", { ascending: true }),
      db.from("shares").select("viewer_id").eq("owner_id", session.uid),
    ]);
    if (uErr || sErr) return res.status(500).json({ error: (uErr || sErr).message });

    const sharedWith = new Set((myShares || []).map((s) => s.viewer_id));
    const result = (users || []).map((u) => ({ id: u.id, username: u.username, shared: sharedWith.has(u.id) }));
    return res.status(200).json(result);
  }

  if (req.method === "POST") {
    const { viewerId } = req.body || {};
    if (!viewerId) return res.status(400).json({ error: "Falta el usuario." });
    const { error } = await db.from("shares").upsert({ owner_id: session.uid, viewer_id: viewerId }, { onConflict: "owner_id,viewer_id" });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { viewerId } = req.query;
    if (!viewerId) return res.status(400).json({ error: "Falta el usuario." });
    const { error } = await db.from("shares").delete().eq("owner_id", session.uid).eq("viewer_id", viewerId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
