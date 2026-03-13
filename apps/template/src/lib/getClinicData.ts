import { cache } from 'react'
import { supabase } from './supabase'
import type { Client, ProfessionConfig } from '@/types/database'

const MOCK_CLINIC: Client = {
  id: 'demo',
  profession_type: 'dental',
  clinic_name: 'Sharma Dental Clinic',
  doctor_name: 'Ramesh Sharma',
  phone: '9876543210',
  email: 'sharma@example.com',
  city: 'Bangalore',
  area: 'Koramangala',
  subdomain: 'demo',
  status: 'demo',
  payment_date: null,
  monthly_amount: 999,
  created_at: new Date().toISOString(),
}

export const getClinicBySubdomain = cache(async (subdomain: string): Promise<Client | null> => {
  if (!supabase) return MOCK_CLINIC
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('subdomain', subdomain)
    .single()
  if (error) return null
  return data ?? null
})

export const getProfessionConfig = cache(async (profession: string): Promise<ProfessionConfig> => {
  try {
    const config = await import(`../../../../data/professions/${profession}.json`)
    return config.default as ProfessionConfig
  } catch {
    return {
      profession,
      display_name: 'Clinic',
      primary_color: '#0EA5E9',
      services: ['Consultation', 'Treatment', 'Follow-up'],
      features: ['whatsapp_cta', 'google_maps'],
      hero_tagline: 'Quality Healthcare, Trusted Care',
    }
  }
})
