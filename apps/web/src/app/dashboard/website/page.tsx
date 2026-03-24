'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const PreviewPane = dynamic(() => import('@/components/dashboard/PreviewPane'), { ssr: false })

// ── Types ─────────────────────────────────────────────────────────────────────
interface Testimonial  { name: string; text: string; treatment: string }
interface Doctor       { name: string; qualification: string; bio: string; photo: string }
interface ClinicStat   { label: string; value: string }
interface OpeningHours { label: string; hours: string }
interface SocialLinks  { instagram?: string; facebook?: string; google?: string; youtube?: string }

// Themes that show a photo on the right side of the hero
const HERO_PHOTO_THEMES = new Set(['modern', 'vitality', 'pulse'])

// ── Theme options ─────────────────────────────────────────────────────────────
const THEMES = [
  { key: 'classic',  label: 'Classic',  desc: 'Blue · Serif · Centered',       color: '#2563EB', heroBg: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', heroText: 'white' },
  { key: 'modern',   label: 'Modern',   desc: 'Dark · Bold · Split',            color: '#8B5CF6', heroBg: 'linear-gradient(135deg,#1E1B4B,#7C3AED)', heroText: 'white' },
  { key: 'minimal',  label: 'Minimal',  desc: 'Black & White · Clean',          color: '#18181B', heroBg: '#FAFAFA',                                 heroText: '#09090B' },
  { key: 'vitality', label: 'Vitality', desc: 'Green · Fresh · Health',         color: '#059669', heroBg: 'linear-gradient(135deg,#D1FAE5,#ECFDF5)', heroText: '#111827' },
  { key: 'elegant',  label: 'Elegant',  desc: 'Navy · Gold · Luxury',           color: '#B45309', heroBg: 'linear-gradient(160deg,#0F172A,#1E293B)', heroText: '#FEF3C7' },
  { key: 'warm',     label: 'Warm',     desc: 'Coral · Friendly · Rounded',     color: '#E11D48', heroBg: 'linear-gradient(135deg,#FF6B6B,#9F1239)', heroText: 'white' },
  { key: 'prestige', label: 'Prestige', desc: 'Dark · Silver · Ultra-Luxury',   color: '#A8A29E', heroBg: 'linear-gradient(160deg,#080808,#131211)', heroText: '#F5F5F4' },
  { key: 'pulse',    label: 'Pulse',    desc: 'Sky Blue · Medical-Tech · Split', color: '#0EA5E9', heroBg: 'linear-gradient(140deg,#0EA5E9,#075985)', heroText: 'white' },
]

// ── Section definitions ───────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'template',     icon: '🎨', label: 'Template',        hint: 'Overall colour & layout style' },
  { id: 'hero',         icon: '🦸', label: 'Hero',            hint: 'Top banner — tagline & buttons' },
  { id: 'stats',        icon: '📊', label: 'Stats & Trust',   hint: 'Years, patients, rating shown on hero' },
  { id: 'announcement', icon: '📢', label: 'Announcement',    hint: 'Highlighted message bar at top' },
  { id: 'about',        icon: '👨‍⚕️', label: 'About / Doctors', hint: 'Doctor profiles & clinic story' },
  { id: 'photos',       icon: '🖼️', label: 'Photos',          hint: 'Clinic photos shown in gallery' },
  { id: 'services',     icon: '🏥', label: 'Services',        hint: 'List of treatments you offer' },
  { id: 'testimonials', icon: '⭐', label: 'Testimonials',    hint: 'Patient reviews' },
  { id: 'booking',      icon: '📅', label: 'Booking',         hint: 'Appointment form' },
  { id: 'contact',      icon: '📞', label: 'Contact',         hint: 'Phone & Google Maps link' },
  { id: 'hours',        icon: '🕐', label: 'Opening Hours',   hint: 'Clinic timings shown in footer' },
  { id: 'social',       icon: '🔗', label: 'Social Links',    hint: 'Instagram, Facebook, Google Reviews' },
  { id: 'footer',       icon: '🦶', label: 'Footer',          hint: 'Bottom of the website' },
]

// ── Accordion section wrapper ─────────────────────────────────────────────────
function AccordionSection({
  id, icon, label, hint, open, onOpen, children,
}: {
  id: string; icon: string; label: string; hint: string
  open: boolean; onOpen: (id: string) => void; children: React.ReactNode
}) {
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        open ? 'border-blue-400 shadow-sm' : 'border-gray-200'
      }`}
      style={{ backgroundColor: open ? '#F8FAFF' : 'white' }}
    >
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        onClick={() => onOpen(id)}
      >
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900">{label}</p>
          <p className="text-xs text-gray-400 truncate">{hint}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-blue-100">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WebsitePage() {
  const [clinicId,       setClinicId]       = useState('')
  const [subdomain,      setSubdomain]      = useState('')
  const [clinicStatus,   setClinicStatus]   = useState('demo')
  const [theme,          setTheme]          = useState('classic')
  const [tagline,        setTagline]        = useState('')
  const [doctorBio,      setDoctorBio]      = useState('')
  const [ctaText,        setCtaText]        = useState('')
  const [services,       setServices]       = useState<string[]>([])
  const [newService,     setNewService]     = useState('')
  const [testimonials,   setTestimonials]   = useState<Testimonial[]>([])
  const [phone,          setPhone]          = useState('')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [doctorName,     setDoctorName]     = useState('')
  const [doctors,        setDoctors]        = useState<Doctor[]>([])
  const [photos,         setPhotos]         = useState<string[]>([])
  const [newPhotoUrl,    setNewPhotoUrl]    = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [stats,          setStats]          = useState<ClinicStat[]>([])
  const [openingHours,   setOpeningHours]   = useState<OpeningHours[]>([])
  const [socialLinks,    setSocialLinks]    = useState<SocialLinks>({})
  const [announcement,   setAnnouncement]   = useState('')
  const [aiLoading,      setAiLoading]      = useState(false)
  const [aiDone,         setAiDone]         = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [autoSaving,     setAutoSaving]     = useState(false)
  const [previewKey,     setPreviewKey]     = useState(0)
  const [openSection,    setOpenSection]    = useState<string>('template')
  const [highlightSec,   setHighlightSec]   = useState<string | undefined>()
  const autoSaveTimer                        = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedRef                            = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      // Use * so query doesn't fail if optional columns (photos, contacted) don't exist yet
      supabase
        .from('clients')
        .select('*')
        .eq('email', session.user.email!)
        .single()
        .then(({ data, error }) => {
          if (error || !data) return
          setClinicId(data.id)
          setSubdomain(data.subdomain)
          setClinicStatus(data.status ?? 'demo')
          setTheme(data.theme ?? 'classic')
          setTagline(data.tagline ?? '')
          setDoctorBio(data.doctor_bio ?? '')
          setCtaText(data.cta_text ?? '')
          setServices(Array.isArray(data.services) ? data.services : [])
          setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : [])
          setPhone(data.phone ?? '')
          setGoogleMapsLink(data.google_maps_link ?? '')
          setPhotos(Array.isArray(data.photos) ? data.photos : [])
          setDoctorName(data.doctor_name ?? '')
          setDoctors(Array.isArray(data.doctors) ? data.doctors : [])
          setStats(Array.isArray(data.stats) ? data.stats : [])
          setOpeningHours(Array.isArray(data.opening_hours) ? data.opening_hours : [])
          setSocialLinks(data.social_links && typeof data.social_links === 'object' ? data.social_links : {})
          setAnnouncement(data.announcement ?? '')
          // Mark initial load done — auto-save won't fire before this
          setTimeout(() => { loadedRef.current = true }, 100)
        })
    })
  }, [])

  // ── Auto-save content changes (1.5s debounce) ─────────────────────────────
  useEffect(() => {
    if (!loadedRef.current || !clinicId) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setAutoSaving(true)
    autoSaveTimer.current = setTimeout(async () => {
      const supabase = createClient()
      await supabase.from('clients').update({
        tagline, doctor_bio: doctorBio, cta_text: ctaText,
        services, testimonials, phone, google_maps_link: googleMapsLink,
        photos, doctor_name: doctorName, doctors,
        stats:         stats.length        ? stats        : null,
        opening_hours: openingHours.length ? openingHours : null,
        social_links:  Object.values(socialLinks).some(Boolean) ? socialLinks : null,
        announcement:  announcement.trim() || null,
      }).eq('id', clinicId)
      setAutoSaving(false)
      setPreviewKey((k) => k + 1)
    }, 1500)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagline, doctorBio, ctaText, services, testimonials, phone,
      googleMapsLink, photos, doctorName, doctors, stats,
      openingHours, socialLinks, announcement])

  function handleSectionOpen(id: string) {
    setOpenSection(id === openSection ? '' : id)
    // Map section id → template section id (photos → gallery)
    const sectionMap: Record<string, string> = { photos: 'gallery' }
    const targetSection = sectionMap[id] ?? id
    // Highlight only actual page sections (not 'template', 'booking')
    if (id !== 'template' && id !== openSection) {
      setHighlightSec(undefined)
      setTimeout(() => setHighlightSec(targetSection), 50)
    }
  }

  async function handleSave() {
    if (!clinicId) return
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('clients')
      .update({
        theme, tagline, doctor_bio: doctorBio, cta_text: ctaText,
        services, testimonials, phone, google_maps_link: googleMapsLink,
        photos, doctor_name: doctorName, doctors,
        stats:         stats.length        ? stats        : null,
        opening_hours: openingHours.length ? openingHours : null,
        social_links:  Object.values(socialLinks).some(Boolean) ? socialLinks : null,
        announcement:  announcement.trim() || null,
      })
      .eq('id', clinicId)
    setSaving(false)
    setSaved(true)
    setPreviewKey((k) => k + 1)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleAiGenerate() {
    setAiLoading(true)
    setAiDone(false)
    try {
      const res = await fetch('/api/dashboard/generate-content', { method: 'POST' })
      const { content, error } = await res.json()
      if (error) { alert(error); return }
      if (content.tagline)     setTagline(content.tagline)
      if (content.doctor_bio)  setDoctorBio(content.doctor_bio)
      if (Array.isArray(content.services) && content.services.length)
        setServices(content.services)
      if (Array.isArray(content.testimonials) && content.testimonials.length)
        setTestimonials(content.testimonials)
      setAiDone(true)
      setTimeout(() => setAiDone(false), 4000)
    } catch {
      alert('AI generation failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  function addService() {
    if (!newService.trim()) return
    setServices([...services, newService.trim()])
    setNewService('')
  }
  function removeService(i: number) { setServices(services.filter((_, idx) => idx !== i)) }
  function addTestimonial() { setTestimonials([...testimonials, { name: '', text: '', treatment: '' }]) }
  function updateTestimonial(i: number, field: keyof Testimonial, value: string) {
    setTestimonials(testimonials.map((t, idx) => idx === i ? { ...t, [field]: value } : t))
  }
  function removeTestimonial(i: number) { setTestimonials(testimonials.filter((_, idx) => idx !== i)) }

  function addPhotoByUrl() {
    const url = newPhotoUrl.trim()
    if (!url) return
    setPhotos([...photos, url])
    setNewPhotoUrl('')
  }
  function removePhoto(i: number) { setPhotos(photos.filter((_, idx) => idx !== i)) }
  function movePhotoLeft(i: number) {
    if (i === 0) return
    const next = [...photos]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setPhotos(next)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch('/api/dashboard/upload-photo', { method: 'POST', body: form })
      const data = await res.json()
      if (data.url) setPhotos((prev) => [...prev, data.url])
      else alert(data.error ?? 'Upload failed')
    } finally {
      setUploadingPhoto(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex gap-6 items-start min-h-0">

      {/* ── Left: accordion editor ── */}
      <div className="w-[420px] flex-shrink-0 space-y-3">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Website Editor</h2>
          <p className="text-sm text-gray-500">Click a section to edit it. Changes apply after saving.</p>
        </div>

        {/* AI Generate banner */}
        <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 flex items-center justify-between gap-3 mb-1">
          <div>
            <p className="font-semibold text-sm text-purple-900">✨ AI Content Generator</p>
            <p className="text-xs text-purple-600 mt-0.5">
              {aiDone
                ? '✓ Tagline, bio, services & reviews filled! Review and save.'
                : 'Auto-write your tagline, doctor bio, services & patient reviews.'}
            </p>
          </div>
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading}
            className="flex-shrink-0 flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {aiLoading ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
            ) : (
              '✨ Generate'
            )}
          </button>
        </div>

        {SECTIONS.map(({ id, icon, label, hint }) => (
          <AccordionSection
            key={id}
            id={id} icon={icon} label={label} hint={hint}
            open={openSection === id}
            onOpen={handleSectionOpen}
          >

            {/* ── TEMPLATE ── */}
            {id === 'template' && (
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <div
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                      theme === t.key ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-16 p-2 flex flex-col justify-end" style={{ background: t.heroBg }}>
                      <div className="text-xs font-bold" style={{ color: t.heroText }}>Your Clinic</div>
                    </div>
                    <div className="p-2 bg-white">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="font-semibold text-xs text-gray-900">{t.label}</span>
                        {theme === t.key && <span className="ml-auto text-blue-500 text-xs">✓</span>}
                      </div>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── HERO ── */}
            {id === 'hero' && (
              <div className="space-y-4">

                {/* Hero photo — only for split-layout themes */}
                {HERO_PHOTO_THEMES.has(theme) ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Photo
                    <span className="ml-2 text-xs font-normal text-gray-400">shown on right side of banner</span>
                  </label>
                  <div className="flex gap-3 items-start">
                    {/* Current preview */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      {photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photos[0]}
                          alt="Hero"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-3xl">🏥</span>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex-1 space-y-2">
                      {/* Upload from device */}
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg px-3 py-2 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingPhoto}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setUploadingPhoto(true)
                            try {
                              const form = new FormData()
                              form.append('file', file)
                              const res  = await fetch('/api/dashboard/upload-photo', { method: 'POST', body: form })
                              const data = await res.json()
                              if (data.url) {
                                // Replace photos[0] with new upload
                                setPhotos((prev) => [data.url, ...prev.slice(1)])
                              } else {
                                alert(data.error ?? 'Upload failed')
                              }
                            } finally {
                              setUploadingPhoto(false)
                              e.target.value = ''
                            }
                          }}
                        />
                        {uploadingPhoto ? (
                          <><span className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-600 rounded-full animate-spin" /><span className="text-xs font-medium text-blue-600">Uploading…</span></>
                        ) : (
                          <><span className="text-base">📤</span><span className="text-xs font-medium text-gray-600">Upload from device</span></>
                        )}
                      </label>
                      {/* Paste URL */}
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="Or paste image URL…"
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const url = (e.target as HTMLInputElement).value.trim()
                              if (url) {
                                setPhotos((prev) => [url, ...prev.slice(1)])
                                ;(e.target as HTMLInputElement).value = ''
                              }
                            }
                          }}
                        />
                        <button
                          className="bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-blue-700 flex-shrink-0"
                          onClick={(e) => {
                            const input = (e.currentTarget.previousSibling as HTMLInputElement)
                            const url = input.value.trim()
                            if (url) {
                              setPhotos((prev) => [url, ...prev.slice(1)])
                              input.value = ''
                            }
                          }}
                        >
                          Set
                        </button>
                      </div>
                      {photos[0] && (
                        <button
                          onClick={() => setPhotos((prev) => prev.slice(1))}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove hero photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                ) : (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-500">
                  <span>ℹ️</span>
                  <span>The <strong>{THEMES.find(t => t.key === theme)?.label}</strong> template uses a text-only hero — no photo shown. Switch to <strong>Modern</strong> or <strong>Vitality</strong> to add a hero image.</span>
                </div>
                )}

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Your smile is our priority"
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400 mt-1">Shows below the clinic name in the hero banner</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Book Appointment"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* ── STATS ── */}
            {id === 'stats' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  These numbers appear on every hero theme. Leave empty to use defaults (10+ years, 5K+ patients, 4.8★).
                </p>
                {stats.length === 0 && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Using defaults — add your real numbers below to personalise.
                  </div>
                )}
                <div className="space-y-3">
                  {stats.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={s.value}
                        onChange={(e) => setStats(stats.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                        placeholder="10+"
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                      <input
                        value={s.label}
                        onChange={(e) => setStats(stats.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                        placeholder="Years Experience"
                        className={inputClass}
                      />
                      <button onClick={() => setStats(stats.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 px-1 flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
                {stats.length < 4 && (
                  <button
                    onClick={() => setStats([...stats, { value: '', label: '' }])}
                    className="w-full border-2 border-dashed border-gray-300 text-gray-500 text-sm py-2.5 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Add Stat
                  </button>
                )}
              </div>
            )}

            {/* ── ANNOUNCEMENT ── */}
            {id === 'announcement' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Announcement Bar
                  <span className="ml-2 text-xs font-normal text-gray-400">shown in a coloured strip at the top of your site</span>
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="e.g. Now open on Sundays! · New branch opening soon"
                  className={inputClass}
                  maxLength={120}
                />
                {announcement && (
                  <div className="rounded-lg px-4 py-2 text-center text-xs font-semibold text-white" style={{ backgroundColor: '#2563EB' }}>
                    📢 &nbsp;{announcement}
                  </div>
                )}
                {announcement && (
                  <button onClick={() => setAnnouncement('')} className="text-xs text-red-500 hover:underline">Remove announcement</button>
                )}
              </div>
            )}

            {/* ── ABOUT / DOCTORS ── */}
            {id === 'about' && (
              <div className="space-y-5">

                {/* Primary doctor */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Primary Doctor</p>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Main</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="Dr. Ramesh Sharma"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bio / Profile</label>
                    <textarea
                      value={doctorBio}
                      onChange={(e) => setDoctorBio(e.target.value)}
                      rows={3}
                      placeholder="Dr. Sharma has 15 years of experience in cosmetic dentistry..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>

                {/* Additional doctors */}
                {doctors.map((doc, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">Doctor {i + 2}</p>
                      <button
                        onClick={() => setDoctors(doctors.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => setDoctors(doctors.map((d, idx) => idx === i ? { ...d, name: e.target.value } : d))}
                        placeholder="Dr. Priya Nair"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Qualification / Specialization</label>
                      <input
                        type="text"
                        value={doc.qualification}
                        onChange={(e) => setDoctors(doctors.map((d, idx) => idx === i ? { ...d, qualification: e.target.value } : d))}
                        placeholder="BDS, MDS – Orthodontics"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                      <textarea
                        value={doc.bio}
                        onChange={(e) => setDoctors(doctors.map((d, idx) => idx === i ? { ...d, bio: e.target.value } : d))}
                        rows={2}
                        placeholder="Short description..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Photo URL (optional)</label>
                      <input
                        type="url"
                        value={doc.photo}
                        onChange={(e) => setDoctors(doctors.map((d, idx) => idx === i ? { ...d, photo: e.target.value } : d))}
                        placeholder="https://..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setDoctors([...doctors, { name: '', qualification: '', bio: '', photo: '' }])}
                  className="w-full border-2 border-dashed border-gray-300 text-gray-500 text-sm py-3 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add Another Doctor
                </button>
              </div>
            )}

            {/* ── PHOTOS ── */}
            {id === 'photos' && (
              <div className="space-y-4">
                {/* Current photos grid */}
                {photos.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-sm font-medium text-gray-700">No photos yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add photos to show a gallery on your website</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">{photos.length} photo{photos.length !== 1 ? 's' : ''} · Drag first photo to set as featured</p>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((url, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden aspect-square border border-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {/* Overlay controls */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            {i > 0 && (
                              <button
                                onClick={() => movePhotoLeft(i)}
                                className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded font-medium hover:bg-white"
                                title="Move to front"
                              >
                                ← Front
                              </button>
                            )}
                            <button
                              onClick={() => removePhoto(i)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                          {i === 0 && (
                            <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload from device */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Upload from device</p>
                  <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-4 cursor-pointer transition-colors ${
                    uploadingPhoto ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingPhoto} />
                    {uploadingPhoto ? (
                      <>
                        <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-600 rounded-full animate-spin" />
                        <span className="text-sm text-blue-600 font-medium">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">📤</span>
                        <span className="text-sm font-medium text-gray-600">Click to upload photo</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">Max 5 MB · JPG, PNG, WebP</p>
                </div>

                {/* Add by URL */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Or paste image URL</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addPhotoByUrl()}
                      placeholder="https://example.com/clinic-photo.jpg"
                      className={inputClass}
                    />
                    <button
                      onClick={addPhotoByUrl}
                      disabled={!newPhotoUrl.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  Photos from Google Maps are added automatically when your clinic is scraped. You can remove or reorder them above.
                </p>
              </div>
            )}

            {/* ── SERVICES ── */}
            {id === 'services' && (
              <div>
                {services.length === 0 && (
                  <p className="text-xs text-gray-400 mb-3">Empty — default profession services will show.</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {services.map((s, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                      {s}
                      <button onClick={() => removeService(i)} className="text-blue-400 hover:text-blue-700 ml-0.5">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addService()}
                    placeholder="e.g. Teeth Whitening"
                    className={inputClass}
                  />
                  <button onClick={addService} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex-shrink-0">
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* ── TESTIMONIALS ── */}
            {id === 'testimonials' && (
              <div>
                {testimonials.length === 0 && (
                  <p className="text-xs text-gray-400 mb-3">Empty — sample reviews will show.</p>
                )}
                <div className="space-y-4 mb-4">
                  {testimonials.map((t, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Review {i + 1}</span>
                        <button onClick={() => removeTestimonial(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                      <input value={t.name} onChange={(e) => updateTestimonial(i, 'name', e.target.value)} placeholder="Patient name" className={inputClass} />
                      <input value={t.treatment} onChange={(e) => updateTestimonial(i, 'treatment', e.target.value)} placeholder="Treatment (e.g. Root Canal)" className={inputClass} />
                      <textarea value={t.text} onChange={(e) => updateTestimonial(i, 'text', e.target.value)} placeholder="What did the patient say?" rows={2} className={`${inputClass} resize-none`} />
                    </div>
                  ))}
                </div>
                <button onClick={addTestimonial} className="w-full border-2 border-dashed border-gray-300 text-gray-500 text-sm py-2.5 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
                  + Add Review
                </button>
              </div>
            )}

            {/* ── BOOKING ── */}
            {id === 'booking' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The booking form is automatically populated with your services and sends appointments to your dashboard.
                </p>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700 mb-1">✓ Auto-configured</p>
                  <p className="text-xs text-blue-600">Patient name, phone, date, time & service — all captured automatically.</p>
                </div>
              </div>
            )}

            {/* ── CONTACT ── */}
            {id === 'contact' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className={inputClass} />
                  <p className="text-xs text-gray-400 mt-1">10-digit number without +91</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                  <input type="url" value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className={inputClass} />
                </div>
              </div>
            )}

            {/* ── OPENING HOURS ── */}
            {id === 'hours' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">Shown in the footer of your website. Leave empty to hide.</p>
                <div className="space-y-3">
                  {openingHours.map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={h.label}
                        onChange={(e) => setOpeningHours(openingHours.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                        placeholder="Mon – Sat"
                        className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                      />
                      <input
                        value={h.hours}
                        onChange={(e) => setOpeningHours(openingHours.map((x, idx) => idx === i ? { ...x, hours: e.target.value } : x))}
                        placeholder="9:00 AM – 7:00 PM"
                        className={inputClass}
                      />
                      <button onClick={() => setOpeningHours(openingHours.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 px-1 flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
                {openingHours.length < 5 && (
                  <button
                    onClick={() => setOpeningHours([...openingHours, { label: '', hours: '' }])}
                    className="w-full border-2 border-dashed border-gray-300 text-gray-500 text-sm py-2.5 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + Add Hours Row
                  </button>
                )}
                <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 space-y-0.5">
                  <p className="font-medium text-gray-500">Example</p>
                  <p>Mon – Sat · 9:00 AM – 7:00 PM</p>
                  <p>Sunday · 10:00 AM – 2:00 PM</p>
                </div>
              </div>
            )}

            {/* ── SOCIAL LINKS ── */}
            {id === 'social' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">Social icons appear in the footer. Leave blank to hide.</p>
                {([
                  ['instagram', '📸 Instagram', 'https://instagram.com/yourclinic'],
                  ['facebook',  '📘 Facebook',  'https://facebook.com/yourclinic'],
                  ['google',    '⭐ Google Reviews', 'https://g.page/yourclinic'],
                  ['youtube',   '▶️ YouTube',   'https://youtube.com/@yourclinic'],
                ] as [keyof SocialLinks, string, string][]).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type="url"
                      value={socialLinks[key] ?? ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value || undefined })}
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── FOOTER ── */}
            {id === 'footer' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The footer shows your clinic name, address, phone, and quick links — pulled from your clinic profile automatically.
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-1">✓ Auto-populated fields</p>
                  <p className="text-xs text-gray-500">Clinic name, area, city, phone, WhatsApp number</p>
                </div>
              </div>
            )}

          </AccordionSection>
        ))}

        <button
          onClick={handleSave}
          disabled={saving || !clinicId}
          className="w-full bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : saved ? (
            '✓ Saved! Preview refreshing…'
          ) : (
            'Save & Update Site'
          )}
        </button>
      </div>

      {/* ── Right: live preview ── */}
      {subdomain && (() => {
        const isPaid = clinicStatus === 'paying'
        const siteUrl = isPaid
          ? `https://${subdomain}.cliniqo.online`
          : `${process.env.NEXT_PUBLIC_TEMPLATE_URL ?? 'https://demo.cliniqo.online'}/${subdomain}`
        return (
          <>
            <div className="flex-1 min-w-0 hidden xl:flex flex-col sticky top-6" style={{ height: 'calc(100vh - 80px)' }}>
              <PreviewPane
                subdomain={subdomain}
                siteUrl={siteUrl}
                refreshKey={previewKey}
                highlightSection={highlightSec}
                liveTheme={theme}
                autoSaving={autoSaving}
              />
            </div>
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="xl:hidden fixed bottom-20 right-4 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"
            >
              Preview ↗
            </a>
          </>
        )
      })()}
    </div>
  )
}
