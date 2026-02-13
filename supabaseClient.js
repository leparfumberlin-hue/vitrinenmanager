import { createClient } from '@supabase/supabase-js'

// ╔══════════════════════════════════════════════════════════════╗
// ║  WICHTIG: Ersetze die beiden Werte unten mit deinen         ║
// ║  echten Supabase-Daten aus: Supabase → Settings → API       ║
// ╚══════════════════════════════════════════════════════════════╝

const SUPABASE_URL = "https://DEIN-PROJEKT.supabase.co"
const SUPABASE_ANON_KEY = "DEIN-ANON-KEY-HIER"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
