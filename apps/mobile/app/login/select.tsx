import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function LoginSelect() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.logo}>Cliniqo</Text>
        <Text style={styles.tagline}>Complete Clinic Management</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity style={[styles.card, styles.ownerCard]} onPress={() => router.push('/login/owner')}>
          <Text style={styles.cardIcon}>🏥</Text>
          <Text style={styles.cardTitle}>Clinic Owner</Text>
          <Text style={styles.cardDesc}>Login with your registered email & password to manage your clinic</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.staffCard]} onPress={() => router.push('/login/staff')}>
          <Text style={styles.cardIcon}>👨‍⚕️</Text>
          <Text style={styles.cardTitle}>Staff Member</Text>
          <Text style={styles.cardDesc}>Login with your Clinic ID, phone number, and PIN provided by your clinic</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Cliniqo · Built for small & medium clinics</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF', padding: 24, justifyContent: 'space-between' },
  header: { marginTop: 60, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '800', color: '#2563EB', letterSpacing: -1 },
  tagline: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  cards: { gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  ownerCard: { borderColor: '#2563EB' },
  staffCard: { borderColor: '#059669' },
  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  footer: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
})
