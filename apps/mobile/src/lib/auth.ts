import * as SecureStore from 'expo-secure-store'
import { supabase } from './supabase'
import type { AppSession, StaffUser } from '../types'

const SESSION_KEY = 'cliniqo_session'

export async function getSession(): Promise<AppSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export async function saveSession(session: AppSession) {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session))
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY)
}

// ── Owner login via Supabase Auth ─────────────────────────────
export async function loginOwner(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) return { error: error?.message ?? 'Login failed' }

  const { data: clinic } = await supabase
    .from('clients')
    .select('subdomain, clinic_name, doctor_name, phone, city, email')
    .eq('email', email)
    .single()

  if (!clinic) return { error: 'Clinic not found' }

  const session: AppSession = {
    type: 'owner',
    subdomain: clinic.subdomain,
    owner: { email: clinic.email ?? email, subdomain: clinic.subdomain, clinic_name: clinic.clinic_name, doctor_name: clinic.doctor_name, phone: clinic.phone, city: clinic.city },
  }
  await saveSession(session)
  return { session }
}

// ── Staff login via Clinic ID + Staff ID + PIN ─────────────────
export async function loginStaff(clinicId: string, staffPhone: string, pin: string) {
  // clinicId is the subdomain
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .eq('subdomain', clinicId.toLowerCase().trim())
    .eq('phone', staffPhone.trim())
    .eq('status', 'active')
    .single()

  if (error || !staff) return { error: 'Staff not found. Check clinic ID and phone number.' }

  // Verify PIN (stored as plain text for now; hash in production)
  if (staff.login_pin !== pin) return { error: 'Incorrect PIN. Please try again.' }

  const session: AppSession = {
    type: 'staff',
    subdomain: staff.subdomain,
    staff: staff as StaffUser,
  }
  await saveSession(session)

  // Update last login time
  await supabase.from('staff').update({ last_login_at: new Date().toISOString() }).eq('id', staff.id)

  return { session }
}
