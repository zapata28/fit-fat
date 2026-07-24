import bcrypt from "bcryptjs";
import { getDb } from "./_lib/db.mjs";
import { signSession, setSessionCookie } from "./_lib/session.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: "Faltan usuario o contraseña." });

    const cleanUsername = String(username).trim().toLowerCase();
    const db = getDb();
    const { data: user, error } = await db
      .from("users")
      .select("id, username, password_hash")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(401).json({ error: "Usuario o contraseña incorrectos." });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Usuario o contraseña incorrectos." });

    const token = await signSession({ uid: user.id, username: user.username });
    setSessionCookie(res, token);
    return res.status(200).json({ ok: true, username: user.username });
  } catch (err) {
    return res.status(500).json({ error: "No se pudo iniciar sesión. " + err.message });
  }
}
