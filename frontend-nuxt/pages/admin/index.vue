<template>
  <div class="flex gap-8">
    <!-- Sidebar -->
    <aside class="w-56 shrink-0">
      <div class="sticky top-8 space-y-1">
        <div class="mb-6">
          <h1 class="text-2xl font-black text-gray-900">Admin</h1>
          <p class="text-xs text-gray-400 font-medium mt-1">Manage your platform</p>
        </div>
        <button v-for="t in tabs" :key="t.key" @click="tab = t.key"
          :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all', tab === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-100']">
          <span class="text-lg">{{ t.icon }}</span>
          {{ t.label }}
          <span v-if="t.badge" class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            :class="tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'">{{ t.badge }}</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 min-w-0">

      <!-- Users Tab -->
      <div v-if="tab === 'users'">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
            <p class="text-3xl font-black text-gray-900 mt-1">{{ users.length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Vendors</p>
            <p class="text-3xl font-black text-gray-900 mt-1">{{ users.filter(u => u.role === 'vendor').length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Suspended</p>
            <p class="text-3xl font-black text-gray-900 mt-1">{{ users.filter(u => u.status === 'suspended').length }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Users</h2>
            <div class="flex items-center gap-3">
              <select v-model="roleFilter" @change="fetchUsers" class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-600 bg-gray-50">
                <option value="">All roles</option>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
              <select v-model="statusFilter" @change="fetchUsers" class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-gray-600 bg-gray-50">
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div class="p-6">
            <div v-if="!loaded" class="space-y-3">
              <div v-for="i in 5" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div v-else-if="users.length === 0" class="text-center py-12">
              <span class="text-4xl mb-3 block">👤</span>
              <p class="text-gray-400 font-medium">No users match your filters.</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="u in users" :key="u.id" class="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">{{ u.email[0].toUpperCase() }}</div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                      {{ u.email }}
                      <span v-if="u.email === 'admin@example.com'" class="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">You</span>
                    </p>
                    <p class="text-xs text-gray-400">Joined {{ u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2.5 shrink-0">
                  <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'vendor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700']">{{ u.role }}</span>
                  <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                    <span :class="['inline-block w-1.5 h-1.5 rounded-full mr-1.5', u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500']" />
                    {{ u.status }}
                  </span>
                  <select v-if="u.role !== 'admin'" v-model="u.role" @change="changeRole(u.id, u.role)" class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-medium text-gray-600 bg-white">
                    <option value="customer">customer</option>
                    <option value="vendor">vendor</option>
                  </select>
                  <button v-if="u.id !== auth.user?.id" @click="confirmTarget = u; confirmAction = 'suspend-user'" :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-colors', u.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200']">
                    {{ u.status === 'active' ? 'Suspend' : 'Activate' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shops Tab -->
      <div v-if="tab === 'shops'">
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Shops</p>
            <p class="text-3xl font-black text-gray-900 mt-1">{{ shops.length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Active</p>
            <p class="text-3xl font-black text-emerald-600 mt-1">{{ shops.filter(s => s.status === 'active').length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
            <p class="text-3xl font-black text-amber-600 mt-1">{{ shops.filter(s => s.status === 'pending').length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Suspended</p>
            <p class="text-3xl font-black text-rose-600 mt-1">{{ shops.filter(s => s.status === 'suspended').length }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Shops</h2>
            <div class="flex items-center gap-3">
              <div class="relative">
                <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input v-model="shopSearch" placeholder="Search shops..." class="pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg font-medium text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 w-48" />
              </div>
            </div>
          </div>
          <div class="p-6">
            <div v-if="!loaded" class="space-y-3">
              <div v-for="i in 4" :key="i" class="h-16 bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div v-else-if="filteredShops.length === 0" class="text-center py-12">
              <span class="text-4xl mb-3 block">🏪</span>
              <p class="text-gray-400 font-medium">{{ shopSearch ? 'No shops match your search.' : 'No shops yet.' }}</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="s in filteredShops" :key="s.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                <div class="flex items-center gap-4 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">{{ s.name[0] }}</div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-gray-900">{{ s.name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ s.slug }} · {{ s.description ? s.description.slice(0, 60) + (s.description.length > 60 ? '...' : '') : 'No description' }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">Owner: {{ s.ownerId?.slice(0, 8) }}...</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700']">
                    <span :class="['inline-block w-1.5 h-1.5 rounded-full mr-1.5', s.status === 'active' ? 'bg-emerald-500' : s.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500']" />
                    {{ s.status }}
                  </span>
                  <button v-if="s.status === 'pending'" @click="approveShop(s.id)" class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Approve</button>
                  <button v-if="s.status !== 'pending'" @click="confirmTarget = s; confirmAction = 'suspend-shop'" :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border', s.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200']">
                    {{ s.status === 'active' ? 'Suspend' : 'Activate' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Tab -->
      <div v-if="tab === 'orders'">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
            <p class="text-3xl font-black text-gray-900 mt-1">{{ orders.length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivered</p>
            <p class="text-3xl font-black text-teal-600 mt-1">{{ orders.filter(o => o.status === 'DELIVERED').length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
            <p class="text-3xl font-black text-emerald-600 mt-1">{{ orders.filter(o => o.status === 'COMPLETED').length }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Orders</h2>
            <div class="flex items-center gap-2">
              <button @click="autoDeliver" :disabled="scheduling" class="px-4 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm">{{ scheduling ? 'Processing...' : 'Auto-Deliver (14d)' }}</button>
              <button @click="autoComplete" :disabled="scheduling" class="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">{{ scheduling ? 'Processing...' : 'Auto-Complete (7d)' }}</button>
            </div>
          </div>
          <div class="p-6">
            <div v-if="!loaded" class="space-y-3">
              <div v-for="i in 4" :key="i" class="h-14 bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div v-else-if="orders.length === 0" class="text-center py-12">
              <span class="text-4xl mb-3 block">📦</span>
              <p class="text-gray-400 font-medium">No orders yet.</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="o in orders" :key="o.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                <div class="flex items-center gap-4 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-black text-xs shadow-sm">#</div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-gray-900">#{{ o.id.slice(0, 8) }}</p>
                    <p class="text-xs text-gray-500">${{ Number(o.total).toFixed(2) }} · {{ o.items?.length || 0 }} item{{ o.items?.length !== 1 ? 's' : '' }} · {{ o.customerId ? o.customerId.slice(0, 8) + '...' : 'Guest' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', o.status === 'DELIVERED' ? 'bg-teal-100 text-teal-700' : o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700']">{{ o.status }}</span>
                  <button v-if="o.status === 'DELIVERED'" @click="confirmTarget = o; confirmAction = 'complete-order'" class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Complete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Returns Tab -->
      <div v-if="tab === 'returns'">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Returns</p>
            <p class="text-3xl font-black text-gray-900 mt-1">{{ returns.length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
            <p class="text-3xl font-black text-amber-600 mt-1">{{ returns.filter(r => r.status === 'pending').length }}</p>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Refunded</p>
            <p class="text-3xl font-black text-purple-600 mt-1">{{ returns.filter(r => r.status === 'refunded').length }}</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Return Requests</h2>
          </div>
          <div class="p-6">
            <div v-if="!loaded" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-16 bg-gray-100 rounded-xl animate-pulse" />
            </div>
            <div v-else-if="returns.length === 0" class="text-center py-12">
              <span class="text-4xl mb-3 block">🔄</span>
              <p class="text-gray-400 font-medium">No return requests.</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="rr in returns" :key="rr.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100/50 transition-colors">
                <div class="flex items-center gap-4 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-sm">R</div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-gray-900">Order #{{ rr.orderId.slice(0, 8) }}</p>
                    <p class="text-xs text-gray-500">{{ rr.reason }} · ${{ Number(rr.refundAmount).toFixed(2) }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">Buyer: {{ rr.buyerId.slice(0, 8) }}... · Shop: {{ rr.shopId.slice(0, 8) }}...</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', rr.status === 'pending' ? 'bg-amber-100 text-amber-700' : rr.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : rr.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700']">{{ rr.status }}</span>
                  <button v-if="rr.status !== 'refunded'" @click="confirmTarget = rr; confirmAction = 'force-refund'" :disabled="loading === rr.id" class="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm">{{ loading === rr.id ? '...' : 'Force Refund' }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Confirmation Modal -->
    <div v-if="confirmTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click.self="confirmTarget = null">
      <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          :class="confirmAction === 'suspend-user' ? 'bg-rose-100' : confirmAction === 'suspend-shop' ? 'bg-amber-100' : 'bg-purple-100'">
          <svg v-if="confirmAction === 'suspend-user'" class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <svg v-else-if="confirmAction === 'suspend-shop'" class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <svg v-else class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 text-center mb-2">{{ confirmTitle }}</h3>
        <p class="text-sm text-gray-500 text-center mb-6">{{ confirmMessage }}</p>
        <div class="flex gap-3">
          <button @click="confirmTarget = null" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">Cancel</button>
          <button @click="executeConfirm" :disabled="confirming" class="flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50"
            :class="confirmAction === 'suspend-user' ? 'bg-rose-600 hover:bg-rose-700' : confirmAction === 'suspend-shop' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700'">
            {{ confirming ? '...' : confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'
const auth = useAuthStore()
const notifications = useNotificationStore()
const config = useRuntimeConfig()
const baseUrl = () => process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const shops = ref([])
const returns = ref([])
const orders = ref([])
const users = ref([])
const tab = ref('users')
const loading = ref('')
const scheduling = ref(false)
const loaded = ref(false)
const roleFilter = ref('')
const statusFilter = ref('')
const shopSearch = ref('')
const confirmTarget = ref(null)
const confirmAction = ref('')
const confirming = ref(false)

const tabs = computed(() => [
  { key: 'users', label: 'Users', icon: '👥', badge: users.value.length || null },
  { key: 'shops', label: 'Shops', icon: '🏪', badge: shops.value.filter(s => s.status === 'pending').length || null },
  { key: 'orders', label: 'Orders', icon: '📦', badge: orders.value.filter(o => o.status === 'DELIVERED').length || null },
  { key: 'returns', label: 'Returns', icon: '🔄', badge: returns.value.filter(r => r.status === 'pending').length || null },
])

const filteredShops = computed(() => {
  if (!shopSearch.value) return shops.value
  const q = shopSearch.value.toLowerCase()
  return shops.value.filter(s => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
})

const confirmTitle = computed(() => {
  if (confirmAction.value === 'suspend-user') return `${confirmTarget.value.status === 'active' ? 'Suspend' : 'Activate'} User`
  if (confirmAction.value === 'suspend-shop') return `${confirmTarget.value.status === 'active' ? 'Suspend' : 'Activate'} Shop`
  if (confirmAction.value === 'complete-order') return 'Complete Order'
  if (confirmAction.value === 'force-refund') return 'Force Refund'
  return 'Confirm'
})

const confirmMessage = computed(() => {
  if (confirmAction.value === 'suspend-user') return `${confirmTarget.value.status === 'active' ? 'Suspend' : 'Activate'} ${confirmTarget.value.email}? They will ${confirmTarget.value.status === 'active' ? 'lose access to the platform' : 'regain access'}.`
  if (confirmAction.value === 'suspend-shop') return `${confirmTarget.value.status === 'active' ? 'Suspend' : 'Activate'} "${confirmTarget.value.name}"? Products will ${confirmTarget.value.status === 'active' ? 'remain visible but the vendor cannot manage them' : 'become manageable again'}.`
  if (confirmAction.value === 'complete-order') return `Mark order #${confirmTarget.value.id.slice(0, 8)} as completed? This will finalize the order.`
  if (confirmAction.value === 'force-refund') return `Force refund $${Number(confirmTarget.value.refundAmount).toFixed(2)}? This action cannot be undone.`
  return 'Are you sure?'
})

const confirmButtonText = computed(() => {
  if (confirmAction.value === 'suspend-user') return confirmTarget.value?.status === 'active' ? 'Suspend' : 'Activate'
  if (confirmAction.value === 'suspend-shop') return confirmTarget.value?.status === 'active' ? 'Suspend' : 'Activate'
  if (confirmAction.value === 'complete-order') return 'Complete'
  if (confirmAction.value === 'force-refund') return 'Force Refund'
  return 'Confirm'
})

async function fetchData() {
  loaded.value = false
  await Promise.all([fetchUsers(), fetchShops(), fetchReturns(), fetchOrders()])
  loaded.value = true
}

async function fetchUsers() {
  try {
    const params = new URLSearchParams()
    if (roleFilter.value) params.set('role', roleFilter.value)
    if (statusFilter.value) params.set('status', statusFilter.value)
    const qs = params.toString()
    users.value = await $fetch(`${baseUrl()}/admin/users${qs ? '?' + qs : ''}`, { headers: authHeaders() })
  } catch {}
}

async function fetchShops() {
  try {
    shops.value = await $fetch(`${baseUrl()}/shops/admin/all`, { headers: authHeaders() })
  } catch {}
}

async function fetchReturns() {
  try {
    returns.value = await $fetch(`${baseUrl()}/orders/admin/returns`, { headers: authHeaders() })
  } catch {}
}

async function fetchOrders() {
  try {
    orders.value = await $fetch(`${baseUrl()}/orders`, { headers: authHeaders() })
  } catch {}
}

async function changeRole(id, role) {
  try {
    await $fetch(`${baseUrl()}/admin/users/${id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: { role } })
    notifications.success('Role updated')
  } catch { notifications.error('Failed to update role') }
}

async function executeConfirm() {
  confirming.value = true
  try {
    if (confirmAction.value === 'suspend-user') {
      const r = await $fetch(`${baseUrl()}/admin/users/${confirmTarget.value.id}/suspend`, { method: 'PATCH', headers: authHeaders() })
      confirmTarget.value.status = r.status
      notifications.success(`User ${r.status === 'active' ? 'activated' : 'suspended'}`)
    } else if (confirmAction.value === 'suspend-shop') {
      await $fetch(`${baseUrl()}/shops/admin/${confirmTarget.value.id}/suspend`, { method: 'PATCH', headers: authHeaders() })
      await fetchShops()
      notifications.success('Shop status updated')
    } else if (confirmAction.value === 'complete-order') {
      await $fetch(`${baseUrl()}/orders/${confirmTarget.value.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: { status: 'COMPLETED' } })
      notifications.success('Order completed')
      await fetchOrders()
    } else if (confirmAction.value === 'force-refund') {
      await $fetch(`${baseUrl()}/orders/admin/returns/${confirmTarget.value.id}/force-refund`, { method: 'POST', headers: authHeaders() })
      notifications.success('Refund processed')
      await fetchReturns()
    }
    confirmTarget.value = null
  } catch (err) {
    notifications.error(err.data?.message || err.data?.error || 'Failed')
  } finally {
    confirming.value = false
  }
}

async function approveShop(id) {
  try {
    await $fetch(`${baseUrl()}/shops/admin/${id}/approve`, { method: 'PATCH', headers: authHeaders() })
    notifications.success('Shop approved')
    await fetchShops()
  } catch (err) {
    notifications.error(err.data?.error || 'Failed to approve shop')
  }
}

async function autoDeliver() {
  scheduling.value = true
  try {
    const r = await $fetch(`${baseUrl()}/orders/admin/auto-deliver`, { method: 'POST', headers: authHeaders() })
    notifications.success(r.message)
    await fetchOrders()
  } catch { notifications.error('Failed') }
  finally { scheduling.value = false }
}

async function autoComplete() {
  scheduling.value = true
  try {
    const r = await $fetch(`${baseUrl()}/orders/admin/auto-complete`, { method: 'POST', headers: authHeaders() })
    notifications.success(r.message)
    await fetchOrders()
  } catch { notifications.error('Failed') }
  finally { scheduling.value = false }
}

onMounted(fetchData)
</script>

<style scoped>
</style>
