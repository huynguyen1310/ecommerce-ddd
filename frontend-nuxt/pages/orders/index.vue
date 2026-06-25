<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">My Orders</h1>
        <p class="text-gray-500 mt-2 text-lg">Track your purchases and order status in real-time.</p>
      </div>
      <button @click="fetchOrders" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Refresh">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
      <span class="text-6xl mb-4 block">📦</span>
      <h2 class="text-2xl font-bold text-gray-900">No orders yet</h2>
      <p class="text-gray-500 mb-8">When you buy something, it will show up here.</p>
      <NuxtLink to="/" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
        Go Shopping
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
        <div class="p-6 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div :class="getStatusBg(order.status)" class="w-12 h-12 rounded-xl flex items-center justify-center text-xl">
              {{ getStatusIcon(order.status) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-gray-900">Order #{{ order.id.substring(0, 8).toUpperCase() }}</h3>
                <span :class="getStatusBadgeClass(order.status)" class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ order.status }}
                </span>
              </div>
              <p class="text-gray-400 text-xs mt-1">{{ formatDate(order.createdAt) }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-8">
            <div class="text-right">
              <p class="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Total Amount</p>
              <p class="text-xl font-black text-indigo-600">${{ order.total }}</p>
            </div>
            <NuxtLink v-if="order.status === 'PENDING'" :to="`/checkout/${order.id}`" class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm">
              Pay Now
            </NuxtLink>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-wrap gap-4 items-center">
          <div v-for="item in order.items" :key="item.productId" class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm">
            <span class="text-gray-400 font-mono text-xs">{{ item.quantity }}x</span>
            <span class="font-medium text-gray-700">Product ID: {{ item.productId.substring(0, 8) }}</span>
          </div>
          <div class="ml-auto flex items-center gap-4">
            <div v-if="order.status === 'SHIPPED' && tracking[order.id]" class="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <span class="text-sm">📦</span>
              <div class="text-xs">
                <p class="font-bold text-blue-800">{{ tracking[order.id].carrier }}</p>
                <p class="text-blue-600 font-mono">{{ tracking[order.id].tracking_number }}</p>
              </div>
            </div>
            <NuxtLink :to="`/orders/${order.id}`" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider">
              View Details &rarr;
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'

const auth = useAuthStore()
const notifications = useNotificationStore()
const config = useRuntimeConfig()

const orders = ref([])
const loading = ref(true)
const tracking = ref({})
let refreshInterval = null

const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const fetchOrders = async () => {
  try {
    const customerId = auth.user?.id || '550e8400-e29b-41d4-a716-446655440100'
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    const data = await $fetch(`${baseUrl}/orders/customer/${customerId}`, { headers: authHeaders() })
    orders.value = data
    fetchTracking(data)
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  } finally {
    loading.value = false
  }
}

const fetchTracking = async (orderList) => {
  const shipped = orderList.filter(o => o.status === 'SHIPPED')
  if (shipped.length === 0) return
  const shipBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
  const results = {}
  await Promise.all(shipped.map(async (o) => {
    try {
      const data = await $fetch(`${shipBaseUrl}/shipments/${o.id}`, { headers: authHeaders() })
      results[o.id] = data
    } catch { /* not found yet */ }
  }))
  tracking.value = { ...tracking.value, ...results }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING': return '⏳'
    case 'PAID': return '✅'
    case 'SHIPPED': return '📦'
    case 'CANCELLED': return '❌'
    case 'REFUNDED': return '💰'
    default: return '📄'
  }
}

const getStatusBg = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-50'
    case 'PAID': return 'bg-green-50'
    case 'SHIPPED': return 'bg-blue-50'
    case 'CANCELLED': return 'bg-rose-50'
    case 'REFUNDED': return 'bg-purple-50'
    default: return 'bg-gray-50'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-700'
    case 'PAID': return 'bg-green-100 text-green-700'
    case 'SHIPPED': return 'bg-blue-100 text-blue-700'
    case 'CANCELLED': return 'bg-rose-100 text-rose-700'
    case 'REFUNDED': return 'bg-purple-100 text-purple-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchOrders()
  // Poll for updates every 5 seconds to show Saga progress
  refreshInterval = setInterval(fetchOrders, 5000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>
