import { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { getSession } from '../src/lib/auth'

export default function SplashRedirect() {
  useEffect(() => {
    getSession().then(session => {
      if (session) {
        router.replace('/(tabs)')
      } else {
        router.replace('/login/select')
      }
    })
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Cliniqo</Text>
      <ActivityIndicator color="#2563EB" size="large" style={{ marginTop: 24 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: '800', color: '#2563EB', letterSpacing: -1 },
})
