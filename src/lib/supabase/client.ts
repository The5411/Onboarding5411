import { createClient } from "@supabase/supabase-js";

// URL y anon key son públicas por diseño — la seguridad real la da Row
// Level Security en Postgres, no el secreto de estas credenciales.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
