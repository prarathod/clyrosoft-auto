import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Client, ProfessionConfig } from '@/types/database'
import type { ThemeKey } from '@/styles/themes'

// Server-side admin client that bypasses RLS — only used in server components/functions.
// Falls back to anon client if service role key is not set.
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { global: { fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' }) } }
    )
  : supabase

const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=800&h=600&fit=crop',
]

function makeMockClinic(theme: ThemeKey, subdomain: string): Client {
  return {
    id: 'demo',
    profession_type: 'dental',
    clinic_name: 'Sharma Dental Clinic',
    doctor_name: 'Ramesh Sharma',
    phone: '9876543210',
    email: 'sharma@example.com',
    city: 'Bangalore',
    area: 'Koramangala',
    subdomain,
    status: 'demo',
    payment_date: null,
    monthly_amount: 499,
    created_at: new Date().toISOString(),
    theme,
    photos: DEMO_PHOTOS,
  }
}

const MOCK_CLINIC: Client = makeMockClinic('classic', 'demo')

// Subdomains that serve theme-specific mock demo sites
const DEMO_THEME_MAP: Record<string, ThemeKey> = {
  'demo':          'classic',
  'demo-classic':  'classic',
  'demo-modern':   'modern',
  'demo-minimal':  'minimal',
  'demo-vitality': 'vitality',
  'demo-elegant':  'elegant',
  'demo-warm':     'warm',
}

// ── Profession config map ─────────────────────────────────────────────────────
// Each entry: [primary_color, default_theme, display_name, hero_tagline, services[]]
type ProfessionMeta = {
  primary_color: string
  theme: ThemeKey
  display_name: string
  hero_tagline: string
  services: string[]
}

const PROFESSION_MAP: Record<string, ProfessionMeta> = {
  // ── Core specialties ──────────────────────────────────────────────────────
  dental: {
    primary_color: '#0891B2',
    theme: 'vitality',
    display_name: 'Dental Clinic',
    hero_tagline: 'Your smile is our priority',
    services: ['Teeth Cleaning', 'Root Canal', 'Dental Implants', 'Teeth Whitening', 'Orthodontics', 'Tooth Extraction'],
  },
  eye: {
    primary_color: '#0369A1',
    theme: 'elegant',
    display_name: 'Eye Clinic',
    hero_tagline: 'Clarity of vision, quality of life',
    services: ['Eye Examination', 'Cataract Surgery', 'LASIK', 'Glaucoma Treatment', 'Retina Care', 'Spectacle Prescription'],
  },
  physiotherapy: {
    primary_color: '#059669',
    theme: 'vitality',
    display_name: 'Physiotherapy Clinic',
    hero_tagline: 'Move better, live better',
    services: ['Manual Therapy', 'Sports Rehabilitation', 'Post-Surgery Recovery', 'Back Pain Treatment', 'Electrotherapy', 'Exercise Therapy'],
  },
  skin: {
    primary_color: '#DB2777',
    theme: 'modern',
    display_name: 'Skin & Dermatology Clinic',
    hero_tagline: 'Healthy skin, confident you',
    services: ['Acne Treatment', 'Laser Therapy', 'Anti-Aging', 'Hair Loss Treatment', 'Skin Whitening', 'Mole Removal'],
  },
  'child specialist': {
    primary_color: '#7C3AED',
    theme: 'warm',
    display_name: 'Child Specialist',
    hero_tagline: 'Gentle care for your little ones',
    services: ['Well-Baby Checkups', 'Vaccination', 'Fever & Infections', 'Nutrition Counseling', 'Growth Monitoring', 'Developmental Checkups'],
  },
  'general physician': {
    primary_color: '#2563EB',
    theme: 'classic',
    display_name: 'General Physician',
    hero_tagline: 'Your trusted family doctor',
    services: ['General Consultation', 'Health Checkup', 'Diabetes Management', 'Blood Pressure', 'Fever & Cold', 'Prescription Renewal'],
  },
  ent: {
    primary_color: '#4F46E5',
    theme: 'minimal',
    display_name: 'ENT Clinic',
    hero_tagline: 'Expert ear, nose & throat care',
    services: ['Ear Cleaning', 'Hearing Tests', 'Sinusitis Treatment', 'Tonsil Surgery', 'Voice Disorders', 'Allergy Management'],
  },
  orthopedic: {
    primary_color: '#334155',
    theme: 'elegant',
    display_name: 'Orthopedic Clinic',
    hero_tagline: 'Strong bones, pain-free life',
    services: ['Joint Replacement', 'Fracture Care', 'Arthritis Treatment', 'Sports Injuries', 'Spine Surgery', 'Physiotherapy'],
  },
  gynecology: {
    primary_color: '#BE185D',
    theme: 'warm',
    display_name: 'Gynecology & Women\'s Health',
    hero_tagline: 'Compassionate care for women',
    services: ['Antenatal Care', 'Normal Delivery', 'C-Section', 'PCOS Treatment', 'Menstrual Disorders', 'Laparoscopy'],
  },
  homeopathy: {
    primary_color: '#65A30D',
    theme: 'vitality',
    display_name: 'Homeopathy Clinic',
    hero_tagline: 'Natural healing, lasting relief',
    services: ['Constitutional Homeopathy', 'Chronic Disease Management', 'Allergy Treatment', 'Skin Disorders', 'Child Health', 'Stress & Anxiety'],
  },

  // ── Specialist clinics ────────────────────────────────────────────────────
  cardiology: {
    primary_color: '#DC2626',
    theme: 'elegant',
    display_name: 'Cardiology Clinic',
    hero_tagline: 'Protecting hearts, saving lives',
    services: ['ECG', 'Echocardiography', 'Stress Test', 'Angioplasty', 'Heart Failure Management', 'Cholesterol Management'],
  },
  neurology: {
    primary_color: '#9333EA',
    theme: 'minimal',
    display_name: 'Neurology Clinic',
    hero_tagline: 'Advanced care for the nervous system',
    services: ['Epilepsy Treatment', 'Migraine Management', 'Stroke Rehabilitation', 'Parkinson\'s Disease', 'Memory Disorders', 'Nerve Pain'],
  },
  psychiatry: {
    primary_color: '#0284C7',
    theme: 'warm',
    display_name: 'Psychiatry & Mental Health',
    hero_tagline: 'Your mental health matters',
    services: ['Depression Treatment', 'Anxiety Disorders', 'OCD', 'ADHD', 'Addiction Counseling', 'Therapy Sessions'],
  },
  urology: {
    primary_color: '#0891B2',
    theme: 'classic',
    display_name: 'Urology Clinic',
    hero_tagline: 'Expert urological care',
    services: ['Kidney Stone Treatment', 'Prostate Care', 'Bladder Disorders', 'Urinary Infections', 'Male Infertility', 'Laparoscopic Surgery'],
  },
  nephrology: {
    primary_color: '#1D4ED8',
    theme: 'elegant',
    display_name: 'Nephrology Clinic',
    hero_tagline: 'Caring for your kidney health',
    services: ['Chronic Kidney Disease', 'Dialysis', 'Kidney Transplant', 'Hypertension', 'Electrolyte Disorders', 'Kidney Stones'],
  },
  gastroenterology: {
    primary_color: '#EA580C',
    theme: 'classic',
    display_name: 'Gastroenterology Clinic',
    hero_tagline: 'Digestive health specialists',
    services: ['Endoscopy', 'Colonoscopy', 'Acidity & GERD', 'Liver Disease', 'IBD Treatment', 'Abdominal Pain'],
  },
  pulmonology: {
    primary_color: '#0369A1',
    theme: 'vitality',
    display_name: 'Pulmonology Clinic',
    hero_tagline: 'Breathe easy, live fully',
    services: ['Asthma Management', 'COPD Treatment', 'Sleep Apnea', 'Allergy Testing', 'Pulmonary Function Tests', 'Respiratory Infections'],
  },
  endocrinology: {
    primary_color: '#CA8A04',
    theme: 'classic',
    display_name: 'Endocrinology Clinic',
    hero_tagline: 'Balancing your hormones, improving your life',
    services: ['Diabetes Management', 'Thyroid Disorders', 'PCOS', 'Hormonal Imbalance', 'Obesity Management', 'Adrenal Disorders'],
  },
  diabetes: {
    primary_color: '#C2410C',
    theme: 'vitality',
    display_name: 'Diabetes Clinic',
    hero_tagline: 'Control diabetes, live life fully',
    services: ['Diabetes Consultation', 'HbA1c Testing', 'Diet Counseling', 'Insulin Management', 'Foot Care', 'Complications Screening'],
  },
  oncology: {
    primary_color: '#6D28D9',
    theme: 'elegant',
    display_name: 'Oncology Clinic',
    hero_tagline: 'Fighting cancer with compassion',
    services: ['Cancer Screening', 'Chemotherapy', 'Radiation Therapy', 'Immunotherapy', 'Palliative Care', 'Follow-up Care'],
  },

  // ── Surgery & diagnostics ─────────────────────────────────────────────────
  'general surgery': {
    primary_color: '#374151',
    theme: 'minimal',
    display_name: 'General Surgery',
    hero_tagline: 'Precision surgery, faster recovery',
    services: ['Hernia Repair', 'Appendix Surgery', 'Gallbladder Removal', 'Laparoscopic Surgery', 'Wound Care', 'Minor Procedures'],
  },
  'plastic surgery': {
    primary_color: '#BE185D',
    theme: 'modern',
    display_name: 'Plastic & Cosmetic Surgery',
    hero_tagline: 'Enhancing your natural beauty',
    services: ['Rhinoplasty', 'Liposuction', 'Breast Augmentation', 'Facelift', 'Tummy Tuck', 'Scar Revision'],
  },
  'diagnostic center': {
    primary_color: '#1E40AF',
    theme: 'classic',
    display_name: 'Diagnostic Centre',
    hero_tagline: 'Accurate results, faster diagnosis',
    services: ['Blood Tests', 'Urine Tests', 'X-Ray', 'Ultrasound', 'MRI', 'CT Scan'],
  },
  'pathology lab': {
    primary_color: '#991B1B',
    theme: 'minimal',
    display_name: 'Pathology Laboratory',
    hero_tagline: 'Reliable lab results you can trust',
    services: ['Complete Blood Count', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Tests', 'Culture & Sensitivity'],
  },
  'radiology center': {
    primary_color: '#334155',
    theme: 'elegant',
    display_name: 'Radiology Centre',
    hero_tagline: 'Advanced imaging for accurate diagnosis',
    services: ['Digital X-Ray', 'MRI Scan', 'CT Scan', 'Ultrasound', 'Mammography', 'Bone Density'],
  },

  // ── Alternative medicine ──────────────────────────────────────────────────
  ayurveda: {
    primary_color: '#166534',
    theme: 'vitality',
    display_name: 'Ayurveda Clinic',
    hero_tagline: 'Ancient wisdom, modern wellness',
    services: ['Panchakarma', 'Detox Therapy', 'Joint Pain Relief', 'Weight Management', 'Stress Relief', 'Skin Treatment'],
  },
  unani: {
    primary_color: '#0F766E',
    theme: 'vitality',
    display_name: 'Unani Clinic',
    hero_tagline: 'Holistic healing through nature',
    services: ['Chronic Disease Management', 'Skin Disorders', 'Digestive Problems', 'Respiratory Issues', 'General Wellness', 'Herbal Medicine'],
  },
  naturopathy: {
    primary_color: '#047857',
    theme: 'vitality',
    display_name: 'Naturopathy Clinic',
    hero_tagline: 'Heal naturally, live vibrantly',
    services: ['Detox Programs', 'Diet Therapy', 'Hydrotherapy', 'Yoga & Meditation', 'Stress Management', 'Lifestyle Counseling'],
  },
  acupuncture: {
    primary_color: '#92400E',
    theme: 'elegant',
    display_name: 'Acupuncture Clinic',
    hero_tagline: 'Restore balance, relieve pain naturally',
    services: ['Pain Management', 'Migraine Relief', 'Stress & Anxiety', 'Fertility Support', 'Back Pain', 'Insomnia'],
  },

  // ── Women & children ──────────────────────────────────────────────────────
  fertility: {
    primary_color: '#BE123C',
    theme: 'warm',
    display_name: 'Fertility Clinic',
    hero_tagline: 'Your journey to parenthood starts here',
    services: ['IVF', 'IUI', 'Egg Freezing', 'Sperm Analysis', 'Hormonal Treatment', 'Fertility Counseling'],
  },
  ivf: {
    primary_color: '#9D174D',
    theme: 'warm',
    display_name: 'IVF Centre',
    hero_tagline: 'Making parenthood dreams a reality',
    services: ['IVF Treatment', 'ICSI', 'Embryo Freezing', 'PGT Testing', 'Donor Egg Program', 'Fertility Preservation'],
  },
  maternity: {
    primary_color: '#C2410C',
    theme: 'warm',
    display_name: 'Maternity Clinic',
    hero_tagline: 'Caring for mothers and babies',
    services: ['Antenatal Care', 'Normal Delivery', 'C-Section', 'Postnatal Care', 'Lactation Support', 'New Born Care'],
  },
  neonatal: {
    primary_color: '#1E40AF',
    theme: 'warm',
    display_name: 'Neonatal Clinic',
    hero_tagline: 'Specialized care for your newborn',
    services: ['NICU Care', 'New Born Screening', 'Jaundice Treatment', 'Premature Baby Care', 'Growth Monitoring', 'Vaccination'],
  },

  // ── Other specialties ─────────────────────────────────────────────────────
  rheumatology: {
    primary_color: '#7E22CE',
    theme: 'elegant',
    display_name: 'Rheumatology Clinic',
    hero_tagline: 'Relief from joint & autoimmune conditions',
    services: ['Rheumatoid Arthritis', 'Lupus Treatment', 'Gout Management', 'Fibromyalgia', 'Osteoporosis', 'Joint Injections'],
  },
  dermatology: {
    primary_color: '#BE185D',
    theme: 'modern',
    display_name: 'Dermatology Clinic',
    hero_tagline: 'Expert skincare for lasting results',
    services: ['Acne Treatment', 'Eczema', 'Psoriasis', 'Skin Allergy', 'Chemical Peel', 'Laser Treatment'],
  },
  'sports medicine': {
    primary_color: '#EA580C',
    theme: 'vitality',
    display_name: 'Sports Medicine Clinic',
    hero_tagline: 'Get back in the game faster',
    services: ['Sports Injury Treatment', 'Performance Enhancement', 'Rehabilitation', 'Platelet-Rich Plasma', 'Biomechanical Assessment', 'Return-to-Play Programs'],
  },
  'pain management': {
    primary_color: '#3730A3',
    theme: 'minimal',
    display_name: 'Pain Management Clinic',
    hero_tagline: 'Life without pain is possible',
    services: ['Chronic Pain Management', 'Joint Injections', 'Nerve Blocks', 'Spine Procedures', 'Migraine Treatment', 'Trigger Point Therapy'],
  },
  spine: {
    primary_color: '#1E293B',
    theme: 'elegant',
    display_name: 'Spine & Neurosurgery Clinic',
    hero_tagline: 'Precision care for your spine',
    services: ['Slipped Disc', 'Spinal Stenosis', 'Scoliosis', 'Minimally Invasive Surgery', 'Neck Pain', 'Lower Back Pain'],
  },
  'hair transplant': {
    primary_color: '#92400E',
    theme: 'modern',
    display_name: 'Hair Transplant Clinic',
    hero_tagline: 'Restore your confidence, restore your hair',
    services: ['FUE Hair Transplant', 'FUT Hair Transplant', 'PRP Therapy', 'Hair Loss Treatment', 'Beard Transplant', 'Eyebrow Transplant'],
  },
  'weight loss': {
    primary_color: '#15803D',
    theme: 'vitality',
    display_name: 'Weight Loss Clinic',
    hero_tagline: 'Your healthiest self is within reach',
    services: ['Medical Weight Loss', 'Diet Planning', 'Bariatric Consultation', 'Body Composition Analysis', 'Metabolic Testing', 'Lifestyle Coaching'],
  },
  nutrition: {
    primary_color: '#4D7C0F',
    theme: 'vitality',
    display_name: 'Nutrition & Dietetics',
    hero_tagline: 'Eat right, feel great',
    services: ['Personalized Diet Plan', 'Weight Management', 'Sports Nutrition', 'Clinical Nutrition', 'Child Nutrition', 'Disease-specific Diets'],
  },
  'speech therapy': {
    primary_color: '#6D28D9',
    theme: 'warm',
    display_name: 'Speech Therapy Clinic',
    hero_tagline: 'Find your voice with expert support',
    services: ['Speech Disorders', 'Stuttering', 'Language Development', 'Voice Therapy', 'Swallowing Disorders', 'Autism Support'],
  },
  'occupational therapy': {
    primary_color: '#0F766E',
    theme: 'warm',
    display_name: 'Occupational Therapy',
    hero_tagline: 'Regain independence, rediscover life',
    services: ['Post-Stroke Rehab', 'Pediatric OT', 'Hand Therapy', 'Sensory Integration', 'Cognitive Rehab', 'Daily Living Skills'],
  },
  veterinary: {
    primary_color: '#B45309',
    theme: 'warm',
    display_name: 'Veterinary Clinic',
    hero_tagline: 'Caring for your beloved pets',
    services: ['Vaccination', 'Spay & Neuter', 'Dental Care', 'Emergency Care', 'Surgery', 'Grooming'],
  },
}

function normalizeProfession(raw: string): string {
  return raw.toLowerCase().replace(/_/g, ' ').trim()
}

// Stock photos per profession for clinics that have no photos scraped yet
const STOCK_PHOTOS: Record<string, string[]> = {
  dental: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
  ],
  eye: [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1588776814546-1ffbb172d936?w=800&h=600&fit=crop',
  ],
  skin: [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&h=600&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516549655669-df64a39e90c7?w=800&h=600&fit=crop',
  ],
}

function withFallbackPhotos(clinic: Client): Client {
  if (clinic.photos && clinic.photos.length > 0) return clinic
  const key = normalizeProfession(clinic.profession_type ?? '')
  const photos = STOCK_PHOTOS[key] ?? STOCK_PHOTOS.default
  return { ...clinic, photos }
}

export const getClinicBySubdomain = cache(async (subdomain: string): Promise<Client | null> => {
  // Serve theme-specific mock demo sites without hitting the database
  if (subdomain in DEMO_THEME_MAP) {
    return makeMockClinic(DEMO_THEME_MAP[subdomain], subdomain)
  }

  if (!supabaseAdmin) return MOCK_CLINIC
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('subdomain', subdomain)
    .single()
  if (error) return null
  return data ? withFallbackPhotos(data) : null
})

export const getProfessionConfig = cache(async (profession: string): Promise<ProfessionConfig> => {
  const key = normalizeProfession(profession)
  const meta = PROFESSION_MAP[key]

  if (meta) {
    return {
      profession: key,
      display_name: meta.display_name,
      primary_color: meta.primary_color,
      theme: meta.theme,
      services: meta.services,
      features: ['whatsapp_cta', 'google_maps'],
      hero_tagline: meta.hero_tagline,
    }
  }

  // Try loading from JSON file as fallback
  try {
    const config = await import(`../../../../data/professions/${key}.json`)
    return config.default as ProfessionConfig
  } catch {
    return {
      profession: key,
      display_name: 'Clinic',
      primary_color: '#0EA5E9',
      theme: 'classic',
      services: ['Consultation', 'Treatment', 'Follow-up'],
      features: ['whatsapp_cta', 'google_maps'],
      hero_tagline: 'Quality Healthcare, Trusted Care',
    }
  }
})
