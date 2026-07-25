import { getDb } from "./_lib/db.mjs";
import { getSession } from "./_lib/session.mjs";

const toNum = (v) => (v === "" || v === undefined || v === null ? null : parseFloat(v));

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const db = getDb();
  const { id } = req.query;

  if (req.method === "GET") {
    const { data, error } = await db
      .from("measurements")
      .select("*")
      .eq("user_id", session.uid)
      .order("date", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = req.body || {};
    if (!body.date) return res.status(400).json({ error: "Falta la fecha." });

    const { data, error } = await db
      .from("measurements")
      .insert({
        user_id: session.uid,
        date: body.date,
        weight: toNum(body.weight),
        neck: toNum(body.neck),
        chest: toNum(body.chest),
        waist: toNum(body.waist),
        hips: toNum(body.hips),
        arm: toNum(body.arm),
        thigh: toNum(body.thigh),
        notes: body.notes || null,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "Falta el id." });
    const { error } = await db.from("measurements").delete().eq("id", id).eq("user_id", session.uid);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
