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
  services: string[]
  features: string[]
  hero_tagline: string
}
