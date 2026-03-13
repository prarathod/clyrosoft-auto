import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[clinic-saas] Supabase env vars missing — falling back to mock data.\n' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = url && key
  ? createClient<Database>(url, key, {
      global: {
        fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' }),
      },
    })
  : null
