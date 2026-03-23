export type ClientStatus = 'demo' | 'paying' | 'inactive'

export interface ClinicStat {
  label: string   // e.g. "Years Experience"
  value: string   // e.g. "12+"
}

export interface OpeningHours {
  label: string   // e.g. "Mon – Sat"
  hours: string   // e.g. "9:00 AM – 7:00 PM"
}

export interface SocialLinks {
  instagram?: string
  facebook?:  string
  google?:    string
  youtube?:   string
}

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
  theme?:            string | null
  tagline?:          string | null
  doctor_bio?:       string | null
  cta_text?:         string | null
  services?:         string[] | null
  testimonials?:     Array<{ name: string; text: string; treatment: string }> | null
  google_maps_link?: string | null
  photos?:           string[] | null
  doctors?:          Array<{ name: string; qualification: string; bio: string; photo: string }> | null
  // new customization fields
  stats?:            ClinicStat[] | null
  opening_hours?:    OpeningHours[] | null
  social_links?:     SocialLinks | null
  announcement?:     string | null
  hidden_sections?:  string[] | null   // e.g. ['gallery','testimonials']
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
  theme?: string
  services: string[]
  features: string[]
  hero_tagline: string
}
