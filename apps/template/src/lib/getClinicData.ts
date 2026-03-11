import { supabase } from './supabase'
import type { Client, ProfessionConfig } from '@/types/database'

export async function getClinicBySubdomain(subdomain: string): Promise<Client | null> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('subdomain', subdomain)
    .single()
  return data ?? null
}

export async function getProfessionConfig(profession: string): Promise<ProfessionConfig> {
  // Dynamic import — zero bundle cost for unused professions
  try {
    const config = await import(`../../../data/professions/${profession}.json`)
    return config.default as ProfessionConfig
  } catch {
    // Fallback generic config
    return {
      profession,
      display_name: 'Clinic',
      primary_color: '#0EA5E9',
      services: ['Consultation', 'Treatment', 'Follow-up'],
      features: ['whatsapp_cta', 'google_maps'],
      hero_tagline: 'Quality Healthcare, Trusted Care',
    }
  }
}
