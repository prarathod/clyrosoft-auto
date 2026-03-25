'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Patient {
  id: string; subdomain: string; name: string; phone: string; email: string
  date_of_birth: string; gender: string; blood_group: string; address: string
  allergies: string[]; chronic_conditions: string[]; notes: string; created_at: string
}
interface Visit {
  id: string; patient_id: string; visit_date: string; visit_type: string
  chief_complaint: string; diagnosis: string; prescription: string
  vitals: Record<string, string>; doctor_name: string; fees_charged: number
  payment_status: string; notes: string; created_at: string
}
interface Followup {
  id: string; patient_id: string; visit_id: string; followup_date: string
  reason: string; status: string; notes: string
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50'
const btnGhost = 'border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'

const VISIT_TYPES = ['opd', 'ipd', 'follow_up', 'emergency', 'teleconsult']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function todayStr() { return new Date().toISOString().split('T')[0] }

function age(dob: string) {
  if (!dob) return null
  const years = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000))
  return `${years}y`
}

// ── Patient Card ──────────────────────────────────────────────────────────────
function PatientCard({ p, active, onClick }: { p: Patient; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full text-left p-3 rounded-xl border transition-colors ${active ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
          {p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
          <p className="text-xs text-gray-500 truncate">
            {p.phone ? `📞 ${p.phone}` : ''}
            {p.date_of_birth ? ` · ${age(p.date_of_birth)}` : ''}
            {p.gender ? ` · ${p.gender}` : ''}
          </p>
        </div>
        {(p.chronic_conditions?.length > 0 || p.allergies?.length > 0) && (
          <span className="text-xs text-red-500" title="Has medical conditions">⚠️</span>
        )}
      </div>
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const [subdomain, setSubdomain] = useState('')
  const [tab, setTab] = useState<'patients' | 'visits' | 'followups'>('patients')
  const [search, setSearch] = useState('')

  // Patient state
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [patientForm, setPatientForm] = useState({
    name: '', phone: '', email: '', date_of_birth: '', gender: 'male',
    blood_group: '', address: '', allergies: '', chronic_conditions: '', notes: ''
  })

  // Visit state
  const [visits, setVisits] = useState<Visit[]>([])
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitForm, setVisitForm] = useState({
    visit_date: todayStr(), visit_type: 'opd', chief_complaint: '', diagnosis: '',
    prescription: '', doctor_name: '', fees_charged: '', payment_status: 'pending',
    bp: '', pulse: '', temp: '', spo2: '', weight: '', notes: ''
  })

  // Followup state
  const [followups, setFollowups] = useState<Followup[]>([])
  const [showFollowupForm, setShowFollowupForm] = useState(false)
  const [followupForm, setFollowupForm] = useState({ followup_date: todayStr(), reason: '', notes: '' })

  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: clinic } = await supabase.from('clients').select('subdomain').eq('email', session.user.email!).single()
      if (!clinic) return
      setSubdomain(clinic.subdomain)
      loadPatients(clinic.subdomain)
      loadFollowups(clinic.subdomain)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPatients(sub: string) {
    const { data } = await supabase.from('patients').select('*').eq('subdomain', sub).order('name')
    setPatients(data ?? [])
  }

  async function loadVisits(patientId: string) {
    const { data } = await supabase.from('patient_visits').select('*').eq('patient_id', patientId).order('visit_date', { ascending: false })
    setVisits(data ?? [])
  }

  async function loadFollowups(sub: string) {
    const { data } = await supabase.from('patient_followups').select('*, patients(name)').eq('subdomain', sub).order('followup_date')
    setFollowups(data ?? [])
  }

  function selectPatient(p: Patient) {
    setSelectedPatient(p)
    loadVisits(p.id)
    setTab('visits')
  }

  // ── Save Patient ──────────────────────────────────────────────────────────
  async function savePatient() {
    if (!patientForm.name.trim()) return
    setSaving(true)
    const payload = {
      subdomain,
      name: patientForm.name.trim(),
      phone: patientForm.phone || null,
      email: patientForm.email || null,
      date_of_birth: patientForm.date_of_birth || null,
      gender: patientForm.gender,
      blood_group: patientForm.blood_group || null,
      address: patientForm.address || null,
      allergies: patientForm.allergies ? patientForm.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      chronic_conditions: patientForm.chronic_conditions ? patientForm.chronic_conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: patientForm.notes || null,
    }
    if (editPatient) {
      await supabase.from('patients').update(payload).eq('id', editPatient.id)
    } else {
      await supabase.from('patients').insert(payload)
    }
    setSaving(false)
    setShowPatientForm(false)
    setEditPatient(null)
    resetPatientForm()
    loadPatients(subdomain)
  }

  function resetPatientForm() {
    setPatientForm({ name: '', phone: '', email: '', date_of_birth: '', gender: 'male', blood_group: '', address: '', allergies: '', chronic_conditions: '', notes: '' })
  }

  function openEditPatient(p: Patient) {
    setEditPatient(p)
    setPatientForm({
      name: p.name, phone: p.phone ?? '', email: p.email ?? '', date_of_birth: p.date_of_birth ?? '',
      gender: p.gender ?? 'male', blood_group: p.blood_group ?? '', address: p.address ?? '',
      allergies: p.allergies?.join(', ') ?? '', chronic_conditions: p.chronic_conditions?.join(', ') ?? '',
      notes: p.notes ?? ''
    })
    setShowPatientForm(true)
    setTab('patients')
  }

  // ── Save Visit ────────────────────────────────────────────────────────────
  async function saveVisit() {
    if (!selectedPatient) return
    setSaving(true)
    const vitals: Record<string, string> = {}
    if (visitForm.bp) vitals.bp = visitForm.bp
    if (visitForm.pulse) vitals.pulse = visitForm.pulse
    if (visitForm.temp) vitals.temp = visitForm.temp
    if (visitForm.spo2) vitals.spo2 = visitForm.spo2
    if (visitForm.weight) vitals.weight = visitForm.weight

    const { data: visit } = await supabase.from('patient_visits').insert({
      subdomain, patient_id: selectedPatient.id,
      visit_date: visitForm.visit_date, visit_type: visitForm.visit_type,
      chief_complaint: visitForm.chief_complaint || null,
      diagnosis: visitForm.diagnosis || null,
      prescription: visitForm.prescription || null,
      vitals: Object.keys(vitals).length > 0 ? vitals : null,
      doctor_name: visitForm.doctor_name || null,
      fees_charged: Number(visitForm.fees_charged) || 0,
      payment_status: visitForm.payment_status,
      notes: visitForm.notes || null,
    }).select().single()

    setSaving(false)
    setShowVisitForm(false)
    setVisitForm({ visit_date: todayStr(), visit_type: 'opd', chief_complaint: '', diagnosis: '', prescription: '', doctor_name: '', fees_charged: '', payment_status: 'pending', bp: '', pulse: '', temp: '', spo2: '', weight: '', notes: '' })
    loadVisits(selectedPatient.id)

    // Auto-prompt for follow-up
    if (visit) setShowFollowupForm(true)
  }

  // ── Save Followup ─────────────────────────────────────────────────────────
  async function saveFollowup() {
    if (!selectedPatient) return
    await supabase.from('patient_followups').insert({
      subdomain, patient_id: selectedPatient.id,
      followup_date: followupForm.followup_date,
      reason: followupForm.reason || null,
      notes: followupForm.notes || null,
      status: 'scheduled'
    })
    setShowFollowupForm(false)
    setFollowupForm({ followup_date: todayStr(), reason: '', notes: '' })
    loadFollowups(subdomain)
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone ?? '').includes(search)
  )
  const todayFollowups = followups.filter(f => f.followup_date === todayStr() && f.status === 'scheduled')
  const upcomingFollowups = followups.filter(f => f.followup_date > todayStr() && f.status === 'scheduled')

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Patient Records</h2>
          <p className="text-sm text-gray-500 mt-0.5">{patients.length} total patients · {todayFollowups.length} follow-ups today</p>
        </div>
        <button onClick={() => { setEditPatient(null); resetPatientForm(); setShowPatientForm(true); setTab('patients') }} className={btnPrimary}>
          + New Patient
        </button>
      </div>

      <div className="flex gap-6" style={{ minHeight: '70vh' }}>
        {/* ── Left: Patient List ── */}
        <div className="w-64 flex-shrink-0 space-y-3">
          <input
            className={inputCls}
            placeholder="🔍 Search patients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {filteredPatients.map(p => (
              <PatientCard key={p.id} p={p} active={selectedPatient?.id === p.id} onClick={() => selectPatient(p)} />
            ))}
            {filteredPatients.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm">{patients.length === 0 ? 'No patients yet' : 'No results'}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Detail Panel ── */}
        <div className="flex-1 space-y-4">
          {!selectedPatient && tab !== 'followups' ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-24">
              <p className="text-5xl mb-4">🏥</p>
              <p className="font-semibold text-gray-500 text-lg">Select a patient to view records</p>
              <p className="text-sm mt-1">or click &quot;+ New Patient&quot; to add one</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                  { key: 'patients', label: '📋 Profile' },
                  { key: 'visits', label: `📋 Visits${selectedPatient ? ' (' + visits.length + ')' : ''}` },
                  { key: 'followups', label: `🔔 Follow-ups${todayFollowups.length > 0 ? ' (' + todayFollowups.length + ')' : ''}` },
                ].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── PROFILE TAB ── */}
              {tab === 'patients' && selectedPatient && !showPatientForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl">
                        {selectedPatient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{selectedPatient.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedPatient.gender && <span className="capitalize">{selectedPatient.gender}</span>}
                          {selectedPatient.date_of_birth && <span> · {age(selectedPatient.date_of_birth)}</span>}
                          {selectedPatient.blood_group && <span> · {selectedPatient.blood_group}</span>}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => openEditPatient(selectedPatient)} className={btnGhost}>Edit</button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedPatient.phone && <p><span className="text-gray-400">Phone:</span> <strong>{selectedPatient.phone}</strong></p>}
                    {selectedPatient.email && <p><span className="text-gray-400">Email:</span> <strong>{selectedPatient.email}</strong></p>}
                    {selectedPatient.address && <p className="col-span-2"><span className="text-gray-400">Address:</span> {selectedPatient.address}</p>}
                  </div>

                  {selectedPatient.allergies?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-red-700 mb-1">⚠️ ALLERGIES</p>
                      <p className="text-sm text-red-800">{selectedPatient.allergies.join(', ')}</p>
                    </div>
                  )}
                  {selectedPatient.chronic_conditions?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-amber-700 mb-1">🩺 CHRONIC CONDITIONS</p>
                      <p className="text-sm text-amber-800">{selectedPatient.chronic_conditions.join(', ')}</p>
                    </div>
                  )}
                  {selectedPatient.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-700 mb-1">Notes</p>
                      <p>{selectedPatient.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Add/Edit Patient Form */}
              {tab === 'patients' && showPatientForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-gray-900">{editPatient ? 'Edit Patient' : 'New Patient'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                      <input className={inputCls} value={patientForm.name} onChange={e => setPatientForm(f => ({ ...f, name: e.target.value }))} placeholder="Patient Full Name" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                      <input className={inputCls} value={patientForm.phone} onChange={e => setPatientForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                      <input className={inputCls} value={patientForm.email} onChange={e => setPatientForm(f => ({ ...f, email: e.target.value }))} placeholder="patient@email.com" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Date of Birth</label>
                      <input type="date" className={inputCls} value={patientForm.date_of_birth} onChange={e => setPatientForm(f => ({ ...f, date_of_birth: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
                      <select className={inputCls} value={patientForm.gender} onChange={e => setPatientForm(f => ({ ...f, gender: e.target.value }))}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Blood Group</label>
                      <select className={inputCls} value={patientForm.blood_group} onChange={e => setPatientForm(f => ({ ...f, blood_group: e.target.value }))}>
                        <option value="">Unknown</option>
                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Address</label>
                      <input className={inputCls} value={patientForm.address} onChange={e => setPatientForm(f => ({ ...f, address: e.target.value }))} placeholder="Patient address" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Allergies (comma separated)</label>
                      <input className={inputCls} value={patientForm.allergies} onChange={e => setPatientForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Penicillin, Aspirin" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Chronic Conditions (comma separated)</label>
                      <input className={inputCls} value={patientForm.chronic_conditions} onChange={e => setPatientForm(f => ({ ...f, chronic_conditions: e.target.value }))} placeholder="Diabetes, Hypertension" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                      <textarea className={inputCls + ' resize-none'} rows={2} value={patientForm.notes} onChange={e => setPatientForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button onClick={savePatient} disabled={saving || !patientForm.name.trim()} className={btnPrimary}>{saving ? 'Saving…' : editPatient ? 'Update' : 'Add Patient'}</button>
                    <button onClick={() => { setShowPatientForm(false); setEditPatient(null) }} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              )}

              {/* ── VISITS TAB ── */}
              {tab === 'visits' && selectedPatient && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">{selectedPatient.name} · Visit History</p>
                    <button onClick={() => setShowVisitForm(v => !v)} className={btnPrimary}>+ Add Visit</button>
                  </div>

                  {showVisitForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                      <h3 className="font-semibold text-gray-900">Record Visit</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Visit Date</label>
                          <input type="date" className={inputCls} value={visitForm.visit_date} onChange={e => setVisitForm(f => ({ ...f, visit_date: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Visit Type</label>
                          <select className={inputCls} value={visitForm.visit_type} onChange={e => setVisitForm(f => ({ ...f, visit_type: e.target.value }))}>
                            {VISIT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Doctor</label>
                          <input className={inputCls} value={visitForm.doctor_name} onChange={e => setVisitForm(f => ({ ...f, doctor_name: e.target.value }))} placeholder="Dr. Name" />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Chief Complaint</label>
                          <input className={inputCls} value={visitForm.chief_complaint} onChange={e => setVisitForm(f => ({ ...f, chief_complaint: e.target.value }))} placeholder="Fever, headache for 3 days…" />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Diagnosis</label>
                          <input className={inputCls} value={visitForm.diagnosis} onChange={e => setVisitForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Viral fever, URTI…" />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Prescription / Treatment</label>
                          <textarea className={inputCls + ' resize-none'} rows={3} value={visitForm.prescription} onChange={e => setVisitForm(f => ({ ...f, prescription: e.target.value }))} placeholder="Paracetamol 500mg TDS x 5 days..." />
                        </div>
                        {/* Vitals */}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <label className="text-xs font-semibold text-gray-700 mb-2 block">Vitals</label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {[['bp', 'BP', '120/80'], ['pulse', 'Pulse', '72 bpm'], ['temp', 'Temp', '98.6°F'], ['spo2', 'SpO2', '98%'], ['weight', 'Weight', '65 kg']].map(([key, label, ph]) => (
                              <div key={key}>
                                <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>
                                <input className={inputCls} value={visitForm[key as keyof typeof visitForm]} onChange={e => setVisitForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Fees (₹)</label>
                          <input type="number" className={inputCls} value={visitForm.fees_charged} onChange={e => setVisitForm(f => ({ ...f, fees_charged: e.target.value }))} placeholder="300" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Payment</label>
                          <select className={inputCls} value={visitForm.payment_status} onChange={e => setVisitForm(f => ({ ...f, payment_status: e.target.value }))}>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="waived">Waived</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button onClick={saveVisit} disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save Visit'}</button>
                        <button onClick={() => setShowVisitForm(false)} className={btnGhost}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Follow-up prompt after visit */}
                  {showFollowupForm && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                      <p className="font-semibold text-blue-800 text-sm">📅 Schedule a follow-up?</p>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Follow-up Date</label>
                          <input type="date" className={inputCls} value={followupForm.followup_date} onChange={e => setFollowupForm(f => ({ ...f, followup_date: e.target.value }))} />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Reason</label>
                          <input className={inputCls} value={followupForm.reason} onChange={e => setFollowupForm(f => ({ ...f, reason: e.target.value }))} placeholder="Check-up, test results…" />
                        </div>
                        <button onClick={saveFollowup} className={btnPrimary}>Add</button>
                        <button onClick={() => setShowFollowupForm(false)} className={btnGhost}>Skip</button>
                      </div>
                    </div>
                  )}

                  {/* Visit list */}
                  {visits.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-3xl mb-2">📋</p>
                      <p className="text-sm">No visits recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visits.map(v => (
                        <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-gray-900">{new Date(v.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium uppercase">{v.visit_type.replace('_', ' ')}</span>
                                {v.doctor_name && <span className="text-xs text-gray-500">{v.doctor_name}</span>}
                              </div>
                              {v.chief_complaint && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Complaint:</span> {v.chief_complaint}</p>}
                              {v.diagnosis && <p className="text-sm text-gray-700 mt-0.5"><span className="font-medium">Diagnosis:</span> {v.diagnosis}</p>}
                              {v.prescription && (
                                <div className="bg-gray-50 rounded-lg p-2 mt-2 text-xs text-gray-600 whitespace-pre-line">{v.prescription}</div>
                              )}
                              {v.vitals && Object.keys(v.vitals).length > 0 && (
                                <div className="flex gap-3 flex-wrap mt-2">
                                  {Object.entries(v.vitals).map(([k, val]) => (
                                    <span key={k} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{k.toUpperCase()}: {val}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-gray-900">₹{Number(v.fees_charged).toLocaleString('en-IN')}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.payment_status === 'paid' ? 'bg-green-100 text-green-700' : v.payment_status === 'waived' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>{v.payment_status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── FOLLOW-UPS TAB ── */}
              {tab === 'followups' && (
                <div className="space-y-6">
                  {todayFollowups.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🔔 Today&apos;s Follow-ups
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{todayFollowups.length}</span>
                      </h3>
                      {todayFollowups.map(f => {
                        const p = patients.find(x => x.id === f.patient_id)
                        return (
                          <div key={f.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 mb-3">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{p?.name ?? '—'}</p>
                              {p?.phone && <p className="text-xs text-gray-500">📞 {p.phone}</p>}
                              {f.reason && <p className="text-xs text-gray-600 mt-0.5 italic">{f.reason}</p>}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => supabase.from('patient_followups').update({ status: 'completed' }).eq('id', f.id).then(() => loadFollowups(subdomain))}
                                className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700">Done</button>
                              <button onClick={() => { const pt = patients.find(x => x.id === f.patient_id); if (pt) selectPatient(pt) }}
                                className="border border-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50">View</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {upcomingFollowups.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">📅 Upcoming Follow-ups</h3>
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              {['Date', 'Patient', 'Reason', 'Status'].map(h => (
                                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {upcomingFollowups.map(f => {
                              const p = patients.find(x => x.id === f.patient_id)
                              return (
                                <tr key={f.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-900">{new Date(f.followup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td className="px-4 py-3">
                                    <button onClick={() => { if (p) selectPatient(p) }} className="font-semibold text-blue-600 hover:underline text-left">{p?.name ?? '—'}</button>
                                    {p?.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 text-xs">{f.reason ?? '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold capitalize">{f.status}</span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {todayFollowups.length === 0 && upcomingFollowups.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <p className="text-4xl mb-3">✅</p>
                      <p className="font-medium text-gray-600">No scheduled follow-ups</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
