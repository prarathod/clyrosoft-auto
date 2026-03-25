import { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getSession } from '../../src/lib/auth'
import type { AppSession } from '../../src/types'

export default function TabsLayout() {
  const [session, setSession] = useState<AppSession | null>(null)

  useEffect(() => {
    getSession().then(setSession)
  }, [])

  const isOwner = session?.type === 'owner'
  const canManageInventory = isOwner || session?.staff?.permissions?.can_manage_inventory
  const canViewPatients = isOwner || session?.staff?.permissions?.can_view_patients
  const canViewAppointments = isOwner || session?.staff?.permissions?.can_view_appointments

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />,
        }}
      />
      {canViewAppointments && (
        <Tabs.Screen
          name="appointments"
          options={{
            title: 'Patients',
            tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
          }}
        />
      )}
      {canManageInventory && (
        <Tabs.Screen
          name="inventory"
          options={{
            title: 'Inventory',
            tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={22} color={color} />,
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  )
}
