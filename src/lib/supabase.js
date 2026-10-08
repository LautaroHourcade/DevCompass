import { createClient } from '@supabase/supabase-js'

// Solo la clave publishable llega al navegador. La seguridad la dan las políticas RLS.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en el fichero .env')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
