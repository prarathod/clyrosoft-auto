'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Staff {
  id: string; subdomain: string; name: string; role: string
  phone: string; email: string; salary: number; join_date: string
  status: string; notes: string; created_at: string
}
interface Attendance {
  id: string; staff_id: string; date: string; status: string; note: string
}
interface Leave {
  id: string; staff_id: string; leave_type: string; start_date: string
  end_date: string; days_count: number; reason: string; status: string; created_at: string
}
interface SalaryRow {
  id?: string; staff_id: string; month: number; year: number
  base_salary: number; bonus: number; deductions: number; status: string; paid_date?: string
}

const ROLES = ['doctor','nurse','receptionist','compounder','lab_technician','pharmacist','ward_boy','other']
const ROLE_COLORS: Record<string,string> = {
  doctor:'bg-blue-100 text-blue-700', nurse:'bg-pink-100 text-pink-700',
  receptionist:'bg-purple-100 text-purple-700', compounder:'bg-green-100 text-green-700',
  lab_technician:'bg-yellow-100 text-yellow-700', pharmacist:'bg-teal-100 text-teal-700',
  ward_boy:'bg-orange-100 text-orange-700', other:'bg-gray-100 text-gray-600',
}
const LEAVE_TYPES = ['sick','casual','earned','unpaid']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const btnPrimary = 'bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50'
const btnGhost = 'border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'

function todayStr() { return new Date().toISOString().split('T')[0] }
function monthStr(m: number, y: number) { return `${MONTHS[m-1]} ${y}` }

// ── Staff Card ─────────────────────────────────────────────────────────────────
function StaffCard({ s, onEdit, onToggle }: { s: Staff; onEdit: (s: Staff)=>void; onToggle: (s: Staff)=>void }) {
  return (
    <div className={`bg-white border rounded-xl p-4 space-y-2 ${s.status==='inactive' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {s.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{s.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[s.role]??ROLE_COLORS.other}`}>
            {s.role.replace(/_/g,' ')}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={()=>onEdit(s)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">✏️</button>
          <button onClick={()=>onToggle(s)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500" title={s.status==='active'?'Deactivate':'Activate'}>
            {s.status==='active' ? '🔴' : '🟢'}
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500 space-y-0.5">
        {s.phone && <p>📞 {s.phone}</p>}
        {s.email && <p>✉️ {s.email}</p>}
        <p>💰 ₹{Number(s.salary).toLocaleString('en-IN')}/mo</p>
        {s.join_date && <p>📅 Joined {new Date(s.join_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [subdomain, setSubdomain] = useState('')
  const [tab, setTab] = useState<'team'|'attendance'|'leaves'|'payroll'>('team')

  // ── Team state
  const [staff, setStaff] = useState<Staff[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editStaff, setEditStaff] = useState<Staff|null>(null)
  const [form, setForm] = useState({ name:'', role:'nurse', phone:'', email:'', salary:'', join_date:'', notes:'' })
  const [saving, setSaving] = useState(false)

  // ── Attendance state
  const [attDate, setAttDate] = useState(todayStr())
  const [attMap, setAttMap] = useState<Record<string,string>>({}) // staff_id → status
  const [attLoading, setAttLoading] = useState(false)

  // ── Leaves state
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ staff_id:'', leave_type:'casual', start_date:todayStr(), end_date:todayStr(), reason:'' })

  // ── Payroll state
  const [payMonth, setPayMonth] = useState(new Date().getMonth()+1)
  const [payYear, setPayYear] = useState(new Date().getFullYear())
  const [salaryRows, setSalaryRows] = useState<SalaryRow[]>([])
  const [salaryEdits, setSalaryEdits] = useState<Record<string,{bonus:number;deductions:number}>>({})

  const supabase = createClient()

  // ── Load subdomain + staff ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async({ data:{ session } }) => {
      if (!session) return
      const { data:clinic } = await supabase.from('clients').select('subdomain').eq('email', session.user.email!).single()
      if (!clinic) return
      setSubdomain(clinic.subdomain)
      loadStaff(clinic.subdomain)
      loadLeaves(clinic.subdomain)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadStaff(sub: string) {
    const { data } = await supabase.from('staff').select('*').eq('subdomain', sub).order('created_at')
    setStaff(data ?? [])
  }
  async function loadLeaves(sub: string) {
    const { data } = await supabase.from('leaves').select('*').eq('subdomain', sub).order('created_at', { ascending: false })
    setLeaves(data ?? [])
  }

  // ── Load attendance for selected date ─────────────────────────────────────
  useEffect(() => {
    if (!subdomain) return
    setAttLoading(true)
    supabase.from('attendance').select('*').eq('subdomain', subdomain).eq('date', attDate)
      .then(({ data }) => {
        const m: Record<string,string> = {}
        ;(data??[]).forEach(r => { m[r.staff_id] = r.status })
        setAttMap(m)
        setAttLoading(false)
      })
  }, [subdomain, attDate])

  // ── Load payroll for selected month/year ──────────────────────────────────
  useEffect(() => {
    if (!subdomain || staff.length === 0) return
    supabase.from('salary_payments').select('*')
      .eq('subdomain', subdomain).eq('month', payMonth).eq('year', payYear)
      .then(({ data }) => {
        const existing = data ?? []
        const rows: SalaryRow[] = staff.filter(s=>s.status==='active').map(s => {
          const ex = existing.find(e => e.staff_id === s.id)
          return ex ?? { staff_id: s.id, month: payMonth, year: payYear, base_salary: s.salary, bonus: 0, deductions: 0, status: 'pending' }
        })
        setSalaryRows(rows)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain, payMonth, payYear, staff.length])

  // ── Mark attendance ────────────────────────────────────────────────────────
  async function markAtt(staffId: string, status: string) {
    setAttMap(m => ({ ...m, [staffId]: status }))
    await supabase.from('attendance').upsert(
      { subdomain, staff_id: staffId, date: attDate, status },
      { onConflict: 'staff_id,date' }
    )
  }

  // ── Save staff ─────────────────────────────────────────────────────────────
  async function saveStaff() {
    if (!form.name.trim()) return
    setSaving(true)
    const payload = { subdomain, name: form.name.trim(), role: form.role, phone: form.phone, email: form.email, salary: Number(form.salary)||0, join_date: form.join_date||null, notes: form.notes, status: 'active' }
    if (editStaff) {
      await supabase.from('staff').update(payload).eq('id', editStaff.id)
    } else {
      await supabase.from('staff').insert(payload)
    }
    setSaving(false)
    setShowForm(false); setEditStaff(null)
    setForm({ name:'', role:'nurse', phone:'', email:'', salary:'', join_date:'', notes:'' })
    loadStaff(subdomain)
  }

  function openEdit(s: Staff) {
    setEditStaff(s)
    setForm({ name:s.name, role:s.role, phone:s.phone??'', email:s.email??'', salary:String(s.salary), join_date:s.join_date??'', notes:s.notes??'' })
    setShowForm(true)
  }

  async function toggleStatus(s: Staff) {
    await supabase.from('staff').update({ status: s.status==='active'?'inactive':'active' }).eq('id', s.id)
    loadStaff(subdomain)
  }

  // ── Save leave ─────────────────────────────────────────────────────────────
  async function saveLeave() {
    if (!leaveForm.staff_id) return
    const days = Math.max(1, Math.ceil((new Date(leaveForm.end_date).getTime() - new Date(leaveForm.start_date).getTime()) / 86400000) + 1)
    await supabase.from('leaves').insert({ subdomain, ...leaveForm, days_count: days, status: 'pending' })
    setShowLeaveForm(false)
    setLeaveForm({ staff_id:'', leave_type:'casual', start_date:todayStr(), end_date:todayStr(), reason:'' })
    loadLeaves(subdomain)
  }

  async function updateLeaveStatus(id: string, status: string) {
    await supabase.from('leaves').update({ status }).eq('id', id)
    loadLeaves(subdomain)
  }

  // ── Payroll ────────────────────────────────────────────────────────────────
  function getEdit(staffId: string) { return salaryEdits[staffId] ?? { bonus: 0, deductions: 0 } }

  async function markPaid(row: SalaryRow) {
    const edit = getEdit(row.staff_id)
    const payload = { subdomain, staff_id: row.staff_id, month: payMonth, year: payYear, base_salary: row.base_salary, bonus: edit.bonus, deductions: edit.deductions, status: 'paid', paid_date: todayStr() }
    await supabase.from('salary_payments').upsert(payload, { onConflict: 'staff_id,month,year' })
    setSalaryRows(r => r.map(x => x.staff_id===row.staff_id ? { ...x, ...payload } : x))
  }

  const activeStaff = staff.filter(s => s.status==='active')
  const pendingLeaves = leaves.filter(l => l.status==='pending')
  const totalPayroll = salaryRows.reduce((s,r) => { const e=getEdit(r.staff_id); return s + r.base_salary + e.bonus - e.deductions }, 0)
  const paidCount = salaryRows.filter(r=>r.status==='paid').length

  const TABS = [
    { key:'team',       label:`👥 Team (${activeStaff.length})` },
    { key:'attendance', label:'📋 Attendance' },
    { key:'leaves',     label:`🌴 Leaves${pendingLeaves.length>0?' ('+pendingLeaves.length+')':''}` },
    { key:'payroll',    label:'💰 Payroll' },
  ] as const

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">{activeStaff.length} active staff members</p>
        </div>
        {tab==='team' && (
          <button onClick={()=>{ setEditStaff(null); setForm({name:'',role:'nurse',phone:'',email:'',salary:'',join_date:'',notes:''}); setShowForm(true) }} className={btnPrimary}>
            + Add Staff
          </button>
        )}
        {tab==='leaves' && (
          <button onClick={()=>setShowLeaveForm(true)} className={btnPrimary}>+ Add Leave</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${tab===t.key?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: TEAM ── */}
      {tab==='team' && (
        <>
          {showForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">{editStaff ? 'Edit Staff' : 'Add Staff Member'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                  <input className={inputCls} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Dr. Ramesh Kumar" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Role *</label>
                  <select className={inputCls} value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                    {ROLES.map(r=><option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                  <input className={inputCls} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="9876543210" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                  <input className={inputCls} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="staff@email.com" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Monthly Salary (₹)</label>
                  <input className={inputCls} type="number" value={form.salary} onChange={e=>setForm(f=>({...f,salary:e.target.value}))} placeholder="15000" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Joining Date</label>
                  <input className={inputCls} type="date" value={form.join_date} onChange={e=>setForm(f=>({...f,join_date:e.target.value}))} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
                  <textarea className={inputCls+' resize-none'} rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional notes about this staff member" /></div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={saveStaff} disabled={saving||!form.name.trim()} className={btnPrimary}>{saving?'Saving…':editStaff?'Update':'Add Staff'}</button>
                <button onClick={()=>{setShowForm(false);setEditStaff(null)}} className={btnGhost}>Cancel</button>
              </div>
            </div>
          )}
          {staff.length===0 ? (
            <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">👥</p><p className="font-medium">No staff yet</p><p className="text-sm mt-1">Click &quot;Add Staff&quot; to get started</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map(s=><StaffCard key={s.id} s={s} onEdit={openEdit} onToggle={toggleStatus} />)}
            </div>
          )}
        </>
      )}

      {/* ── TAB: ATTENDANCE ── */}
      {tab==='attendance' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input type="date" value={attDate} onChange={e=>setAttDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-xs text-gray-400">{attDate===todayStr()?'Today':''}</span>
          </div>

          {activeStaff.length===0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No active staff to mark attendance for.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Staff</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">Mark Attendance</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeStaff.map(s => {
                    const cur = attMap[s.id]
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[s.role]??ROLE_COLORS.other}`}>{s.role.replace(/_/g,' ')}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {[['present','✅','bg-green-100 text-green-700 border-green-300'],['absent','❌','bg-red-100 text-red-700 border-red-300'],['half_day','🌓','bg-yellow-100 text-yellow-700 border-yellow-300'],['leave','🌴','bg-blue-100 text-blue-700 border-blue-300']].map(([st,icon,cls])=>(
                              <button key={st} disabled={attLoading} onClick={()=>markAtt(s.id, st as string)}
                                className={`text-xs px-2 py-1 rounded-lg border font-medium transition-all ${cur===st?cls+' ring-2 ring-offset-1 ring-current scale-105':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                                {icon} {(st as string).replace('_',' ')}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {cur ? <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cur==='present'?'bg-green-100 text-green-700':cur==='absent'?'bg-red-100 text-red-700':cur==='half_day'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700'}`}>{cur.replace('_',' ')}</span>
                            : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: LEAVES ── */}
      {tab==='leaves' && (
        <div className="space-y-6">
          {showLeaveForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Record Leave</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Staff Member *</label>
                  <select className={inputCls} value={leaveForm.staff_id} onChange={e=>setLeaveForm(f=>({...f,staff_id:e.target.value}))}>
                    <option value="">Select staff…</option>
                    {activeStaff.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Leave Type</label>
                  <select className={inputCls} value={leaveForm.leave_type} onChange={e=>setLeaveForm(f=>({...f,leave_type:e.target.value}))}>
                    {LEAVE_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)} Leave</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Start Date</label>
                  <input type="date" className={inputCls} value={leaveForm.start_date} onChange={e=>setLeaveForm(f=>({...f,start_date:e.target.value}))} /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">End Date</label>
                  <input type="date" className={inputCls} value={leaveForm.end_date} onChange={e=>setLeaveForm(f=>({...f,end_date:e.target.value}))} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-medium text-gray-600 mb-1 block">Reason</label>
                  <input className={inputCls} value={leaveForm.reason} onChange={e=>setLeaveForm(f=>({...f,reason:e.target.value}))} placeholder="Reason for leave" /></div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={saveLeave} disabled={!leaveForm.staff_id} className={btnPrimary}>Save</button>
                <button onClick={()=>setShowLeaveForm(false)} className={btnGhost}>Cancel</button>
              </div>
            </div>
          )}

          {pendingLeaves.length>0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⏳ Pending Approvals ({pendingLeaves.length})</h3>
              <div className="space-y-3">
                {pendingLeaves.map(l => {
                  const s = staff.find(x=>x.id===l.staff_id)
                  return (
                    <div key={l.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{s?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {l.leave_type} leave · {new Date(l.start_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.end_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · {l.days_count} day{l.days_count!==1?'s':''}
                        </p>
                        {l.reason && <p className="text-xs text-gray-400 mt-0.5 italic">&quot;{l.reason}&quot;</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>updateLeaveStatus(l.id,'approved')} className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                        <button onClick={()=>updateLeaveStatus(l.id,'rejected')} className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100">Reject</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Leave History</h3>
            {leaves.filter(l=>l.status!=='pending').length===0 && leaves.length===0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No leave records yet.</p>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Staff','Type','Period','Days','Status'].map(h=>(
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leaves.map(l=>{
                      const s=staff.find(x=>x.id===l.staff_id)
                      return (
                        <tr key={l.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{s?.name??'—'}</td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{l.leave_type}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.start_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.end_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                          <td className="px-4 py-3 text-gray-600">{l.days_count}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${l.status==='approved'?'bg-green-100 text-green-700':l.status==='rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: PAYROLL ── */}
      {tab==='payroll' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select value={payMonth} onChange={e=>setPayMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={payYear} onChange={e=>setPayYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-sm text-gray-500">{monthStr(payMonth,payYear)}</span>
          </div>

          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'Total Payroll', value:`₹${totalPayroll.toLocaleString('en-IN')}`, color:'text-blue-700 bg-blue-50 border-blue-200' },
              { label:'Paid', value:`${paidCount} / ${salaryRows.length}`, color:'text-green-700 bg-green-50 border-green-200' },
              { label:'Pending', value:`${salaryRows.length-paidCount}`, color:'text-amber-700 bg-amber-50 border-amber-200' },
            ].map(s=>(
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {salaryRows.length===0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No active staff for payroll.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Staff','Base Salary','Bonus','Deductions','Net Salary','Status','Action'].map(h=>(
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salaryRows.map(row=>{
                    const s=staff.find(x=>x.id===row.staff_id)
                    const edit=getEdit(row.staff_id)
                    const net=row.base_salary+edit.bonus-edit.deductions
                    const paid=row.status==='paid'
                    return (
                      <tr key={row.staff_id} className={`hover:bg-gray-50 ${paid?'opacity-60':''}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{s?.name??'—'}</td>
                        <td className="px-4 py-3 text-gray-700">₹{Number(row.base_salary).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <input type="number" disabled={paid} value={edit.bonus}
                            onChange={e=>setSalaryEdits(ed=>({...ed,[row.staff_id]:{...getEdit(row.staff_id),bonus:Number(e.target.value)||0}}))}
                            className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" disabled={paid} value={edit.deductions}
                            onChange={e=>setSalaryEdits(ed=>({...ed,[row.staff_id]:{...getEdit(row.staff_id),deductions:Number(e.target.value)||0}}))}
                            className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{net.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${paid?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{paid?`Paid ${row.paid_date?new Date(row.paid_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):''}` :'pending'}</span>
                        </td>
                        <td className="px-4 py-3">
                          {!paid && <button onClick={()=>markPaid(row)} className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700">Mark Paid</button>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
