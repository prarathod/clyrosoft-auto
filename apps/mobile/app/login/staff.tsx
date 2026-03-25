import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { loginStaff } from '../../src/lib/auth'

export default function StaffLogin() {
  const [clinicId, setClinicId] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!clinicId.trim() || !phone.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please fill in all fields.')
      return
    }
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits.')
      return
    }
    setLoading(true)
    const result = await loginStaff(clinicId.trim(), phone.trim(), pin.trim())
    setLoading(false)
    if (result.error) {
      Alert.alert('Login Failed', result.error)
    } else {
      router.replace('/(tabs)')
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>👨‍⚕️</Text>
        </View>
        <Text style={styles.title}>Staff Login</Text>
        <Text style={styles.subtitle}>Your clinic owner will provide you with the Clinic ID and PIN</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 Ask your clinic owner for: Clinic ID, your registered phone number, and your PIN</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Clinic ID</Text>
          <TextInput
            style={styles.input}
            value={clinicId}
            onChangeText={setClinicId}
            placeholder="e.g. jaisamatdada"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Your Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="9876543210"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Your PIN</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="••••"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  icon: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  infoBox: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 16 },
  infoText: { fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
  form: { gap: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827' },
  btn: { backgroundColor: '#059669', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
