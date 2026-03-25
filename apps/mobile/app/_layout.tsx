import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { getSession } from '../src/lib/auth'
import type { AppSession } from '../src/types'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login/owner" options={{ headerShown: true, title: 'Clinic Owner Login' }} />
        <Stack.Screen name="login/staff" options={{ headerShown: true, title: 'Staff Login' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  )
}
