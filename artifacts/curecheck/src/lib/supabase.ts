import { createClient } from "@supabase/supabase-js";

const url = typeof __SUPABASE_URL__ !== "undefined" ? __SUPABASE_URL__ : "";
const key = typeof __SUPABASE_ANON_KEY__ !== "undefined" ? __SUPABASE_ANON_KEY__ : "";

export const supabase = url && key ? createClient(url, key) : null;
