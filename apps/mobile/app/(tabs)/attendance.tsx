import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import { getSession } from '../../src/lib/auth'
import { supabase } from '../../src/lib/supabase'
import type { AppSession } from '../../src/types'

// Clinic coordinates (owner sets this in settings)
// For demo: Pune city center
const CLINIC_LAT = 18.5204
const CLINIC_LNG = 73.8567
const ALLOWED_RADIUS_METERS = 500

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const STATUS_CONFIG = {
  present:  { label: 'Present',   emoji: '✅', bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  absent:   { label: 'Absent',    emoji: '❌', bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  half_day: { label: 'Half Day',  emoji: '🌓', bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  leave:    { label: 'On Leave',  emoji: '🌴', bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
}

export default function AttendanceScreen() {
  const [session, setSession] = useState<AppSession | null>(null)
  const [todayStatus, setTodayStatus] = useState<string | null>(null)
  const [allStaff, setAllStaff] = useState<any[]>([])
  const [attMap, setAttMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [withinRange, setWithinRange] = useState<boolean | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const isOwner = session?.type === 'owner'

  useEffect(() => {
    getSession().then(s => {
      setSession(s)
      if (s) {
        loadAttendance(s)
        if (!isOwner && s.staff) checkLocation()
      }
    })
  }, [])

  async function checkLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setLocationError('Location permission denied. Attendance requires location access.')
      setWithinRange(false)
      return
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    const dist = haversineDistance(loc.coords.latitude, loc.coords.longitude, CLINIC_LAT, CLINIC_LNG)

    // Update last known location in DB
    if (session?.staff) {
      await supabase.from('staff').update({
        last_lat: loc.coords.latitude,
        last_lng: loc.coords.longitude,
        last_location_at: new Date().toISOString(),
      }).eq('id', session.staff.id)
    }

    if (dist <= ALLOWED_RADIUS_METERS) {
      setWithinRange(true)
      setLocationError(null)
    } else {
      setWithinRange(false)
      setLocationError(`You are ${Math.round(dist)}m away from the clinic. Must be within ${ALLOWED_RADIUS_METERS}m to mark attendance.`)
    }
  }

  async function loadAttendance(s: AppSession) {
    if (s.type === 'staff' && s.staff) {
      // Staff: only load own attendance
      const { data } = await supabase.from('attendance')
        .select('*').eq('subdomain', s.subdomain)
        .eq('staff_id', s.staff.id).eq('date', today).single()
      setTodayStatus(data?.status ?? null)
    } else if (s.type === 'owner') {
      // Owner: load all staff + their attendance
      const { data: staffList } = await supabase.from('staff').select('*').eq('subdomain', s.subdomain).eq('status', 'active')
      setAllStaff(staffList ?? [])
      const { data: attList } = await supabase.from('attendance').select('*').eq('subdomain', s.subdomain).eq('date', today)
      const map: Record<string, string> = {}
      ;(attList ?? []).forEach((a: any) => { map[a.staff_id] = a.status })
      setAttMap(map)
    }
  }

  async function markMyAttendance(status: string) {
    if (!session?.staff) return
    if (!withinRange) {
      Alert.alert('Location Required', locationError ?? 'Please enable location access to mark attendance.')
      return
    }
    setLoading(true)
    await supabase.from('attendance').upsert(
      { subdomain: session.subdomain, staff_id: session.staff.id, date: today, status },
      { onConflict: 'staff_id,date' }
    )
    setTodayStatus(status)
    setLoading(false)
  }

  async function markStaffAttendance(staffId: string, status: string) {
    if (!session) return
    await supabase.from('attendance').upsert(
      { subdomain: session.subdomain, staff_id: staffId, date: today, status },
      { onConflict: 'staff_id,date' }
    )
    setAttMap(m => ({ ...m, [staffId]: status }))
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      {/* Staff: Mark own attendance */}
      {!isOwner && session?.staff && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mark Your Attendance</Text>

          {/* Location status */}
          <View style={[styles.locationBar, { backgroundColor: withinRange === true ? '#D1FAE5' : withinRange === false ? '#FEE2E2' : '#F3F4F6' }]}>
            <Ionicons
              name={withinRange === true ? 'location' : 'location-outline'}
              size={16}
              color={withinRange === true ? '#059669' : withinRange === false ? '#DC2626' : '#6B7280'}
            />
            <Text style={[styles.locationText, { color: withinRange === true ? '#059669' : withinRange === false ? '#DC2626' : '#6B7280' }]}>
              {withinRange === null ? 'Checking location…' : withinRange ? 'Within clinic area ✓' : locationError ?? 'Location check failed'}
            </Text>
            <TouchableOpacity onPress={checkLocation}>
              <Ionicons name="refresh" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {todayStatus && (
            <View style={[styles.currentStatus, { backgroundColor: STATUS_CONFIG[todayStatus as keyof typeof STATUS_CONFIG]?.bg }]}>
              <Text style={{ fontSize: 20 }}>{STATUS_CONFIG[todayStatus as keyof typeof STATUS_CONFIG]?.emoji}</Text>
              <Text style={[styles.currentStatusText, { color: STATUS_CONFIG[todayStatus as keyof typeof STATUS_CONFIG]?.text }]}>
                Today: {STATUS_CONFIG[todayStatus as keyof typeof STATUS_CONFIG]?.label}
              </Text>
            </View>
          )}

          <View style={styles.statusButtons}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <TouchableOpacity
                key={key}
                style={[styles.statusBtn, todayStatus === key && { borderColor: cfg.border, backgroundColor: cfg.bg }]}
                onPress={() => markMyAttendance(key)}
                disabled={loading}
              >
                <Text style={styles.statusBtnEmoji}>{cfg.emoji}</Text>
                <Text style={[styles.statusBtnLabel, todayStatus === key && { color: cfg.text, fontWeight: '700' }]}>{cfg.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading && <ActivityIndicator color="#2563EB" style={{ marginTop: 12 }} />}
        </View>
      )}

      {/* Owner: Mark all staff attendance */}
      {isOwner && (
        <View>
          <Text style={styles.sectionTitle}>All Staff</Text>
          {allStaff.map(s => {
            const cur = attMap[s.id]
            const cfg = cur ? STATUS_CONFIG[cur as keyof typeof STATUS_CONFIG] : null
            return (
              <View key={s.id} style={styles.staffRow}>
                <View style={styles.staffInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{s.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</Text>
                  </View>
                  <View>
                    <Text style={styles.staffName}>{s.name}</Text>
                    <Text style={styles.staffRole}>{s.role.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
                {cfg ? (
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                    <Text style={{ fontSize: 12 }}>{cfg.emoji}</Text>
                    <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
                  </View>
                ) : (
                  <View style={styles.markButtons}>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <TouchableOpacity key={key} style={[styles.miniBtn, { borderColor: cfg.border }]} onPress={() => markStaffAttendance(s.id, key)}>
                        <Text style={{ fontSize: 14 }}>{cfg.emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  date: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  locationBar: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, padding: 10, marginBottom: 14 },
  locationText: { flex: 1, fontSize: 12, fontWeight: '500' },
  currentStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginBottom: 14 },
  currentStatusText: { fontSize: 14, fontWeight: '700' },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, alignItems: 'center', width: '47%' },
  statusBtnEmoji: { fontSize: 22, marginBottom: 4 },
  statusBtnLabel: { fontSize: 12, color: '#374151', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  staffRow: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  staffInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  staffName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  staffRole: { fontSize: 11, color: '#6B7280', textTransform: 'capitalize' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  markButtons: { flexDirection: 'row', gap: 4 },
  miniBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
})
