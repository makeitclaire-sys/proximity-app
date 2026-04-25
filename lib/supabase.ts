import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ""

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn("Supabase env vars missing. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
