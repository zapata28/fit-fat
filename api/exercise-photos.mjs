import { getDb } from "./_lib/db.mjs";
import { getSession } from "./_lib/session.mjs";

const BUCKET = "exercise-photos";
let bucketReady = false;

async function ensureBucket(db) {
  if (bucketReady) return;
  const { error } = await db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "5MB" });
  // Ignore "already exists" - any other error surfaces to the caller.
  if (error && !String(error.message || "").toLowerCase().includes("already exists")) throw error;
  bucketReady = true;
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/\w+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "No autorizado" });
  const db = getDb();

  if (req.method === "GET") {
    const { data, error } = await db.from("exercise_photos").select("*").eq("user_id", session.uid);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    try {
      const { exerciseName, dataUrl } = req.body || {};
      const cleanName = normalizeName(exerciseName);
      if (!cleanName) return res.status(400).json({ error: "Falta el nombre del ejercicio." });

      const parsed = parseDataUrl(dataUrl);
      if (!parsed) return res.status(400).json({ error: "Imagen inválida." });
      if (parsed.buffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: "La imagen es muy pesada (máx 5MB)." });

      await ensureBucket(db);

      const ext = parsed.mime.split("/")[1] || "jpg";
      const path = `${session.uid}/${cleanName.replace(/[^a-z0-9]+/g, "-")}.${ext}`;

      const { error: uploadError } = await db.storage.from(BUCKET).upload(path, parsed.buffer, {
        contentType: parsed.mime,
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);

      const { data, error } = await db
        .from("exercise_photos")
        .upsert(
          { user_id: session.uid, exercise_name: cleanName, url: pub.publicUrl, storage_path: path },
          { onConflict: "user_id,exercise_name" }
        )
        .select()
        .single();
      if (error) throw error;

      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: "No se pudo subir la foto. " + err.message });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
