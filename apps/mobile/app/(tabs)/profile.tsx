import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getSession, clearSession } from '../../src/lib/auth'
import { supabase } from '../../src/lib/supabase'
import type { AppSession } from '../../src/types'

export default function ProfileScreen() {
  const [session, setSession] = useState<AppSession | null>(null)

  useEffect(() => {
    getSession().then(setSession)
  }, [])

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          if (session?.type === 'owner') await supabase.auth.signOut()
          await clearSession()
          router.replace('/login/select')
        }
      }
    ])
  }

  const isOwner = session?.type === 'owner'
  const name = isOwner ? session?.owner?.doctor_name : session?.staff?.name
  const subtitle = isOwner ? session?.owner?.clinic_name : session?.staff?.role?.replace(/_/g, ' ')
  const permissions = session?.staff?.permissions

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(name ?? 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.name}>{name ?? 'Loading...'}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={[styles.badge, isOwner ? styles.ownerBadge : styles.staffBadge]}>
          <Text style={[styles.badgeText, isOwner ? styles.ownerBadgeText : styles.staffBadgeText]}>
            {isOwner ? '🏥 Clinic Owner' : '👨‍⚕️ Staff Member'}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <InfoRow icon="business-outline" label="Clinic ID" value={session?.subdomain ?? '—'} />
        {isOwner && <InfoRow icon="mail-outline" label="Email" value={session?.owner?.email ?? '—'} />}
        {!isOwner && <InfoRow icon="call-outline" label="Phone" value={session?.staff?.phone ?? '—'} />}
        {!isOwner && <InfoRow icon="wallet-outline" label="Salary" value={session?.staff?.salary ? `₹${Number(session.staff.salary).toLocaleString('en-IN')}/mo` : '—'} />}
      </View>

      {/* Permissions (staff only) */}
      {!isOwner && permissions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Permissions</Text>
          <PermRow label="Mark Attendance" granted={permissions.can_mark_attendance} />
          <PermRow label="View Appointments" granted={permissions.can_view_appointments} />
          <PermRow label="Manage Inventory" granted={permissions.can_manage_inventory} />
          <PermRow label="View Patients" granted={permissions.can_view_patients} />
          <PermRow label="Add Patients" granted={permissions.can_add_patients} />
          <PermRow label="View Payroll" granted={permissions.can_view_payroll} />
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        {isOwner && (
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming soon', 'Web dashboard: cliniqo.online')}>
            <Ionicons name="desktop-outline" size={20} color="#2563EB" />
            <Text style={styles.actionText}>Open Web Dashboard</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionRow, styles.logoutRow]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={[styles.actionText, { color: '#DC2626' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Cliniqo Mobile v1.0.0</Text>
    </ScrollView>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={18} color="#6B7280" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function PermRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <View style={styles.permRow}>
      <Text style={styles.permLabel}>{label}</Text>
      <View style={[styles.permBadge, granted ? styles.permGranted : styles.permDenied]}>
        <Text style={[styles.permBadgeText, granted ? styles.permGrantedText : styles.permDeniedText]}>
          {granted ? '✓ Allowed' : '✗ Restricted'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textTransform: 'capitalize' },
  badge: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  ownerBadge: { backgroundColor: '#EFF6FF' },
  staffBadge: { backgroundColor: '#ECFDF5' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  ownerBadgeText: { color: '#2563EB' },
  staffBadgeText: { color: '#059669' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { flex: 1, fontSize: 14, color: '#374151' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  permLabel: { fontSize: 14, color: '#374151' },
  permBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  permGranted: { backgroundColor: '#D1FAE5' },
  permDenied: { backgroundColor: '#F3F4F6' },
  permBadgeText: { fontSize: 11, fontWeight: '700' },
  permGrantedText: { color: '#065F46' },
  permDeniedText: { color: '#6B7280' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  logoutRow: { borderBottomWidth: 0 },
  actionText: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 8 },
})
