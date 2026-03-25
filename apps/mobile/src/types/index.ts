export interface StaffPermissions {
  can_mark_attendance: boolean
  can_view_appointments: boolean
  can_manage_inventory: boolean
  can_view_patients: boolean
  can_add_patients: boolean
  can_view_payroll: boolean
}

export interface StaffUser {
  id: string
  subdomain: string
  name: string
  role: string
  phone: string
  email: string
  salary: number
  join_date: string
  status: string
  permissions: StaffPermissions
  last_lat?: number
  last_lng?: number
}

export interface ClinicOwner {
  email: string
  subdomain: string
  clinic_name: string
  doctor_name: string
  phone: string
  city: string
}

// Auth session stored locally
export interface AppSession {
  type: 'owner' | 'staff'
  subdomain: string
  staff?: StaffUser
  owner?: ClinicOwner
}

export interface InventoryItem {
  id: string
  subdomain: string
  name: string
  category: string
  unit: string
  current_stock: number
  min_stock_alert: number
  cost_price: number
  sell_price: number
  supplier: string | null
  expiry_date: string | null
  barcode: string | null
}

export interface Patient {
  id: string
  subdomain: string
  name: string
  phone: string
  email: string
  date_of_birth: string
  gender: string
  blood_group: string
  allergies: string[]
  chronic_conditions: string[]
  notes: string
}

export interface Attendance {
  id: string
  subdomain: string
  staff_id: string
  date: string
  status: 'present' | 'absent' | 'half_day' | 'leave'
}

export interface Appointment {
  id: string
  subdomain: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  appointment_time: string
  service: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}
