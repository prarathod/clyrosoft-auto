import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getSession } from '../../src/lib/auth'
import { supabase } from '../../src/lib/supabase'
import type { AppSession } from '../../src/types'

interface Stats {
  todayAppointments: number
  pendingAppointments: number
  lowStockItems: number
  todayPresent: number
  totalStaff: number
  pendingFollowups: number
}

export default function HomeScreen() {
  const [session, setSession] = useState<AppSession | null>(null)
  const [stats, setStats] = useState<Stats>({ todayAppointments: 0, pendingAppointments: 0, lowStockItems: 0, todayPresent: 0, totalStaff: 0, pendingFollowups: 0 })
  const [refreshing, setRefreshing] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    getSession().then(s => {
      setSession(s)
      if (s) loadStats(s.subdomain)
    })
  }, [])

  async function loadStats(subdomain: string) {
    const [appts, inventory, attendance, staff, followups] = await Promise.all([
      supabase.from('appointments').select('id, status').eq('subdomain', subdomain).eq('appointment_date', today),
      supabase.from('inventory_items').select('id, current_stock, min_stock_alert').eq('subdomain', subdomain),
      supabase.from('attendance').select('status').eq('subdomain', subdomain).eq('date', today),
      supabase.from('staff').select('id').eq('subdomain', subdomain).eq('status', 'active'),
      supabase.from('patient_followups').select('id').eq('subdomain', subdomain).eq('followup_date', today).eq('status', 'scheduled'),
    ])

    const items = inventory.data ?? []
    setStats({
      todayAppointments: appts.data?.length ?? 0,
      pendingAppointments: appts.data?.filter(a => a.status === 'pending').length ?? 0,
      lowStockItems: items.filter(i => i.current_stock <= i.min_stock_alert).length,
      todayPresent: attendance.data?.filter(a => a.status === 'present').length ?? 0,
      totalStaff: staff.data?.length ?? 0,
      pendingFollowups: followups.data?.length ?? 0,
    })
  }

  async function onRefresh() {
    setRefreshing(true)
    if (session) await loadStats(session.subdomain)
    setRefreshing(false)
  }

  const isOwner = session?.type === 'owner'
  const displayName = isOwner ? session?.owner?.clinic_name : session?.staff?.name

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()} 👋</Text>
          <Text style={styles.clinicName}>{displayName ?? 'Loading...'}</Text>
          {!isOwner && session?.staff && (
            <Text style={styles.role}>{session.staff.role.replace(/_/g, ' ')}</Text>
          )}
        </View>
        {isOwner && (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerBadgeText}>Owner</Text>
          </View>
        )}
      </View>

      {/* Today's date */}
      <View style={styles.dateBar}>
        <Ionicons name="calendar" size={14} color="#6B7280" />
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      </View>

      {/* Stats grid */}
      <Text style={styles.sectionTitle}>Today&apos;s Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="calendar-outline" label="Today's Appointments" value={stats.todayAppointments} accent="#2563EB" onPress={() => router.push('/(tabs)/appointments')} />
        <StatCard icon="time-outline" label="Pending" value={stats.pendingAppointments} accent="#D97706" onPress={() => router.push('/(tabs)/appointments')} />
        <StatCard icon="people-outline" label="Present Today" value={`${stats.todayPresent}/${stats.totalStaff}`} accent="#059669" onPress={() => router.push('/(tabs)/attendance')} />
        <StatCard icon="notifications-outline" label="Follow-ups Due" value={stats.pendingFollowups} accent="#7C3AED" onPress={() => router.push('/(tabs)/appointments')} />
      </View>

      {stats.lowStockItems > 0 && (
        <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/(tabs)/inventory')}>
          <Ionicons name="warning" size={18} color="#DC2626" />
          <Text style={styles.alertText}>{stats.lowStockItems} items are low on stock — tap to restock</Text>
          <Ionicons name="chevron-forward" size={16} color="#DC2626" />
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <QuickAction icon="checkmark-circle-outline" label="Mark Attendance" color="#059669" onPress={() => router.push('/(tabs)/attendance')} />
        {(isOwner || session?.staff?.permissions?.can_view_patients) && (
          <QuickAction icon="person-add-outline" label="Add Patient" color="#2563EB" onPress={() => router.push('/(tabs)/appointments')} />
        )}
        {(isOwner || session?.staff?.permissions?.can_manage_inventory) && (
          <QuickAction icon="scan-outline" label="Scan Inventory" color="#7C3AED" onPress={() => router.push('/(tabs)/inventory')} />
        )}
        <QuickAction icon="call-outline" label="Call Clinic" color="#D97706" onPress={() => {}} />
      </View>
    </ScrollView>
  )
}

function StatCard({ icon, label, value, accent, onPress }: {
  icon: string; label: string; value: number | string; accent: string; onPress: () => void
}) {
  return (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: accent }]} onPress={onPress}>
      <Ionicons name={icon as any} size={20} color={accent} />
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting: { fontSize: 14, color: '#6B7280' },
  clinicName: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 2 },
  role: { fontSize: 12, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  ownerBadge: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#BFDBFE' },
  ownerBadgeText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  dateBar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  dateText: { fontSize: 13, color: '#6B7280' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '47%',
    borderLeftWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 26, fontWeight: '800', marginTop: 6, marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#6B7280', lineHeight: 14 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#FECACA', marginBottom: 20,
  },
  alertText: { flex: 1, fontSize: 13, color: '#DC2626', fontWeight: '500' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickAction: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '47%',
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  quickActionLabel: { fontSize: 12, color: '#374151', fontWeight: '600', textAlign: 'center' },
})
