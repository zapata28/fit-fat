import { createClient } from "@supabase/supabase-js";

let client = null;

export function getDb() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
