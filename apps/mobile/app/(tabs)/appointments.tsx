import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getSession } from '../../src/lib/auth'
import { supabase } from '../../src/lib/supabase'
import type { AppSession, Patient, Appointment } from '../../src/types'

export default function PatientsScreen() {
  const [session, setSession] = useState<AppSession | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tab, setTab] = useState<'patients' | 'appointments'>('appointments')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [patientForm, setPatientForm] = useState({ name: '', phone: '', gender: 'male', notes: '' })
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    getSession().then(s => {
      setSession(s)
      if (s) { loadPatients(s.subdomain); loadAppointments(s.subdomain) }
    })
  }, [])

  async function loadPatients(subdomain: string) {
    const { data } = await supabase.from('patients').select('*').eq('subdomain', subdomain).order('name')
    setPatients(data ?? [])
  }

  async function loadAppointments(subdomain: string) {
    const { data } = await supabase.from('appointments').select('*').eq('subdomain', subdomain)
      .gte('appointment_date', today).order('appointment_date').order('appointment_time').limit(50)
    setAppointments(data ?? [])
  }

  async function onRefresh() {
    setRefreshing(true)
    if (session) { await loadPatients(session.subdomain); await loadAppointments(session.subdomain) }
    setRefreshing(false)
  }

  async function addPatient() {
    if (!patientForm.name.trim() || !session) return
    setSaving(true)
    await supabase.from('patients').insert({ subdomain: session.subdomain, name: patientForm.name.trim(), phone: patientForm.phone.trim() || null, gender: patientForm.gender, notes: patientForm.notes || null })
    setSaving(false)
    setShowAddPatient(false)
    setPatientForm({ name: '', phone: '', gender: 'male', notes: '' })
    loadPatients(session.subdomain)
  }

  async function updateApptStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.phone ?? '').includes(search))
  const todayAppts = appointments.filter(a => a.appointment_date === today)
  const upcomingAppts = appointments.filter(a => a.appointment_date > today)

  const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending:   { bg: '#FEF3C7', text: '#92400E' },
    confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
    completed: { bg: '#D1FAE5', text: '#065F46' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        {(session?.type === 'owner' || session?.staff?.permissions?.can_add_patients) && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddPatient(true)}>
            <Ionicons name="person-add-outline" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'appointments' && styles.tabActive]} onPress={() => setTab('appointments')}>
          <Text style={[styles.tabLabel, tab === 'appointments' && styles.tabLabelActive]}>📅 Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'patients' && styles.tabActive]} onPress={() => setTab('patients')}>
          <Text style={[styles.tabLabel, tab === 'patients' && styles.tabLabelActive]}>👥 All Patients ({patients.length})</Text>
        </TouchableOpacity>
      </View>

      {tab === 'appointments' && (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {todayAppts.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Today ({todayAppts.length})</Text>
              {todayAppts.map(a => (
                <View key={a.id} style={styles.apptCard}>
                  <View style={styles.apptLeft}>
                    <Text style={styles.apptTime}>{a.appointment_time}</Text>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[a.status]?.bg }]} />
                  </View>
                  <View style={styles.apptCenter}>
                    <Text style={styles.apptName}>{a.patient_name}</Text>
                    <Text style={styles.apptPhone}>{a.patient_phone}</Text>
                    {a.service && <Text style={styles.apptService}>{a.service}</Text>}
                  </View>
                  <View style={styles.apptActions}>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[a.status]?.bg }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[a.status]?.text }]}>{a.status}</Text>
                    </View>
                    {a.status === 'pending' && (
                      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                        <TouchableOpacity style={styles.miniGreen} onPress={() => updateApptStatus(a.id, 'confirmed')}>
                          <Text style={{ fontSize: 10, color: '#059669', fontWeight: '600' }}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.miniGreen} onPress={() => updateApptStatus(a.id, 'completed')}>
                          <Text style={{ fontSize: 10, color: '#059669', fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </>
          )}
          {upcomingAppts.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Upcoming ({upcomingAppts.length})</Text>
              {upcomingAppts.map(a => (
                <View key={a.id} style={styles.apptCard}>
                  <View style={styles.apptLeft}>
                    <Text style={styles.apptDate}>{new Date(a.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                    <Text style={styles.apptTime}>{a.appointment_time}</Text>
                  </View>
                  <View style={styles.apptCenter}>
                    <Text style={styles.apptName}>{a.patient_name}</Text>
                    <Text style={styles.apptPhone}>{a.patient_phone}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[a.status]?.bg }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[a.status]?.text }]}>{a.status}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
          {appointments.length === 0 && (
            <View style={styles.empty}><Text style={styles.emptyIcon}>📅</Text><Text style={styles.emptyText}>No upcoming appointments</Text></View>
          )}
        </ScrollView>
      )}

      {tab === 'patients' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <TextInput style={styles.searchInput} placeholder="Search by name or phone…" value={search} onChangeText={setSearch} placeholderTextColor="#9CA3AF" />
          </View>
          <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {filteredPatients.map(p => (
              <View key={p.id} style={styles.patientCard}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.avatarText}>{p.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{p.name}</Text>
                  <Text style={styles.patientPhone}>{p.phone ?? '—'} · {p.gender} · {p.blood_group || '?'}</Text>
                  {(p.chronic_conditions?.length > 0) && (
                    <Text style={styles.patientConditions}>{p.chronic_conditions.join(', ')}</Text>
                  )}
                </View>
              </View>
            ))}
            {filteredPatients.length === 0 && (
              <View style={styles.empty}><Text style={styles.emptyIcon}>👥</Text><Text style={styles.emptyText}>{search ? 'No patients match' : 'No patients yet'}</Text></View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Add Patient Modal */}
      <Modal visible={showAddPatient} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Patient</Text>
              <TouchableOpacity onPress={() => setShowAddPatient(false)}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput style={styles.modalInput} value={patientForm.name} onChangeText={v => setPatientForm(f => ({ ...f, name: v }))} placeholder="Patient name" />
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput style={styles.modalInput} value={patientForm.phone} onChangeText={v => setPatientForm(f => ({ ...f, phone: v }))} placeholder="9876543210" keyboardType="phone-pad" />
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput style={[styles.modalInput, { height: 70 }]} value={patientForm.notes} onChangeText={v => setPatientForm(f => ({ ...f, notes: v }))} placeholder="Allergies, conditions…" multiline />
            <TouchableOpacity style={[styles.confirmBtn, saving && { opacity: 0.6 }]} onPress={addPatient} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Add Patient</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  addBtn: { backgroundColor: '#2563EB', width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
  tabActive: { backgroundColor: '#2563EB' },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabLabelActive: { color: '#fff' },
  content: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10 },
  apptCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', gap: 12, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  apptLeft: { alignItems: 'center', minWidth: 40 },
  apptDate: { fontSize: 11, color: '#6B7280' },
  apptTime: { fontSize: 14, fontWeight: '700', color: '#111827' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  apptCenter: { flex: 1 },
  apptName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  apptPhone: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  apptService: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  apptActions: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  miniGreen: { borderWidth: 1, borderColor: '#6EE7B7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#ECFDF5' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  patientCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', gap: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  patientAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  patientPhone: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  patientConditions: { fontSize: 11, color: '#DC2626', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', marginBottom: 12 },
  confirmBtn: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
