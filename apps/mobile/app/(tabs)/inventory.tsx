import { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { getSession } from '../../src/lib/auth'
import { supabase } from '../../src/lib/supabase'
import type { AppSession, InventoryItem } from '../../src/types'

export default function InventoryScreen() {
  const [session, setSession] = useState<AppSession | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null)
  const [useQty, setUseQty] = useState('1')
  const [useReason, setUseReason] = useState('')
  const [useSaving, setUseSaving] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const lastScan = useRef<string>('')

  useEffect(() => {
    getSession().then(s => {
      setSession(s)
      if (s) loadItems(s.subdomain)
    })
  }, [])

  async function loadItems(subdomain: string) {
    const { data } = await supabase.from('inventory_items').select('*').eq('subdomain', subdomain).order('name')
    setItems(data ?? [])
  }

  function onBarcodeScanned({ data }: { data: string }) {
    if (data === lastScan.current) return
    lastScan.current = data
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    const found = items.find(i => i.barcode === data)
    if (found) {
      setScannerOpen(false)
      setScannedItem(found)
      lastScan.current = ''
    } else {
      Alert.alert('Item Not Found', `No inventory item with barcode: ${data}.\n\nAsk your clinic owner to add this item first.`, [
        { text: 'Scan Again', onPress: () => { lastScan.current = '' } },
        { text: 'Cancel', onPress: () => { setScannerOpen(false); lastScan.current = '' } },
      ])
    }
  }

  async function recordUsage() {
    if (!scannedItem || !session) return
    const qty = Number(useQty)
    if (!qty || qty <= 0) { Alert.alert('Error', 'Enter a valid quantity.'); return }
    if (qty > scannedItem.current_stock) { Alert.alert('Insufficient Stock', `Only ${scannedItem.current_stock} ${scannedItem.unit} available.`); return }

    setUseSaving(true)
    const newStock = scannedItem.current_stock - qty
    await supabase.from('inventory_items').update({ current_stock: newStock }).eq('id', scannedItem.id)
    await supabase.from('inventory_transactions').insert({
      subdomain: session.subdomain,
      item_id: scannedItem.id,
      type: 'out',
      quantity: qty,
      unit_price: scannedItem.sell_price,
      reason: useReason || 'Staff usage',
      staff_name: session.type === 'staff' ? session.staff?.name : 'Owner',
    })
    setUseSaving(false)
    setScannedItem(null)
    setUseQty('1')
    setUseReason('')
    loadItems(session.subdomain)
    Alert.alert('Recorded ✓', `Used ${qty} ${scannedItem.unit} of ${scannedItem.name}. Stock: ${newStock} remaining.`)
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) || (i.barcode?.includes(search) ?? false)
  )
  const lowStock = items.filter(i => i.current_stock <= i.min_stock_alert)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>{items.length} items · {lowStock.length} low stock</Text>
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={() => {
          if (!permission?.granted) { requestPermission(); return }
          setScannerOpen(true)
        }}>
          <Ionicons name="scan" size={20} color="#fff" />
          <Text style={styles.scanBtnText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning-outline" size={16} color="#DC2626" />
          <Text style={styles.alertText}>{lowStock.length} item{lowStock.length > 1 ? 's' : ''} below minimum stock level</Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items or scan barcode…"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Items list */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.map(item => {
          const isLow = item.current_stock <= item.min_stock_alert
          return (
            <TouchableOpacity key={item.id} style={[styles.itemCard, isLow && styles.itemCardLow]} onPress={() => setScannedItem(item)}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  {item.barcode && <Text style={styles.itemBarcode}>· {item.barcode}</Text>}
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={[styles.stockNum, isLow && styles.stockLow]}>{item.current_stock}</Text>
                <Text style={styles.stockUnit}>{item.unit}</Text>
                {isLow && <View style={styles.lowBadge}><Text style={styles.lowBadgeText}>Low</Text></View>}
              </View>
            </TouchableOpacity>
          )
        })}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>{search ? 'No items match your search' : 'No inventory items'}</Text>
          </View>
        )}
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={scannerOpen} animationType="slide">
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <TouchableOpacity onPress={() => setScannerOpen(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan Barcode / QR Code</Text>
          </View>
          <CameraView style={StyleSheet.absoluteFill} onBarcodeScanned={onBarcodeScanned} barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'upc_a'] }}>
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanHint}>Point camera at item&apos;s barcode or QR code</Text>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* Use Item Modal */}
      <Modal visible={!!scannedItem} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Usage</Text>
              <TouchableOpacity onPress={() => setScannedItem(null)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {scannedItem && (
              <>
                <View style={styles.modalItem}>
                  <Text style={styles.modalItemName}>{scannedItem.name}</Text>
                  <Text style={styles.modalItemStock}>Available: {scannedItem.current_stock} {scannedItem.unit}</Text>
                </View>

                <Text style={styles.inputLabel}>Quantity Used</Text>
                <TextInput
                  style={styles.modalInput}
                  value={useQty}
                  onChangeText={setUseQty}
                  keyboardType="number-pad"
                  placeholder="1"
                />

                <Text style={styles.inputLabel}>Reason (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={useReason}
                  onChangeText={setUseReason}
                  placeholder="e.g. OPD patient, dressing change…"
                />

                <TouchableOpacity style={[styles.confirmBtn, useSaving && { opacity: 0.6 }]} onPress={recordUsage} disabled={useSaving}>
                  {useSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Record Usage</Text>}
                </TouchableOpacity>
              </>
            )}
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
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  scanBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', marginHorizontal: 20, borderRadius: 10, padding: 10, marginBottom: 8 },
  alertText: { fontSize: 12, color: '#DC2626', fontWeight: '500' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  list: { flex: 1, paddingHorizontal: 20 },
  itemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  itemCardLow: { borderLeftWidth: 3, borderLeftColor: '#DC2626' },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemMeta: { flexDirection: 'row', gap: 4, marginTop: 2 },
  itemCategory: { fontSize: 11, color: '#6B7280' },
  itemBarcode: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  stockNum: { fontSize: 20, fontWeight: '800', color: '#111827' },
  stockLow: { color: '#DC2626' },
  stockUnit: { fontSize: 10, color: '#9CA3AF' },
  lowBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  lowBadgeText: { fontSize: 10, color: '#DC2626', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  // Scanner
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 56, zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: { padding: 8 },
  scannerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  scanOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#fff', borderRadius: 16, backgroundColor: 'transparent' },
  scanHint: { color: '#fff', fontSize: 13, marginTop: 20, textAlign: 'center', paddingHorizontal: 40 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalItem: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, marginBottom: 16 },
  modalItemName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalItemStock: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', marginBottom: 12 },
  confirmBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
