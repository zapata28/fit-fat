import bcrypt from "bcryptjs";
import { getDb } from "./_lib/db.mjs";
import { signSession, setSessionCookie } from "./_lib/session.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { username, password } = req.body || {};
    if (!username || !password || password.length < 4) {
      return res.status(400).json({ error: "Usuario y contraseña (mínimo 4 caracteres) son requeridos." });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,24}$/.test(cleanUsername)) {
      return res.status(400).json({ error: "El usuario debe tener 3-24 caracteres: letras, números, punto, guion o guion bajo." });
    }

    const db = getDb();
    const { data: existing } = await db.from("users").select("id").eq("username", cleanUsername).maybeSingle();
    if (existing) return res.status(409).json({ error: "Ese usuario ya existe." });

    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await db.from("users").insert({ username: cleanUsername, password_hash }).select().single();
    if (error) throw error;

    const token = await signSession({ uid: data.id, username: data.username });
    setSessionCookie(res, token);
    return res.status(200).json({ ok: true, username: data.username });
  } catch (err) {
    return res.status(500).json({ error: "No se pudo crear la cuenta. " + err.message });
  }
}
