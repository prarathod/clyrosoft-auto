'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Types ────────────────────────────────────────────────────────────────────

type Item = {
  id: string
  name: string
  category: string
  unit: string
  current_stock: number
  min_stock_alert: number
  cost_price: number
  sell_price: number
  supplier: string | null
  expiry_date: string | null
}

type Transaction = {
  id: string
  item_id: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  unit_price: number
  reason: string | null
  created_at: string
  inventory_items?: { name: string; unit: string }
}

type StockModalState = {
  open: boolean
  mode: 'in' | 'out'
  item: Item | null
}

const CATEGORIES = ['General', 'Medicine', 'Consumable', 'Equipment']

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return Number(n).toLocaleString('en-IN') }

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [subdomain, setSubdomain] = useState('')
  const [tab, setTab] = useState<'items' | 'movements' | 'alerts'>('items')
  const [items, setItems] = useState<Item[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Item form modal
  const [itemModal, setItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [itemForm, setItemForm] = useState({
    name: '', category: 'General', unit: 'units',
    current_stock: '', min_stock_alert: '5',
    cost_price: '', sell_price: '',
    supplier: '', expiry_date: '',
  })

  // Stock in/out modal
  const [stockModal, setStockModal] = useState<StockModalState>({ open: false, mode: 'in', item: null })
  const [stockForm, setStockForm] = useState({ qty: '', unit_price: '', reason: '' })

  // Stock movement forms
  const [movType, setMovType] = useState<'in' | 'out'>('in')
  const [movForm, setMovForm] = useState({ item_id: '', qty: '', unit_price: '', reason: '' })

  // ── Load subdomain ──────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: clinic } = await supabase
        .from('clients')
        .select('subdomain')
        .eq('email', session.user.email!)
        .single()
      if (clinic) setSubdomain(clinic.subdomain)
    })
  }, [])

  // ── Fetch data ──────────────────────────────────────────────────────────────

  const loadItems = useCallback(async () => {
    if (!subdomain) return
    const { data } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('subdomain', subdomain)
      .order('name')
    setItems(data ?? [])
    setLoading(false)
  }, [subdomain])

  const loadTransactions = useCallback(async () => {
    if (!subdomain) return
    const { data } = await supabase
      .from('inventory_transactions')
      .select('*, inventory_items(name, unit)')
      .eq('subdomain', subdomain)
      .order('created_at', { ascending: false })
      .limit(50)
    setTransactions(data ?? [])
  }, [subdomain])

  useEffect(() => {
    if (subdomain) { loadItems(); loadTransactions() }
  }, [subdomain, loadItems, loadTransactions])

  // ── Item CRUD ───────────────────────────────────────────────────────────────

  function openAddItem() {
    setEditingItem(null)
    setItemForm({ name: '', category: 'General', unit: 'units', current_stock: '', min_stock_alert: '5', cost_price: '', sell_price: '', supplier: '', expiry_date: '' })
    setItemModal(true)
  }

  function openEditItem(item: Item) {
    setEditingItem(item)
    setItemForm({
      name: item.name, category: item.category, unit: item.unit,
      current_stock: String(item.current_stock), min_stock_alert: String(item.min_stock_alert),
      cost_price: String(item.cost_price), sell_price: String(item.sell_price),
      supplier: item.supplier ?? '', expiry_date: item.expiry_date ?? '',
    })
    setItemModal(true)
  }

  async function saveItem() {
    if (!itemForm.name.trim()) return setError('Item name is required')
    setSaving(true); setError('')
    const payload = {
      subdomain,
      name: itemForm.name.trim(),
      category: itemForm.category,
      unit: itemForm.unit || 'units',
      current_stock: parseFloat(itemForm.current_stock) || 0,
      min_stock_alert: parseFloat(itemForm.min_stock_alert) || 5,
      cost_price: parseFloat(itemForm.cost_price) || 0,
      sell_price: parseFloat(itemForm.sell_price) || 0,
      supplier: itemForm.supplier || null,
      expiry_date: itemForm.expiry_date || null,
    }
    if (editingItem) {
      await supabase.from('inventory_items').update(payload).eq('id', editingItem.id)
    } else {
      await supabase.from('inventory_items').insert(payload)
    }
    setItemModal(false)
    setSaving(false)
    await loadItems()
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item and all its transactions?')) return
    await supabase.from('inventory_items').delete().eq('id', id)
    await loadItems()
    await loadTransactions()
  }

  // ── Quick stock in/out ──────────────────────────────────────────────────────

  function openStockModal(item: Item, mode: 'in' | 'out') {
    setStockModal({ open: true, mode, item })
    setStockForm({ qty: '', unit_price: String(mode === 'in' ? item.cost_price : 0), reason: '' })
  }

  async function submitStockModal() {
    const { item, mode } = stockModal
    if (!item) return
    const qty = parseFloat(stockForm.qty)
    if (!qty || qty <= 0) return setError('Enter a valid quantity')
    setSaving(true); setError('')

    const newStock = mode === 'in'
      ? item.current_stock + qty
      : Math.max(item.current_stock - qty, 0)

    await supabase.from('inventory_transactions').insert({
      subdomain, item_id: item.id, type: mode, quantity: qty,
      unit_price: parseFloat(stockForm.unit_price) || 0,
      reason: stockForm.reason || null,
    })
    await supabase.from('inventory_items').update({ current_stock: newStock }).eq('id', item.id)

    setStockModal({ open: false, mode: 'in', item: null })
    setSaving(false)
    await loadItems()
    await loadTransactions()
  }

  // ── Stock movement tab ──────────────────────────────────────────────────────

  async function submitMovement() {
    if (!movForm.item_id) return setError('Select an item')
    const qty = parseFloat(movForm.qty)
    if (!qty || qty <= 0) return setError('Enter a valid quantity')
    setSaving(true); setError('')

    const item = items.find(i => i.id === movForm.item_id)
    if (!item) { setSaving(false); return }

    const newStock = movType === 'in'
      ? item.current_stock + qty
      : Math.max(item.current_stock - qty, 0)

    await supabase.from('inventory_transactions').insert({
      subdomain, item_id: movForm.item_id, type: movType, quantity: qty,
      unit_price: parseFloat(movForm.unit_price) || 0,
      reason: movForm.reason || null,
    })
    await supabase.from('inventory_items').update({ current_stock: newStock }).eq('id', movForm.item_id)

    setMovForm({ item_id: '', qty: '', unit_price: '', reason: '' })
    setSaving(false)
    await loadItems()
    await loadTransactions()
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )
  const lowStock = items.filter(i => i.current_stock <= i.min_stock_alert)
  const expiringSoon = items.filter(i => i.expiry_date && daysUntil(i.expiry_date) <= 30 && daysUntil(i.expiry_date) >= 0)
  const expired = items.filter(i => i.expiry_date && daysUntil(i.expiry_date) < 0)

  const TABS = [
    { key: 'items', label: 'Items', count: items.length },
    { key: 'movements', label: 'Stock Movement', count: null },
    { key: 'alerts', label: 'Alerts', count: lowStock.length + expiringSoon.length + expired.length || null },
  ] as const

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 text-sm">Loading inventory...</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500">{items.length} items · {lowStock.length} low stock</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                t.key === 'alerts' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Items ────────────────────────────────────────────────────────── */}
      {tab === 'items' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search items or category..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={openAddItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1.5">
              + Add Item
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-3xl mb-3">📦</p>
              <p className="font-medium text-gray-900">No items found</p>
              <p className="text-sm text-gray-500 mt-1">Add medicines, consumables, or supplies to your inventory</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Cost ₹</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Sell ₹</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Expiry</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(item => {
                    const isLow = item.current_stock <= item.min_stock_alert
                    const days = item.expiry_date ? daysUntil(item.expiry_date) : null
                    const isExpired = days !== null && days < 0
                    const isExpiring = days !== null && days >= 0 && days <= 30
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.supplier && <p className="text-xs text-gray-400">{item.supplier}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{item.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                            {item.current_stock} {item.unit}
                          </span>
                          {isLow && <p className="text-xs text-red-500">Low stock</p>}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">₹{fmt(item.cost_price)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">₹{fmt(item.sell_price)}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {item.expiry_date ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isExpired ? 'bg-red-100 text-red-700' :
                              isExpiring ? 'bg-amber-100 text-amber-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {isExpired ? 'Expired' : isExpiring ? `${days}d left` : new Date(item.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openStockModal(item, 'in')} title="Stock In" className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded font-medium">+</button>
                            <button onClick={() => openStockModal(item, 'out')} title="Stock Out" className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded font-medium">−</button>
                            <button onClick={() => openEditItem(item)} className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded">✎</button>
                            <button onClick={() => deleteItem(item.id)} className="text-xs bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 px-2 py-1 rounded">✕</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Stock Movement ───────────────────────────────────────────────── */}
      {tab === 'movements' && (
        <div className="grid md:grid-cols-2 gap-6">

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 h-fit">
            <h3 className="font-semibold text-gray-900">Record Stock Movement</h3>

            {/* In / Out toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button onClick={() => setMovType('in')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${movType === 'in' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'}`}>Stock In</button>
              <button onClick={() => setMovType('out')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${movType === 'out' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-600'}`}>Stock Out</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Item *</label>
                <select value={movForm.item_id} onChange={e => setMovForm(f => ({ ...f, item_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Select item —</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Stock: {i.current_stock} {i.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" min="0" value={movForm.qty} onChange={e => setMovForm(f => ({ ...f, qty: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                {movType === 'in' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price ₹</label>
                    <input type="number" min="0" value={movForm.unit_price} onChange={e => setMovForm(f => ({ ...f, unit_price: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason / Note</label>
                <input value={movForm.reason} onChange={e => setMovForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Purchase from supplier" />
              </div>
              <button onClick={submitMovement} disabled={saving}
                className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                  movType === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}>
                {saving ? 'Saving...' : `Record ${movType === 'in' ? 'Stock In' : 'Stock Out'}`}
              </button>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Recent Transactions</h3>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No transactions yet</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      tx.type === 'in' ? 'bg-green-100 text-green-700' :
                      tx.type === 'out' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.type === 'in' ? 'IN' : tx.type === 'out' ? 'OUT' : 'ADJ'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{tx.inventory_items?.name}</p>
                      {tx.reason && <p className="text-xs text-gray-400 truncate">{tx.reason}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{tx.quantity} {tx.inventory_items?.unit}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Alerts ───────────────────────────────────────────────────────── */}
      {tab === 'alerts' && (
        <div className="space-y-6">

          {/* Low Stock */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-red-500">⚠</span>
              <h3 className="font-semibold text-gray-900 text-sm">Low Stock</h3>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-auto">{lowStock.length}</span>
            </div>
            {lowStock.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">All items are well stocked</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {lowStock.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category} · Min alert: {item.min_stock_alert} {item.unit}</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">{item.current_stock} {item.unit}</span>
                    <button
                      onClick={() => { setTab('movements'); setMovType('in'); setMovForm(f => ({ ...f, item_id: item.id })) }}
                      className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiring Soon */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="text-amber-500">⏰</span>
              <h3 className="font-semibold text-gray-900 text-sm">Expiring Soon (within 30 days)</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">{expiringSoon.length}</span>
            </div>
            {expiringSoon.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No items expiring in the next 30 days</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {expiringSoon.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category} · {item.current_stock} {item.unit} in stock</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      {daysUntil(item.expiry_date!)}d left · {new Date(item.expiry_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expired */}
          {expired.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2">
                <span className="text-red-600">🚫</span>
                <h3 className="font-semibold text-red-700 text-sm">Expired Items</h3>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-auto">{expired.length}</span>
              </div>
              <div className="divide-y divide-red-50">
                {expired.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category} · {item.current_stock} {item.unit} in stock</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      Expired {new Date(item.expiry_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={() => openEditItem(item)} className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium">
                      Update
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowStock.length === 0 && expiringSoon.length === 0 && expired.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="font-medium text-gray-900">All clear!</p>
              <p className="text-sm text-gray-500 mt-1">No low stock or expiry alerts at this time.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Item Form Modal ────────────────────────────────────────────────────── */}
      {itemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
              <button onClick={() => setItemModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item Name *</label>
                  <input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                  <input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="units / strips / ml" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Opening Stock</label>
                  <input type="number" min="0" value={itemForm.current_stock} onChange={e => setItemForm(f => ({ ...f, current_stock: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Stock Alert</label>
                  <input type="number" min="0" value={itemForm.min_stock_alert} onChange={e => setItemForm(f => ({ ...f, min_stock_alert: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cost Price ₹</label>
                  <input type="number" min="0" value={itemForm.cost_price} onChange={e => setItemForm(f => ({ ...f, cost_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sell Price ₹</label>
                  <input type="number" min="0" value={itemForm.sell_price} onChange={e => setItemForm(f => ({ ...f, sell_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
                  <input value={itemForm.supplier} onChange={e => setItemForm(f => ({ ...f, supplier: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Supplier name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={itemForm.expiry_date} onChange={e => setItemForm(f => ({ ...f, expiry_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setItemModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={saveItem} disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Stock Modal ─────────────────────────────────────────────────── */}
      {stockModal.open && stockModal.item && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {stockModal.mode === 'in' ? '+ Stock In' : '− Stock Out'} — {stockModal.item.name}
              </h3>
              <button onClick={() => setStockModal(s => ({ ...s, open: false }))} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
              <p className="text-xs text-gray-500">Current stock: <strong className="text-gray-900">{stockModal.item.current_stock} {stockModal.item.unit}</strong></p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                <input type="number" min="0" value={stockForm.qty} onChange={e => setStockForm(f => ({ ...f, qty: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" autoFocus />
              </div>
              {stockModal.mode === 'in' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price ₹</label>
                  <input type="number" min="0" value={stockForm.unit_price} onChange={e => setStockForm(f => ({ ...f, unit_price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                <input value={stockForm.reason} onChange={e => setStockForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={stockModal.mode === 'in' ? 'Purchase, donation...' : 'Used, expired, damaged...'} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStockModal(s => ({ ...s, open: false }))} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={submitStockModal} disabled={saving}
                  className={`flex-1 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                    stockModal.mode === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}>
                  {saving ? 'Saving...' : stockModal.mode === 'in' ? 'Add Stock' : 'Remove Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
