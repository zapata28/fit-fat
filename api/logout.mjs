import { clearSessionCookie } from "./_lib/session.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
