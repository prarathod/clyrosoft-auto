export type ClientStatus = 'demo' | 'paying' | 'inactive'

export interface Client {
  id: string
  profession_type: string
  clinic_name: string
  doctor_name: string
  phone: string
  email: string | null
  city: string
  area: string
  subdomain: string
  status: ClientStatus
  payment_date: string | null
  monthly_amount: number
  created_at: string
  // extended fields (nullable, added progressively)
  theme?: string | null
  tagline?: string | null
  doctor_bio?: string | null
  cta_text?: string | null
  google_maps_link?: string | null
  photos?: string[] | null
  doctors?: Array<{ name: string; qualification: string; bio: string; photo: string }> | null
  services?: string[] | null
  testimonials?: Array<{ name: string; text: string; treatment: string }> | null
}

export interface AnalyticsEvent {
  id: string
  subdomain: string
  event_type: 'page_view' | 'whatsapp_click' | 'form_submit'
  created_at: string
}
