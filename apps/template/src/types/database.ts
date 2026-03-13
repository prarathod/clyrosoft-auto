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
  // dashboard-editable fields
  theme?: string
  tagline?: string | null
  doctor_bio?: string | null
  cta_text?: string | null
  services?: string[] | null
  testimonials?: Array<{ name: string; text: string; treatment: string }> | null
  google_maps_link?: string | null
  photos?: string[] | null
}

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
    }
  }
}

export interface ProfessionConfig {
  profession: string
  display_name: string
  primary_color: string
  theme?: string        // 'classic' | 'modern' | 'minimal' — defaults to 'classic'
  services: string[]
  features: string[]
  hero_tagline: string
}
